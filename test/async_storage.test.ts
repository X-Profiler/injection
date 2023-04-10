import { strict as assert } from "assert";
import { Container, ErrorType } from "../src";
import { createCustomError } from "../src/utils";
import { Singleton, Execution } from "./fixtures/items/async";

describe("async_storage.test.js", () => {
  const container = new Container();
  container.set(Singleton);
  container.set(Execution);

  it("singleton should be ok", async () => {
    const singleton1 = container.get(Singleton);
    let singleton2: Singleton | undefined;
    let singleton3: Singleton | undefined;
    await container.run(async () => {
      singleton2 = container.get(Singleton);
    });

    await container.run(async () => {
      singleton3 = container.get(Singleton);
    });

    assert.equal(singleton1, singleton2);
    assert.equal(singleton1, singleton3);
    assert.equal(singleton2, singleton3);
  });

  it("execution should be ok", async () => {
    const execution1 = container.get(Execution);
    let execution2_1: Execution | undefined;
    let execution2_2: Execution | undefined;
    let execution3_1: Execution | undefined;
    let execution3_2: Execution | undefined;
    await container.run(async () => {
      execution2_1 = container.get(Execution);
      execution2_2 = container.get(Execution);
    });

    await container.run(async () => {
      execution3_1 = container.get(Execution);
      execution3_2 = container.get(Execution);
    });

    assert.notEqual(execution1, execution2_1);
    assert.notEqual(execution1, execution3_1);
    assert.notEqual(execution2_1, execution3_1);
    assert.equal(execution2_1, execution2_2);
    assert.equal(execution3_1, execution3_2);
  });

  it("execution item should be ok", async () => {
    const id = Symbol("contextKey");
    let idx1_1: number | undefined;
    let idx1_2: number | undefined;
    let idx2_1: number | undefined;
    let idx2_2: number | undefined;

    await container.run(async () => {
      container.set({ id, value: 1, export: true });

      await new Promise(resolve => setTimeout(() => {
        idx1_1 = container.get(id);
        resolve(1);
      }, 100));

      await new Promise(resolve => setTimeout(() => {
        idx1_2 = container.get(id);
        resolve(1);
      }, 100));
    });

    await container.run(async () => {
      container.set({ id, value: 2 });

      await new Promise(resolve => setTimeout(() => {
        idx2_1 = container.get(id);
        resolve(1);
      }, 100));

      await new Promise(resolve => setTimeout(() => {
        idx2_2 = container.get(id);
        resolve(1);
      }, 100));
    });

    assert.equal(idx1_1, idx1_2);
    assert.equal(idx2_1, idx2_2);
    assert.notEqual(idx1_1, idx2_2);

    let error = createCustomError();
    try {
      container.get(id);
    } catch (err) {
      error = err;
    }
    assert(error.code === ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND);
  });
});