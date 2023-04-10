import {
  ContainerSetOptions,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, PropType,
  IdentifierT, IdeintifiedT, ErrorType, ScopeType, ConstructableT, ClassConstructorMetadataT, RecordClassMemberMetadataT,
  ClassFunctionArgMetadataT, ClassPropMetadataT, DEFAULT_CONTAINER_TAG, MODULE_METADATA_KEY, ModuleMetadataT, ModuleConstructableT,
  Injectable,
} from ".";
import { Store } from "./store";
import { createCustomError, is, toString } from "./lib/utils";

@Injectable()
export class Container {
  public tag: string;
  public children: Container[] = [];
  public registry = new Map<IdentifierT, IdeintifiedT>();
  public collection = new Map<IdentifierT, InstanceType<ConstructableT>>;
  public store: Store;

  constructor(tag: string = DEFAULT_CONTAINER_TAG, store: Store = new Store()) {
    this.tag = tag;
    this.store = store;
    this.containers.set(tag, this);
  }

  public set(options: ConstructableT | ContainerSetOptions) {
    options = is.class(options) ? { value: options } : options as ContainerSetOptions;

    // base type
    if (!is.class(options.value)) {
      if (!options.id) {
        throw createCustomError(ErrorType.CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID);
      }

      this.duplicate(this.aregistry, options.id, options.value);
      return this;
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

    return this;
  }

  public get<T = unknown>(id: IdentifierT<T>): T {
    // async local storage
    const store = this.store.storage.getStore();

    const value = store?.get(id) ?? this.registry.get(id);
    if (value === undefined) {
      throw createCustomError(ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND, str => `container: <${this.tag}> [${toString(id)}] ${str}`);
    }

    if (!is.class(value) || value === null) {
      return value as T;
    }

    // singleton scope
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
    const metadata = Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, value) as ClassConstructorMetadataT;
    let result: T;
    if (args.length) {
      result = new (value as ConstructableT<T>)(...args.map(id => this.get(id)));
    } else {
      result = new (value as ConstructableT<T>)();
    }

    // add props
    for (const prop of props) {
      prop.lazy ?
        Object.defineProperty(result, prop.prop, { get: () => this.get(prop.id) }) :
        result[prop.prop] = this.get(prop.id);
    }

    // modify func
    for (const func of funcs) {
      const origin = result[func.prop];
      result[func.prop] = (...args: any[]) => {
        for (const arg of func.args) {
          args[arg.index] = this.get(arg.id);
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

  public run<T = unknown>(fn: () => Promise<T>): Promise<T> {
    return this.store.storage.run(
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
    const list = Array.from(containers.keys()).filter(path => metadata.path.includes(path)).reverse();
    const modulePath = list.sort((a, b) => b.length - a.length)[0];
    metadata.container ??= modulePath ?? DEFAULT_CONTAINER_TAG;
    const container = containers.get(metadata.container) ?? this;
    return container;
  }

  private get aregistry() {
    return this.store.storage.getStore() ?? this.registry;
  }

  private get containers() {
    return this.store.containers;
  }

  private parse(clazz: ConstructableT,
    handler: {
      constructor: (arg: ClassFunctionArgMetadataT, prop: string) => void,
      property: (metadata: ClassPropMetadataT, prop: string) => void,
      function: (args: ClassFunctionArgMetadataT[], prop: string) => void,
    }) {
    for (const prop of (Reflect.getMetadata(CLASS_PROPS_KEY, clazz) || []) as string[]) {
      const info = Reflect.getMetadata(`${CLASS_PROP_METADATA_PREFIX}${prop}`, clazz) as RecordClassMemberMetadataT | undefined;
      if (!info) {
        continue;
      }

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