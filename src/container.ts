import {
  ContainerSetOptions,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, PropType,
  IdentifierT, IdeintifiedT, ErrorType, ScopeType, ConstructableT, ClassConstructorMetadataT, RecordClassMemberMetadataT,
  ClassFunctionArgMetadataT, ClassPropMetadataT, DEFAULT_CONTAINER_TAG, MODULE_METADATA_KEY, ModuleMetadataT, ModuleConstructableT,
} from ".";

import { createCustomError, is, toString } from "./lib/utils";

export class Container {
  static modules: ModuleConstructableT[] = [];

  public parent: Container | undefined;
  public children: Container[] = [];

  private tag: string;
  private registry = new Map<IdentifierT, IdeintifiedT>();
  private collection = new Map<IdentifierT, InstanceType<ConstructableT>>;
  private relationship: Map<string, Container>;

  constructor(parent?: Container, tag: string = DEFAULT_CONTAINER_TAG, root = true) {
    this.tag = tag;
    this.parent = parent;
    this.parent?.children.push(this);
    if (root) {
      this.relationship = new Map<string, Container>();
      this.containers.set(DEFAULT_CONTAINER_TAG, this);
    }
  }

  get name() {
    return this.tag;
  }

  get containers(): Map<string, Container> {
    return this.relationship ?? this.parent?.containers;
  }

  public set(options: ConstructableT | ContainerSetOptions) {
    options = is.class(options) ? { value: options } : options as ContainerSetOptions;

    // base type
    if (!is.class(options.value)) {
      if (!options.id) {
        throw createCustomError(ErrorType.CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID);
      }
      this.registry.set(options.id, options.value);
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
    const containers = this.containers;
    const modulePath = Array.from(containers.keys()).filter(path => metadata.path.includes(path))[0];
    metadata.container ??= modulePath ?? DEFAULT_CONTAINER_TAG;
    const container = containers.get(metadata.container) ?? this;
    if (container.registry.has(metadata.id)) {
      return;
    }
    container.registry.set(options.id || metadata.id, clazz);
  }

  public get<T = unknown>(id: IdentifierT<T>): T {
    const value = this.value(id);
    if (value === undefined) {
      throw createCustomError(ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND, str => `[${toString(id)}] ${str}`);
    }
    return value;
  }

  public async findModuleExports(blacklist: ModuleConstructableT[] = []) {
    const modules = Container.modules.filter(item => !blacklist.includes(item));
    for (const mod of modules) {
      const metadata: ModuleMetadataT = Reflect.getMetadata(MODULE_METADATA_KEY, mod);
      const module = metadata.path;
      const containers = this.containers;
      if (!!this.containers.get(module)) {
        continue;
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
          metadata.container = DEFAULT_CONTAINER_TAG;
          metadata.module = module;
        }
      } catch (err) {
        throw createCustomError(ErrorType.MODULE_INDEX_NOT_FOUND, str => `mod: ${module} ${str}`);
      }

      if (mod.parent) {
        const parentMetadata: ModuleMetadataT = Reflect.getMetadata(MODULE_METADATA_KEY, mod.parent);
        const parentContainer = containers.get(parentMetadata.path);
        if (!parentContainer) {
          throw createCustomError(ErrorType.PARENT_CONTAINER_NOT_FOUND, str =>
            `[${toString(mod)}] ` +
            `child: ${metadata.path}, parent: ${parentMetadata.path}, ` +
            `${str}`);
        }
        containers.set(metadata.path, new Container(parentContainer, metadata.path, false));
      } else {
        containers.set(metadata.path, new Container(this, metadata.path, false));
      }
    }
  }

  private value<T = unknown>(id: IdentifierT<T>) {
    const value = this.registry.get(id);
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
}