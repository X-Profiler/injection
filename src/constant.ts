
const PREFIX = "XPROFILER";

export const CLASS_CONSTRUCTOR_METADATA_KEY = `${PREFIX}::CLASS_CONSTRUCTOR`;
export const CLASS_PROPS_KEY = `${PREFIX}::CLASS_PROP`;
export const CLASS_PROP_METADATA_PREFIX = `${PREFIX}::CLASS_PROP_METADATA::`;
export const CLASS_CONSTRUCTOR_TAG = `${PREFIX}::CLASS_CONSTRUCTOR_TAG`;
export const DEFAULT_CONTAINER_TAG = `${PREFIX}::DEFAULT_CONTAINER`;
export const MODULE_METADATA_KEY = `${PREFIX}::MODULE_METADATA_KEY`;

export const ScopeType = {
  SINGLETON: `${PREFIX}::SINGLETON`,
  EXECUTION: `${PREFIX}::EXECUTION`,
  TRANSIENT: `${PREFIX}::TRANSIENT`,
} as const;

export const PropType = {
  PROPERTY: `${PREFIX}::PROPERTY`,
  FUNCTION: `${PREFIX}::FUNCTION`,
} as const;

export const ErrorType = {
  EMPTY_INITIALIZED: `${PREFIX}::EMPTY_INITIALIZED`,
  INJECT_FAILED_WITH_STATIC_PROP: `${PREFIX}::INJECT_FAILED_WITH_STATIC_PROP`,
  INJECT_FAILED_WITH_ILLEGAL_IDENTIFIER: `${PREFIX}::INJECT_FAILED_WITH_ILLEGAL_IDENTIFIER`,
  INJECT_FAILED_WITH_UNINITIALIZED_TYPE: `${PREFIX}::INJECT_FAILED_WITH_UNINITIALIZED_TYPE`,
  CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID: `${PREFIX}::CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID`,
  CONTAINER_SET_FAILED_BY_NOT_INJECTABLE: `${PREFIX}::CONTAINER_SET_FAILED_BY_NOT_INJECTABLE`,
  CONTAINER_GET_FAILED_BY_NOT_FOUND: `${PREFIX}::CONTAINER_GET_FAILED_BY_NOT_FOUND`,
  PARENT_CONTAINER_NOT_FOUND: `${PREFIX}::PARENT_MODULE_NOT_FOUND`,
  MODULE_INDEX_NOT_FOUND: `${PREFIX}::MODULE_INDEX_NOT_FOUND`,
  MODULE_CIRCULAR_DEPENDENCY: `${PREFIX}::MODULE_CIRCULAR_DEPENDENCY`,
} as const;

export const ErrorMessage = {
  [ErrorType.EMPTY_INITIALIZED]: "empty initialized",
  [ErrorType.INJECT_FAILED_WITH_STATIC_PROP]: "should not inject static props!",
  [ErrorType.INJECT_FAILED_WITH_ILLEGAL_IDENTIFIER]: "should inject with legal identifier!",
  [ErrorType.INJECT_FAILED_WITH_UNINITIALIZED_TYPE]: "should inject with reflect type or id!",
  [ErrorType.CONTAINER_SET_FAILED_BY_BASIC_TYPE_WITHOUT_ID]: "basic type injection needs id!",
  [ErrorType.CONTAINER_SET_FAILED_BY_NOT_INJECTABLE]: "class is not injectable!",
  [ErrorType.CONTAINER_GET_FAILED_BY_NOT_FOUND]: "injected value not found!",
  [ErrorType.PARENT_CONTAINER_NOT_FOUND]: "parent container not found!",
  [ErrorType.MODULE_INDEX_NOT_FOUND]: "needs index(entrance) at module root!",
  [ErrorType.MODULE_CIRCULAR_DEPENDENCY]: "circular dependency found!",
} as const;