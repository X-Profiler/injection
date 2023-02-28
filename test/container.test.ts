import { strict as assert } from "assert";
import { Container, ErrorType } from "../src";
import { createCustomError } from "../src/lib/utils";
import { UnInjectable, Foo, Bar } from "./fixtures/items/container";
import { Config, Config2, TransientConfig } from "./fixtures/items/config";


describe("container.test.js", () => {
  describe("container set & get", () => {
    const container = new Container();
    container.set({ id: "config1", value: 666 });
    container.set({ id: "config2", value: false });
    container.set({ id: "config3", value: { key: 666 } });

    container.set({ id: "foo", value: "bar" });
    container.set({ id: Foo, value: Symbol.for("foo") });

    container.set(Bar);
    container.set(Config);
    container.set(Config2);
    container.set({ id: Symbol.for("bar"), value: Bar });
    container.set({ id: "defautKey", value: "key" });
    container.set({ id: "key", value: "name" });

    it("items should be ok", () => {
      assert(container.get("config1") === 666);
      assert(container.get("config2") === false);
      assert.deepEqual(container.get("config3"), { key: 666 });
      assert(container.get("foo") === "bar");
      assert(container.get(Foo) === Symbol.for("foo"));

      const bar = container.get(Bar);
      assert(bar.getConfig(1) === "custom::config");
      assert(bar.getConfig(2) === "custom::key");
      assert(bar.getConfig(3) === "custom::config2");
      assert(bar.getConfig(4) === "custom::key2");
    });

    it("should throw when set basic value without", () => {
      let error = createCustomError();
      try {
        container.set({ value: 888 });
      } catch (err) {
        error = err;
      }
      assert(error.code === ErrorType.CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID);
    });

    it("should throw when set uninjectable class", () => {
      let error = createCustomError();
      try {
        container.set(UnInjectable);
      } catch (err) {
        error = err;
      }
      assert(error.code === ErrorType.CONTAINER_SET_FAILED_BY_NOT_INJECTABLE);
    });

    it("[1/2] should throw when get uninjectable class", () => {
      let error = createCustomError();
      try {
        container.get(Symbol.for("404"));
      } catch (err) {
        error = err;
      }
      assert(error.code === ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND);
    });

    it("[2/2] should throw when get uninjectable class", () => {
      let error = createCustomError();
      try {
        container.get("500");
      } catch (err) {
        error = err;
      }
      assert(error.code === ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND);
    });
  });

  describe("loop injection", () => {
    it("cycle inject should throw", async () => {
      let error = createCustomError();
      try {
        await import("./fixtures/items/cycle");
      } catch (err) {
        error = err;
      }
      assert(error.code === ErrorType.INJECT_FAILED_WITH_UNINITIALIZED_TYPE);
      assert(error.message.includes("class BB::aa => class Object"));
    });
  });

  describe("instance scope", () => {
    const container = new Container();
    container.set(Config);
    container.set(TransientConfig);

    it("single scope should be ok", () => {
      const config = container.get(Config);
      assert(container.get(Config) === config);
    });

    it("transient scope should be ok", () => {
      const config = container.get(TransientConfig);
      assert(container.get(TransientConfig) !== config);
    });
  });
});