import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { genFromJSON } from "../gen-from-json.ts";

describe("genFromJSON", () => {
	let testDir: string;
	let outDir: string;

	beforeEach(async () => {
		// Create a temporary directory for test files
		testDir = join(tmpdir(), `prototypey-test-import-${String(Date.now())}`);
		outDir = join(testDir, "output");
		await mkdir(testDir, { recursive: true });
		await mkdir(outDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		await rm(testDir, { recursive: true, force: true });
	});

	test("generates TypeScript from a simple JSON lexicon", async () => {
		// Create a test JSON lexicon file
		const jsonFile = join(testDir, "app.bsky.actor.profile.json");
		const lexiconJSON = {
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
		};

		await writeFile(jsonFile, JSON.stringify(lexiconJSON, null, 2));

		// Run the from-json command
		await genFromJSON(outDir, jsonFile);

		// Read the generated TypeScript file
		const outputFile = join(outDir, "app.bsky.actor.profile.ts");
		const content = await readFile(outputFile, "utf-8");

		// Verify the structure
		expect(content).toContain('import { fromJSON } from "prototypey"');
		expect(content).toContain("export const appBskyActorProfile = fromJSON(");
		expect(content).toContain('"id": "app.bsky.actor.profile"');
		expect(content).toContain('"lexicon": 1');

		// Verify it can be parsed as JSON within the call
		const jsonMatch = content.match(/fromJSON\(([\s\S]+)\);/);
		expect(jsonMatch).toBeTruthy();
		if (jsonMatch) {
			const parsedJSON = JSON.parse(jsonMatch[1]);
			expect(parsedJSON).toEqual(lexiconJSON);
		}
	});

	test("handles multiple JSON files with glob pattern", async () => {
		// Create multiple test JSON files
		const lexicons = join(testDir, "lexicons");
		await mkdir(lexicons, { recursive: true });

		const profileJSON = {
			lexicon: 1,
			id: "app.bsky.actor.profile",
			defs: {
				main: {
					type: "record",
					key: "self",
					record: { type: "object", properties: {} },
				},
			},
		};

		const postJSON = {
			lexicon: 1,
			id: "app.bsky.feed.post",
			defs: {
				main: {
					type: "record",
					key: "tid",
					record: { type: "object", properties: {} },
				},
			},
		};

		await writeFile(
			join(lexicons, "app.bsky.actor.profile.json"),
			JSON.stringify(profileJSON, null, 2),
		);
		await writeFile(
			join(lexicons, "app.bsky.feed.post.json"),
			JSON.stringify(postJSON, null, 2),
		);

		// Run with glob pattern
		await genFromJSON(outDir, `${lexicons}/*.json`);

		// Verify both files were created
		const profileTS = await readFile(
			join(outDir, "app.bsky.actor.profile.ts"),
			"utf-8",
		);
		const postTS = await readFile(
			join(outDir, "app.bsky.feed.post.ts"),
			"utf-8",
		);

		expect(profileTS).toContain("appBskyActorProfile");
		expect(postTS).toContain("appBskyFeedPost");
	});

	test("generates correct export names from lexicon IDs", async () => {
		const testCases = [
			{ id: "app.bsky.feed.post", expectedName: "appBskyFeedPost" },
			{
				id: "com.atproto.repo.createRecord",
				expectedName: "comAtprotoRepoCreateRecord",
			},
			{ id: "app.bsky.actor.profile", expectedName: "appBskyActorProfile" },
			{ id: "simple", expectedName: "simple" },
		];

		for (const { id, expectedName } of testCases) {
			const jsonFile = join(testDir, `${id}.json`);
			const lexiconJSON = {
				lexicon: 1,
				id,
				defs: { main: { type: "object", properties: {} } },
			};

			await writeFile(jsonFile, JSON.stringify(lexiconJSON, null, 2));
			await genFromJSON(outDir, jsonFile);

			const outputFile = join(outDir, `${id}.ts`);
			const content = await readFile(outputFile, "utf-8");

			expect(content).toContain(`export const ${expectedName} = fromJSON(`);
		}
	});

	test("generates TypeScript from query endpoint JSON", async () => {
		const jsonFile = join(testDir, "app.bsky.feed.searchPosts.json");
		const lexiconJSON = {
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
		};

		await writeFile(jsonFile, JSON.stringify(lexiconJSON, null, 2));
		await genFromJSON(outDir, jsonFile);

		const outputFile = join(outDir, "app.bsky.feed.searchPosts.ts");
		const content = await readFile(outputFile, "utf-8");

		expect(content).toContain("appBskyFeedSearchPosts");
		expect(content).toContain('"type": "query"');
		expect(content).toContain("Find posts matching search criteria");
	});

	test("generates TypeScript from procedure endpoint JSON", async () => {
		const jsonFile = join(testDir, "com.atproto.repo.createRecord.json");
		const lexiconJSON = {
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
		};

		await writeFile(jsonFile, JSON.stringify(lexiconJSON, null, 2));
		await genFromJSON(outDir, jsonFile);

		const outputFile = join(outDir, "com.atproto.repo.createRecord.ts");
		const content = await readFile(outputFile, "utf-8");

		expect(content).toContain("comAtprotoRepoCreateRecord");
		expect(content).toContain('"type": "procedure"');
	});

	test("generates TypeScript from subscription endpoint JSON", async () => {
		const jsonFile = join(testDir, "com.atproto.sync.subscribeRepos.json");
		const lexiconJSON = {
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
		};

		await writeFile(jsonFile, JSON.stringify(lexiconJSON, null, 2));
		await genFromJSON(outDir, jsonFile);

		const outputFile = join(outDir, "com.atproto.sync.subscribeRepos.ts");
		const content = await readFile(outputFile, "utf-8");

		expect(content).toContain("comAtprotoSyncSubscribeRepos");
		expect(content).toContain('"type": "subscription"');
		expect(content).toContain("commit");
		expect(content).toContain("identity");
		expect(content).toContain("account");
	});

	test("generates TypeScript from complex namespace with refs and unions", async () => {
		const jsonFile = join(testDir, "app.bsky.feed.defs.json");
		const lexiconJSON = {
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
		};

		await writeFile(jsonFile, JSON.stringify(lexiconJSON, null, 2));
		await genFromJSON(outDir, jsonFile);

		const outputFile = join(outDir, "app.bsky.feed.defs.ts");
		const content = await readFile(outputFile, "utf-8");

		expect(content).toContain("appBskyFeedDefs");
		expect(content).toContain("postView");
		expect(content).toContain("requestLess");
		expect(content).toContain("requestMore");
	});

	test("handles invalid JSON gracefully", async () => {
		const jsonFile = join(testDir, "invalid.json");
		await writeFile(jsonFile, "{ this is not valid json }");

		await expect(genFromJSON(outDir, jsonFile)).rejects.toThrow();
	});

	test("skips non-lexicon JSON files", async () => {
		const jsonFile = join(testDir, "not-a-lexicon.json");
		await writeFile(
			jsonFile,
			JSON.stringify({ someKey: "someValue" }, null, 2),
		);

		// Should not throw, just warn and skip
		await genFromJSON(outDir, jsonFile);

		// Verify no output file was created
		const outputFiles = await readdir(outDir).catch(() => []);
		expect(outputFiles.length).toBe(0);
	});

	test("round-trip: gen-emit then gen-from-json produces equivalent types", async () => {
		// This is an integration test that verifies the round-trip works
		const intermediateDir = join(testDir, "json");
		await mkdir(intermediateDir, { recursive: true });

		// First, create a simple TypeScript lexicon
		const tsFile = join(testDir, "original.ts");
		await writeFile(
			tsFile,
			`
import { lx } from "prototypey";

export const postSchema = lx.lexicon("app.bsky.feed.post", {
	main: lx.record({
		key: "tid",
		record: lx.object({
			text: lx.string({ maxLength: 300, required: true }),
			createdAt: lx.string({ format: "datetime", required: true }),
		}),
	}),
});
`,
		);

		// Import gen-emit dynamically to use it
		const { genEmit } = await import("../gen-emit.ts");

		// Step 1: gen-emit to create JSON
		await genEmit(intermediateDir, tsFile);

		// Step 2: gen-from-json to create TypeScript from JSON
		const jsonFile = join(intermediateDir, "app.bsky.feed.post.json");
		await genFromJSON(outDir, jsonFile);

		// Verify the output exists
		const outputFile = join(outDir, "app.bsky.feed.post.ts");
		const content = await readFile(outputFile, "utf-8");

		expect(content).toContain("appBskyFeedPost");
		expect(content).toContain('"id": "app.bsky.feed.post"');
		expect(content).toContain('"type": "record"');
	});
});

// Helper function that was missing from imports
async function readdir(path: string): Promise<string[]> {
	const { readdir: fsReaddir } = await import("node:fs/promises");
	return fsReaddir(path);
}
