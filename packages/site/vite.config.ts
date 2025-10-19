import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { resolve } from "path";

function servePrototypeyTypes() {
	return {
		name: "serve-prototypey-types",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.url?.startsWith("/types/") && req.url.endsWith(".d.ts")) {
					const fileName = req.url.slice(7);
					try {
						const filePath = resolve(__dirname, "../prototypey/lib", fileName);
						const content = readFileSync(filePath, "utf-8");
						res.setHeader("Content-Type", "application/typescript");
						res.end(content);
						return;
					} catch (e) {
						res.statusCode = 404;
						res.end("Type file not found");
						return;
					}
				}
				next();
			});
		},
	};
}

export default defineConfig({
	plugins: [react(), servePrototypeyTypes()],
});
