import { expect, test, describe } from "vitest";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

describe("CLI Integration", () => {
	test("shows error when called without arguments", async () => {
		const { stdout, stderr, code } = await runCLI();
		expect(code).toBe(1);
		expect(stderr).toContain("No command specified");
		expect(stderr).toContain("Run `$ prototypey --help` for more info");
	});

	test("shows version", async () => {
		const { stdout, stderr } = await runCLI(["--version"]);
		expect(stderr).toBe("");
		expect(stdout).toContain("prototypey, 0.0.0");
	});

	test("shows help for gen-inferred command", async () => {
		const { stdout, stderr } = await runCLI(["gen-inferred", "--help"]);
		expect(stderr).toBe("");
		expect(stdout).toContain("gen-inferred <outdir> <schemas...>");
		expect(stdout).toContain(
			"Generate type-inferred code from lexicon schemas",
		);
	});

	test("shows help for gen-emit command", async () => {
		const { stdout, stderr } = await runCLI(["gen-emit", "--help"]);
		expect(stderr).toBe("");
		expect(stdout).toContain("gen-emit <outdir> <sources...>");
		expect(stdout).toContain(
			"Emit JSON lexicon schemas from authored TypeScript",
		);
	});

	test("handles unknown command", async () => {
		const { stdout, stderr, code } = await runCLI(["unknown-command"]);
		expect(code).toBe(1);
		expect(stderr).toContain("Invalid command: unknown-command");
		expect(stderr).toContain("Run `$ prototypey --help` for more info");
	});

	test("handles missing arguments", async () => {
		const { stdout, stderr, code } = await runCLI(["gen-inferred"]);
		expect(code).toBe(1);
		expect(stderr).toContain("Insufficient arguments!");
		expect(stderr).toContain(
			"Run `$ prototypey gen-inferred --help` for more info",
		);
	});
});

function runCLI(
	args: string[] = [],
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
