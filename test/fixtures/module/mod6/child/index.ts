import { Module6 } from "..";
import { Inject, Injectable, Module } from "../../../../../src";
import { GrandChildExportedClass } from "./child";

@Module()
export class Module6Child { 
  static get parent() {
    return Module6;
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