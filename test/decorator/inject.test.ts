import { strict as assert } from "assert";
import {
  ClassFunctionArgMetadataT, ClassPropMetadataT,
  ErrorType, PropType, CLASS_CONSTRUCTOR_TAG,
  Container,
} from "../../src";
import { createCustomError } from "../../src/utils";
import { Inject } from "../fixtures/decorator";
import { Config } from "../fixtures/items/config";
import { getClassProps, getClassMemberMetadata } from "../fixtures/utils";


describe("injectable.test.js", () => {
  it("class metadata should be ok", () => {
    const container = new Container();
    container.set(Inject.Child1);
    container.set(Inject.Child2);
    const child1 = container.get(Inject.Child1);
    assert(child1.config);
    const props1 = getClassProps(Inject.Child1);
    const props2 = getClassProps(Inject.Child2);
    assert.deepEqual(props1, ["child1", CLASS_CONSTRUCTOR_TAG]);
    assert.deepEqual(props2, ["child2", CLASS_CONSTRUCTOR_TAG]);
    assert.notEqual(props1, props2);
  });

  it("class AA props should be ok", () => {
    const props = getClassProps(Inject.AA);
    assert.deepEqual(props, ["config1", "config2", "config3", "config4", "config5", "getConfig", CLASS_CONSTRUCTOR_TAG]);
  });

  it("class AA injected prop config1 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config1");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.list[0].id === Config);
    assert((metadata.list[0] as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config2 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config2");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.list[0].id === Config);
    assert((metadata.list[0] as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config3 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config3");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.list[0].id === Config);
    assert((metadata.list[0] as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config4 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config4");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.list[0].id === "config");
    assert((metadata.list[0] as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop config5 metadata shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "config5");
    assert(metadata.type === PropType.PROPERTY);
    assert(metadata.list[0].id === "config");
    assert((metadata.list[0] as ClassPropMetadataT).lazy === false);
  });

  it("class AA injected prop 6/7 metadata (constructor) shoule be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, CLASS_CONSTRUCTOR_TAG);
    assert(metadata.type === PropType.FUNCTION);
    assert(metadata.list.length === 2);
    assert(metadata.list[0].id === Config);
    assert((metadata.list[0] as ClassFunctionArgMetadataT).index === 0);
    assert(metadata.list[1].id === "config7");
    assert((metadata.list[1] as ClassFunctionArgMetadataT).index === 1);
  });

  it("class AA injected function arg shouble be ok", () => {
    const metadata = getClassMemberMetadata(Inject.AA, "getConfig");
    assert(metadata.type === PropType.FUNCTION);
    assert(metadata.list.length === 1);
    assert(metadata.list[0].id === Config);
    assert((metadata.list[0] as ClassFunctionArgMetadataT).index === 0);
  });

  it("should throw with uninlizated types", async () => {
    let error = createCustomError();
    try {
      await import("../fixtures/decorator/error/inject_illegal");
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.code === ErrorType.INJECT_FAILED_WITH_ILLEGAL_IDENTIFIER);
  });

  it("should throw with uninlizated types", async () => {
    let error = createCustomError();
    try {
      await import("../fixtures/decorator/error/inject_uninitialized");
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.code === ErrorType.INJECT_FAILED_WITH_UNINITIALIZED_TYPE);
  });

  it("inject should throw error with static props", async () => {
    let error = createCustomError();
    try {
      await import("../fixtures/decorator/error/inject_static");
    } catch (err) {
      error = err;
    }
    assert(error);
    assert(error.code === ErrorType.INJECT_FAILED_WITH_STATIC_PROP);
  });
});