import { Module } from "../../../../src";

export * from "./a1";
export * from "./b1";

export const unused = { foo: "bar" };

export class Unused { }

@Module()
@Module()
export class Module1 { }