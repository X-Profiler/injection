import { Injectable, Inject } from "../../../../src";
import { Config } from "../../items/config";

@Injectable()
export class AA {
  @Inject({ id: false as any })
  private illegal: Config;

  public getData() {
    return this.illegal;
  }
}