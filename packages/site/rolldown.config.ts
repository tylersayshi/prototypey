import { defineConfig } from "rolldown";
import react from "@vitejs/plugin-react";

export default defineConfig({
	input: "./src/main.tsx",
	output: {
		dir: "dist",
	},
	plugins: [react()],
});
