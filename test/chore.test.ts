import { strict as assert } from "assert";
import { getCalleeFromStack, toString } from "../src/lib/utils";

describe("chore.test.js", () => {
  describe("stack util", () => {
    it("get stack should be ok", () => {
      assert(getCalleeFromStack() !== "anonymous");
      assert(getCalleeFromStack(3) === "anonymous");
      assert(getCalleeFromStack(100) === "anonymous");
    });
  });

  describe("string util", () => {
    it("toString should be ok", () => {
      assert(toString(undefined as any) === "undefined");
      assert(toString(null as any) === "null");
      assert(toString(false as any) === "false");
      assert(toString({ a: 1 } as any) === "[object Object]");
      assert(toString("123") === "123");
      assert(toString(Symbol("123")) === "Symbol(123)");
      assert(toString(class StringUtil { }) === "class StringUtil");
    });
  });
});