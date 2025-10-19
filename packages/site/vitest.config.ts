import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Plugin to mock monaco-editor workers in tests
function mockMonacoWorkers() {
	return {
		name: "mock-monaco-workers",
		resolveId(id: string) {
			if (id.includes("monaco-editor") && id.includes("?worker")) {
				return id;
			}
		},
		load(id: string) {
			if (id.includes("monaco-editor") && id.includes("?worker")) {
				return "export default class MockWorker {}";
			}
		},
	};
}

export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [],
			},
		}),
		mockMonacoWorkers(),
	],
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./tests/setup.ts"],
	},
	resolve: {
		alias: {
			"monaco-editor": "/Users/tyler/gitspace/prototypey/packages/site/tests/mocks/monaco-editor.ts",
		},
	},
});
