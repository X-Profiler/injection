import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { Injectable } from "./decorator/injectable";
import {
  PropType, ErrorType, ScopeType, ModuleRelationType,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, DEFAULT_CONTAINER_TAG, TRUE_CONTAINER,
} from "./shared/constant";
import { Store } from "./shared/store";
import {
  ContainerSetOptions, IdentifierT, IdeintifiedT, ConstructableT,
  ClassConstructorMetadataT, RecordClassMemberMetadataT, ClassFunctionArgMetadataT, ClassPropMetadataT,
} from "./shared/type";
import { createCustomError } from "./utils/error";
import { is, toString } from "./utils/helper";
import { BaseModule } from "./module";


@Injectable()
export class Container {
  public tag: string;
  public children: Container[] = [];
  public registry = new Map<IdentifierT, IdeintifiedT>();
  public collection = new Map<IdentifierT, InstanceType<ConstructableT>>;
  public commons: string[] = [];

  constructor(commons: string[] = [], tag: string = DEFAULT_CONTAINER_TAG, init = true) {
    this.tag = tag;
    this.commons = commons;
    if (init) {
      this.containers.clear();
    }
    this.filling();
  }

  public filling() {
    const containers = this.containers;
    if (!containers.has(this.tag)) {
      containers.set(this.tag, this);
    }
    for (const mod of BaseModule.tags()) {
      if (containers.has(mod)) {
        continue;
      }
      new Container(this.commons, mod, false);
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
        const parents = BaseModule.parentship.get(container.tag) || [];
        for (const parent of parents) {
          const pcontainer = this.scontainer(parent);
          pcontainer.duplicate(options.id, { [TRUE_CONTAINER]: container.tag });
        }
        const children = BaseModule.childship.get(container.tag) || [];
        for (const child of children) {
          const ccontainer = this.scontainer(child);
          const info = BaseModule.relationtype.get(BaseModule.compose(container.tag, child));
          if (info?.type === ModuleRelationType.SUBMODULE_BINDING) {
            ccontainer.duplicate(options.id, { [TRUE_CONTAINER]: container.tag });
          }
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

  public get<T = unknown>(id: IdentifierT<T>, trace: string[] = []): T {
    const store = Store.storage.getStore();

    const value = store?.get(id) ?? this.registry.get(id);
    if (value === undefined) {
      if (this.tag !== DEFAULT_CONTAINER_TAG) {
        return this.scontainer(DEFAULT_CONTAINER_TAG).get(id, [...trace, this.tag]);
      }
      trace.push(this.tag);
      throw createCustomError(ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND, str => `container: <${trace.join(" => ")}> [${toString(id)}] ${str}`);
    }

    if (is.includes(value, TRUE_CONTAINER)) {
      if (trace.includes(this.tag)) {
        trace.push(this.tag);
        throw createCustomError(ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND, str => `container: <${trace.join(" => ")} (loop: ${this.tag})> [${toString(id)}] ${str}`);
      }
      return this.scontainer(value[TRUE_CONTAINER]).get(id, [...trace, this.tag]);
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

  public async ready() {
    this.filling();
    this.addCommon();
    await this.addFakeItmes(BaseModule.childship);
    await this.addFakeItmes(BaseModule.parentship, (k, v) => {
      const info = BaseModule.relationtype.get(BaseModule.compose(v, k));
      return info ? info.type === ModuleRelationType.SUBMODULE_BINDING : true;
    });
  }

  public async dump(output?: string) {
    const array = [] as { parent: string, child?: string }[];
    const tags = BaseModule.tags();
    const root = this.findCommonPrefix(tags);
    tags
      .forEach(mod => {
        if (BaseModule.childship.has(mod)) {
          const children = BaseModule.childship.get(mod) as string[];
          array.push(...children.map(child => ({ parent: mod, child })));
        } else {
          array.push({ parent: mod });
        }
      });

    const relations = array
      .filter((item, index) => index === array.findIndex(obj => JSON.stringify(obj) === JSON.stringify(item)))
      .map(item => ({ ...item, parent: path.relative(root, item.parent), child: item.child ? path.relative(root, item.child) : undefined }))
      .filter(item => item.parent);


    const files = { mmd: "", svg: "" };
    if (output) {
      const content =
        "graph LR\n" +
        `root>"Root: ${root}"]\n` +
        relations.map(item => {
          const key = item.child ? BaseModule.compose(path.join(root, item.parent), path.join(root, item.child)) : "";
          const desc = BaseModule.relationtype.get(key)?.desc;
          return `${item.parent}${item.child ? ` -->${desc ? ` |${desc}|` : ""} ${item.child}` : ""}`;
        }).join("\n");
      const mmd = path.join(output, "__module__.mmd");
      await fs.writeFile(mmd, content);
      const svg = path.join(output, "__module__.svg");
      await promisify(exec)(`mmdc -i ${mmd} -o ${svg}`, { cwd: output });
      files.mmd = mmd;
      files.svg = svg;
      console.log(`mmd to: ${mmd}\nsvg to: ${svg}`);
    }

    return { root, relations, files };
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

  private findCommonPrefix(strs) {
    if (!strs || strs.length === 0) {
      return "";
    }
    const firstStr = strs[0];
    const len = firstStr.length;
    for (let i = 0; i < len; i++) {
      const currChar = firstStr[i];
      for (let j = 1; j < strs.length; j++) {
        if (i >= strs[j].length || strs[j][i] !== currChar) {
          return firstStr.substring(0, i);
        }
      }
    }
    return firstStr;
  }

  private addCommon() {
    for (const mod of BaseModule.tags()) {
      this.commons.forEach(common => {
        if (mod === common) {
          return;
        }
        BaseModule.ship(mod, common, BaseModule.childship, {
          key: BaseModule.compose(mod, common),
          value: { desc: "全局公共模块", type: ModuleRelationType.GLOBAL_COMMON_BINDING },
        });
        BaseModule.ship(common, mod, BaseModule.parentship);
      });
    }
  }

  private async addFakeItmes(
    map: Map<string, string[]>,
    check: (key: string, value: string) => boolean = () => true,
  ) {
    for (const key of map.keys()) {
      const children = map.get(key) as string[];
      const container = this.scontainer(key);

      for (const child of children) {
        if (!check(key, child) || this.scontainer(child).tag === DEFAULT_CONTAINER_TAG) {
          continue;
        }
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
}