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

type InferDefs<T extends Record<string, unknown>> = {
	-readonly [K in keyof T]: InferType<T[K]>;
};

export type InferNS<T extends { id: string; defs: Record<string, unknown> }> =
	Prettify<InferDefs<T["defs"]>>;
