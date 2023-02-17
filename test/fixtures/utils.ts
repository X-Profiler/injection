import "reflect-metadata";
import {
  ClassConstructorMetadataT, ConstructableT,
  CLASS_CONSTRUCTOR_METADATA_KEY,
} from "../../src";

export function getClassMetadata(target: ConstructableT): ClassConstructorMetadataT {
  return Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, target);
}