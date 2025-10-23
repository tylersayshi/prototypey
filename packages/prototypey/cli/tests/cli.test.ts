import { expect, test, describe } from "vitest";
import { runCLI } from "./test-utils.ts";
import pkg from "../../package.json" with { type: "json" };

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
		expect(stdout).toContain(`prototypey, ${pkg.version}`);
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
});
