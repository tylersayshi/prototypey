import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function runCLI(
	args: string[] = [],
	options?: { cwd?: string; env?: NodeJS.ProcessEnv },
): Promise<{ stdout: string; stderr: string; code: number }> {
	return new Promise((resolve) => {
		const cliPath = join(
			dirname(fileURLToPath(import.meta.url)),
			"../lib/index.js",
		);
		const child = spawn("node", [cliPath, ...args], {
			cwd: options?.cwd ?? process.cwd(),
			env: options?.env ?? process.env,
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
