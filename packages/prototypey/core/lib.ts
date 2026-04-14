/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Infer } from "./infer.ts";
import type { UnionToTuple } from "./type-utils.ts";
import type { LexiconDoc, ValidationResult } from "@atproto/lexicon";
import { Lexicons } from "@atproto/lexicon";

/** Runtime markers for property-level required/nullable on objects (avoids collision with array form) */
const PROP_REQUIRED = Symbol("required");
const PROP_NULLABLE = Symbol("nullable");

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
	| "subscription"
	// Permission types
	| "permission-set";

/**
 * Common options available for lexicon items.
 * @see https://atproto.com/specs/lexicon#string-formats
 */
type LexiconItemCommonOptions = {
	/** Indicates this field must be provided */
	required?: boolean;
	/** Indicates this field can be explicitly set to null */
	nullable?: boolean;
	/** Human-readable description */
	description?: string;
};

/**
 * Base interface for all lexicon items.
 * @see https://atproto.com/specs/lexicon#overview-of-types
 */
type LexiconItem = LexiconItemCommonOptions & {
	type: LexiconType;
};

/**
 * Definition in a lexicon namespace.
 * @see https://atproto.com/specs/lexicon#lexicon-document
 */
type Def = {
	type: LexiconType;
};

/**
 * Lexicon namespace document structure.
 * @see https://atproto.com/specs/lexicon#lexicon-document
 */
type LexiconNamespace = {
	/** Namespaced identifier (NSID) for this lexicon */
	id: string;
	/** Named definitions within this namespace */
	defs: Record<string, Def>;
};

/**
 * String type options.
 * @see https://atproto.com/specs/lexicon#string
 */
type StringOptions = LexiconItemCommonOptions & {
	/**
	 * Semantic string format constraint.
	 * @see https://atproto.com/specs/lexicon#string-formats
	 */
	format?:
		| "at-identifier" // Handle or DID
		| "at-uri" // AT Protocol URI
		| "cid" // Content Identifier
		| "datetime" // Timestamp (UTC, ISO 8601)
		| "did" // Decentralized Identifier
		| "handle" // User handle identifier
		| "nsid" // Namespaced Identifier
		| "tid" // Timestamp Identifier
		| "record-key" // Repository record key
		| "uri" // Generic URI
		| "language"; // IETF BCP 47 language tag
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
};

/**
 * Boolean type options.
 * @see https://atproto.com/specs/lexicon#boolean
 */
type BooleanOptions = LexiconItemCommonOptions & {
	/** Default value if not provided */
	default?: boolean;
	/** Fixed, unchangeable value */
	const?: boolean;
};

/**
 * Integer type options.
 * @see https://atproto.com/specs/lexicon#integer
 */
type IntegerOptions = LexiconItemCommonOptions & {
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
};

/**
 * Bytes type options for arbitrary byte arrays.
 * @see https://atproto.com/specs/lexicon#bytes
 */
type BytesOptions = LexiconItemCommonOptions & {
	/** Minimum byte array length */
	minLength?: number;
	/** Maximum byte array length */
	maxLength?: number;
};

/**
 * Blob type options for binary data with MIME types.
 * @see https://atproto.com/specs/lexicon#blob
 */
type BlobOptions = LexiconItemCommonOptions & {
	/** Allowed MIME types (e.g., ["image/png", "image/jpeg"]) */
	accept?: string[];
	/** Maximum blob size in bytes */
	maxSize?: number;
};

/**
 * Array type options.
 * @see https://atproto.com/specs/lexicon#array
 */
type ArrayOptions = LexiconItemCommonOptions & {
	/** Minimum array length */
	minLength?: number;
	/** Maximum array length */
	maxLength?: number;
};

/**
 * Record type options for repository records.
 * @see https://atproto.com/specs/lexicon#record
 */
type RecordOptions = {
	/**
	 * Record key strategy: "self" for self-describing or "tid" for timestamp IDs
	 * @see https://atproto.com/specs/record-key
	 */
	key: string;
	/** Object schema defining the record structure */
	record: { type: "object" };
	/** Human-readable description */
	description?: string;
};

/**
 * Union type options for multiple possible types.
 * @see https://atproto.com/specs/lexicon#union
 */
type UnionOptions = LexiconItemCommonOptions & {
	/** If true, only listed refs are allowed; if false, additional types may be added */
	closed?: boolean;
};

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

/** Resolves to an error string for nested objects, or passes through unchanged. */
type CheckNotObject<T> = T extends { type: "object" }
	? '❌ Nested objects are not supported. Per the Lexicon spec, objects can be "nested inside other definitions by reference" (https://atproto.com/specs/lexicon#object). Use lx.ref() instead.'
	: T;

/**
 * Object-level options (not property-level).
 * @see https://atproto.com/specs/lexicon#object
 */
type ObjectOptions = {
	/** Human-readable description of the object */
	description?: string;
	/** Indicates this object is a required property when nested in a parent object */
	required?: boolean;
	/** Indicates this object can be explicitly set to null when nested in a parent object */
	nullable?: boolean;
};

type RequiredKeys<T> = {
	[K in keyof T]: T[K] extends { required: true } | { _required: true }
		? K
		: never;
}[keyof T];

type NullableKeys<T> = {
	[K in keyof T]: T[K] extends { nullable: true } | { _nullable: true }
		? K
		: never;
}[keyof T];

/**
 * Resulting object schema with required and nullable fields extracted.
 * @see https://atproto.com/specs/lexicon#object
 */
type ObjectResult<T extends ObjectProperties, O extends ObjectOptions = {}> = {
	type: "object";
	/** Property definitions */
	properties: {
		[K in keyof T]: T[K] extends { type: "object" }
			? Omit<T[K], "_required" | "_nullable">
			: Omit<T[K], "required" | "nullable">;
	};
} & ([RequiredKeys<T>] extends [never]
	? {}
	: { required: UnionToTuple<RequiredKeys<T>> }) &
	([NullableKeys<T>] extends [never]
		? {}
		: { nullable: UnionToTuple<NullableKeys<T>> }) &
	(O extends { required: true } ? { _required: true } : {}) &
	(O extends { nullable: true } ? { _nullable: true } : {}) &
	Omit<O, "required" | "nullable">;

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
	properties: {
		[K in keyof T]: Omit<T[K], "required" | "nullable">;
	};
} & ([RequiredKeys<T>] extends [never]
	? {}
	: { required: UnionToTuple<RequiredKeys<T>> });

/**
 * HTTP request or response body schema.
 * @see https://atproto.com/specs/lexicon#http-endpoints
 */
type BodySchema = {
	/** MIME type encoding (typically "application/json") */
	encoding: "application/json" | (string & {});
	/** Human-readable description */
	description?: string;
	/** Object schema defining the body structure */
	schema?: ObjectResult<ObjectProperties>;
};

/**
 * Error definition for HTTP endpoints.
 * @see https://atproto.com/specs/lexicon#http-endpoints
 */
type ErrorDef = {
	/** Error name/code */
	name: string;
	/** Human-readable error description */
	description?: string;
};

/**
 * Query endpoint options (HTTP GET).
 * @see https://atproto.com/specs/lexicon#query
 */
type QueryOptions = {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: ParamsResult<ParamsProperties>;
	/** Response body schema */
	output?: BodySchema;
	/** Possible error responses */
	errors?: ErrorDef[];
};

/**
 * Procedure endpoint options (HTTP POST).
 * @see https://atproto.com/specs/lexicon#procedure
 */
type ProcedureOptions = {
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
};

/**
 * WebSocket message schema for subscriptions.
 * @see https://atproto.com/specs/lexicon#subscription
 */
type MessageSchema = {
	/** Human-readable description */
	description?: string;
	/** Union of possible message types */
	schema: { type: "union"; refs: readonly string[] };
};

/**
 * Subscription endpoint options (WebSocket).
 * @see https://atproto.com/specs/lexicon#subscription
 */
type SubscriptionOptions = {
	/** Human-readable description */
	description?: string;
	/** Query string parameters */
	parameters?: ParamsResult<ParamsProperties>;
	/** Message schema for events */
	message?: MessageSchema;
	/** Possible error responses */
	errors?: ErrorDef[];
};

/**
 * A lexicon schema object or a plain NSID string, used to reference
 * collections or endpoints in permission definitions.
 */
type NsidResolvable = string | { json: { id: string } };

function resolveNsid(ref: NsidResolvable): string {
	return typeof ref === "string" ? ref : ref.json.id;
}

/**
 * A translatable string with optional language variants.
 * Used particularly permission-sets.
 */
type LangString = {
	default: string;
	lang: Record<string, string>;
};

/** A plain string or a translatable string with language variants. */
type Translatable = string | LangString;

function resolveTranslatable(value: Translatable): {
	value: string;
	lang?: Record<string, string>;
} {
	if (typeof value === "string") return { value };
	return { value: value.default, lang: value.lang };
}

/**
 * Options for a repo-resource permission.
 * @see https://atproto.com/specs/permission#repo
 */
type RepoPermissionOptions = {
	/** NSID of record types (lexicon schemas or NSID strings). Wildcard (*) grants access to all records. Partial wildcards are not supported. Wildcards are not supported in permissions within a permission set */
	collection: NsidResolvable[];
	/** defines the set of record operations allowed. If not defined, all operations are allowed */
	action?: readonly ("create" | "update" | "delete")[];
};

/**
 * Options for an RPC-resource permission.
 * @see https://atproto.com/specs/permission#rpc
 */
type RpcPermissionOptions = {
	/** NSID of API endpoints (lexicon schemas or NSID strings). Wildcard (*) gives access to all endpoints. Partial wildcards are not supported. Wildcards are not supported in permissions within a permission set */
	lxm: NsidResolvable[];
	/** audience of API requests, as a DID service reference: DID followed by required service type fragment (e.g. did:web:api.example.com#srvtype). Supports wildcard (*), though aud and lxm cannot both be wildcard. DID references are not allowed in permission set context. Always required in granular string representation; contingent on `inheritAud` in permission sets */
	aud?: string;
	/** only used inside permission sets. If true, an `aud` value will be inherited from the `include:` invocation, and the `aud` field is not required on the permission */
	inheritAud?: boolean;
};

/**
 * Options for a blob-resource permission.
 * @see https://atproto.com/specs/permission#blob
 */
type BlobPermissionOptions = {
	/** MIME types or partial MIME type glob patterns. Same syntax as the `accept` field in the `blob` lexicon type */
	accept: string[];
};

/**
 * Options for an account-resource permission.
 * @see https://atproto.com/specs/permission#account
 */
type AccountPermissionOptions = {
	/** a component of account configuration. Wildcard is not supported. "email": account email address — `read` makes email and verification status visible, `manage` includes `read` and allows changing the email. "repo": ability to update entire public repository using a CAR file — `manage` allows importing CAR files (e.g. during account migration), `read` does nothing */
	attr: "email" | "repo";
	/** degree of control. If not specified, default is `read` */
	action?: "read" | "manage";
};

/**
 * Options for an identity-resource permission.
 * @see https://atproto.com/specs/permission#identity
 */
type IdentityPermissionOptions = {
	/** an aspect or component of identity. Wildcard (*) indicates full control of DID document and handle. "handle": ability to update handle, including registration in the DID document and any domain names controlled by the PDS */
	attr: "handle" | "*";
};

/** Resolves an Options type into a permission entry, converting NsidResolvable fields to strings */
type PermissionEntryOf<Resource extends string, Opts> = {
	type: "permission";
	resource: Resource;
} & {
	[K in keyof Opts]: Opts[K] extends readonly NsidResolvable[]
		? string[]
		: Opts[K];
};

/** @see https://atproto.com/specs/permission#repo */
type RepoPermissionEntry = PermissionEntryOf<"repo", RepoPermissionOptions>;
/** @see https://atproto.com/specs/permission#rpc */
type RpcPermissionEntry = PermissionEntryOf<"rpc", RpcPermissionOptions>;
/** @see https://atproto.com/specs/permission#blob */
type BlobPermissionEntry = PermissionEntryOf<"blob", BlobPermissionOptions>;
/** @see https://atproto.com/specs/permission#account */
type AccountPermissionEntry = PermissionEntryOf<
	"account",
	AccountPermissionOptions
>;
/** @see https://atproto.com/specs/permission#identity */
type IdentityPermissionEntry = PermissionEntryOf<
	"identity",
	IdentityPermissionOptions
>;

/**
 * Union of all permission entry types.
 * @see https://atproto.com/specs/permission
 */
type PermissionEntry =
	| RepoPermissionEntry
	| RpcPermissionEntry
	| BlobPermissionEntry
	| AccountPermissionEntry
	| IdentityPermissionEntry;

/**
 * Options for a permission-set definition.
 * @see https://atproto.com/specs/permission
 */
type PermissionSetOptions = {
	/** Human-readable title, optionally translatable via lx.langString() */
	title: Translatable;
	/** Human-readable detail, optionally translatable via lx.langString() */
	detail: Translatable;
	/** List of permissions in this set */
	permissions: PermissionEntry[];
	/** Human-readable description */
	description?: string;
};

/**
 * Public interface for Lexicon to avoid exposing private implementation details
 */
export type LexiconSchema<T extends LexiconNamespace> = {
	json: T;
	"~infer": Infer<{ json: T }>;
	validate(
		data: unknown,
		def?: keyof T["defs"],
	): ValidationResult<Infer<{ json: T }>>;
};

class Lexicon<T extends LexiconNamespace> implements LexiconSchema<T> {
	public json: T;
	public "~infer": Infer<{ json: T }> = null as unknown as Infer<{ json: T }>;
	private _validator: Lexicons;

	constructor(json: T) {
		this.json = json;
		// Clone before passing to Lexicons to prevent mutation of this.json
		this._validator = new Lexicons([
			structuredClone(json) as unknown as LexiconDoc,
		]);
	}

	/**
	 * Validate data against this lexicon's main definition.
	 * @param data - The data to validate
	 * @returns ValidationResult with success status and value or error
	 */
	validate(
		data: unknown,
		def: keyof T["defs"] = "main",
	): ValidationResult<Infer<{ json: T }>> {
		return this._validator.validate(
			`${this.json.id}#${def as string}`,
			data,
		) as ValidationResult<Infer<{ json: T }>>;
	}
}

/**
 * Main API for creating lexicon schemas.
 * @see https://atproto.com/specs/lexicon
 */
export const lx = {
	/**
	 * Creates a null type.
	 * @see https://atproto.com/specs/lexicon#null
	 */
	null(
		options?: LexiconItemCommonOptions,
	): { type: "null" } & LexiconItemCommonOptions {
		return {
			type: "null",
			...options,
		};
	},
	/**
	 * Creates a boolean type with optional constraints.
	 * @see https://atproto.com/specs/lexicon#boolean
	 */
	boolean<T extends BooleanOptions>(options?: T): T & { type: "boolean" } {
		return {
			type: "boolean",
			...options,
		} as T & { type: "boolean" };
	},
	/**
	 * Creates an integer type with optional min/max and enum constraints.
	 * @see https://atproto.com/specs/lexicon#integer
	 */
	integer<T extends IntegerOptions>(options?: T): T & { type: "integer" } {
		return {
			type: "integer",
			...options,
		} as T & { type: "integer" };
	},
	/**
	 * Creates a string type with optional format, length, and value constraints.
	 * @see https://atproto.com/specs/lexicon#string
	 */
	string<T extends StringOptions>(options?: T): T & { type: "string" } {
		return {
			type: "string",
			...options,
		} as T & { type: "string" };
	},
	/**
	 * Creates an unknown type for flexible, unvalidated objects.
	 * @see https://atproto.com/specs/lexicon#unknown
	 */
	unknown(
		options?: LexiconItemCommonOptions,
	): { type: "unknown" } & LexiconItemCommonOptions {
		return {
			type: "unknown",
			...options,
		};
	},
	/**
	 * Creates a bytes type for arbitrary byte arrays.
	 * @see https://atproto.com/specs/lexicon#bytes
	 */
	bytes<T extends BytesOptions>(options?: T): T & { type: "bytes" } {
		return {
			type: "bytes",
			...options,
		} as T & { type: "bytes" };
	},
	/**
	 * Creates a CID link reference to content-addressed data.
	 * @see https://atproto.com/specs/lexicon#cid-link
	 */
	cidLink<Link extends string>(link: Link): { type: "cid-link"; $link: Link } {
		return {
			type: "cid-link",
			$link: link,
		};
	},
	/**
	 * Creates a blob type for binary data with MIME type constraints.
	 * @see https://atproto.com/specs/lexicon#blob
	 */
	blob<T extends BlobOptions>(options?: T): T & { type: "blob" } {
		return {
			type: "blob",
			...options,
		} as T & { type: "blob" };
	},
	/**
	 * Creates an array type with item schema and length constraints.
	 * @see https://atproto.com/specs/lexicon#array
	 */
	array<Items extends { type: LexiconType }, Options extends ArrayOptions>(
		items: Items,
		options?: Options,
	): Options & { type: "array"; items: Items } {
		return {
			type: "array",
			items,
			...options,
		} as Options & { type: "array"; items: Items };
	},
	/**
	 * Creates a token type for symbolic values in unions.
	 * @see https://atproto.com/specs/lexicon#token
	 */
	token<Description extends string>(
		description: Description,
	): { type: "token"; description: Description } {
		return { type: "token", description };
	},
	/**
	 * Creates a reference to another schema definition.
	 * @see https://atproto.com/specs/lexicon#ref
	 */
	ref<Ref extends string>(
		ref: Ref,
		options?: LexiconItemCommonOptions,
	): LexiconItemCommonOptions & { type: "ref"; ref: Ref } {
		return {
			type: "ref",
			ref,
			...options,
		} as LexiconItemCommonOptions & { type: "ref"; ref: Ref };
	},
	/**
	 * Creates a union type for multiple possible type variants.
	 * @see https://atproto.com/specs/lexicon#union
	 */
	union<const Refs extends readonly string[], Options extends UnionOptions>(
		refs: Refs,
		options?: Options,
	): Options & { type: "union"; refs: Refs } {
		return {
			type: "union",
			refs,
			...options,
		} as Options & { type: "union"; refs: Refs };
	},
	/**
	 * Creates a record type for repository records.
	 * @see https://atproto.com/specs/lexicon#record
	 */
	record<T extends RecordOptions>(options: T): T & { type: "record" } {
		return {
			type: "record",
			...options,
		};
	},
	/**
	 * Creates an object type with defined properties.
	 * @see https://atproto.com/specs/lexicon#object
	 */
	object<T extends ObjectProperties, O extends ObjectOptions>(
		properties: { [K in keyof T]: CheckNotObject<T[K]> },
		options?: O,
	): ObjectResult<T, O> {
		// Nested objects are not supported in lexicon definitions.
		// Each object should be its own definition, referenced via lx.ref().
		for (const [key, value] of Object.entries(properties)) {
			if ((value as { type: string }).type === "object") {
				throw new Error(
					`Nested objects are not supported in lexicon definitions. Property "${key}" is an inline object. Per the Lexicon spec, objects can be "nested inside other definitions by reference" (https://atproto.com/specs/lexicon#object). Define it as its own lexicon def and use lx.ref() instead.`,
				);
			}
		}
		const {
			required: propRequired,
			nullable: propNullable,
			...objectOptions
		} = (options ?? {}) as ObjectOptions;
		const required = Object.keys(properties).filter((key) => {
			const prop = properties[key] as Record<string | symbol, unknown>;
			return (
				(typeof prop.required === "boolean" && prop.required) ||
				prop[PROP_REQUIRED] === true
			);
		});
		const nullable = Object.keys(properties).filter((key) => {
			const prop = properties[key] as Record<string | symbol, unknown>;
			return (
				(typeof prop.nullable === "boolean" && prop.nullable) ||
				prop[PROP_NULLABLE] === true
			);
		});
		// Strip internal-only flags from properties
		const cleanedProperties: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(properties)) {
			const prop = { ...(value as Record<string | symbol, unknown>) };
			if (typeof prop.required === "boolean") delete prop.required;
			if (typeof prop.nullable === "boolean") delete prop.nullable;
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			if (PROP_REQUIRED in prop) delete prop[PROP_REQUIRED];
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			if (PROP_NULLABLE in prop) delete prop[PROP_NULLABLE];
			cleanedProperties[key] = prop;
		}
		const result: Record<string | symbol, unknown> = {
			type: "object",
			properties: cleanedProperties,
			...objectOptions,
		};
		if (required.length > 0) {
			result.required = required;
		}
		if (nullable.length > 0) {
			result.nullable = nullable;
		}
		if (propRequired) result[PROP_REQUIRED] = true;
		if (propNullable) result[PROP_NULLABLE] = true;
		return result as ObjectResult<T, O>;
	},
	/**
	 * Creates a params type for query string parameters.
	 * @see https://atproto.com/specs/lexicon#params
	 */
	params<Properties extends ParamsProperties>(
		properties: Properties,
	): ParamsResult<Properties> {
		const required = Object.keys(properties).filter(
			(key) => properties[key].required,
		);
		// Strip internal-only flags (required) from properties
		const cleanedProperties: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(properties)) {
			const { required: _r, ...rest } = value as Record<string, unknown>;
			cleanedProperties[key] = rest;
		}
		const result: Record<string, unknown> = {
			type: "params",
			properties: cleanedProperties,
		};
		if (required.length > 0) {
			result.required = required;
		}
		return result as ParamsResult<Properties>;
	},
	/**
	 * Creates a query endpoint definition (HTTP GET).
	 * @see https://atproto.com/specs/lexicon#query
	 */
	query<T extends QueryOptions>(options?: T): T & { type: "query" } {
		return {
			type: "query",
			...options,
		} as T & { type: "query" };
	},
	/**
	 * Creates a procedure endpoint definition (HTTP POST).
	 * @see https://atproto.com/specs/lexicon#procedure
	 */
	procedure<T extends ProcedureOptions>(
		options?: T,
	): T & { type: "procedure" } {
		return {
			type: "procedure",
			...options,
		} as T & { type: "procedure" };
	},
	/**
	 * Creates a subscription endpoint definition (WebSocket).
	 * @see https://atproto.com/specs/lexicon#subscription
	 */
	subscription<T extends SubscriptionOptions>(
		options?: T,
	): T & { type: "subscription" } {
		return {
			type: "subscription",
			...options,
		} as T & { type: "subscription" };
	},
	/**
	 * Creates a repo-resource permission entry.
	 * @see https://atproto.com/specs/permission#repo
	 */
	repoPermission(options: RepoPermissionOptions): RepoPermissionEntry {
		return {
			type: "permission",
			resource: "repo",
			collection: options.collection.map(resolveNsid),
			...(options.action ? { action: options.action } : {}),
		};
	},
	/**
	 * Creates an RPC-resource permission entry.
	 * @see https://atproto.com/specs/permission#rpc
	 */
	rpcPermission(options: RpcPermissionOptions): RpcPermissionEntry {
		return {
			type: "permission",
			resource: "rpc",
			lxm: options.lxm.map(resolveNsid),
			...(options.aud !== undefined ? { aud: options.aud } : {}),
			...(options.inheritAud !== undefined
				? { inheritAud: options.inheritAud }
				: {}),
		};
	},
	/**
	 * Creates a blob-resource permission entry.
	 * @see https://atproto.com/specs/permission#blob
	 */
	blobPermission(options: BlobPermissionOptions): BlobPermissionEntry {
		return {
			type: "permission",
			resource: "blob",
			accept: options.accept,
		};
	},
	/**
	 * Creates an account-resource permission entry.
	 * @see https://atproto.com/specs/permission#account
	 */
	accountPermission(options: AccountPermissionOptions): AccountPermissionEntry {
		return {
			type: "permission",
			resource: "account",
			attr: options.attr,
			...(options.action !== undefined ? { action: options.action } : {}),
		};
	},
	/**
	 * Creates an identity-resource permission entry.
	 * @see https://atproto.com/specs/permission#identity
	 */
	identityPermission(
		options: IdentityPermissionOptions,
	): IdentityPermissionEntry {
		return {
			type: "permission",
			resource: "identity",
			attr: options.attr,
		};
	},
	/**
	 * Creates a translatable string with language variants.
	 * @see https://atproto.com/specs/permission
	 */
	langString(defaultValue: string, lang: Record<string, string>): LangString {
		return { default: defaultValue, lang };
	},
	/**
	 * Creates a permission-set definition.
	 * @see https://atproto.com/specs/permission#permission-sets
	 */
	permissionSet(options: PermissionSetOptions) {
		const title = resolveTranslatable(options.title);
		const detail = resolveTranslatable(options.detail);
		return {
			type: "permission-set" as const,
			key: "literal:self" as const,
			title: title.value,
			...(title.lang ? { "title:lang": title.lang } : {}),
			detail: detail.value,
			...(detail.lang ? { "detail:lang": detail.lang } : {}),
			permissions: options.permissions,
			...(options.description ? { description: options.description } : {}),
		};
	},
	/**
	 * Creates a lexicon schema document.
	 * @see https://atproto.com/specs/lexicon#lexicon-document
	 */
	lexicon<ID extends string, D extends LexiconNamespace["defs"]>(
		id: ID,
		defs: D,
	): LexiconSchema<{ lexicon: 1; id: ID; defs: D }> {
		return new Lexicon({
			lexicon: 1,
			id,
			defs,
		});
	},
};

/**
 * Recursively strips internal-only flags (required, nullable) from
 * individual properties in object/params nodes, matching what lx.object()
 * and lx.params() produce.
 */
function stripPropertyFlags(
	node: Record<string, unknown>,
): Record<string, unknown> {
	for (const [key, value] of Object.entries(node)) {
		if (value && typeof value === "object" && !Array.isArray(value)) {
			node[key] = stripPropertyFlags(value as Record<string, unknown>);
		}
	}
	if (
		(node.type === "object" || node.type === "params") &&
		node.properties &&
		typeof node.properties === "object"
	) {
		const props = node.properties as Record<string, Record<string, unknown>>;
		for (const prop of Object.values(props)) {
			delete prop.required;
			delete prop.nullable;
		}
	}
	return node;
}

/** helper to pull lexicon from json directly */
export function fromJSON<const Lex extends LexiconNamespace>(json: Lex) {
	const defs = stripPropertyFlags(
		structuredClone(json.defs) as Record<string, unknown>,
	) as Lex["defs"];
	return lx.lexicon<Lex["id"], Lex["defs"]>(json.id, defs);
}
