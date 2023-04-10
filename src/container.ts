import {
  ContainerSetOptions,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, PropType,
  IdentifierT, IdeintifiedT, ErrorType, ScopeType, ConstructableT, ClassConstructorMetadataT, RecordClassMemberMetadataT,
  ClassFunctionArgMetadataT, ClassPropMetadataT, DEFAULT_CONTAINER_TAG, TRUE_CONTAINER,
  Injectable,
} from ".";
import { BaseModule } from "./module";
import { Store } from "./store";
import { createCustomError, is, toString } from "./lib/utils";


@Injectable()
export class Container {
  public tag: string;
  public children: Container[] = [];
  public registry = new Map<IdentifierT, IdeintifiedT>();
  public collection = new Map<IdentifierT, InstanceType<ConstructableT>>;

  constructor(tag: string = DEFAULT_CONTAINER_TAG, root = true) {
    this.tag = tag;
    this.containers.set(tag, this);

    if (root) {
      for (const mod of BaseModule.tags()) {
        new Container(mod, false);
      }
    }
  }

  public set(options: ConstructableT | ContainerSetOptions) {
    options = is.class(options) ? { value: options } : options as ContainerSetOptions;

    // base type
    if (!is.class(options.value)) {
      if (!options.id) {
        throw createCustomError(ErrorType.CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID);
      }

      if (options.export) {
        const container = this.scontainer(this.tag);
        const parents = BaseModule.parentship.get(container.tag) || [DEFAULT_CONTAINER_TAG];
        for (const parent of parents) {
          const pcontainer = this.scontainer(parent);
          if (pcontainer.tag === container.tag) {
            continue;
          }
          pcontainer.set({ id: options.id, value: { [TRUE_CONTAINER]: container.tag } });
        }
      }

      this.duplicate(options.id, options.value);
      return this;
    }

    // set class
    const clazz = options.value as ConstructableT;
    const metadata = Reflect.getOwnMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, clazz) as ClassConstructorMetadataT;
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
    container.duplicate(options.id || metadata.id, options.value);

    return this;
  }

  public get<T = unknown>(id: IdentifierT<T>, tag = ""): T {
    const store = Store.storage.getStore();

    const value = store?.get(id) ?? this.registry.get(id);
    if (value === undefined) {
      if (this.tag !== DEFAULT_CONTAINER_TAG) {
        return this.scontainer(DEFAULT_CONTAINER_TAG).get(id, `${this.tag} => `);
      }
      throw createCustomError(ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND, str => `container: <${tag}${this.tag}> [${toString(id)}] ${str}`);
    }

    if (is.includes(value, TRUE_CONTAINER)) {
      const container = this.scontainer(value[TRUE_CONTAINER]);
      return container.get(id, `${this.tag} => `);
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
    const metadata = Reflect.getOwnMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, value) as ClassConstructorMetadataT;
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
    return Store.storage.run(
      new Map<IdentifierT, InstanceType<ConstructableT>>(),
      fn,
    );
  }

  public choose(clazz: ConstructableT): Container {
    const metadata = Reflect.getOwnMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, clazz) as ClassConstructorMetadataT;
    if (!metadata) {
      return this;
    }
    const containers = this.containers;
    const list = Array.from(containers.keys()).filter(path => metadata.path.includes(path)).reverse();
    const modulePath = list.sort((a, b) => b.length - a.length)[0];
    metadata.container = modulePath;
    const container = this.scontainer(metadata.container);
    return container;
  }

  public async ready(commons: string[] = []) {
    for (const parent of BaseModule.childship.keys()) {
      const children = BaseModule.childship.get(parent) as string[];
      const container = this.scontainer(parent);
      commons.forEach(common => !children.includes(common) && children.push(common));

      for (const child of children) {
        try {
          for (const clazz of (Object.values(await import(child)))) {
            if (!is.class(clazz)) {
              continue;
            }
            const metadata = Reflect.getOwnMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, clazz as ConstructableT) as ClassConstructorMetadataT;
            if (!metadata) {
              continue;
            }

            container.set({ id: metadata.id, value: { [TRUE_CONTAINER]: child } });
          }
        } catch (err) {
          throw createCustomError(ErrorType.MODULE_INDEX_NOT_FOUND, str => `mod: ${child} ${str}\n\nextra: ${err}`);
        }
      }
    }
  }

  private get aregistry() {
    return Store.storage.getStore() ?? this.registry;
  }

  private get containers() {
    return Store.containers;
  }

  private scontainer(tag: string) {
    const containers = this.containers;
    return containers.get(tag) ?? containers.get(DEFAULT_CONTAINER_TAG) as Container;
  }

  private getProps(clazz: ConstructableT, props: string[] = []) {
    props.push(...(Reflect.getOwnMetadata(CLASS_PROPS_KEY, clazz) || []) as string[]);
    const proto = Reflect.getPrototypeOf(clazz);
    if (is.class(proto)) {
      this.getProps(proto as ConstructableT, props);
    }
    return props;
  }

  private parse(clazz: ConstructableT,
    handler: {
      constructor: (arg: ClassFunctionArgMetadataT, prop: string) => void,
      property: (metadata: ClassPropMetadataT, prop: string) => void,
      function: (args: ClassFunctionArgMetadataT[], prop: string) => void,
    }) {
    for (const prop of this.getProps(clazz)) {
      const func = is.constructor(prop) ? "getMetadata" : "getOwnMetadata";
      const info = Reflect[func](`${CLASS_PROP_METADATA_PREFIX}${prop}`, clazz) as RecordClassMemberMetadataT;

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

  private duplicate(id: IdentifierT, value: IdeintifiedT) {
    const registry = this.aregistry;
    if (registry.has(id)) {
      return;
    }
    registry.set(id, value);
  }
}