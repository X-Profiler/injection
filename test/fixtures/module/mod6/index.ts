import { Inject, Injectable, Module } from "../../../../src";
import { ChildExportedClass } from "./child";

@Module()
export class Module6 { }

@Injectable()
export class A6 {
  @Inject()
  private child: ChildExportedClass;

  public say() {
    return this.child.from();
  }
}

