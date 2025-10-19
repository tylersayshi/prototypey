import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

describe("CLI Performance", () => {
	let testDir: string;
	let outDir: string;
	let schemasDir: string;

	beforeEach(async () => {
		// Create a temporary directory for test files
		testDir = join(tmpdir(), `prototypey-perf-test-${Date.now()}`);
		outDir = join(testDir, "output");
		schemasDir = join(testDir, "schemas");
		await mkdir(testDir, { recursive: true });
		await mkdir(outDir, { recursive: true });
		await mkdir(schemasDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		await rm(testDir, { recursive: true, force: true });
	});

	test("handles large number of schemas efficiently", async () => {
		// Create 50 schema files
		const schemaCount = 50;
		const schemaFiles = [];

		for (let i = 0; i < schemaCount; i++) {
			const schemaFile = join(schemasDir, `test${i}.json`);
			await writeFile(
				schemaFile,
				JSON.stringify({
					lexicon: 1,
					id: `app.test.schema${i}`,
					defs: {
						main: {
							type: "record",
							key: "tid",
							record: {
								type: "object",
								properties: {
									name: { type: "string", maxLength: 64 },
									value: { type: "integer" },
								},
							},
						},
					},
				}),
			);
			schemaFiles.push(schemaFile);
		}

		const startTime = Date.now();
		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			`${schemasDir}/*.json`,
		]);
		const endTime = Date.now();

		const duration = endTime - startTime;

		expect(code).toBe(0);
		expect(stdout).toContain(`Found ${schemaCount} schema file(s)`);
		expect(stderr).toBe("");

		// Should complete within reasonable time (less than 5 seconds for 50 files)
		expect(duration).toBeLessThan(5000);

		// Verify some generated files exist
		expect(stdout).toContain("app.test.schema0 -> app/test/schema0.ts");
		expect(stdout).toContain("app.test.schema49 -> app/test/schema49.ts");
	});

	test("memory usage stays reasonable with large schemas", async () => {
		// Create a schema with complex nested structure
		const complexSchema = join(schemasDir, "complex.json");
		await writeFile(
			complexSchema,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.complex",
				defs: {
					main: {
						type: "record",
						key: "tid",
						record: {
							type: "object",
							properties: {
								// Create a deeply nested structure
								level1: {
									type: "object",
									properties: {
										level2: {
											type: "object",
											properties: {
												level3: {
													type: "object",
													properties: {
														level4: {
															type: "object",
															properties: {
																items: {
																	type: "array",
																	items: {
																		type: "object",
																		properties: {
																			id: { type: "string" },
																			data: { type: "string" },
																			metadata: {
																				type: "object",
																				properties: {
																					created: {
																						type: "string",
																						format: "datetime",
																					},
																					updated: {
																						type: "string",
																						format: "datetime",
																					},
																					tags: {
																						type: "array",
																						items: { type: "string" },
																					},
																				},
																			},
																		},
																	},
																},
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			}),
		);

		const startTime = Date.now();
		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			complexSchema,
		]);
		const endTime = Date.now();

		const duration = endTime - startTime;

		expect(code).toBe(0);
		expect(stdout).toContain("Found 1 schema file(s)");
		expect(stdout).toContain("app.test.complex -> app/test/complex.ts");
		expect(stderr).toBe("");

		// Should complete within reasonable time (less than 2 seconds)
		expect(duration).toBeLessThan(2000);
	});

	test("concurrent processing of multiple commands", async () => {
		// Create test schemas
		const schema1 = join(schemasDir, "test1.json");
		const schema2 = join(schemasDir, "test2.json");

		await writeFile(
			schema1,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.concurrent1",
				defs: {
					main: { type: "record", key: "tid", record: { type: "object" } },
				},
			}),
		);

		await writeFile(
			schema2,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.concurrent2",
				defs: {
					main: { type: "record", key: "tid", record: { type: "object" } },
				},
			}),
		);

		// Run two CLI commands concurrently
		const [result1, result2] = await Promise.all([
			runCLI(["gen-inferred", join(outDir, "out1"), schema1]),
			runCLI(["gen-inferred", join(outDir, "out2"), schema2]),
		]);

		expect(result1.code).toBe(0);
		expect(result2.code).toBe(0);
		expect(result1.stdout).toContain(
			"app.test.concurrent1 -> app/test/concurrent1.ts",
		);
		expect(result2.stdout).toContain(
			"app.test.concurrent2 -> app/test/concurrent2.ts",
		);
	});
});

function runCLI(
	args: string[],
): Promise<{ stdout: string; stderr: string; code: number }> {
	return new Promise((resolve) => {
		const cliPath = join(dirname(fileURLToPath(import.meta.url)), "../../lib/index.js");
		const child = spawn("node", [cliPath, ...args]);

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
