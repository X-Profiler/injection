import { Inject, Injectable } from "../../../src";
import { Module1 } from "./mod1";
import { Module1Foo } from "./mod1/port";
Module1.register();


@Injectable()
export class Application {
  @Inject()
  private module1Foo: Module1Foo;

  public msg() {
    return this.module1Foo.echo();
  }
}