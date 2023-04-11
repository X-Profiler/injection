import path from "path";
import { ErrorType } from "./shared/constant";
import { ModuleRelationType } from "./shared/type";
import { createCustomError } from "./utils/error";
import { toString } from "./utils/helper";
import { getCalleeFromStack } from "./utils/stack";

class Module {
  public tag: string;
  public parents: Module[];

  constructor(tag: string, parents: Module[]) {
    this.tag = tag;
    this.parents = parents;
  }
}

export class BaseModule {
  static modules: Map<typeof BaseModule, Module> = new Map<typeof BaseModule, Module>();
  static childship: Map<string, string[]> = new Map<string, string[]>();
  static parentship: Map<string, string[]> = new Map<string, string[]>();
  static relationtype: Map<string, ModuleRelationType> = new Map<string, ModuleRelationType>();

  static get parents(): BaseModule[] {
    return [];
  }

  static create(tag: string, parents: Module[]): Module {
    return new Module(tag, parents);
  }

  static module(clazz?: typeof BaseModule) {
    return this.modules.get(clazz ?? this) as Module;
  }

  static tag(clazz?: typeof BaseModule): string {
    return this.module(clazz).tag;
  }

  static tags(): string[] {
    return Array.from(this.modules.keys()).map(key => this.tag(key));
  }

  static compose(parent: string, value: string) {
    return `${parent}::${value}`;
  }

  static ship(
    key: string,
    value: string, ship: Map<string, string[]>,
    options?: { key: string, value: ModuleRelationType },
  ) {
    const list: string[] = ship.get(key) || [];
    value && !list.includes(value) && list.push(value);
    ship.set(key, list);
    if (options) {
      this.relationtype.set(options.key, options.value);
    }
  }

  static register(
    parent = true,
    registedTag?: string,
    type?: ModuleRelationType,
  ) {
    // get parent and child tag
    registedTag ??= path.dirname(getCalleeFromStack(2));
    const moduleTag = (this.modules.get(this) as Module).tag;
    const parentTag = parent ? registedTag : moduleTag;
    const childTag = parent ? moduleTag : registedTag;

    // check parents
    if (parent) {
      const fixedParents = this.module().parents.map(parent => parent.tag);
      if (fixedParents.length > 0 && !fixedParents.includes(parentTag)) {
        throw createCustomError(ErrorType.MODULE_DECLARED_PARENTS, str =>
          `[${toString(this)} declared parents: [ ${fixedParents.join(", ")} ], now is: <${parentTag}>],` +
          ` ${str}`);
      }
    }

    // set childship
    const options = type ? { key: this.compose(parentTag, childTag), value: type } : undefined;
    this.ship(parentTag, childTag, this.childship, options);
    // set parentship
    this.ship(childTag, parentTag, this.parentship);
  }
}
