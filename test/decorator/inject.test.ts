import { strict as assert } from "assert";
import { ClassFunctionArgMetadataT, ClassPropMetadataT, ErrorType, PropType, createXpfError } from "../../src";
import { Inject } from "../fixtures/decorator";
import { Config } from "../fixtures/items/config";
import { getClassProps, getClassMemberMetadata } from "../fixtures/utils";


describe("injectable.test.js", () => {
  it("class AA props should be ok", () => {
    const props = getClassProps(Inject.AA);
    assert.deepEqual(props, ["config1", "config2", "config3", "config4", "config5", "getConfig"]);
  });

  it("class AA injected prop config1 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config1");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.id === Config);
    assert((metadata as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config2 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config2");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.id === Config);
    assert((metadata as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config3 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config3");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.id === Config);
    assert((metadata as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config4 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config4");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.id === "config");
    assert((metadata as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config5 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config5");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.id === "config");
    assert((metadata as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected function arg shouble be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "getConfig");
    assert(metadata.type === PropType.FUNCTION);
    assert(metadata.id === Config);
    assert((metadata as ClassFunctionArgMetadataT).index === 0);
  });

  it("should throw with uninlizated types", async () => {
    let error = createXpfError();
    try {
      await import("../fixtures/decorator/error/inject_uninitialized");
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.code === ErrorType.INJECT_FAILED_WITH_UNINITIALIZED_TYPE);
  });

  it("inject should throw error with static props", async () => {
    let error = createXpfError();
    try {
      await import("../fixtures/decorator/error/inject_static");
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.code === ErrorType.INJECT_FAILED_WITH_STATIC_PROP);
  });
});