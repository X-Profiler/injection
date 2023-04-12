import path from "path";
import { ModuleRelationType } from "../shared/constant";
import { getCalleeFromStack } from "../utils/stack";
import { BaseModule } from "../module";

export function DefineModule() {
  return (target: any) => {
    const modulePath = path.dirname(getCalleeFromStack());
    const parents = (target.parents as typeof BaseModule[]).map(parent => {
      parent.register(false, modulePath, { desc: "子模块主动绑定", type: ModuleRelationType.SUBMODULE_BINDING });
      return BaseModule.module(parent);
    });
    BaseModule.modules.set(target, BaseModule.create(modulePath, parents));

    if(Reflect.getPrototypeOf(target) !== BaseModule){
      Reflect.setPrototypeOf(target, BaseModule);
    }
  };
}
