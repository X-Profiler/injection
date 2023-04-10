import { CLASS_PROPS_KEY, CLASS_PROP_METADATA_PREFIX, PropType, ErrorType, CLASS_CONSTRUCTOR_TAG } from "../shared/constant";
import { IdentifierT, RecordClassMemberMetadataT, InjectOptions } from "../shared/type";
import { createCustomError } from "../utils/error";
import { is, getOwnMetadataType, toString } from "../utils/helper";

export function Inject(options?: IdentifierT | InjectOptions) {
  return (target: any, prop: string | undefined, index?: number) => {
    const clazz = is.function(target) ? target : target.constructor;
    prop = (is.undefined(prop) ? CLASS_CONSTRUCTOR_TAG : prop) as string;

    // check static
    if (is.includes(clazz, prop)) {
      throw createCustomError(ErrorType.INJECT_FAILED_WITH_STATIC_PROP);
    }

    // format options
    options = is.identifier(options) ? { id: options as IdentifierT } : options as InjectOptions;

    // get & check id
    const id: IdentifierT = is.includes(options, "id") ? options.id : getOwnMetadataType(clazz, prop, index);
    if (is.includes(options, "id") && !is.identifier(options.id)) {
      throw createCustomError(ErrorType.INJECT_FAILED_WITH_ILLEGAL_IDENTIFIER);
    }
    if (!is.includes(options, "id") && !is.class(id)) {
      throw createCustomError(ErrorType.INJECT_FAILED_WITH_UNINITIALIZED_TYPE, str => `[${toString(clazz)}::${prop} => ${toString(id)}] ${str}`);
    }

    // set props
    const props = Reflect.getOwnMetadata(CLASS_PROPS_KEY, clazz);
    if (Array.isArray(props)) {
      !props.includes(prop) && props.push(prop);
    } else {
      Reflect.defineMetadata(CLASS_PROPS_KEY, [prop], clazz);
    }

    // set prop metadata
    const key = `${CLASS_PROP_METADATA_PREFIX}${prop}`;
    const metadata: RecordClassMemberMetadataT = { type: PropType.PROPERTY, list: [] };
    if (is.number(index)) {
      metadata.type = PropType.FUNCTION;
      metadata.list.push({ id, index: index as number });
      // add origin
      const origin = Reflect.getOwnMetadata(key, clazz);
      Array.isArray(origin?.list) && metadata.list.push(...origin.list);
    } else {
      metadata.list.push({ id, lazy: false, ...options });
    }

    Reflect.defineMetadata(key, metadata, clazz);
  };
}