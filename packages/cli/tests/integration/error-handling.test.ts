import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

describe("CLI Error Handling", () => {
	let testDir: string;
	let outDir: string;
	let schemasDir: string;

	beforeEach(async () => {
		// Create a temporary directory for test files
		testDir = join(tmpdir(), `prototypey-error-test-${Date.now()}`);
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

	test("handles non-existent schema files gracefully", async () => {
		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			join(schemasDir, "non-existent.json"),
		]);

		expect(code).toBe(0); // Should not crash
		expect(stdout).toContain("No schema files found matching patterns");
		expect(stderr).toBe("");
	});

	test("handles invalid JSON schema files", async () => {
		// Create an invalid JSON file
		const invalidSchema = join(schemasDir, "invalid.json");
		await writeFile(invalidSchema, "not valid json");

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			invalidSchema,
		]);

		expect(code).toBe(1); // Should exit with error
		expect(stderr).toContain("Error generating inferred types");
	});

	test("handles schema files with missing id", async () => {
		// Create a schema with missing id
		const schemaFile = join(schemasDir, "missing-id.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				defs: { main: { type: "record" } },
			}),
		);

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			schemaFile,
		]);

		expect(code).toBe(0); // Should not crash
		expect(stdout).toContain("Found 1 schema file(s)");
		expect(stdout).toContain("Generated inferred types in");
		// Should skip the invalid file silently
	});

	test("handles schema files with missing defs", async () => {
		// Create a schema with missing defs
		const schemaFile = join(schemasDir, "missing-defs.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.missing",
			}),
		);

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			schemaFile,
		]);

		expect(code).toBe(0); // Should not crash
		expect(stdout).toContain("Found 1 schema file(s)");
		expect(stdout).toContain("Generated inferred types in");
		// Should skip the invalid file silently
	});

	test("handles non-existent source files for gen-emit", async () => {
		const { stdout, stderr, code } = await runCLI([
			"gen-emit",
			outDir,
			join(schemasDir, "non-existent.ts"),
		]);

		expect(code).toBe(0); // Should not crash
		expect(stdout).toContain("No source files found matching patterns");
		expect(stderr).toBe("");
	});

	test("handles valid TypeScript files with no lexicon exports for gen-emit", async () => {
		// Create a valid TypeScript file with no lexicon exports
		const validSource = join(schemasDir, "no-namespace.ts");
		await writeFile(validSource, "export const x = 1;");

		const { stdout, stderr, code } = await runCLI([
			"gen-emit",
			outDir,
			validSource,
		]);

		expect(code).toBe(0); // Should not crash
		expect(stdout).toContain("Found 1 source file(s)");
		expect(stderr).toContain("No lexicon namespaces found");
	});

	test("handles permission errors when writing output", async () => {
		// This test might be platform-specific, so we'll make it lenient
		// Create a schema file first
		const schemaFile = join(schemasDir, "test.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.permission",
				defs: { main: { type: "record" } },
			}),
		);

		// Try to write to a directory that might have permission issues
		// We'll use a path that likely won't exist and is invalid
		const invalidOutDir = "/invalid/path/that/does/not/exist";

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			invalidOutDir,
			schemaFile,
		]);

		// Should handle the error gracefully
		expect(code).toBe(1);
		expect(stderr).toContain("Error generating inferred types");
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
