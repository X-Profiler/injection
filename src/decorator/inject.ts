import { is, getMetadataType } from "../lib/utils";
import {
  CLASS_PROPS_KEY, CLASS_PROP_METATA_PREFIX,
  ClasMemberMetadataT, IdentifierT,
  InjectOptions,
} from "../";

export function Inject(options?: IdentifierT | InjectOptions) {
  return (target: any, prop: string, index?: number) => {
    const clazz = is.function(target) ? target : target.constructor;
    if (is.static(clazz, prop)) {
      throw new Error("should not inject static props!");
    }

    // format options
    options = is.identifier(options) ? { id: options as IdentifierT } : options as InjectOptions;

    // get id
    const id: IdentifierT = !options ? getMetadataType(clazz.prototype, prop, index) : options.id;
    console.log(12333, prop, id);

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
      metadata = { id, index: index as number };
    } else {
      metadata = { id, lazy: false, ...options };
    }
    Reflect.defineMetadata(`${CLASS_PROP_METATA_PREFIX}${prop}`, metadata, clazz);
  };
}