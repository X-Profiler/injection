import { Inject, Injectable } from "../../../src";
import { A1 } from "./mod1";
import { A4 } from "./mod4";

@Injectable()
export class Application {
  @Inject()
  private a1: A1;

  run1() {
    return this.a1.say();
  }

  run2() {
    return this.a1.say2();
  }
}

@Injectable()
export class Application2 {
  @Inject()
  private a4: A4;

  run() {
    return this.a4.say();
  }
}