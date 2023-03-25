import { AsyncLocalStorage } from "node:async_hooks";
import { strict as assert } from "assert";
import {
  ContainerSetOptions,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, PropType,
  IdentifierT, IdeintifiedT, ErrorType, ScopeType, ConstructableT, ClassConstructorMetadataT, RecordClassMemberMetadataT,
  ClassFunctionArgMetadataT, ClassPropMetadataT, DEFAULT_CONTAINER_TAG, MODULE_METADATA_KEY, ModuleMetadataT, ModuleConstructableT, Injectable,
} from ".";
import { createCustomError, is, toString } from "./lib/utils";

@Injectable()
export class Container {
  static modules: ModuleConstructableT[] = [];

  public parent: Container | undefined;
  public children: Container[] = [];

  private tag: string;
  private registry = new Map<IdentifierT, IdeintifiedT>();
  private collection = new Map<IdentifierT, InstanceType<ConstructableT>>;
  private relationship: Map<string, Container>;
  private storage: AsyncLocalStorage<Map<IdentifierT, Exclude<IdeintifiedT, ConstructableT> | InstanceType<ConstructableT>>>;

  constructor(parent?: Container, tag: string = DEFAULT_CONTAINER_TAG, root = true) {
    this.tag = tag;
    this.parent = parent;
    this.parent?.children.push(this);
    if (root) {
      this.relationship = new Map<string, Container>();
      this.containers.set(DEFAULT_CONTAINER_TAG, this);
      this.storage = new AsyncLocalStorage();
    }
  }

  get name() {
    return this.tag;
  }

  get containers(): Map<string, Container> {
    return this.relationship ?? this.parent?.containers;
  }

  get store(): typeof this.storage {
    return this.storage ?? this.parent?.store;
  }

  public set(options: ConstructableT | ContainerSetOptions) {
    options = is.class(options) ? { value: options } : options as ContainerSetOptions;

    // base type
    if (!is.class(options.value)) {
      if (!options.id) {
        throw createCustomError(ErrorType.CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID);
      }

      this.duplicate(this.store.getStore() ?? this.registry, options.id, options.value);
      return;
    }

    // set class
    const clazz = options.value as ConstructableT;
    const metadata = Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, clazz) as ClassConstructorMetadataT;
    if (!metadata) {
      throw createCustomError(ErrorType.CONTAINER_SET_FAILED_BY_NOT_INJECTABLE, str => `[${toString(clazz)}] ${str}`);
    }


    // auto inject
    this.parse(clazz, {
      constructor: arg => this.auto(arg.id),
      property: metadata => this.auto(metadata.id),
      function: args => args.forEach(arg => this.auto(arg.id)),
    });

    // get container
    const container = this.choose(clazz);
    this.duplicate(container.registry, options.id || metadata.id, options.value || clazz);
  }

  public get<T = unknown>(id: IdentifierT<T>): T {
    const value = this.value(id);
    if (value === undefined) {
      throw createCustomError(ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND, str => `[${toString(id)}] ${str}`);
    }
    return value;
  }

  public run<T = unknown>(fn: () => Promise<T>): Promise<T> {
    return this.store.run(
      new Map<IdentifierT, InstanceType<ConstructableT>>(),
      fn,
    );
  }

  public choose(clazz: ConstructableT): Container {
    const metadata = Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, clazz) as ClassConstructorMetadataT;
    if (!metadata) {
      return this;
    }
    const containers = this.containers;
    const list = Array.from(containers.keys()).filter(path => metadata.path.includes(path));
    const modulePath = list.sort((a, b) => b.length - a.length)[0];
    metadata.container ??= modulePath ?? DEFAULT_CONTAINER_TAG;
    const container = containers.get(metadata.container) ?? this;
    return container;
  }

  public async findModuleExports(blacklist: ModuleConstructableT[] = []) {
    const modules: ModuleConstructableT[] = [];
    for (const mod of Container.modules.filter(item => !blacklist.includes(item))) {
      if (modules.includes(mod)) {
        continue;
      }
      modules.push(mod);
      if (mod.parent && !blacklist.includes(mod.parent)) {
        modules.splice(modules.indexOf(mod), 0, mod.parent);
      }
    }
    for (const mod of modules) {
      const metadata: ModuleMetadataT = Reflect.getMetadata(MODULE_METADATA_KEY, mod);
      if (!metadata) {
        continue;
      }
      const module = metadata.path;
      const containers = this.containers;
      if (!!this.containers.get(module)) {
        continue;
      }

      let parentMetadata: ModuleMetadataT | undefined;
      if (mod.parent) {
        parentMetadata = Reflect.getMetadata(MODULE_METADATA_KEY, mod.parent);
        if (!parentMetadata) {
          throw createCustomError(ErrorType.PARENT_CONTAINER_NOT_FOUND, str =>
            `[${toString(mod)}] ` +
            `child: ${metadata.path}, parent: ${toString(mod.parent)}, ` +
            `${str}`);
        }
      }

      try {
        for (const clazz of (Object.values(await import(module)))) {
          if (!is.class(clazz)) {
            continue;
          }
          const metadata = Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, clazz as ConstructableT) as ClassConstructorMetadataT;
          if (!metadata) {
            continue;
          }
          metadata.container = mod.parent ? (parentMetadata?.path ?? DEFAULT_CONTAINER_TAG) : DEFAULT_CONTAINER_TAG;
          metadata.module = module;
        }
      } catch (err) {
        throw createCustomError(ErrorType.MODULE_INDEX_NOT_FOUND, str => `mod: ${module} ${str}`);
      }

      if (mod.parent) {
        assert(parentMetadata?.path);
        const parentPath = parentMetadata.path;
        const parentContainer = containers.get(parentPath);
        if (!parentContainer) {
          throw createCustomError(ErrorType.PARENT_CONTAINER_NOT_FOUND, str =>
            `[${toString(mod)}] ` +
            `child: ${metadata.path}, parent: ${parentPath}, ` +
            `${str}`);
        }
        containers.set(metadata.path, new Container(parentContainer, metadata.path, false));
      } else {
        containers.set(metadata.path, new Container(this, metadata.path, false));
      }
    }
  }

  private value<T = unknown>(id: IdentifierT<T>) {
    // async local storage
    const store = this.store.getStore();

    const value = store?.get(id) ?? this.registry.get(id);
    if (value === undefined) {
      return this.parent?.value(id);
    }

    if (!is.class(value)) {
      return value as T;
    }

    // check scope
    const instance = this.collection.get(id);
    if (instance) {
      return instance as T;
    }

    // parse constructor & props & funcs
    const args: IdentifierT[] = [];
    const props: (ClassPropMetadataT & { prop: string })[] = [];
    const funcs: ({ prop: string, args: ClassFunctionArgMetadataT[] })[] = [];
    this.parse(value as ConstructableT, {
      constructor: arg => args[arg.index] = arg.id,
      property: (metadata, prop) => props.push({ prop, ...metadata }),
      function: (args, prop) => funcs.push({ prop, args }),
    });

    // init class
    const containers = this.containers;
    const metadata = Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, value) as ClassConstructorMetadataT;
    const container = metadata.module ? containers.get(metadata.module) ?? this : this;
    let result: T;
    if (args.length) {
      result = new (value as ConstructableT<T>)(...args.map(id => container.get(id)));
    } else {
      result = new (value as ConstructableT<T>)();
    }

    // add props
    for (const prop of props) {
      prop.lazy ?
        Object.defineProperty(result, prop.prop, { get: () => container.get(prop.id) }) :
        result[prop.prop] = container.get(prop.id);
    }

    // modify func
    for (const func of funcs) {
      const origin = result[func.prop];
      result[func.prop] = (...args: any[]) => {
        for (const arg of func.args) {
          args[arg.index] = container.get(arg.id);
        }
        return origin.call(result, ...args);
      };
    }

    // cache singleton
    if (metadata.scope === ScopeType.SINGLETON) {
      this.collection.set(id, result);
    }

    // cache execution
    if (metadata.scope === ScopeType.EXECUTION) {
      store?.set(id, result);
    }

    return result;
  }

  private parse(clazz: ConstructableT,
    handler: {
      constructor: (arg: ClassFunctionArgMetadataT, prop: string) => void,
      property: (metadata: ClassPropMetadataT, prop: string) => void,
      function: (args: ClassFunctionArgMetadataT[], prop: string) => void,
    }) {
    for (const prop of (Reflect.getMetadata(CLASS_PROPS_KEY, clazz) || []) as string[]) {
      const info = Reflect.getMetadata(`${CLASS_PROP_METADATA_PREFIX}${prop}`, clazz) as RecordClassMemberMetadataT;
      if (is.constructor(prop)) {
        (info.list as ClassFunctionArgMetadataT[]).forEach(item => handler.constructor(item, prop));
        continue;
      }

      if (info.type === PropType.PROPERTY) {
        handler.property(info.list[0] as ClassPropMetadataT, prop);
        continue;
      }

      if (info.type === PropType.FUNCTION) {
        handler.function(info.list as ClassFunctionArgMetadataT[], prop);
        continue;
      }
    }
  }

  private auto(id: IdentifierT) {
    if (!is.class(id)) {
      return;
    }

    this.set(id as ConstructableT);
  }

  private duplicate(
    registry: Map<IdentifierT, Exclude<IdeintifiedT, ConstructableT> | InstanceType<ConstructableT>>,
    id: IdentifierT, value: IdeintifiedT) {
    if (registry.has(id)) {
      return;
    }
    registry.set(id, value);
  }
}