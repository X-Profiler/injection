import { Injectable, Inject } from "../../../src";
import { Config } from "../items/config";

@Injectable()
export class AA {
  @Inject()
  private config: Config;

  getConfig(@Inject() config: Config) {
    return this.config || config;
  }
}