import { Module6Child } from "..";
import { Injectable, Module } from "../../../../../../src";

@Module()
export class Module6GrandChild {
  static get parent() {
    return Module6Child;
  }
}

@Injectable()
export class GrandChildExportedClass {
  public from() {
    return "from module6.child.child";
  }
}