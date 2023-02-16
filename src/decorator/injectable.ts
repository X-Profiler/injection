import { CLASS_METADATA_KEY, Scope } from "../constant";
import { InjectableOptions } from "../type";

export function Injectable(options?: Partial<InjectableOptions>) {
  return (target: any) => {
    const medataValue = { id: target, scope: Scope.SINGLETON, ...options };
    Reflect.defineMetadata(CLASS_METADATA_KEY, medataValue, target);
  };
}