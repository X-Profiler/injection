import "reflect-metadata";
import {
  ClassConstructorMetadataT, ConstructableT,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, RecordClassMemberMetadataT,
} from "../../src";

export function getClassConstructorMetadata(target: ConstructableT): ClassConstructorMetadataT {
  return Reflect.getMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, target);
}

export function getClassProps(target: ConstructableT): string[] {
  return Reflect.getMetadata(CLASS_PROPS_KEY, target);
}

export function getClassMemberMetadata(target: ConstructableT, prop: string): RecordClassMemberMetadataT {
  return Reflect.getMetadata(`${CLASS_PROP_METADATA_PREFIX}${prop}`, target);
}