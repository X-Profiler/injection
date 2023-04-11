import path from "path";
import { getCalleeFromStack } from "../utils/stack";
import { BaseModule } from "../module";

export function DefineModule() {
  return (target: any) => {
    const modulePath = path.dirname(getCalleeFromStack());
    const parents = (target.parents as typeof BaseModule[]).map(parent => {
      parent.register(false, modulePath);
      return BaseModule.module(parent);
    });
    BaseModule.modules.set(target, BaseModule.create(modulePath, parents));
  };
}
