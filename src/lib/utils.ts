import { CLASS_CONSTRUCTOR_TAG } from "../constant";
import { ConstructableT } from "../type";

function isBoolean(bool: any) {
  return typeof bool === "boolean";
}

function isObject(obj: any) {
  return obj !== null && typeof obj === "object";
}

function isNumber(num: any) {
  return typeof num === "number";
}

function isString(str) {
  return typeof str === "string";
}

function isFunction(func: any) {
  return typeof func === "function";
}

function isSymbol(sym: any) {
  return typeof sym === "symbol";
}

function isUndefined(undef: any) {
  return typeof undef === "undefined";
}

function isNull(nul: any) {
  return nul === null;
}

function isClass(clazz: any) {
  return isFunction(clazz) && Function.prototype.toString.call(clazz).includes("class ");
}

function isIdentifier(val: any) {
  return isString(val) || isSymbol(val) || isFunction(val);
}

function isConstructor(cons: string) {
  return cons === CLASS_CONSTRUCTOR_TAG;
}

function includes(object: any, key: string) {
  return (isObject(object) || isFunction(object)) && Reflect.ownKeys(object).includes(key);
}

export const is = {
  boolean: isBoolean,
  object: isObject,
  number: isNumber,
  string: isString,
  function: isFunction,
  symbol: isSymbol,
  undefined: isUndefined,
  null: isNull,
  class: isClass,
  identifier: isIdentifier,
  constructor: isConstructor,
  includes,
};

export function getMetadataType(clazz: ConstructableT, prop: string, index?: number) {
  return isConstructor(prop) ?
    Reflect.getMetadata("design:paramtypes", clazz)[index as number] :
    isNumber(index) ?
      Reflect.getMetadata("design:paramtypes", clazz.prototype, prop)[index as number] :
      Reflect.getMetadata("design:type", clazz.prototype, prop);
}

export function toString(val: any): string {
  if (isUndefined(val)) {
    return "undefined";
  }

  if (isNull(val)) {
    return "null";
  }

  if (isBoolean(val) || isObject(val)) {
    return val.toString();
  }

  if (isString(val)) {
    return val as string;
  }

  if (isSymbol(val)) {
    return (val as symbol).toString();
  }

  return `class ${(val as ConstructableT).name}`;
}

export * from "./error";

export * from "./stack";
