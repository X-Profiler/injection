import { Injectable } from "../../../../src";

@Injectable()
export class Message {
  public echo() {
    return "echo from Message";
  }
}