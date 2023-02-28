import path from "path";
import { strict as assert } from "assert";
import { Container, DEFAULT_CONTAINER_TAG, ErrorType } from "../src";
import { createCustomError } from "../src/lib/utils";
import { Application } from "./fixtures/module/app";
import { A1, Module1 } from "./fixtures/module/mod1";
import { A2 } from "./fixtures/module/mod2";
import { A3 } from "./fixtures/module/mod3/a3";

describe("module.test.js", () => {
  const container = new Container();

  beforeAll(async function () {
    await container.findModuleExports([A3]);
    container.set(Application);
  });

  it("container name should be ok", () => {
    assert(container.name === DEFAULT_CONTAINER_TAG);
  });

  it("[1/2] app should run ok", () => {
    const app = container.get(Application);
    const message = app.run1();
    assert(message.includes("[info] log from mod1::class A1"));
    assert(message.includes("[debug] log from mod1::class Private"));
    assert(message.includes("format by b1"));
  });

  it("[2/2] app should run ok", () => {
    const app = container.get(Application);
    const message = app.run2();
    assert(app === container.get(Application));
    assert(message.includes("[info] log from mod4::class A4"));
    assert(message.includes("[debug] log from mod1::class Private"));
  });

  it("a1 should be ok", async () => {
    const a1 = container.get(A1);
    assert(a1);
  });

  it("a2 should throw error", async () => {
    let error = createCustomError();
    try {
      container.set(A2);
      container.get(A2);
    } catch (err) {
      error = err;
    }
    assert(error.code === ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND);
    assert(error.message.includes("class Private"));
  });

  it("a3 should throw error", async () => {
    let error = createCustomError();
    try {
      await container.findModuleExports();
      container.get(A3);
    } catch (err) {
      error = err;
    }
    assert(error.code === ErrorType.MODULE_INDEX_NOT_FOUND);
    assert(error.message.includes(path.join(__dirname, "fixtures/module/mod3")));
  });

  it("a4 should throw when parent container not inited", async () => {
    let error = createCustomError();
    try {
      const container = new Container();
      container.set(Application);
      await container.findModuleExports([Module1, A3]);
    } catch (err) {
      error = err;
    }
    assert(error.code === ErrorType.PARENT_CONTAINER_NOT_FOUND);
    assert(error.message.includes("class Module4"));
    assert(error.message.includes(`child: ${path.join(__dirname, "fixtures/module/mod4")}`));
    assert(error.message.includes(`parent: ${path.join(__dirname, "fixtures/module/mod1")}`));
  });
});