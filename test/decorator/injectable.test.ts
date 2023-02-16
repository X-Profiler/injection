import { strict as assert } from "assert";
import { describe, it } from "vitest";
import { Injectable } from "../fixtures/decorator";
import { getClassMetadata } from "../fixtures/utils";
import { Scope } from "../../src";


describe("injectable.test.js", () => {
  it("class AA metadata shoule be ok", () => {
    const metadata = getClassMetadata(Injectable.AA);
    assert(metadata.id === Injectable.AA);
    assert(metadata.scope === Scope.SINGLETON);
  });

  it("class BB metadata shoule be ok", () => {
    const metadata = getClassMetadata(Injectable.BB);
    assert(metadata.id === Injectable.BB);
    assert(metadata.scope === Scope.SINGLETON);
  });

  it("class CC metadata shoule be ok", () => {
    const metadata = getClassMetadata(Injectable.CC);
    assert(metadata.id === "cc");
    assert(metadata.scope === Scope.SINGLETON);
  });

  it("class DD metadata shoule be ok", () => {
    const metadata = getClassMetadata(Injectable.DD);
    assert(metadata.id === Injectable.DD);
    assert(metadata.scope === Scope.EXECUTION);
  });
});