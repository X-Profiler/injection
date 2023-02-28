import { Inject, Injectable, Module } from "../../../../src";
import { Logger } from "../logger";
import { Private } from "../mod1/private";

@Module()
@Injectable()
export class A2 {
  @Inject()
  private logger: Logger;

  @Inject()
  private private: Private;

  public say() {
    return this.logger.info(`log from mod2::class A2, ${this.private.say()}`);
  }
}