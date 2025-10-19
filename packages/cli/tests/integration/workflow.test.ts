import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";

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

	test("complete workflow: JSON schema -> inferred types", async () => {
		// Step 1: Create JSON schema file directly (avoiding dynamic import issues)
		const schemaPath = join(schemasDir, "app.test.profile.json");
		await writeFile(
			schemaPath,
			JSON.stringify(
				{
					lexicon: 1,
					id: "app.test.profile",
					defs: {
						main: {
							type: "record",
							key: "self",
							record: {
								type: "object",
								properties: {
									displayName: { type: "string", maxLength: 64 },
									description: { type: "string", maxLength: 256 },
								},
							},
						},
					},
				},
				null,
				2,
			),
		);

		// Step 2: Generate inferred TypeScript from JSON schema
		const inferResult = await runCLI([
			"gen-inferred",
			generatedDir,
			schemaPath,
		]);

		console.log("Infer result code:", inferResult.code);
		console.log("Infer stdout:", inferResult.stdout);
		console.log("Infer stderr:", inferResult.stderr);

		expect(inferResult.code).toBe(0);
		expect(inferResult.stdout).toContain("Generated inferred types in");
		expect(inferResult.stdout).toContain(
			"app.test.profile -> app/test/profile.ts",
		);

		// Verify generated TypeScript file
		const generatedPath = join(generatedDir, "app/test/profile.ts");
		const generatedContent = await readFile(generatedPath, "utf-8");
		expect(generatedContent).toContain(
			'import type { Infer } from "prototypey"',
		);
		expect(generatedContent).toContain(
			"export type Profile = Infer<typeof schema>",
		);
		expect(generatedContent).toContain("export const ProfileSchema = schema");
		expect(generatedContent).toContain(
			"export function isProfile(v: unknown): v is Profile",
		);
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

		// Generate inferred types
		const inferResult = await runCLI([
			"gen-inferred",
			generatedDir,
			`${schemasDir}/*.json`,
		]);
		expect(inferResult.code).toBe(0);
		expect(inferResult.stdout).toContain("app.test.post -> app/test/post.ts");
		expect(inferResult.stdout).toContain(
			"app.test.searchPosts -> app/test/searchPosts.ts",
		);

		// Verify both generated files exist and have correct content
		const postContent = await readFile(
			join(generatedDir, "app/test/post.ts"),
			"utf-8",
		);
		const searchContent = await readFile(
			join(generatedDir, "app/test/searchPosts.ts"),
			"utf-8",
		);

		expect(postContent).toContain("export type Post = Infer<typeof schema>");
		expect(searchContent).toContain(
			"export type SearchPosts = Infer<typeof schema>",
		);
	});
});

function runCLI(
	args: string[],
): Promise<{ stdout: string; stderr: string; code: number }> {
	return new Promise((resolve) => {
		const cliPath = join(__dirname, "../../lib/index.js");
		const child = spawn("node", [cliPath, ...args], {
			cwd: process.cwd(),
			env: process.env,
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", (code) => {
			resolve({ stdout, stderr, code: code ?? 0 });
		});
	});
}
