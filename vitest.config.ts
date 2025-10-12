import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		globalSetup: ["setup-vitest.ts"],
	},
});
