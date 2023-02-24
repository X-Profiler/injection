import { Inject, Injectable } from "../../../src";
import { Config, Config2 } from "./config";

export class UnInjectable { }

@Injectable()
export class Foo { }

@Injectable()
export class Bar {
  @Inject()
  private config1: Config;
  @Inject({ lazy: true })
  private config2: Config2;

  private key: string;

  public unused: string;


  constructor(unused: string, @Inject("defautKey") key: string) {
    this.key = key;
    this.unused = unused;
  }

  getConfig(from: number, @Inject("key") key?: string) {
    if (!key) {
      throw new Error("should have key!");
    }

    if (from === 1) {
      return this.config1[key];
    }

    if (from === 2) {
      return this.config1[this.key];
    }

    if (from === 3) {
      return this.config2[key];
    }

    if (from === 4) {
      return this.config2[this.key];
    }
  }
}