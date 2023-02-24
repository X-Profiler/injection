import {
  ContainerSetOptions,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, PropType,
  IdentifierT, IdeintifiedT, ErrorType, ScopeType, ConstructableT, ClassConstructorMetadataT, RecordClassMemberMetadataT,
  ClassFunctionArgMetadataT, ClassPropMetadataT, DEFAULT_CONTAINER_TAG,
} from ".";

import { createCustomError, is, toString } from "./lib/utils";

export class Container {
  public children: Container[];
  public parent: Container | undefined;

  private tag: string;
  private registry = new Map<IdentifierT, IdeintifiedT>();
  private collection = new Map<IdentifierT, InstanceType<ConstructableT>>;

  constructor(parent?: Container, tag: string = DEFAULT_CONTAINER_TAG) {
    this.tag = tag;
    this.parent = parent;
    this.parent?.children.push(this);
  }

  get name() {
    return this.tag;
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

    this.registry.set(options.id || metadata.id, clazz);
  }

  public get<T = unknown>(id: IdentifierT<T>): T {
    const value = this.registry.get(id);
    if (value === undefined) {
      throw createCustomError(ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND, str => `[${toString(id)}] ${str}`);
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

    for (const prop of (Reflect.getMetadata(CLASS_PROPS_KEY, value) || []) as string[]) {
      const info = Reflect.getMetadata(`${CLASS_PROP_METADATA_PREFIX}${prop}`, value) as RecordClassMemberMetadataT;
      if (is.constructor(prop)) {
        (info.list as ClassFunctionArgMetadataT[]).forEach(item => args[item.index] = item.id);
        continue;
      }

      if (info.type === PropType.PROPERTY) {
        props.push({ prop, ...info.list[0] as ClassPropMetadataT });
        continue;
      }

      if (info.type === PropType.FUNCTION) {
        funcs.push({ prop, args: info.list as ClassFunctionArgMetadataT[] });
        continue;
      }
    }

    // init class
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
    const metadata = Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, value) as ClassConstructorMetadataT;
    if (metadata.scope === ScopeType.SINGLETON) {
      this.collection.set(id, result);
    }

    return result;
  }
}