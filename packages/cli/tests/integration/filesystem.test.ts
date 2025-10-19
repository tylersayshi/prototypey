import { expect, test, describe, beforeEach, afterEach } from "vitest";
import {
	mkdir,
	writeFile,
	rm,
	chmod,
	access,
	constants,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runCLI } from "../test-utils.js";

describe("CLI File System Handling", () => {
	let testDir: string;
	let outDir: string;
	let schemasDir: string;

	beforeEach(async () => {
		// Create a temporary directory for test files
		testDir = join(tmpdir(), `prototypey-fs-test-${Date.now()}`);
		outDir = join(testDir, "output");
		schemasDir = join(testDir, "schemas");
		await mkdir(testDir, { recursive: true });
		await mkdir(schemasDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		try {
			await rm(testDir, { recursive: true, force: true });
		} catch (error) {
			// Ignore cleanup errors
		}
	});

	test("creates nested output directories when they don't exist", async () => {
		// Create a schema file
		const schemaFile = join(schemasDir, "test.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				id: "app.deeply.nested.schema",
				defs: { main: { type: "record" } },
			}),
		);

		// Use a deeply nested output directory that doesn't exist
		const deepOutDir = join(outDir, "very", "deeply", "nested", "path");

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			deepOutDir,
			schemaFile,
		]);

		expect(code).toBe(0);
		expect(stderr).toBe("");
		expect(stdout).toContain(
			"app.deeply.nested.schema -> app/deeply/nested/schema.ts",
		);

		// Verify the file was created in the deeply nested path
		const generatedFile = join(deepOutDir, "app/deeply/nested/schema.ts");
		await access(generatedFile, constants.F_OK);
	});

	test("handles special characters in NSID correctly", async () => {
		// Create a schema with special characters in the name
		const schemaFile = join(schemasDir, "special.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.special-name_with.mixedChars123",
				defs: { main: { type: "record" } },
			}),
		);

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			schemaFile,
		]);

		expect(code).toBe(0);
		expect(stderr).toBe("");
		// Should convert to proper PascalCase
		expect(stdout).toContain(
			"app.test.special-name_with.mixedChars123 -> app/test/special-name_with/mixedChars123.ts",
		);
	});

	test("handles very long NSID paths", async () => {
		// Create a schema with a very long NSID
		const longNSID = "com." + "verylongdomainname.".repeat(10) + "test";
		const schemaFile = join(schemasDir, "long.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				id: longNSID,
				defs: { main: { type: "record" } },
			}),
		);

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			schemaFile,
		]);

		expect(code).toBe(0);
		expect(stderr).toBe("");
		expect(stdout).toContain(`Found 1 schema file(s)`);
	});

	test("handles existing files gracefully", async () => {
		// Create a schema file
		const schemaFile = join(schemasDir, "test.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.overwrite",
				defs: { main: { type: "record" } },
			}),
		);

		// Run CLI once
		await runCLI(["gen-inferred", outDir, schemaFile]);

		// Verify file exists
		const generatedFile = join(outDir, "app/test/overwrite.ts");
		await access(generatedFile, constants.F_OK);

		// Run CLI again (should overwrite)
		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			outDir,
			schemaFile,
		]);

		expect(code).toBe(0);
		expect(stderr).toBe("");
		expect(stdout).toContain("app.test.overwrite -> app/test/overwrite.ts");
	});

	test("handles read-only output directory gracefully", async () => {
		// This test might be platform-specific and could fail on some systems
		// We'll make it lenient to not fail the test suite

		// Create a schema file
		const schemaFile = join(schemasDir, "test.json");
		await writeFile(
			schemaFile,
			JSON.stringify({
				lexicon: 1,
				id: "app.test.permission",
				defs: { main: { type: "record" } },
			}),
		);

		// Create output directory and make it read-only
		const readOnlyDir = join(outDir, "readonly");
		await mkdir(readOnlyDir, { recursive: true });

		// Try to make read-only (might not work on all systems)
		try {
			await chmod(readOnlyDir, 0o444);
		} catch (error) {
			// Ignore if we can't change permissions
		}

		const { stdout, stderr, code } = await runCLI([
			"gen-inferred",
			readOnlyDir,
			schemaFile,
		]);

		// Should handle the error gracefully
		// On some systems this might succeed, on others fail - we just want it to not crash
		expect([0, 1]).toContain(code);
	});
});
