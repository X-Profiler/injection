import { ScopeType, PropType, ErrorType, ErrorMessage } from "./";

export type ConstructableT<T = unknown> = new (...args: any[]) => T;

export type IdentifierT<T = unknown> = string | symbol | ConstructableT<T>;

export type IdeintifiedT<T = unknown> = string | number | boolean | symbol | object | ConstructableT<T>;

export type ScopeT = (typeof ScopeType)[keyof (typeof ScopeType)];

export type ClassMemberMetadataT = (ClassPropMetadataT | ClassFunctionArgMetadataT);

export type ErrorCodeT = (typeof ErrorType)[keyof (typeof ErrorType)];

export type ErrorMessageT = (typeof ErrorMessage)[keyof (typeof ErrorMessage)];

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

export interface InjectBaseOptions {
  id?: IdentifierT,
}

export interface ContainerSetOptions {
  value: IdeintifiedT,
  id?: IdentifierT,
}

export interface RecordClassMemberMetadataT {
  type: (typeof PropType)[keyof (typeof PropType)],
  list: ClassMemberMetadataT[],
}
