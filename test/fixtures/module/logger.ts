import { Injectable } from "../../../src";

@Injectable()
export class Logger {
  info(msg: string) {
    return `[info] ${msg}`;
  }

  error(msg: string) {
    return `[error] ${msg}`;
  }

  debug(msg: string) {
    return `[debug] ${msg}`;
  }
}