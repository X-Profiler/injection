import { BaseModule, DefineModule } from "../../../../src";

@DefineModule()
export class Module2 extends BaseModule { }

import { Module2_1 } from "./mod2_1/module";
Module2_1.register();