import { BaseModule, DefineModule } from "../../../../../src";
import { Module1 } from "../";

@DefineModule()
export class Module1_1 extends BaseModule {
  static get parents() {
    return [Module1];
  }
}