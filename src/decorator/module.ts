import path from "path";
import { getCalleeFromStack } from "../lib/utils";
import {
  Container,
  ModuleMetadataT,
  MODULE_METADATA_KEY,
} from "..";

export function Module() {
  return (target: any) => {
    const modulePath = path.dirname(getCalleeFromStack());
    if (Container.modules.includes(target)) {
      return;
    }
    const metadata: ModuleMetadataT = { path: modulePath };
    Reflect.defineMetadata(MODULE_METADATA_KEY, metadata, target);
    Container.modules.push(target);
  };
}
