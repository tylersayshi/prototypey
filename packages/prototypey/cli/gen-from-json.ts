import { glob } from "tinyglobby";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname, basename } from "node:path";

interface LexiconJSON {
	lexicon: number;
	id: string;
	defs: Record<string, unknown>;
}

/**
 * Converts a lexicon ID to a valid TypeScript export name
 * e.g., "app.bsky.feed.post" -> "appBskyFeedPost"
 * "com.atproto.repo.createRecord" -> "comAtprotoRepoCreateRecord"
 */
function lexiconIdToExportName(id: string): string {
	// Split by dots and handle camelCase conversion
	const parts = id.split(".");

	// For the first part (e.g., "app", "com"), keep it lowercase
	// For subsequent parts, capitalize the first letter of each word
	// But preserve any existing camelCase within parts
	return parts
		.map((part, index) => {
			if (index === 0) return part;
			// Capitalize first letter of the part
			return part.charAt(0).toUpperCase() + part.slice(1);
		})
		.join("");
}

export async function genFromJSON(
	outdir: string,
	sources: string | string[],
): Promise<void> {
	try {
		const sourcePatterns = Array.isArray(sources) ? sources : [sources];

		// Find all JSON files matching the patterns
		const jsonFiles = await glob(sourcePatterns, {
			absolute: true,
			onlyFiles: true,
		});

		if (jsonFiles.length === 0) {
			console.log("No JSON files found matching patterns:", sourcePatterns);
			return;
		}

		console.log(`Found ${String(jsonFiles.length)} JSON file(s)`);

		// Ensure output directory exists
		await mkdir(outdir, { recursive: true });

		// Process each JSON file
		for (const jsonPath of jsonFiles) {
			await processJSONFile(jsonPath, outdir);
		}

		console.log(`\nGenerated TypeScript files in ${outdir}`);
	} catch (error) {
		console.error("Error generating TypeScript from JSON:", error);
		process.exit(1);
	}
}

async function processJSONFile(
	jsonPath: string,
	outdir: string,
): Promise<void> {
	try {
		// Read and parse the JSON file
		const content = await readFile(jsonPath, "utf-8");
		const lexiconJSON = JSON.parse(content);

		// Validate it's a lexicon
		if (
			!lexiconJSON.lexicon ||
			!lexiconJSON.id ||
			!lexiconJSON.defs ||
			typeof lexiconJSON.defs !== "object"
		) {
			console.warn(`  ⚠ ${jsonPath}: Not a valid lexicon JSON`);
			return;
		}

		const { id } = lexiconJSON as LexiconJSON;
		const exportName = lexiconIdToExportName(id);

		// Generate TypeScript content
		const tsContent = `import { fromJSON } from "prototypey";

export const ${exportName} = fromJSON(${JSON.stringify(lexiconJSON, null, "\t")});
`;

		// Determine output path - use same structure but in outdir
		const outputFileName = `${basename(jsonPath, ".json")}.ts`;
		const outputPath = join(outdir, outputFileName);

		// Ensure output directory exists
		await mkdir(dirname(outputPath), { recursive: true });

		// Write the TypeScript file
		await writeFile(outputPath, tsContent, "utf-8");

		console.log(`  ✓ ${id} -> ${outputFileName}`);
	} catch (error) {
		console.error(`  ✗ Error processing ${jsonPath}:`, error);
		throw error;
	}
}
