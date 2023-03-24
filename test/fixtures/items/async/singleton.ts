import { Injectable, ScopeType } from "../../../../src";

@Injectable({ scope: ScopeType.SINGLETON })
export class Singleton {
}