import { Injectable, Inject } from "../../../../src";

@Injectable()
export class AA {
  @Inject()
  static initialized = "mock static";
}