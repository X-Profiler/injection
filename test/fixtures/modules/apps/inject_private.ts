import { Inject, Injectable } from "../../../../src";
import { Module1 } from "../mod1";
import { Module1Private } from "../mod1/private";
Module1.register();


@Injectable()
export class InjectPrivate {
  @Inject()
  private module1Private: Module1Private;

  public msg() {
    return this.module1Private.echo();
  }
}