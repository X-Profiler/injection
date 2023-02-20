import { Injectable, Inject } from "../../../../src";

@Injectable()
export class AA {
  @Inject()
  private uninitialized;

  foo() {
    return this.uninitialized;
  }
}