import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { join } from "node:path";

import { tmpdir } from "node:os";
import { genEmit } from "../gen-emit.ts";

describe("genEmit", () => {
	let testDir: string;
	let outDir: string;

	beforeEach(async () => {
		// Create a temporary directory for test files
		testDir = join(tmpdir(), `prototypey-test-${String(Date.now())}`);
		outDir = join(testDir, "output");
		await mkdir(testDir, { recursive: true });
		await mkdir(outDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		await rm(testDir, { recursive: true, force: true });
	});

	test("emits JSON from a simple lexicon file", async () => {
		// Create a test lexicon file
		const lexiconFile = join(testDir, "profile.ts");
		await writeFile(
			lexiconFile,
			`
import { lx } from "prototypey";

export const profileNamespace = lx.lexicon("app.bsky.actor.profile", {
	main: lx.record({
		key: "self",
		record: lx.object({
			displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
			description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
		}),
	}),
});
`,
		);

		// Run the emit command
		await genEmit(outDir, lexiconFile);

		// Read the emitted JSON file
		const outputFile = join(outDir, "app.bsky.actor.profile.json");
		const content = await readFile(outputFile, "utf-8");
		const json = JSON.parse(content);

		// Verify the structure
		expect(json).toEqual({
			lexicon: 1,
			id: "app.bsky.actor.profile",
			defs: {
				main: {
					type: "record",
					key: "self",
					record: {
						type: "object",
						properties: {
							displayName: {
								type: "string",
								maxLength: 64,
								maxGraphemes: 64,
							},
							description: {
								type: "string",
								maxLength: 256,
								maxGraphemes: 256,
							},
						},
					},
				},
			},
		});
	});

	test("emits JSON from multiple lexicon exports in one file", async () => {
		// Create a test file with multiple exports
		const lexiconFile = join(testDir, "multiple.ts");
		await writeFile(
			lexiconFile,
			`
import { lx } from "prototypey";

export const profile = lx.lexicon("app.bsky.actor.profile", {
	main: lx.record({
		key: "self",
		record: lx.object({
			displayName: lx.string({ maxLength: 64 }),
		}),
	}),
});

export const post = lx.lexicon("app.bsky.feed.post", {
	main: lx.record({
		key: "tid",
		record: lx.object({
			text: lx.string({ maxLength: 300 }),
		}),
	}),
});
`,
		);

		// Run the emit command
		await genEmit(outDir, lexiconFile);

		// Verify both files were created
		const profileJson = JSON.parse(
			await readFile(join(outDir, "app.bsky.actor.profile.json"), "utf-8"),
		);
		const postJson = JSON.parse(
			await readFile(join(outDir, "app.bsky.feed.post.json"), "utf-8"),
		);

		expect(profileJson.id).toBe("app.bsky.actor.profile");
		expect(postJson.id).toBe("app.bsky.feed.post");
	});

	test("handles glob patterns for multiple files", async () => {
		// Create multiple test files
		const lexicons = join(testDir, "lexicons");
		await mkdir(lexicons, { recursive: true });

		await writeFile(
			join(lexicons, "profile.ts"),
			`
import { lx } from "prototypey";
export const schema = lx.lexicon("app.bsky.actor.profile", {
	main: lx.record({ key: "self", record: lx.object({}) }),
});
`,
		);

		await writeFile(
			join(lexicons, "post.ts"),
			`
import { lx } from "prototypey";
export const schema = lx.lexicon("app.bsky.feed.post", {
	main: lx.record({ key: "tid", record: lx.object({}) }),
});
`,
		);

		// Run with glob pattern
		await genEmit(outDir, `${lexicons}/*.ts`);

		// Verify both files were created
		const profileExists = await readFile(
			join(outDir, "app.bsky.actor.profile.json"),
			"utf-8",
		);
		const postExists = await readFile(
			join(outDir, "app.bsky.feed.post.json"),
			"utf-8",
		);

		expect(profileExists).toBeTruthy();
		expect(postExists).toBeTruthy();
	});

	test("emits query endpoint with parameters and output", async () => {
		const lexiconFile = join(testDir, "search.ts");
		await writeFile(
			lexiconFile,
			`
import { lx } from "prototypey";

export const searchPosts = lx.lexicon("app.bsky.feed.searchPosts", {
	main: lx.query({
		description: "Find posts matching search criteria",
		parameters: lx.params({
			q: lx.string({ required: true }),
			limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
			cursor: lx.string(),
		}),
		output: {
			encoding: "application/json",
			schema: lx.object({
				cursor: lx.string(),
				posts: lx.array(lx.ref("app.bsky.feed.defs#postView"), { required: true }),
			}),
		},
	}),
});
`,
		);

		await genEmit(outDir, lexiconFile);

		const outputFile = join(outDir, "app.bsky.feed.searchPosts.json");
		const content = await readFile(outputFile, "utf-8");
		const json = JSON.parse(content);

		expect(json).toEqual({
			lexicon: 1,
			id: "app.bsky.feed.searchPosts",
			defs: {
				main: {
					type: "query",
					description: "Find posts matching search criteria",
					parameters: {
						type: "params",
						properties: {
							q: { type: "string", required: true },
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
								posts: {
									type: "array",
									items: { type: "ref", ref: "app.bsky.feed.defs#postView" },
									required: true,
								},
							},
							required: ["posts"],
						},
					},
				},
			},
		});
	});

	test("emits procedure endpoint with input and output", async () => {
		const lexiconFile = join(testDir, "create-post.ts");
		await writeFile(
			lexiconFile,
			`
import { lx } from "prototypey";

export const createPost = lx.lexicon("com.atproto.repo.createRecord", {
	main: lx.procedure({
		description: "Create a record",
		input: {
			encoding: "application/json",
			schema: lx.object({
				repo: lx.string({ required: true }),
				collection: lx.string({ required: true }),
				record: lx.unknown({ required: true }),
			}),
		},
		output: {
			encoding: "application/json",
			schema: lx.object({
				uri: lx.string({ required: true }),
				cid: lx.string({ required: true }),
			}),
		},
	}),
});
`,
		);

		await genEmit(outDir, lexiconFile);

		const outputFile = join(outDir, "com.atproto.repo.createRecord.json");
		const content = await readFile(outputFile, "utf-8");
		const json = JSON.parse(content);

		expect(json).toEqual({
			lexicon: 1,
			id: "com.atproto.repo.createRecord",
			defs: {
				main: {
					type: "procedure",
					description: "Create a record",
					input: {
						encoding: "application/json",
						schema: {
							type: "object",
							properties: {
								repo: { type: "string", required: true },
								collection: { type: "string", required: true },
								record: { type: "unknown", required: true },
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
				},
			},
		});
	});

	test("emits subscription endpoint with message union", async () => {
		const lexiconFile = join(testDir, "subscription.ts");
		await writeFile(
			lexiconFile,
			`
import { lx } from "prototypey";

export const subscribeRepos = lx.lexicon("com.atproto.sync.subscribeRepos", {
	main: lx.subscription({
		description: "Repository event stream",
		parameters: lx.params({
			cursor: lx.integer(),
		}),
		message: {
			schema: lx.union(["#commit", "#identity", "#account"]),
		},
	}),
	commit: lx.object({
		seq: lx.integer({ required: true }),
		rebase: lx.boolean({ required: true }),
	}),
	identity: lx.object({
		seq: lx.integer({ required: true }),
		did: lx.string({ required: true, format: "did" }),
	}),
	account: lx.object({
		seq: lx.integer({ required: true }),
		active: lx.boolean({ required: true }),
	}),
});
`,
		);

		await genEmit(outDir, lexiconFile);

		const outputFile = join(outDir, "com.atproto.sync.subscribeRepos.json");
		const content = await readFile(outputFile, "utf-8");
		const json = JSON.parse(content);

		expect(json).toEqual({
			lexicon: 1,
			id: "com.atproto.sync.subscribeRepos",
			defs: {
				main: {
					type: "subscription",
					description: "Repository event stream",
					parameters: {
						type: "params",
						properties: {
							cursor: { type: "integer" },
						},
					},
					message: {
						schema: {
							type: "union",
							refs: ["#commit", "#identity", "#account"],
						},
					},
				},
				commit: {
					type: "object",
					properties: {
						seq: { type: "integer", required: true },
						rebase: { type: "boolean", required: true },
					},
					required: ["seq", "rebase"],
				},
				identity: {
					type: "object",
					properties: {
						seq: { type: "integer", required: true },
						did: { type: "string", format: "did", required: true },
					},
					required: ["seq", "did"],
				},
				account: {
					type: "object",
					properties: {
						seq: { type: "integer", required: true },
						active: { type: "boolean", required: true },
					},
					required: ["seq", "active"],
				},
			},
		});
	});

	test("emits complex namespace with tokens, refs, and unions", async () => {
		const lexiconFile = join(testDir, "complex.ts");
		await writeFile(
			lexiconFile,
			`
import { lx } from "prototypey";

export const feedDefs = lx.lexicon("app.bsky.feed.defs", {
	postView: lx.object({
		uri: lx.string({ required: true, format: "at-uri" }),
		cid: lx.string({ required: true, format: "cid" }),
		author: lx.ref("app.bsky.actor.defs#profileViewBasic", { required: true }),
		embed: lx.union([
			"app.bsky.embed.images#view",
			"app.bsky.embed.video#view",
		]),
		likeCount: lx.integer({ minimum: 0 }),
	}),
	requestLess: lx.token("Request less content like this"),
	requestMore: lx.token("Request more content like this"),
});
`,
		);

		await genEmit(outDir, lexiconFile);

		const outputFile = join(outDir, "app.bsky.feed.defs.json");
		const content = await readFile(outputFile, "utf-8");
		const json = JSON.parse(content);

		expect(json).toEqual({
			lexicon: 1,
			id: "app.bsky.feed.defs",
			defs: {
				postView: {
					type: "object",
					properties: {
						uri: { type: "string", format: "at-uri", required: true },
						cid: { type: "string", format: "cid", required: true },
						author: {
							type: "ref",
							ref: "app.bsky.actor.defs#profileViewBasic",
							required: true,
						},
						embed: {
							type: "union",
							refs: ["app.bsky.embed.images#view", "app.bsky.embed.video#view"],
						},
						likeCount: { type: "integer", minimum: 0 },
					},
					required: ["uri", "cid", "author"],
				},
				requestLess: {
					type: "token",
					description: "Request less content like this",
				},
				requestMore: {
					type: "token",
					description: "Request more content like this",
				},
			},
		});
	});

	test("emits lexicon with arrays, blobs, and string formats", async () => {
		const lexiconFile = join(testDir, "primitives.ts");
		await writeFile(
			lexiconFile,
			`
import { lx } from "prototypey";

export const imagePost = lx.lexicon("app.example.imagePost", {
	main: lx.record({
		key: "tid",
		record: lx.object({
			text: lx.string({ maxLength: 300, maxGraphemes: 300, required: true }),
			createdAt: lx.string({ format: "datetime", required: true }),
			images: lx.array(lx.blob({ accept: ["image/png", "image/jpeg"], maxSize: 1000000 }), { maxLength: 4 }),
			tags: lx.array(lx.string({ maxLength: 64 })),
			langs: lx.array(lx.string()),
		}),
	}),
});
`,
		);

		await genEmit(outDir, lexiconFile);

		const outputFile = join(outDir, "app.example.imagePost.json");
		const content = await readFile(outputFile, "utf-8");
		const json = JSON.parse(content);

		expect(json).toEqual({
			lexicon: 1,
			id: "app.example.imagePost",
			defs: {
				main: {
					type: "record",
					key: "tid",
					record: {
						type: "object",
						properties: {
							text: {
								type: "string",
								maxLength: 300,
								maxGraphemes: 300,
								required: true,
							},
							createdAt: { type: "string", format: "datetime", required: true },
							images: {
								type: "array",
								items: {
									type: "blob",
									accept: ["image/png", "image/jpeg"],
									maxSize: 1000000,
								},
								maxLength: 4,
							},
							tags: {
								type: "array",
								items: { type: "string", maxLength: 64 },
							},
							langs: {
								type: "array",
								items: { type: "string" },
							},
						},
						required: ["text", "createdAt"],
					},
				},
			},
		});
	});
});
