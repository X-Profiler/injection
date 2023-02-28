import { Injectable } from "../../../../src";

@Injectable()
export class B1 {
  format(msg: string) {
    return `${msg}, format by b1`;
  }
}