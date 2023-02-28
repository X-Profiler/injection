function prepareObjectStackTrace(err: Error, stack: NodeJS.CallSite[]) {
  err;
  return stack;
}

export function getCalleeFromStack(stackIndex = 5): string {
  const prep = Error.prepareStackTrace;
  const limit = Error.stackTraceLimit;

  Error.prepareStackTrace = prepareObjectStackTrace;
  Error.stackTraceLimit = 10;

  // capture the stack
  const obj: { stack: NodeJS.CallSite[] } = {
    stack: [],
  };
  Error.captureStackTrace(obj);

  const fileName = obj.stack[stackIndex]?.getFileName() || "anonymous";

  // restore
  Error.prepareStackTrace = prep;
  Error.stackTraceLimit = limit;

  return fileName;
}