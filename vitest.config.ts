import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts", "src/**/*.bench.ts"],
		globalSetup: ["setup-vitest.ts"],
	},
});
