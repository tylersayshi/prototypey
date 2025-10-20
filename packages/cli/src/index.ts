import { readFile } from "node:fs/promises";
import sade from "sade";
import { genInferred } from "./commands/gen-inferred.ts";
import { genEmit } from "./commands/gen-emit.ts";

const pkg = JSON.parse(
	await readFile(new URL("../package.json", import.meta.url), "utf-8"),
) as { version: string };

const prog = sade("prototypey");

prog.version(pkg.version).describe("atproto lexicon typescript toolkit");

prog
	.command("gen-inferred <outdir> <schemas...>")
	.describe("Generate type-inferred code from lexicon schemas")
	.example("gen-inferred ./generated/inferred ./lexicons/**/*.json")
	.action(genInferred);

prog
	.command("gen-emit <outdir> <sources...>")
	.describe("Emit JSON lexicon schemas from authored TypeScript")
	.example("gen-emit ./lexicons ./src/lexicons/**/*.ts")
	.action(genEmit);

prog.parse(process.argv);
