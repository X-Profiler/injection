import path from "path";
import { strict as assert } from "assert";
import { Container, DEFAULT_CONTAINER_TAG, ErrorType } from "../src";
import { createCustomError } from "../src/lib/utils";
import { Application } from "./fixtures/modules/app";
import { ModuleCommon, Message } from "./fixtures/modules/common";
import { Unused } from "./fixtures/modules/mod1/chore";
import { Module1Foo } from "./fixtures/modules/mod1";
import { Module1_1Public } from "./fixtures/modules/mod1/mod1_1";

describe("module.test.js", () => {
  const container = new Container();
  container.set(Application);

  beforeEach(async function () {
    await container.ready([ModuleCommon.tag()]);
  });

  it("should echo success", () => {
    const app = container.get(Application);
    const msg = app.msg();
    assert(msg.includes("from class Module1Foo"));
    assert(msg.includes("from class Module1Private"));
    assert(msg.includes("echo from Message"));
    assert(msg.includes("echo from Logger"));
    assert(msg.includes("from class Module1_1Private"));
  });

  it("should choose correct module", async () => {
    const containerApp = container.choose(Application);
    assert(containerApp.tag === DEFAULT_CONTAINER_TAG);

    const containerMessage = container.choose(Message);
    assert(containerMessage.tag === path.join(__dirname, "fixtures/modules/common"));

    const containerUnusedA = container.choose(Unused);
    assert(containerUnusedA.tag === DEFAULT_CONTAINER_TAG);
  });

  it("[1/2] should ok when set export: true", async () => {
    const containerMod1Foo = container.choose(Module1Foo);
    assert(containerMod1Foo.tag === path.join(__dirname, "fixtures/modules/mod1"));
    const context = { req: { date: Date.now() + "::" + Math.random().toString(16).slice(2) } };
    containerMod1Foo.set({ id: "context1", value: context, export: true });
    const containerApp = container.choose(Application);
    assert.deepEqual(containerApp.get("context1"), context);
  });

  it("[2/2] should ok when set export: true", async () => {
    const containerMod1_1Public = container.choose(Module1_1Public);
    assert(containerMod1_1Public.tag === path.join(__dirname, "fixtures/modules/mod1/mod1_1"));
    const context = { req: { date: Date.now() + "::" + Math.random().toString(16).slice(2) } };
    containerMod1_1Public.set({ id: "context2", value: context, export: true });
    const containerMod1Foo = container.choose(Module1Foo);
    assert.deepEqual(containerMod1Foo.get("context2"), context);
  });

  it("should throw error when inject module private class", async () => {
    let error = createCustomError();
    try {
      const { Application2 } = await import("./fixtures/modules/app2");
      container.set(Application2);
      const app = container.get(Application2);
      app.msg();
    } catch (err) {
      error = err;
    }
    assert(error.code === ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND);
    assert(error.message.includes("class Module1Private"));
    assert(error.message.includes("injected value not found"));
  });

  it("should throw error when module not have index(entrance)", async () => {
    let error = createCustomError();
    try {
      const { Module2 } = await import("./fixtures/modules/mod2");
      Module2.register();
      await container.ready();
    } catch (err) {
      error = err;
    }
    assert(error.code === ErrorType.MODULE_INDEX_NOT_FOUND);
    assert(error.message.includes(path.join(__dirname, "fixtures/modules/mod2/mod2_1")));
  });
});