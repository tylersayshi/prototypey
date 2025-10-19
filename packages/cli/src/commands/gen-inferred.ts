import { glob } from "tinyglobby";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { join, dirname, relative, parse } from "node:path";
import { generateInferredCode } from "../templates/inferred.ts";

interface LexiconSchema {
	lexicon: number;
	id: string;
	defs: Record<string, unknown>;
}

export async function genInferred(
	outdir: string,
	schemas: string | string[],
): Promise<void> {
	try {
		const schemaPatterns = Array.isArray(schemas) ? schemas : [schemas];

		// Find all schema files matching the patterns
		const schemaFiles = await glob(schemaPatterns, {
			absolute: true,
			onlyFiles: true,
		});

		if (schemaFiles.length === 0) {
			console.log("No schema files found matching patterns:", schemaPatterns);
			return;
		}

		console.log(`Found ${schemaFiles.length} schema file(s)`);

		// Process each schema file
		for (const schemaPath of schemaFiles) {
			await processSchema(schemaPath, outdir);
		}

		console.log(`\nGenerated inferred types in ${outdir}`);
	} catch (error) {
		console.error("Error generating inferred types:", error);
		process.exit(1);
	}
}

async function processSchema(
	schemaPath: string,
	outdir: string,
): Promise<void> {
	const content = await readFile(schemaPath, "utf-8");
	const schema: LexiconSchema = JSON.parse(content);

	if (!schema.id || !schema.defs) {
		console.warn(`Skipping ${schemaPath}: Missing id or defs`);
		return;
	}

	// Convert NSID to file path: app.bsky.feed.post -> app/bsky/feed/post.ts
	const nsidParts = schema.id.split(".");
	const relativePath = join(...nsidParts) + ".ts";
	const outputPath = join(outdir, relativePath);

	// Create directory structure
	await mkdir(dirname(outputPath), { recursive: true });

	// Generate the TypeScript code
	const code = generateInferredCode(schema, schemaPath, outdir);

	// Write the file
	await writeFile(outputPath, code, "utf-8");

	console.log(`  ✓ ${schema.id} -> ${relativePath}`);
}
