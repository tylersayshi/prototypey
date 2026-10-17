import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		// CLI tests write lexicon files to a temp dir that import "prototypey"
		alias: {
			prototypey: new URL("core/main.ts", import.meta.url).pathname,
		},
	},
	test: {
		include: ["**/*.test.ts"],
		globalSetup: ["setup-vitest.ts"],
	},
});
