import { strict as assert } from "assert";
import { Injectable } from "../fixtures/decorator";
import { getClassConstructorMetadata } from "../fixtures/utils";
import { ScopeType } from "../../src";


describe("injectable.test.js", () => {
  it("class AA metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.AA);
    assert(metadata.id === Injectable.AA);
    assert(metadata.scope === ScopeType.SINGLETON);
  });

  it("class BB metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.BB);
    assert(metadata.id === Injectable.BB);
    assert(metadata.scope === ScopeType.SINGLETON);
  });

  it("class CC metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.CC);
    assert(metadata.id === "cc");
    assert(metadata.scope === ScopeType.EXECUTION);
  });

  it("class DD metadata shoule be ok", () => {
    const metadata = getClassConstructorMetadata(Injectable.DD);
    assert(metadata.id === Injectable.DD);
    assert(metadata.scope === ScopeType.TRANSIENT);
  });

  it("class EE not have metadata", () => {
    const metadata = getClassConstructorMetadata(Injectable.EE);
    const hasMetadata = !!metadata;
    assert(!hasMetadata);
  });
});