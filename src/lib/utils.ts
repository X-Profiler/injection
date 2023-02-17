import { ConstructableT } from "../";

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

function isStatic(clazz: ConstructableT, key: string) {
  return Reflect.ownKeys(clazz).includes(key);
}

function isIdentifier(val: any) {
  return isString(val) || isSymbol(val) || isFunction(val);
}

export const is = {
  number: isNumber,
  string: isString,
  function: isFunction,
  symbol: isSymbol,
  static: isStatic,
  identifier: isIdentifier,
};

export function getMetadataType(prototype: object, prop: string, index?: number) {
  return isNumber(index) ?
    Reflect.getMetadata("design:paramtypes", prototype, prop)[index as number] :
    Reflect.getMetadata("design:type", prototype, prop);
}