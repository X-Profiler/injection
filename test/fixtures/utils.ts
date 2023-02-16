import "reflect-metadata";
import {
  ClassMetaDataT, ConstructableT,
  CLASS_METADATA_KEY,
} from "../../src";

export function getClassMetadata(target: ConstructableT): ClassMetaDataT {
  return Reflect.getMetadata(CLASS_METADATA_KEY, target);
}