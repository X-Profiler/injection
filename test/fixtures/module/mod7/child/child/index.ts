import { Module, Injectable } from "../../../../../../src";
import { Module7Child } from "..";

@Module()
export class Module7GrandChild {
  static get parent() {
    return Module7Child;
  }
}

@Injectable()
export class GrandChildExportedClass {
  public from() {
    return "from module7.child.child";
  }
}