import { is, getMetadataType, createXpfError } from "../lib/utils";
import {
  ClasMemberMetadataT, IdentifierT,
  InjectOptions,
  CLASS_PROPS_KEY, CLASS_PROP_METATA_PREFIX, PropType, ErrorType,
} from "../";

export function Inject(options?: IdentifierT | InjectOptions) {
  return (target: any, prop: string, index?: number) => {
    const clazz = is.function(target) ? target : target.constructor;
    if (is.static(clazz, prop)) {
      throw createXpfError(ErrorType.INJECT_FAILED_WITH_STATIC_PROP);
    }

    // format options
    options = is.identifier(options) ? { id: options as IdentifierT } : options as InjectOptions;

    // get id
    const id: IdentifierT = !options ? getMetadataType(clazz.prototype, prop, index) : options.id;
    if (!options && !is.class(id)) {
      throw createXpfError(ErrorType.INJECT_FAILED_WITH_UNINITIALIZED_TYPE);
    }

    // set props
    const props = Reflect.getMetadata(CLASS_PROPS_KEY, clazz);
    if (Array.isArray(props)) {
      props.push(prop);
    } else {
      Reflect.defineMetadata(CLASS_PROPS_KEY, [prop], clazz);
    }

    // set prop metadata
    let metadata: ClasMemberMetadataT;
    if (is.number(index)) {
      metadata = { id, type: PropType.FUNCTION, index: index as number };
    } else {
      metadata = { id, type: PropType.PROPERTY, lazy: false, ...options };
    }
    Reflect.defineMetadata(`${CLASS_PROP_METATA_PREFIX}${prop}`, metadata, clazz);
  };
}