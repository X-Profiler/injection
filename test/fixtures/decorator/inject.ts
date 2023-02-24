import { Injectable, Inject } from "../../../src";
import { Config } from "../items/config";

@Injectable()
export class AA {
  @Inject()
  private config1: Config;

  @Inject(Config)
  private config2: Config;

  @Inject({ id: Config })
  private config3: Config;

  @Inject("config")
  private config4: Config;

  @Inject({ id: "config" })
  private config5: Config;

  private config6: Config;

  private config7: Config;

  constructor(@Inject() config: Config, @Inject("config7") config7: Config) {
    this.config6 = config;
    this.config7 = config7;
  }

  getConfig(@Inject() config: Config) {
    return this.config1 || this.config2 || this.config3 || this.config4 || this.config5 || this.config6 || this.config7 || config;
  }
}