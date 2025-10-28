#!/usr/bin/env node

import sade from "sade";
import { genEmit } from "./gen-emit.ts";
import { genFromJSON } from "./gen-from-json.ts";
import pkg from "../package.json" with { type: "json" };

const prog = sade("prototypey");

prog.version(pkg.version).describe("atproto lexicon typescript toolkit");

prog
	.command("gen-emit <outdir> <sources...>")
	.describe("Emit JSON lexicon schemas from authored TypeScript")
	.example("gen-emit ./lexicons ./src/lexicons/**/*.ts")
	.action(genEmit);

prog
	.command("gen-from-json <outdir> <sources...>")
	.describe("Generate TypeScript files from JSON lexicon schemas")
	.example("gen-from-json ./src/lexicons ./lexicons/**/*.json")
	.action(genFromJSON);

prog.parse(process.argv);
