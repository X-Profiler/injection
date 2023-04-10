import { Inject, Injectable } from "../../../../src";
import { Module1Private } from "./private";
import { Message } from "../common/message";
import { Logger } from "../logger";
import { Module1_1Public } from "./mod1_1";

@Injectable()
export class Module1Foo {
  @Inject()
  private module1Private: Module1Private;
  @Inject()
  private message: Message;
  @Inject()
  private logger: Logger;
  @Inject()
  private module1_1public: Module1_1Public;

  public echo() {
    return "from class Module1Foo" +
      ` (${this.module1Private.echo()}) ` +
      ` (${this.message.echo()}) ` +
      ` (${this.logger.echo()}) ` +
      ` (${this.module1_1public.echo()}) `;
  }
}

export const Module1FooTag = "module1Foo";