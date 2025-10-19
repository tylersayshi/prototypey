import { UnionToTuple } from "./type-utils.js";
import { Infer } from "./infer.js";

//#region src/lib.d.ts
/** @see https://atproto.com/specs/lexicon#overview-of-types */
type LexiconType =
	| "null"
	| "boolean"
	| "integer"
	| "string"
	| "bytes"
	| "cid-link"
	| "blob"
	| "array"
	| "object"
	| "params"
	| "token"
	| "ref"
	| "union"
	| "unknown"
	| "record"
	| "query"
	| "procedure"
	| "subscription";
/**
 * Common options available for lexicon items.
 * @see https://atproto.com/specs/lexicon#string-formats
 */
interface LexiconItemCommonOptions {
	/** Indicates this field must be provided */
	required?: boolean;
	/** Indicates this field can be explicitly set to null */
	nullable?: boolean;
}
/**
 * Base interface for all lexicon items.
 * @see https://atproto.com/specs/lexicon#overview-of-types
 */
interface LexiconItem extends LexiconItemCommonOptions {
	type: LexiconType;
}
/**
 * Definition in a lexicon namespace.
 * @see https://atproto.com/specs/lexicon#lexicon-document
 */
interface Def {
	type: LexiconType;
}
/**
 * Lexicon namespace document structure.
 * @see https://atproto.com/specs/lexicon#lexicon-document
 */
interface LexiconNamespace {
	/** Namespaced identifier (NSID) for this lexicon */
	id: string;
	/** Named definitions within this namespace */
	defs: Record<string, Def>;
}
/**
 * String type options.
 * @see https://atproto.com/specs/lexicon#string
 */
interface StringOptions extends LexiconItemCommonOptions {
	/**
	 * Semantic string format constraint.
	 * @see https://atproto.com/specs/lexicon#string-formats
	 */
	format?:
		| "at-identifier"
		| "at-uri"
		| "cid"
		| "datetime"
		| "did"
		| "handle"
		| "nsid"
		| "tid"
		| "record-key"
		| "uri"
		| "language";
	/** Maximum string length in bytes */
	maxLength?: number;
	/** Minimum string length in bytes */
	minLength?: number;
	/** Maximum string length in Unicode graphemes */
	maxGraphemes?: number;
	/** Minimum string length in Unicode graphemes */
	minGraphemes?: number;
	/** Hints at expected values, not enforced */
	knownValues?: string[];
	/** Restricts to an exact set of string values */
	enum?: string[];
	/** Default value if not provided */
	default?: string;
	/** Fixed, unchangeable value */
	const?: string;
}
/**
 * Boolean type options.
 * @see https://atproto.com/specs/lexicon#boolean
 */
interface BooleanOptions extends LexiconItemCommonOptions {
	/** Default value if not provided */
	default?: boolean;
	/** Fixed, unchangeable value */
	const?: boolean;
}
/**
 * Integer type options.
 * @see https://atproto.com/specs/lexicon#integer
 */
interface IntegerOptions extends LexiconItemCommonOptions {
	/** Minimum allowed value (inclusive) */
	minimum?: number;
	/** Maximum allowed value (inclusive) */
	maximum?: number;
	/** Restricts to an exact set of integer values */
	enum?: number[];
	/** Default value if not provided */
	default?: number;
	/** Fixed, unchangeable value */
	const?: number;
}
/**
 * Bytes type options for arbitrary byte arrays.
 * @see https://atproto.com/specs/lexicon#bytes
 */
interface BytesOptions extends LexiconItemCommonOptions {
	/** Minimum byte array length */
	minLength?: number;
	/** Maximum byte array length */
	maxLength?: number;
}
/**
 * Blob type options for binary data with MIME types.
 * @see https://atproto.com/specs/lexicon#blob
 */
interface BlobOptions extends LexiconItemCommonOptions {
	/** Allowed MIME types (e.g., ["image/png", "image/jpeg"]) */
	accept?: string[];
	/** Maximum blob size in bytes */
	maxSize?: number;
}
/**
 * Array type options.
 * @see https://atproto.com/specs/lexicon#array
 */
interface ArrayOptions extends LexiconItemCommonOptions {
	/** Minimum array length */
	minLength?: number;
	/** Maximum array length */
	maxLength?: number;
}
/**
 * Record type options for repository records.
 * @see https://atproto.com/specs/lexicon#record
 */
interface RecordOptions {
	/** Record key strategy: "self" for self-describing or "tid" for timestamp IDs */
	key: "self" | "tid";
	/** Object schema defining the record structure */
	record: {
		type: "object";
	};
	/** Human-readable description */
	description?: string;
}
/**
 * Union type options for multiple possible types.
 * @see https://atproto.com/specs/lexicon#union
 */
interface UnionOptions extends LexiconItemCommonOptions {
	/** If true, only listed refs are allowed; if false, additional types may be added */
	closed?: boolean;
}
/**
 * Map of property names to their lexicon item definitions.
 * @see https://atproto.com/specs/lexicon#object
 */
type ObjectProperties = Record<
	string,
	{
		type: LexiconType;
	}
>;
type RequiredKeys<T> = {
	[K in keyof T]: T[K] extends {
		required: true;
	}
		? K
		: never;
}[keyof T];
type NullableKeys<T> = {
	[K in keyof T]: T[K] extends {
		nullable: true;
	}
		? K
		: never;
}[keyof T];
/**
 * Resulting object schema with required and nullable fields extracted.
 * @see https://atproto.com/specs/lexicon#object
 */
type ObjectResult<T extends ObjectProperties> = {
	type: "object";
	/** Property definitions */
	properties: {
		[K in keyof T]: T[K] extends {
			type: "object";
		}
			? T[K]
			: Omit<T[K], "required" | "nullable">;
	};
} & ([RequiredKeys<T>] extends [never]
	? {}
	: {
			required: UnionToTuple<RequiredKeys<T>>;
		}) &
	([NullableKeys<T>] extends [never]
		? {}
		: {
				nullable: UnionToTuple<NullableKeys<T>>;
			});
/**
 * Map of parameter names to their lexicon item definitions.
 * @see https://atproto.com/specs/lexicon#params
 */
type ParamsProperties = Record<string, LexiconItem>;
/**
 * Resulting params schema with required fields extracted.
 * @see https://atproto.com/specs/lexicon#params
 */
type ParamsResult<T extends ParamsProperties> = {
	type: "params";
	/** Parameter definitions */
	properties: { [K in keyof T]: Omit<T[K], "required" | "nullable"> };
} & ([RequiredKeys<T>] extends [never]
	? {}
	: {
			required: UnionToTuple<RequiredKeys<T>>;
		});
/**
 * HTTP request or response body schema.
 * @see https://atproto.com/specs/lexicon#http-endpoints
 */
interface BodySchema {
	/** MIME type encoding (typically "application/json") */
	encoding: "application/json" | (string & {});
	/** Human-readable description */
	description?: string;
	/** Object schema defining the body structure */
	schema?: ObjectResult<ObjectProperties>;
}
/**
 * Error definition for HTTP endpoints.
 * @see https://atproto.com/specs/lexicon#http-endpoints
 */
interface ErrorDef {
	/** Error name/code */
	name: string;
	/** Human-readable error description */
	description?: string;
}
/**
 * Query endpoint options (HTTP GET).
 * @see https://atproto.com/specs/lexicon#query
 */
interface QueryOptions {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: ParamsResult<ParamsProperties>;
	/** Response body schema */
	output?: BodySchema;
	/** Possible error responses */
	errors?: ErrorDef[];
}
/**
 * Procedure endpoint options (HTTP POST).
 * @see https://atproto.com/specs/lexicon#procedure
 */
interface ProcedureOptions {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: ParamsResult<ParamsProperties>;
	/** Request body schema */
	input?: BodySchema;
	/** Response body schema */
	output?: BodySchema;
	/** Possible error responses */
	errors?: ErrorDef[];
}
/**
 * WebSocket message schema for subscriptions.
 * @see https://atproto.com/specs/lexicon#subscription
 */
interface MessageSchema {
	/** Human-readable description */
	description?: string;
	/** Union of possible message types */
	schema: {
		type: "union";
		refs: readonly string[];
	};
}
/**
 * Subscription endpoint options (WebSocket).
 * @see https://atproto.com/specs/lexicon#subscription
 */
interface SubscriptionOptions {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: ParamsResult<ParamsProperties>;
	/** Message schema for events */
	message?: MessageSchema;
	/** Possible error responses */
	errors?: ErrorDef[];
}
declare class Namespace<T extends LexiconNamespace> {
	json: T;
	infer: Infer<T>;
	constructor(json: T);
}
/**
 * Main API for creating lexicon schemas.
 * @see https://atproto.com/specs/lexicon
 */
declare const lx: {
	/**
	 * Creates a null type.
	 * @see https://atproto.com/specs/lexicon#null
	 */
	null(options?: LexiconItemCommonOptions): {
		type: "null";
	} & LexiconItemCommonOptions;
	/**
	 * Creates a boolean type with optional constraints.
	 * @see https://atproto.com/specs/lexicon#boolean
	 */
	boolean<T extends BooleanOptions>(
		options?: T,
	): T & {
		type: "boolean";
	};
	/**
	 * Creates an integer type with optional min/max and enum constraints.
	 * @see https://atproto.com/specs/lexicon#integer
	 */
	integer<T extends IntegerOptions>(
		options?: T,
	): T & {
		type: "integer";
	};
	/**
	 * Creates a string type with optional format, length, and value constraints.
	 * @see https://atproto.com/specs/lexicon#string
	 */
	string<T extends StringOptions>(
		options?: T,
	): T & {
		type: "string";
	};
	/**
	 * Creates an unknown type for flexible, unvalidated objects.
	 * @see https://atproto.com/specs/lexicon#unknown
	 */
	unknown(options?: LexiconItemCommonOptions): {
		type: "unknown";
	} & LexiconItemCommonOptions;
	/**
	 * Creates a bytes type for arbitrary byte arrays.
	 * @see https://atproto.com/specs/lexicon#bytes
	 */
	bytes<T extends BytesOptions>(
		options?: T,
	): T & {
		type: "bytes";
	};
	/**
	 * Creates a CID link reference to content-addressed data.
	 * @see https://atproto.com/specs/lexicon#cid-link
	 */
	cidLink<Link extends string>(
		link: Link,
	): {
		type: "cid-link";
		$link: Link;
	};
	/**
	 * Creates a blob type for binary data with MIME type constraints.
	 * @see https://atproto.com/specs/lexicon#blob
	 */
	blob<T extends BlobOptions>(
		options?: T,
	): T & {
		type: "blob";
	};
	/**
	 * Creates an array type with item schema and length constraints.
	 * @see https://atproto.com/specs/lexicon#array
	 */
	array<
		Items extends {
			type: LexiconType;
		},
		Options extends ArrayOptions,
	>(
		items: Items,
		options?: Options,
	): Options & {
		type: "array";
		items: Items;
	};
	/**
	 * Creates a token type for symbolic values in unions.
	 * @see https://atproto.com/specs/lexicon#token
	 */
	token<Description extends string>(
		description: Description,
	): {
		type: "token";
		description: Description;
	};
	/**
	 * Creates a reference to another schema definition.
	 * @see https://atproto.com/specs/lexicon#ref
	 */
	ref<Ref extends string>(
		ref: Ref,
		options?: LexiconItemCommonOptions,
	): LexiconItemCommonOptions & {
		type: "ref";
		ref: Ref;
	};
	/**
	 * Creates a union type for multiple possible type variants.
	 * @see https://atproto.com/specs/lexicon#union
	 */
	union<const Refs extends readonly string[], Options extends UnionOptions>(
		refs: Refs,
		options?: Options,
	): Options & {
		type: "union";
		refs: Refs;
	};
	/**
	 * Creates a record type for repository records.
	 * @see https://atproto.com/specs/lexicon#record
	 */
	record<T extends RecordOptions>(
		options: T,
	): T & {
		type: "record";
	};
	/**
	 * Creates an object type with defined properties.
	 * @see https://atproto.com/specs/lexicon#object
	 */
	object<T extends ObjectProperties>(options: T): ObjectResult<T>;
	/**
	 * Creates a params type for query string parameters.
	 * @see https://atproto.com/specs/lexicon#params
	 */
	params<Properties extends ParamsProperties>(
		properties: Properties,
	): ParamsResult<Properties>;
	/**
	 * Creates a query endpoint definition (HTTP GET).
	 * @see https://atproto.com/specs/lexicon#query
	 */
	query<T extends QueryOptions>(
		options?: T,
	): T & {
		type: "query";
	};
	/**
	 * Creates a procedure endpoint definition (HTTP POST).
	 * @see https://atproto.com/specs/lexicon#procedure
	 */
	procedure<T extends ProcedureOptions>(
		options?: T,
	): T & {
		type: "procedure";
	};
	/**
	 * Creates a subscription endpoint definition (WebSocket).
	 * @see https://atproto.com/specs/lexicon#subscription
	 */
	subscription<T extends SubscriptionOptions>(
		options?: T,
	): T & {
		type: "subscription";
	};
	/**
	 * Creates a lexicon namespace document.
	 * @see https://atproto.com/specs/lexicon#lexicon-document
	 */
	namespace<ID extends string, D extends LexiconNamespace["defs"]>(
		id: ID,
		defs: D,
	): Namespace<{
		lexicon: 1;
		id: ID;
		defs: D;
	}>;
};
//#endregion
export { lx };
//# sourceMappingURL=lib.d.ts.map
