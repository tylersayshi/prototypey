type InferType<T> = T extends { type: "record" } ? InferRecord<T>
  : T extends { type: "object" } ? InferObject<T>
  : T extends { type: "array" } ? InferArray<T>
  : T extends { type: "params" } ? InferParams<T>
  : T extends { type: "union" } ? InferUnion<T>
  : T extends { type: "token" } ? InferToken<T>
  : T extends { type: "ref" } ? InferRef<T>
  : T extends { type: "unknown" } ? unknown
  : T extends { type: "null" } ? null
  : T extends { type: "boolean" } ? boolean
  : T extends { type: "integer" } ? number
  : T extends { type: "string" } ? string
  : T extends { type: "bytes" } ? Uint8Array
  : T extends { type: "cid-link" } ? string
  : T extends { type: "blob" } ? Blob
  : never;

type InferToken<T> = T extends { enum: readonly (infer U)[] } ? U : string;

type InferObject<T> = T extends { properties: infer P } ?
    & {
      -readonly [K in keyof P as P[K] extends { type: string } ? K : never]?:
        InferType<
          P[K]
        >;
    }
    & (T extends { required?: readonly (infer R)[] } ? {
        -readonly [K in R extends string ? R : never]-?: InferType<
          P[K & keyof P]
        >;
      }
      : never)
  : never;

type InferArray<T> = T extends { items: infer Items } ? InferType<Items>[]
  : never[];

type InferUnion<T> = T extends { refs: readonly (infer R)[] }
  ? R extends string ? { $type: R; [key: string]: unknown } : never
  : never;

type InferRef<T> = T extends { ref: infer R }
  ? R extends string ? { $type: R; [key: string]: unknown } : unknown
  : unknown;

type InferParams<T> = T extends { properties: infer P } ? InferObject<T>
  : never;

type InferRecord<T> = T extends { record: infer R }
  ? R extends { type: "object" } ? InferObject<R>
  : R extends { type: "union" } ? InferUnion<R>
  : unknown
  : unknown;

type Prettify<T> =
  & {
    [K in keyof T]: T[K];
  }
  // deno-lint-ignore ban-types
  & {};

export type InferDefs<T extends Record<string, unknown>> = Prettify<
  {
    -readonly [K in keyof T]: InferType<T[K]>;
  }
>;

type InferNS<T extends { id: string; defs: Record<string, unknown> }> =
  InferDefs<T["defs"]>;

const schema = {
  "lexicon": 1,
  "id": "app.bsky.actor.profile",
  "defs": {
    "main": {
      "type": "record",
      "key": "self",
      "record": {
        "type": "object",
        "properties": {
          "displayName": {
            "type": "string",
            "maxLength": 64,
            "maxGraphemes": 64,
          },
          "description": {
            "type": "string",
            "maxLength": 256,
            "maxGraphemes": 256,
          },
        },
        "nullable": ["displayName"],
      },
    },
  },
} as const;

type Schema = InferNS<typeof schema>;

const main: Schema["main"] = {
  displayName: "blob",
  description: "I am a blob dude",
};

console.log(`hi ${main.displayName}`);
