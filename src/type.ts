import { Scope } from "./constant";

export type ConstructableT = new (...args: any[]) => any;

export type IdentifierT = string | symbol | ConstructableT;

export type ScopeT = (typeof Scope)[keyof (typeof Scope)];

export type InjectableOptions = {
  id: IdentifierT,
  scope: ScopeT,
};

export type ClassMetaDataT = Pick<InjectableOptions, "id" | "scope">;
