import { Injectable } from "../../../src";

@Injectable()
export class Logger {
  public echo() {
    return "echo from Logger";
  }
}