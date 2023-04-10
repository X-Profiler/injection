import { Injectable } from "../../../../src";

@Injectable()
export class Module1Private {
  public echo() {
    return "from class Module1Private";
  }
}