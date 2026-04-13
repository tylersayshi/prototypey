import { Prettify } from "./type-utils.ts";

/* eslint-disable @typescript-eslint/no-empty-object-type */
type InferType<T> = T extends { type: "record" }
	? InferRecord<T>
	: T extends { type: "object" }
		? InferObject<T>
		: T extends { type: "array" }
			? InferArray<T>
			: T extends { type: "params" }
				? InferParams<T>
				: T extends { type: "permission-set" }
					? InferPermissionSet<T>
					: T extends { type: "union" }
						? InferUnion<T>
						: T extends { type: "token" }
							? InferToken<T>
							: T extends { type: "ref" }
								? InferRef<T>
								: T extends { type: "unknown" }
									? unknown
									: T extends { type: "null" }
										? null
										: T extends { type: "boolean" }
											? boolean
											: T extends { type: "integer" }
												? number
												: T extends { type: "string" }
													? T extends {
															enum: readonly (infer E extends string)[];
														}
														? E
														: T extends {
																	knownValues: readonly (infer K extends
																		string)[];
															  }
															? K | (string & {})
															: string
													: T extends { type: "bytes" }
														? Uint8Array
														: T extends { type: "cid-link" }
															? string
															: T extends { type: "blob" }
																? Blob
																: never;

type InferToken<T> = T extends { enum: readonly (infer U)[] } ? U : string;

export type GetRequired<T> = T extends { required: readonly (infer R)[] }
	? R
	: never;
export type GetNullable<T> = T extends { nullable: readonly (infer N)[] }
	? N
	: never;

type InferObject<
	T,
	Nullable extends string = GetNullable<T> & string,
	Required extends string = GetRequired<T> & string,
	NullableAndRequired extends string = Required & Nullable & string,
	Normal extends string = "properties" extends keyof T
		? Exclude<keyof T["properties"], Required | Nullable> & string
		: never,
> = Prettify<
	T extends { properties: infer P }
		? {
				-readonly [K in Normal]?: InferType<P[K & keyof P]>;
			} & {
				-readonly [K in Exclude<Required, NullableAndRequired>]-?: InferType<
					P[K & keyof P]
				>;
			} & {
				-readonly [K in Exclude<Nullable, NullableAndRequired>]?: InferType<
					P[K & keyof P]
				> | null;
			} & {
				-readonly [K in NullableAndRequired]: InferType<P[K & keyof P]> | null;
			}
		: {}
>;

type InferArray<T> = T extends { items: infer Items }
	? InferType<Items>[]
	: never[];

type InferUnion<T> = T extends { refs: readonly (infer R)[] }
	? R extends string
		? { $type: R; [key: string]: unknown }
		: never
	: never;

type InferRef<T> = T extends { ref: infer R }
	? R extends string
		? { $type: R; [key: string]: unknown }
		: unknown
	: unknown;

type InferParams<T> = InferObject<T>;

type InferPermissionEntry<T> = T extends { resource: "repo" }
	? Prettify<
			{
				type: "permission";
				resource: "repo";
				collection: string[];
			} & (T extends { action: infer A } ? { action: A } : {})
		>
	: T extends { resource: "rpc" }
		? Prettify<
				{ type: "permission"; resource: "rpc" } & (T extends { lxm: infer L }
					? { lxm: L }
					: {}) &
					(T extends { aud: infer A } ? { aud: A } : {}) &
					(T extends { inheritAud: infer I } ? { inheritAud: I } : {})
			>
		: T extends { resource: "blob" }
			? { type: "permission"; resource: "blob"; accept: string[] }
			: T extends { resource: "account" }
				? Prettify<
						{
							type: "permission";
							resource: "account";
							attr: T extends { attr: infer A } ? A : string;
						} & (T extends { action: infer Act } ? { action: Act } : {})
					>
				: T extends { resource: "identity" }
					? {
							type: "permission";
							resource: "identity";
							attr: T extends { attr: infer A } ? A : string;
						}
					: { type: "permission"; resource: string };

type InferPermissions<T> = T extends readonly [infer Head, ...infer Tail]
	? [InferPermissionEntry<Head>, ...InferPermissions<Tail>]
	: T extends readonly (infer Item)[]
		? InferPermissionEntry<Item>[]
		: never;

type InferPermissionSet<T> = Prettify<
	{
		title: T extends { title: infer V } ? V : string;
		detail: T extends { detail: infer V } ? V : string;
		permissions: T extends { permissions: infer P } ? InferPermissions<P> : [];
	} & (T extends { description: infer D } ? { description: D } : {})
>;

type InferRecord<T> = T extends { record: infer R }
	? R extends { type: "object" }
		? InferObject<R>
		: R extends { type: "union" }
			? InferUnion<R>
			: unknown
	: unknown;

/**
 * Recursively replaces stub references in a type with their actual definitions.
 * Detects circular references and missing references, returning string literal error messages.
 */
type ReplaceRefsInType<T, Defs, Visited = never> =
	// Check if this is a ref stub type (has $type starting with #)
	T extends { $type: `#${infer DefName}` }
		? DefName extends keyof Defs
			? // Check for circular reference
				DefName extends Visited
				? `[Circular reference detected: #${DefName}]`
				: // Recursively resolve the ref and preserve the $type marker
					Prettify<
						ReplaceRefsInType<Defs[DefName], Defs, Visited | DefName> & {
							$type: T["$type"];
						}
					>
			: // Reference not found in definitions
				`[Reference not found: #${DefName}]`
		: // Handle arrays (but not Uint8Array or other typed arrays)
			T extends Uint8Array | Blob
			? T
			: T extends readonly (infer Item)[]
				? ReplaceRefsInType<Item, Defs, Visited>[]
				: // Handle plain objects (exclude built-in types and functions)
					T extends object
					? T extends (...args: unknown[]) => unknown
						? T
						: { [K in keyof T]: ReplaceRefsInType<T[K], Defs, Visited> }
					: // Primitives pass through unchanged
						T;

/**
 * Infers the TypeScript type for a lexicon namespace, returning only the 'main' definition
 * with all local refs (#user, #post, etc.) resolved to their actual types.
 */
export type Infer<
	T extends { json: { id: string; defs: Record<string, unknown> } },
> = Prettify<
	"main" extends keyof T["json"]["defs"]
		? { $type: T["json"]["id"] } & ReplaceRefsInType<
				InferType<T["json"]["defs"]["main"]>,
				{ [K in keyof T["json"]["defs"]]: InferType<T["json"]["defs"][K]> }
			>
		: never
>;
