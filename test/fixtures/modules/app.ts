import { Inject, Injectable } from "../../../src";
import { Module1, Module1Bar } from "./mod1";
import { Module1Foo } from "./mod1/port";
Module1.register();


@Injectable()
export class Application {
  @Inject()
  private module1Foo: Module1Foo;
  @Inject()
  private module1Bar: Module1Bar;

  public msg() {
    return this.module1Foo.echo();
  }

  public msg2() {
    return this.module1Bar.echo();
  }
}