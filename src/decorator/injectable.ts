import {
  CLASS_CONSTRUCTOR_METADATA_KEY,
  InjectableOptions,
  ScopeType,
} from "../";

export function Injectable(options?: Partial<InjectableOptions>) {
  return (target: any) => {
    const medata = { id: target, scope: ScopeType.SINGLETON, ...options };
    Reflect.defineMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, medata, target);
  };
}