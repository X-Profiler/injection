import path from "path";
import { getCalleeFromStack } from "../utils/stack";
import { BaseModule } from "../module";

export function DefineModule() {
  return (target: any) => {
    BaseModule.modules.set(target, BaseModule.create(path.dirname(getCalleeFromStack())));
  };
}
