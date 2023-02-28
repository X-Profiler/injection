import { Injectable, ScopeType } from "../../../src";

@Injectable()
export class AA { }

@Injectable({})
export class BB { }

@Injectable({ id: "cc", scope: ScopeType.EXECUTION })
export class CC { }

@Injectable({ scope: ScopeType.TRANSIENT })
export class DD { }

export class EE { }