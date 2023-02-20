import { strict as assert } from "assert";
import { Injectable } from "../fixtures/decorator";
import { getClassConstructorMetadata } from "../fixtures/utils";
import { Scope } from "../../src";


describe("injectable.test.js", () => {
  it("class AA metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.AA);
    assert(metadata.id === Injectable.AA);
    assert(metadata.scope === Scope.SINGLETON);
  });

  it("class BB metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.BB);
    assert(metadata.id === Injectable.BB);
    assert(metadata.scope === Scope.SINGLETON);
  });

  it("class CC metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.CC);
    assert(metadata.id === "cc");
    assert(metadata.scope === Scope.SINGLETON);
  });

  it("class DD metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.DD);
    assert(metadata.id === Injectable.DD);
    assert(metadata.scope === Scope.EXECUTION);
  });

  it("class EE not have metadata", () => {
    const metadata = getClassConstructorMetadata(Injectable.EE);
    const hasMetadata = !!metadata;
    assert(!hasMetadata);
  });
});