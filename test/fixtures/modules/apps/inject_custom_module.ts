import { Inject, Injectable } from "../../../../src";
import { Module1_1, Module1_1Public } from "../mod1/mod1_1";
Module1_1.register();


@Injectable()
export class InjectCustomModule {
  @Inject()
  private module1_1Public: Module1_1Public;

  public msg() {
    return this.module1_1Public.echo();
  }
}