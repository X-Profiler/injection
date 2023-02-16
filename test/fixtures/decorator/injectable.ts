import { Injectable, Scope } from "../../../src";

@Injectable()
export class AA { }

@Injectable({})
export class BB { }

@Injectable({ id: "cc" })
export class CC { }

@Injectable({ scope: Scope.EXECUTION })
export class DD { }