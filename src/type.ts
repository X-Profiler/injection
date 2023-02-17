import { Scope } from "./";

export type ConstructableT = new (...args: any[]) => any;

export type IdentifierT = string | symbol | ConstructableT;

export type ScopeT = (typeof Scope)[keyof (typeof Scope)];

export type ClasMemberMetadataT = ClassPropMetadataT | ClassFunctionArgMetadataT;

export interface InjectBaseOptions {
  id?: IdentifierT,
}

export interface InjectableOptions extends InjectBaseOptions {
  scope?: ScopeT,
}

export interface InjectOptions extends InjectBaseOptions {
  lazy?: boolean,
}

export interface ClassConstructorMetadataT extends Required<Pick<InjectableOptions, "id" | "scope">> { }

export interface ClassPropMetadataT extends Required<Pick<InjectOptions, "id" | "lazy">> { }

export interface ClassFunctionArgMetadataT extends Required<Pick<InjectOptions, "id">> {
  index: number,
}
