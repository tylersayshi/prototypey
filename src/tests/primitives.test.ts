import { strict as assert } from "node:assert";
import { lx } from "../lib.ts";
import { test } from "node:test";

test("lx.null()", () => {
	const result = lx.null();
	assert.deepEqual(result, { type: "null" });
});

test("lx.boolean()", () => {
	const result = lx.boolean();
	assert.deepEqual(result, { type: "boolean" });
});

test("lx.boolean() with default", () => {
	const result = lx.boolean({ default: true });
	assert.deepEqual(result, { type: "boolean", default: true });
});

test("lx.boolean() with const", () => {
	const result = lx.boolean({ const: false });
	assert.deepEqual(result, { type: "boolean", const: false });
});

test("lx.integer()", () => {
	const result = lx.integer();
	assert.deepEqual(result, { type: "integer" });
});

test("lx.integer() with minimum", () => {
	const result = lx.integer({ minimum: 0 });
	assert.deepEqual(result, { type: "integer", minimum: 0 });
});

test("lx.integer() with maximum", () => {
	const result = lx.integer({ maximum: 100 });
	assert.deepEqual(result, { type: "integer", maximum: 100 });
});

test("lx.integer() with minimum and maximum", () => {
	const result = lx.integer({ minimum: 0, maximum: 100 });
	assert.deepEqual(result, { type: "integer", minimum: 0, maximum: 100 });
});

test("lx.integer() with enum", () => {
	const result = lx.integer({ enum: [1, 2, 3, 5, 8, 13] });
	assert.deepEqual(result, { type: "integer", enum: [1, 2, 3, 5, 8, 13] });
});

test("lx.integer() with default", () => {
	const result = lx.integer({ default: 42 });
	assert.deepEqual(result, { type: "integer", default: 42 });
});

test("lx.integer() with const", () => {
	const result = lx.integer({ const: 7 });
	assert.deepEqual(result, { type: "integer", const: 7 });
});

test("lx.string()", () => {
	const result = lx.string();
	assert.deepEqual(result, { type: "string" });
});

test("lx.string() with maxLength", () => {
	const result = lx.string({ maxLength: 64 });
	assert.deepEqual(result, { type: "string", maxLength: 64 });
});

test("lx.string() with enum", () => {
	const result = lx.string({ enum: ["light", "dark", "auto"] });
	assert.deepEqual(result, { type: "string", enum: ["light", "dark", "auto"] });
});

test("lx.unknown()", () => {
	const result = lx.unknown();
	assert.deepEqual(result, { type: "unknown" });
});

test("lx.bytes()", () => {
	const result = lx.bytes();
	assert.deepEqual(result, { type: "bytes" });
});

test("lx.bytes() with minLength", () => {
	const result = lx.bytes({ minLength: 1 });
	assert.deepEqual(result, { type: "bytes", minLength: 1 });
});

test("lx.bytes() with maxLength", () => {
	const result = lx.bytes({ maxLength: 1024 });
	assert.deepEqual(result, { type: "bytes", maxLength: 1024 });
});

test("lx.bytes() with minLength and maxLength", () => {
	const result = lx.bytes({ minLength: 1, maxLength: 1024 });
	assert.deepEqual(result, { type: "bytes", minLength: 1, maxLength: 1024 });
});

test("lx.cidLink()", () => {
	const result = lx.cidLink(
		"bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a",
	);
	assert.deepEqual(result, {
		type: "cid-link",
		$link: "bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a",
	});
});

test("lx.blob()", () => {
	const result = lx.blob();
	assert.deepEqual(result, { type: "blob" });
});

test("lx.blob() with accept", () => {
	const result = lx.blob({ accept: ["image/png", "image/jpeg"] });
	assert.deepEqual(result, {
		type: "blob",
		accept: ["image/png", "image/jpeg"],
	});
});

test("lx.blob() with maxSize", () => {
	const result = lx.blob({ maxSize: 1000000 });
	assert.deepEqual(result, { type: "blob", maxSize: 1000000 });
});

test("lx.blob() with accept and maxSize", () => {
	const result = lx.blob({
		accept: ["image/png", "image/jpeg"],
		maxSize: 5000000,
	});
	assert.deepEqual(result, {
		type: "blob",
		accept: ["image/png", "image/jpeg"],
		maxSize: 5000000,
	});
});

test("lx.array() with string items", () => {
	const result = lx.array(lx.string());
	assert.deepEqual(result, { type: "array", items: { type: "string" } });
});

test("lx.array() with integer items", () => {
	const result = lx.array(lx.integer());
	assert.deepEqual(result, { type: "array", items: { type: "integer" } });
});

test("lx.array() with minLength", () => {
	const result = lx.array(lx.string(), { minLength: 1 });
	assert.deepEqual(result, {
		type: "array",
		items: { type: "string" },
		minLength: 1,
	});
});

test("lx.array() with maxLength", () => {
	const result = lx.array(lx.string(), { maxLength: 10 });
	assert.deepEqual(result, {
		type: "array",
		items: { type: "string" },
		maxLength: 10,
	});
});

test("lx.array() with minLength and maxLength", () => {
	const result = lx.array(lx.string(), { minLength: 1, maxLength: 10 });
	assert.deepEqual(result, {
		type: "array",
		items: { type: "string" },
		minLength: 1,
		maxLength: 10,
	});
});

test("lx.array() with required", () => {
	const result = lx.array(lx.string(), { required: true });
	assert.deepEqual(result, {
		type: "array",
		items: { type: "string" },
		required: true,
	});
});

test("lx.token() with interaction event", () => {
	const result = lx.token(
		"Request that less content like the given feed item be shown in the feed",
	);
	assert.deepEqual(result, {
		type: "token",
		description:
			"Request that less content like the given feed item be shown in the feed",
	});
});

test("lx.token() with content mode", () => {
	const result = lx.token(
		"Declares the feed generator returns posts containing app.bsky.embed.video embeds",
	);
	assert.deepEqual(result, {
		type: "token",
		description:
			"Declares the feed generator returns posts containing app.bsky.embed.video embeds",
	});
});

test("lx.ref() with local definition", () => {
	const result = lx.ref("#profileAssociated");
	assert.deepEqual(result, {
		type: "ref",
		ref: "#profileAssociated",
	});
});

test("lx.ref() with external schema", () => {
	const result = lx.ref("com.atproto.label.defs#label");
	assert.deepEqual(result, {
		type: "ref",
		ref: "com.atproto.label.defs#label",
	});
});

test("lx.ref() with required option", () => {
	const result = lx.ref("#profileView", { required: true });
	assert.deepEqual(result, {
		type: "ref",
		ref: "#profileView",
		required: true,
	});
});

test("lx.ref() with nullable option", () => {
	const result = lx.ref("#profileView", { nullable: true });
	assert.deepEqual(result, {
		type: "ref",
		ref: "#profileView",
		nullable: true,
	});
});

test("lx.ref() with both required and nullable", () => {
	const result = lx.ref("app.bsky.actor.defs#profileView", {
		required: true,
		nullable: true,
	});
	assert.deepEqual(result, {
		type: "ref",
		ref: "app.bsky.actor.defs#profileView",
		required: true,
		nullable: true,
	});
});

test("lx.union() with local refs", () => {
	const result = lx.union(["#reasonRepost", "#reasonPin"]);
	assert.deepEqual(result, {
		type: "union",
		refs: ["#reasonRepost", "#reasonPin"],
	});
});

test("lx.union() with external refs", () => {
	const result = lx.union([
		"app.bsky.embed.images#view",
		"app.bsky.embed.video#view",
		"app.bsky.embed.external#view",
		"app.bsky.embed.record#view",
		"app.bsky.embed.recordWithMedia#view",
	]);
	assert.deepEqual(result, {
		type: "union",
		refs: [
			"app.bsky.embed.images#view",
			"app.bsky.embed.video#view",
			"app.bsky.embed.external#view",
			"app.bsky.embed.record#view",
			"app.bsky.embed.recordWithMedia#view",
		],
	});
});

test("lx.union() with closed option", () => {
	const result = lx.union(["#postView", "#notFoundPost", "#blockedPost"], {
		closed: true,
	});
	assert.deepEqual(result, {
		type: "union",
		refs: ["#postView", "#notFoundPost", "#blockedPost"],
		closed: true,
	});
});

test("lx.union() with closed: false (open union)", () => {
	const result = lx.union(["#threadViewPost", "#notFoundPost"], {
		closed: false,
	});
	assert.deepEqual(result, {
		type: "union",
		refs: ["#threadViewPost", "#notFoundPost"],
		closed: false,
	});
});

test("lx.params() with basic properties", () => {
	const result = lx.params({
		q: lx.string(),
		limit: lx.integer(),
	});
	assert.deepEqual(result, {
		type: "params",
		properties: {
			q: { type: "string" },
			limit: { type: "integer" },
		},
	});
});

test("lx.params() with required properties", () => {
	const result = lx.params({
		q: lx.string({ required: true }),
		limit: lx.integer(),
	});
	assert.deepEqual(result, {
		type: "params",
		properties: {
			q: { type: "string", required: true },
			limit: { type: "integer" },
		},
		required: ["q"],
	});
});

test("lx.params() with property options", () => {
	const result = lx.params({
		q: lx.string(),
		limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
		cursor: lx.string(),
	});
	assert.deepEqual(result, {
		type: "params",
		properties: {
			q: { type: "string" },
			limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
			cursor: { type: "string" },
		},
	});
});

test("lx.params() with array properties", () => {
	const result = lx.params({
		tags: lx.array(lx.string()),
		ids: lx.array(lx.integer()),
	});
	assert.deepEqual(result, {
		type: "params",
		properties: {
			tags: { type: "array", items: { type: "string" } },
			ids: { type: "array", items: { type: "integer" } },
		},
	});
});

test("lx.params() real-world example from searchActors", () => {
	const result = lx.params({
		q: lx.string({ required: true }),
		limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
		cursor: lx.string(),
	});
	assert.deepEqual(result, {
		type: "params",
		properties: {
			q: { type: "string", required: true },
			limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
			cursor: { type: "string" },
		},
		required: ["q"],
	});
});

test("lx.query() basic", () => {
	const result = lx.query();
	assert.deepEqual(result, { type: "query" });
});

test("lx.query() with description", () => {
	const result = lx.query({ description: "Search for actors" });
	assert.deepEqual(result, { type: "query", description: "Search for actors" });
});

test("lx.query() with parameters", () => {
	const result = lx.query({
		parameters: lx.params({
			q: lx.string({ required: true }),
			limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
		}),
	});
	assert.deepEqual(result, {
		type: "query",
		parameters: {
			type: "params",
			properties: {
				q: { type: "string", required: true },
				limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
			},
			required: ["q"],
		},
	});
});

test("lx.query() with output", () => {
	const result = lx.query({
		output: {
			encoding: "application/json",
			schema: lx.object({
				posts: lx.array(lx.ref("app.bsky.feed.defs#postView"), {
					required: true,
				}),
				cursor: lx.string(),
			}),
		},
	});
	assert.deepEqual(result, {
		type: "query",
		output: {
			encoding: "application/json",
			schema: {
				type: "object",
				properties: {
					posts: {
						type: "array",
						items: { type: "ref", ref: "app.bsky.feed.defs#postView" },
						required: true,
					},
					cursor: { type: "string" },
				},
				required: ["posts"],
			},
		},
	});
});

test("lx.query() with errors", () => {
	const result = lx.query({
		errors: [{ name: "BadQueryString" }],
	});
	assert.deepEqual(result, {
		type: "query",
		errors: [{ name: "BadQueryString" }],
	});
});

test("lx.query() real-world example: searchPosts", () => {
	const result = lx.query({
		description: "Find posts matching search criteria",
		parameters: lx.params({
			q: lx.string({ required: true }),
			sort: lx.string({ enum: ["top", "latest"], default: "latest" }),
			limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
			cursor: lx.string(),
		}),
		output: {
			encoding: "application/json",
			schema: lx.object({
				cursor: lx.string(),
				hitsTotal: lx.integer(),
				posts: lx.array(lx.ref("app.bsky.feed.defs#postView"), {
					required: true,
				}),
			}),
		},
		errors: [{ name: "BadQueryString" }],
	});
	assert.deepEqual(result, {
		type: "query",
		description: "Find posts matching search criteria",
		parameters: {
			type: "params",
			properties: {
				q: { type: "string", required: true },
				sort: { type: "string", enum: ["top", "latest"], default: "latest" },
				limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
				cursor: { type: "string" },
			},
			required: ["q"],
		},
		output: {
			encoding: "application/json",
			schema: {
				type: "object",
				properties: {
					cursor: { type: "string" },
					hitsTotal: { type: "integer" },
					posts: {
						type: "array",
						items: { type: "ref", ref: "app.bsky.feed.defs#postView" },
						required: true,
					},
				},
				required: ["posts"],
			},
		},
		errors: [{ name: "BadQueryString" }],
	});
});

test("lx.procedure() basic", () => {
	const result = lx.procedure();
	assert.deepEqual(result, { type: "procedure" });
});

test("lx.procedure() with description", () => {
	const result = lx.procedure({ description: "Create a new post" });
	assert.deepEqual(result, {
		type: "procedure",
		description: "Create a new post",
	});
});

test("lx.procedure() with parameters", () => {
	const result = lx.procedure({
		parameters: lx.params({
			validate: lx.boolean({ default: true }),
		}),
	});
	assert.deepEqual(result, {
		type: "procedure",
		parameters: {
			type: "params",
			properties: {
				validate: { type: "boolean", default: true },
			},
		},
	});
});

test("lx.procedure() with input", () => {
	const result = lx.procedure({
		input: {
			encoding: "application/json",
			schema: lx.object({
				text: lx.string({ required: true, maxGraphemes: 300 }),
				createdAt: lx.string({ format: "datetime" }),
			}),
		},
	});
	assert.deepEqual(result, {
		type: "procedure",
		input: {
			encoding: "application/json",
			schema: {
				type: "object",
				properties: {
					text: { type: "string", required: true, maxGraphemes: 300 },
					createdAt: { type: "string", format: "datetime" },
				},
				required: ["text"],
			},
		},
	});
});

test("lx.procedure() with output", () => {
	const result = lx.procedure({
		output: {
			encoding: "application/json",
			schema: lx.object({
				uri: lx.string({ required: true }),
				cid: lx.string({ required: true }),
			}),
		},
	});
	assert.deepEqual(result, {
		type: "procedure",
		output: {
			encoding: "application/json",
			schema: {
				type: "object",
				properties: {
					uri: { type: "string", required: true },
					cid: { type: "string", required: true },
				},
				required: ["uri", "cid"],
			},
		},
	});
});

test("lx.procedure() with errors", () => {
	const result = lx.procedure({
		errors: [
			{ name: "InvalidRequest" },
			{ name: "RateLimitExceeded", description: "Too many requests" },
		],
	});
	assert.deepEqual(result, {
		type: "procedure",
		errors: [
			{ name: "InvalidRequest" },
			{ name: "RateLimitExceeded", description: "Too many requests" },
		],
	});
});

test("lx.procedure() real-world example: createPost", () => {
	const result = lx.procedure({
		description: "Create a post",
		input: {
			encoding: "application/json",
			schema: lx.object({
				repo: lx.string({ required: true }),
				collection: lx.string({ required: true }),
				record: lx.unknown({ required: true }),
				validate: lx.boolean({ default: true }),
			}),
		},
		output: {
			encoding: "application/json",
			schema: lx.object({
				uri: lx.string({ required: true }),
				cid: lx.string({ required: true }),
			}),
		},
		errors: [{ name: "InvalidSwap" }, { name: "InvalidRecord" }],
	});
	assert.deepEqual(result, {
		type: "procedure",
		description: "Create a post",
		input: {
			encoding: "application/json",
			schema: {
				type: "object",
				properties: {
					repo: { type: "string", required: true },
					collection: { type: "string", required: true },
					record: { type: "unknown", required: true },
					validate: { type: "boolean", default: true },
				},
				required: ["repo", "collection", "record"],
			},
		},
		output: {
			encoding: "application/json",
			schema: {
				type: "object",
				properties: {
					uri: { type: "string", required: true },
					cid: { type: "string", required: true },
				},
				required: ["uri", "cid"],
			},
		},
		errors: [{ name: "InvalidSwap" }, { name: "InvalidRecord" }],
	});
});

test("lx.subscription() basic", () => {
	const result = lx.subscription();
	assert.deepEqual(result, { type: "subscription" });
});

test("lx.subscription() with description", () => {
	const result = lx.subscription({
		description: "Repository event stream",
	});
	assert.deepEqual(result, {
		type: "subscription",
		description: "Repository event stream",
	});
});

test("lx.subscription() with parameters", () => {
	const result = lx.subscription({
		parameters: lx.params({
			cursor: lx.integer(),
		}),
	});
	assert.deepEqual(result, {
		type: "subscription",
		parameters: {
			type: "params",
			properties: {
				cursor: { type: "integer" },
			},
		},
	});
});

test("lx.subscription() with message", () => {
	const result = lx.subscription({
		message: {
			schema: lx.union(["#commit", "#identity", "#account"]),
		},
	});
	assert.deepEqual(result, {
		type: "subscription",
		message: {
			schema: {
				type: "union",
				refs: ["#commit", "#identity", "#account"],
			},
		},
	});
});

test("lx.subscription() with message description", () => {
	const result = lx.subscription({
		message: {
			description: "Event message types",
			schema: lx.union(["#commit", "#handle", "#migrate"]),
		},
	});
	assert.deepEqual(result, {
		type: "subscription",
		message: {
			description: "Event message types",
			schema: {
				type: "union",
				refs: ["#commit", "#handle", "#migrate"],
			},
		},
	});
});

test("lx.subscription() with errors", () => {
	const result = lx.subscription({
		errors: [
			{ name: "FutureCursor" },
			{ name: "ConsumerTooSlow", description: "Consumer is too slow" },
		],
	});
	assert.deepEqual(result, {
		type: "subscription",
		errors: [
			{ name: "FutureCursor" },
			{ name: "ConsumerTooSlow", description: "Consumer is too slow" },
		],
	});
});

test("lx.subscription() real-world example: subscribeRepos", () => {
	const result = lx.subscription({
		description: "Repository event stream, aka Firehose endpoint",
		parameters: lx.params({
			cursor: lx.integer(),
		}),
		message: {
			description: "Represents an update of repository state",
			schema: lx.union([
				"#commit",
				"#identity",
				"#account",
				"#handle",
				"#migrate",
				"#tombstone",
				"#info",
			]),
		},
		errors: [{ name: "FutureCursor" }, { name: "ConsumerTooSlow" }],
	});
	assert.deepEqual(result, {
		type: "subscription",
		description: "Repository event stream, aka Firehose endpoint",
		parameters: {
			type: "params",
			properties: {
				cursor: {
					type: "integer",
				},
			},
		},
		message: {
			description: "Represents an update of repository state",
			schema: {
				type: "union",
				refs: [
					"#commit",
					"#identity",
					"#account",
					"#handle",
					"#migrate",
					"#tombstone",
					"#info",
				],
			},
		},
		errors: [{ name: "FutureCursor" }, { name: "ConsumerTooSlow" }],
	});
});
