import { Injectable } from "../../../../../../src";

@Injectable()
export class Module1_1Public {
  public echo() {
    return "from class Module1_1Private";
  }
}