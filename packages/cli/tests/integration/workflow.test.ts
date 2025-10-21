import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runCLI } from "../test-utils.js";

describe("CLI End-to-End Workflow", () => {
	let testDir: string;
	let schemasDir: string;
	let generatedDir: string;

	beforeEach(async () => {
		// Create a temporary directory for test files
		testDir = join(tmpdir(), `prototypey-e2e-test-${Date.now()}`);
		schemasDir = join(testDir, "schemas");
		generatedDir = join(testDir, "generated");
		await mkdir(testDir, { recursive: true });
		await mkdir(schemasDir, { recursive: true });
		await mkdir(generatedDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		await rm(testDir, { recursive: true, force: true });
	});

	test("workflow with multiple schemas", async () => {
		// Create multiple JSON schema files
		const postSchema = join(schemasDir, "app.test.post.json");
		await writeFile(
			postSchema,
			JSON.stringify(
				{
					lexicon: 1,
					id: "app.test.post",
					defs: {
						main: {
							type: "record",
							key: "tid",
							record: {
								type: "object",
								properties: {
									text: { type: "string", maxLength: 300, required: true },
									createdAt: {
										type: "string",
										format: "datetime",
										required: true,
									},
								},
							},
						},
					},
				},
				null,
				2,
			),
		);

		const searchSchema = join(schemasDir, "app.test.searchPosts.json");
		await writeFile(
			searchSchema,
			JSON.stringify(
				{
					lexicon: 1,
					id: "app.test.searchPosts",
					defs: {
						main: {
							type: "query",
							parameters: {
								type: "params",
								properties: {
									q: { type: "string", required: true },
									limit: {
										type: "integer",
										minimum: 1,
										maximum: 100,
										default: 25,
									},
								},
								required: ["q"],
							},
							output: {
								encoding: "application/json",
								schema: {
									type: "object",
									properties: {
										posts: {
											type: "array",
											items: { type: "ref", ref: "app.test.post#main" },
											required: true,
										},
									},
									required: ["posts"],
								},
							},
						},
					},
				},
				null,
				2,
			),
		);
	});
});
