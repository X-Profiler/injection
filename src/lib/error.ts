import { ErrorCodeT, ErrorMessage, ErrorType } from "../";

class XpfError extends Error {
  public code: ErrorCodeT;

  constructor(code: ErrorCodeT) {
    super(ErrorMessage[code]);
    this.code = code;
  }
}

export function createXpfError(code: ErrorCodeT = ErrorType.EMPTY_INITIALIZED) {
  const error = new XpfError(code);
  return error;
}