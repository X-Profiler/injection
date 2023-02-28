import path from "path";
import {
  InjectableOptions, ClassConstructorMetadataT,
  CLASS_CONSTRUCTOR_METADATA_KEY, ScopeType,
} from "../";
import { getCalleeFromStack } from "../lib/utils";

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