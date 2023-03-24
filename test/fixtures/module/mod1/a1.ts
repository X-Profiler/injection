import { Inject, Injectable } from "../../../../src";
import { Logger } from "../logger";
import { A4 } from "../mod4";
import { Private } from "./private";

@Injectable()
export class A1 {
  @Inject()
  private logger: Logger;

  @Inject()
  private private: Private;

  @Inject()
  private a4: A4;

  public say() {
    return this.logger.info(`log from mod1::class A1, ${this.private.say()}`);
  }

  public say2() {
    return this.a4.say();
  }
}