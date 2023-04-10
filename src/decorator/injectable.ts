import path from "path";
import { CLASS_CONSTRUCTOR_METADATA_KEY, ScopeType } from "../shared/constant";
import { InjectableOptions, ClassConstructorMetadataT } from "../shared/type";
import { getCalleeFromStack } from "../utils/stack";

export function Injectable(options?: Partial<InjectableOptions>) {
  return (target: any) => {
    const classPath = path.dirname(getCalleeFromStack());
    const metadata: ClassConstructorMetadataT = {
      id: target,
      scope: ScopeType.SINGLETON,
      path: classPath,
      ...options,
    };
    Reflect.defineMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, metadata, target);
  };
}