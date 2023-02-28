import { Inject, Injectable, Module } from "../../../../src";
import { Logger } from "../logger";
import { Private } from "../mod1/private";

@Module()
@Injectable()
export class A3 {
  @Inject()
  private logger: Logger;

  @Inject()
  private private: Private;

  public say() {
    return this.logger.info(`log from mod3::class A3, ${this.private.say()}`);
  }
}