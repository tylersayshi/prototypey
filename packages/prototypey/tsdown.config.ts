import { defineConfig } from "tsdown";

export default defineConfig({
	dts: true,
	entry: ["core/main.ts", "cli/main.ts"],
	clean: true,
	outDir: "lib",
	unbundle: true,
});
