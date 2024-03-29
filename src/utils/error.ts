import { ErrorMessage, ErrorType } from "../shared/constant";
import { ErrorCodeT } from "../shared/type";

class CustomError extends Error {
  public code: ErrorCodeT;

  constructor(code: ErrorCodeT, format: (str: string) => string) {
    super(format(ErrorMessage[code]));
    this.code = code;
  }
}

export function createCustomError(code: ErrorCodeT = ErrorType.EMPTY_INITIALIZED, format = (str: string) => str) {
  const error = new CustomError(code, format);
  return error;
}