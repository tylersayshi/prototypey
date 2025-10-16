#!/usr/bin/env node
import sade from "sade";
import { genInferred } from "./commands/gen-inferred.ts";

const prog = sade("prototypey");

prog
	.version("0.0.0")
	.describe("Type-safe lexicon inference and code generation");

prog
	.command("gen-inferred <outdir> <schemas...>")
	.describe("Generate type-inferred code from lexicon schemas")
	.example("gen-inferred ./generated/inferred ./lexicons/**/*.json")
	.action(genInferred);

prog.parse(process.argv);
