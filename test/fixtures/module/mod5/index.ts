import { Module, Inject } from "../../../../src";
import { Logger } from "../logger";

export class NotAModule { }

@Module()
export class Module5 {
  static get parent() {
    return NotAModule;
  }
}

export class A5 {
  @Inject()
  private logger: Logger;

  say() {
    return this.logger.info("hello from mod5::class A5");
  }
}