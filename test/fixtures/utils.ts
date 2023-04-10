import "reflect-metadata";
import {
  ClassConstructorMetadataT, ConstructableT,
  CLASS_CONSTRUCTOR_METADATA_KEY, CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, RecordClassMemberMetadataT,
} from "../../src";
import { is } from "../../src/lib/utils";

export function getClassConstructorMetadata(target: ConstructableT): ClassConstructorMetadataT {
  return Reflect.getOwnMetadata(CLASS_CONSTRUCTOR_METADATA_KEY, target);
}

export function getClassProps(target: ConstructableT, props: string[] = []): string[] {
  props.push(...(Reflect.getOwnMetadata(CLASS_PROPS_KEY, target) || []) as string[]);
  const proto = Reflect.getPrototypeOf(target);
  if (is.class(proto)) {
    getClassProps(proto as ConstructableT, props);
  }
  return props;
}

export function getClassMemberMetadata(target: ConstructableT, prop: string): RecordClassMemberMetadataT {
  return Reflect.getOwnMetadata(`${CLASS_PROP_METADATA_PREFIX}${prop}`, target);
}