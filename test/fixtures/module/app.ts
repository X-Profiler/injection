import { Inject, Injectable } from "../../../src";
import { A1 } from "./mod1";
import { A4 } from "./mod4";
import { A5 } from "./mod5";
import { A6 } from "./mod6";
import { A7 } from "./mod7";

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

@Injectable()
export class Application3 {
  @Inject()
  private a5: A5;

  run() {
    return this.a5.say();
  }
}

@Injectable()
export class Application4 {
  @Inject()
  private a6: A6;

  run() {
    return this.a6.say();
  }
}

@Injectable()
export class Application5 {
  @Inject()
  private a6: A7;

  run() {
    return this.a6.say();
  }
}