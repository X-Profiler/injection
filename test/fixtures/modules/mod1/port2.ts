import { Inject, Injectable } from "../../../../src";
import { Module1_2Public } from "./mod1_2";

@Injectable()
export class Module1Bar {
  @Inject()
  private module1_2Public: Module1_2Public;

  public echo() {
    return "from class Module1Bar" +
      ` (${this.module1_2Public.echo()})`;
  }
}