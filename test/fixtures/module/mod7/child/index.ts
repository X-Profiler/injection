import { Module, Injectable, Inject } from "../../../../../src";
import { Module7GrandChild, GrandChildExportedClass } from "./child";

@Module()
export class Module7Child {
  static get parent() {
    return Module7GrandChild;
  }
}

@Injectable()
export class ChildExportedClass {
  @Inject()
  private child: GrandChildExportedClass;

  public from() {
    return `${this.child.from()}::from module6.child`;
  }
}