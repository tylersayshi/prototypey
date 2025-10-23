import { expect, test, describe, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { runCLI } from "./test-utils.ts";

describe("CLI Error Handling", () => {
	let testDir: string;
	let outDir: string;
	let schemasDir: string;

	beforeEach(async () => {
		// Create a temporary directory for test files
		testDir = join(tmpdir(), `prototypey-error-test-${String(Date.now())}`);
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
		expect(stderr).toContain("No lexicons found");
	});
});
