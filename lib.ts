// deno-lint-ignore-file ban-types
/** @see https://atproto.com/specs/lexicon#overview-of-types */
type LexiconType =
  // Concrete types
  | "null"
  | "boolean"
  | "integer"
  | "string"
  | "bytes"
  | "cid-link"
  | "blob"
  // Container types
  | "array"
  | "object"
  | "params"
  // Meta types
  | "token"
  | "ref"
  | "union"
  | "unknown"
  // Primary types
  | "record"
  | "query"
  | "procedure"
  | "subscription";

interface LexiconItemCommonOptions {
  required?: boolean;
  nullable?: boolean;
}

interface LexiconItem extends LexiconItemCommonOptions {
  type: LexiconType;
}

type Def = {
  type: LexiconType;
};

interface LexiconNamespace {
  id: string;
  defs: {
    [name: string]: Def;
  };
}

interface StringOptions extends LexiconItemCommonOptions {
  format?: string;
  maxLength?: number;
  minLength?: number;
  maxGraphemes?: number;
  minGraphemes?: number;
  knownValues?: string[];
  enum?: string[];
  default?: string;
  const?: string;
}

interface BooleanOptions extends LexiconItemCommonOptions {
  default?: boolean;
  const?: boolean;
}

interface IntegerOptions extends LexiconItemCommonOptions {
  minimum?: number;
  maximum?: number;
  enum?: number[];
  default?: number;
  const?: number;
}

interface BytesOptions extends LexiconItemCommonOptions {
  minLength?: number;
  maxLength?: number;
}

interface BlobOptions extends LexiconItemCommonOptions {
  accept?: string[];
  maxSize?: number;
}

interface ArrayOptions extends LexiconItemCommonOptions {
  minLength?: number;
  maxLength?: number;
}

interface RecordOptions {
  key: "self" | "tid";
  record: { type: "object" };
}

interface UnionOptions {
  closed?: boolean;
}

interface ObjectProperties {
  [key: string]: LexiconItem;
}

interface ObjectResult<T extends ObjectProperties> {
  type: "object";
  properties: T;
  required?: string[];
  nullable?: string[];
}

interface ParamsProperties {
  [key: string]: LexiconItem;
}

interface ParamsResult<T extends ParamsProperties> {
  type: "params";
  properties: T;
  required?: string[];
}

interface BodySchema {
  encoding: "application/json" | (string & {});
  description?: string;
  schema?: ObjectResult<ObjectProperties>;
}

interface ErrorDef {
  name: string;
  description?: string;
}

interface QueryOptions {
  description?: string;
  parameters?: ParamsResult<ParamsProperties>;
  output?: BodySchema;
  errors?: ErrorDef[];
}

/**
 * Main API: Create a namespace (lexicon document)
 */
export const lx = {
  null(
    options?: LexiconItemCommonOptions
  ): { type: "null" } & LexiconItemCommonOptions {
    return {
      type: "null",
      ...options,
    };
  },
  boolean<T extends BooleanOptions>(options?: T): T & { type: "boolean" } {
    return {
      type: "boolean",
      ...options,
    } as T & { type: "boolean" };
  },
  integer<T extends IntegerOptions>(options?: T): T & { type: "integer" } {
    return {
      type: "integer",
      ...options,
    } as T & { type: "integer" };
  },
  string<T extends StringOptions>(options?: T): T & { type: "string" } {
    return {
      type: "string",
      ...options,
    } as T & { type: "string" };
  },
  unknown(
    options?: LexiconItemCommonOptions
  ): { type: "unknown" } & LexiconItemCommonOptions {
    return {
      type: "unknown",
      ...options,
    };
  },
  bytes<T extends BytesOptions>(options?: T): T & { type: "bytes" } {
    return {
      type: "bytes",
      ...options,
    } as T & { type: "bytes" };
  },
  cidLink<Link extends string>(link: Link): { type: "cid-link"; $link: Link } {
    return {
      type: "cid-link",
      $link: link,
    };
  },
  blob<T extends BlobOptions>(options?: T): T & { type: "blob" } {
    return {
      type: "blob",
      ...options,
    } as T & { type: "blob" };
  },
  array<Items extends LexiconItem, Options extends ArrayOptions>(
    items: Items,
    options?: Options
  ): Options & { type: "array"; items: Items } {
    return {
      type: "array",
      items,
      ...options,
    } as Options & { type: "array"; items: Items };
  },
  token<Description extends string>(
    description: Description
  ): { type: "token"; description: Description } {
    return { type: "token", description };
  },
  ref<Ref extends string>(ref: Ref): { type: "ref"; ref: Ref } {
    return {
      type: "ref",
      ref,
    };
  },
  union<const Refs extends readonly string[], Options extends UnionOptions>(
    refs: Refs,
    options?: Options
  ): Options & { type: "union"; refs: Refs } {
    return {
      type: "union",
      refs,
      ...options,
    } as Options & { type: "union"; refs: Refs };
  },
  record<T extends RecordOptions>(options: T): T & { type: "record" } {
    return {
      type: "record",
      ...options,
    };
  },
  object<T extends ObjectProperties>(options: T): ObjectResult<T> {
    const required = Object.keys(options).filter(
      (key) => options[key].required
    );
    const nullable = Object.keys(options).filter(
      (key) => options[key].nullable
    );
    const result: ObjectResult<T> = {
      type: "object",
      properties: options,
    };
    if (required.length > 0) {
      result.required = required;
    }
    if (nullable.length > 0) {
      result.nullable = nullable;
    }
    return result;
  },
  params<Properties extends ParamsProperties>(
    properties: Properties
  ): ParamsResult<Properties> {
    const required = Object.keys(properties).filter(
      (key) => properties[key].required
    );
    const result: {
      type: "params";
      properties: Properties;
      required?: string[];
    } = {
      type: "params",
      properties,
    };
    if (required.length > 0) {
      result.required = required;
    }
    return result;
  },
  query<T extends QueryOptions>(options?: T): T & { type: "query" } {
    return {
      type: "query",
      ...options,
    } as T & { type: "query" };
  },
  namespace<ID extends string, D extends LexiconNamespace["defs"]>(
    id: ID,
    defs: D
  ): { lexicon: 1; id: ID; defs: D } {
    return {
      lexicon: 1,
      id,
      defs,
    };
  },
};
