import { DefineModule, Inject, Injectable } from "../../../../../src";
import { Module1 } from "../";
import { Module1_1, Module1_1Public } from "../mod1_1";

@DefineModule()
export class Module1_2 {
  static get parents() {
    return [Module1, Module1_1];
  }
}

@Injectable()
export class Module1_2Public {
  @Inject()
  private module1_1Public: Module1_1Public;

  public echo() {
    return `from class Module1_2Public (use ${this.module1_1Public.tag()})`;
  }
}