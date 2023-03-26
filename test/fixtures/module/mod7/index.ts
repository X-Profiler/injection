import { Inject, Injectable, Module } from "../../../../src";
import { ChildExportedClass } from "./child";

@Module()
export class Module7 { }

@Injectable()
export class A7 {
  @Inject()
  private child: ChildExportedClass;

  public say() {
    return this.child.from();
  }
}