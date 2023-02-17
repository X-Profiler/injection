import { Injectable } from "../../../src";

@Injectable()
export class Config {
  #name = "xprofiler::config";

  get name() {
    return this.#name;
  }
}