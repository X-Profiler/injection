import { Inject, Injectable, Module } from "../../../../src";
import { Logger } from "../logger";
import { Module1 } from "../mod1";
import { Private } from "../mod1/private";

@Module()
export class Module4 {
  static get parent() {
    return Module1;
  }
}

@Injectable()
export class A4 {
  @Inject()
  private logger: Logger;

  @Inject()
  private private: Private;

  public say() {
    return this.logger.info(`log from mod4::class A4, ${this.private.say()}`);
  }
}