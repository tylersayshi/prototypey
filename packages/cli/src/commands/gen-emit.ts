import { glob } from "tinyglobby";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

interface LexiconNamespace {
	json: {
		lexicon: number;
		id: string;
		defs: Record<string, unknown>;
	};
}

export async function genEmit(
	outdir: string,
	sources: string | string[],
): Promise<void> {
	try {
		const sourcePatterns = Array.isArray(sources) ? sources : [sources];

		// Find all source files matching the patterns
		const sourceFiles = await glob(sourcePatterns, {
			absolute: true,
			onlyFiles: true,
		});

		if (sourceFiles.length === 0) {
			console.log("No source files found matching patterns:", sourcePatterns);
			return;
		}

		console.log(`Found ${sourceFiles.length} source file(s)`);

		// Ensure output directory exists
		await mkdir(outdir, { recursive: true });

		// Process each source file
		for (const sourcePath of sourceFiles) {
			await processSourceFile(sourcePath, outdir);
		}

		console.log(`\nEmitted lexicon schemas to ${outdir}`);
	} catch (error) {
		console.error("Error emitting lexicon schemas:", error);
		process.exit(1);
	}
}

async function processSourceFile(
	sourcePath: string,
	outdir: string,
): Promise<void> {
	try {
		// Convert file path to file URL for dynamic import
		const fileUrl = pathToFileURL(sourcePath).href;

		// Dynamically import the module
		const module = await import(fileUrl);

		// Find all exported lexicons
		const lexicons: LexiconNamespace[] = [];
		for (const key of Object.keys(module)) {
			const exported = module[key];
			// Check if it's a lexicon with a json property
			if (
				exported &&
				typeof exported === "object" &&
				"json" in exported &&
				exported.json &&
				typeof exported.json === "object" &&
				"lexicon" in exported.json &&
				"id" in exported.json &&
				"defs" in exported.json
			) {
				lexicons.push(exported as LexiconNamespace);
			}
		}

		if (lexicons.length === 0) {
			console.warn(`  ⚠ ${sourcePath}: No lexicons found`);
			return;
		}

		// Emit JSON for each lexicon
		for (const lexicon of lexicons) {
			const { id } = lexicon.json;
			const outputPath = join(outdir, `${id}.json`);

			// Write the JSON file
			await writeFile(
				outputPath,
				JSON.stringify(lexicon.json, null, "\t"),
				"utf-8",
			);

			console.log(`  ✓ ${id} -> ${id}.json`);
		}
	} catch (error) {
		console.error(`  ✗ Error processing ${sourcePath}:`, error);
		throw error;
	}
}
