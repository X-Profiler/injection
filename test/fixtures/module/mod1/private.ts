import { Inject, Injectable } from "../../../../src";
import { Logger } from "../logger";
import { B1 } from "./b1";

@Injectable()
export class Private {
  @Inject()
  private logger: Logger;

  @Inject()
  private b1: B1;

  say() {
    return this.logger.debug(this.b1.format("log from mod1::class Private"));
  }
}