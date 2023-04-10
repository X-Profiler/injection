import path from "path";
import { getCalleeFromStack } from "./utils/stack";

class Module {
  public tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }
}

export class BaseModule {
  static modules: Map<typeof BaseModule, Module> = new Map<typeof BaseModule, Module>();
  static childship: Map<string, string[]> = new Map<string, string[]>();
  static parentship: Map<string, string[]> = new Map<string, string[]>();

  static create(tag: string) {
    return new Module(tag);
  }

  static tag(clazz?: typeof BaseModule): string {
    return (this.modules.get(clazz ?? this) as Module).tag;
  }

  static tags(): string[] {
    return Array.from(this.modules.keys()).map(key => this.tag(key));
  }

  static register() {
    const parent = path.dirname(getCalleeFromStack(2));
    const children: string[] = this.childship.get(parent) || [];
    const tag = (this.modules.get(this) as Module).tag;
    tag && !children.includes(tag) && children.push(tag);
    this.childship.set(parent, children);

    const parents: string[] = tag && this.parentship.get(tag) || [];
    !parents.includes(parent) && parents.push(parent);
    this.parentship.set(tag, parents);
  }
}
