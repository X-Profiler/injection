import { Inject, Injectable } from "../../../../src";
import { Logger } from "../logger";
import { Private } from "./private";

@Injectable()
export class A1 {
  @Inject()
  private logger: Logger;

  @Inject()
  private private: Private;

  public say() {
    return this.logger.info(`log from mod1::class A1, ${this.private.say()}`);
  }
}