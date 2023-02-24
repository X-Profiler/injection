import { Inject, Injectable } from "../../../../src";
import { AA } from "./a";

@Injectable()
export class BB {
  @Inject()
  private aa: AA;

  say() {
    return "this is bb to say: " + this.aa.say();
  }
}