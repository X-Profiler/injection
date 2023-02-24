import { Injectable } from "../../../src";

@Injectable()
export class Config {
  #name = "custom::config";
  #key = "custom::key";

  set name(name: string) {
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set key(key: string) {
    this.#key = key;
  }

  get key() {
    return this.#key;
  }
}

@Injectable()
export class Config2 {
  #name = "custom::config2";
  #key = "custom::key2";

  set name(name: string) {
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set key(key: string) {
    this.#key = key;
  }

  get key() {
    return this.#key;
  }
}