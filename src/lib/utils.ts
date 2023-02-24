import { CLASS_CONSTRUCTOR_TAG, ConstructableT, IdentifierT } from "../";

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
  object: isObject,
  number: isNumber,
  string: isString,
  function: isFunction,
  symbol: isSymbol,
  undefined: isUndefined,
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

export function toString(val: IdentifierT): string {
  if (isString(val)) {
    return val as string;
  } else if (isSymbol(val)) {
    return (val as symbol).toString();
  } else {
    return `class ${(val as ConstructableT).name}`;
  }
}

export * from "./error";
