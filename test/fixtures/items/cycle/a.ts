import { Inject, Injectable } from "../../../../src";
import { BB } from "./b";

@Injectable()
export class AA {
  @Inject()
  private bb: BB;

  say() {
    return "this is aa to say: " + this.bb.say();
  }
}