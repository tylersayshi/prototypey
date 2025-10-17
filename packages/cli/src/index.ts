#!/usr/bin/env node
import sade from "sade";
import { genInferred } from "./commands/gen-inferred.ts";
import { genEmit } from "./commands/gen-emit.ts";

const prog = sade("prototypey");

prog
	.version("0.0.0")
	.describe("Type-safe lexicon inference and code generation");

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
