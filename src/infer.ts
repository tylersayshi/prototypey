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
												? string
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
export type Infer<T extends { id: string; defs: Record<string, unknown> }> =
	Prettify<
		"main" extends keyof T["defs"]
			? { id: T["id"] } & ReplaceRefsInType<
					InferType<T["defs"]["main"]>,
					{ [K in keyof T["defs"]]: InferType<T["defs"][K]> }
				>
			: never
	>;
