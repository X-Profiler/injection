import { Injectable, ScopeType } from "../../../src";

@Injectable()
export class AA { }

@Injectable({})
export class BB { }

@Injectable({ id: "cc" })
export class CC { }

@Injectable({ scope: ScopeType.EXECUTION })
export class DD { }

export class EE { }