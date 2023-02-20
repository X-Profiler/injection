import { Scope, PropType, ErrorType, ErrorMessage } from "./";

export type ConstructableT = new (...args: any[]) => any;

export type IdentifierT = string | symbol | ConstructableT;

export type ScopeT = (typeof Scope)[keyof (typeof Scope)];

export type ClasMemberMetadataT = (ClassPropMetadataT | ClassFunctionArgMetadataT) & { type: (typeof PropType)[keyof (typeof PropType)] };

export type ErrorCodeT = (typeof ErrorType)[keyof (typeof ErrorType)];

export type ErrorMessageT = (typeof ErrorMessage)[keyof (typeof ErrorMessage)];

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
