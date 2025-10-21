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
		testDir = join(tmpdir(), `prototypey-fs-test-${String(Date.now())}`);
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
});
