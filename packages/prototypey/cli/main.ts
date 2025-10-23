#!/usr/bin/env node

import sade from "sade";
import { genEmit } from "./gen-emit.ts";
import pkg from "../package.json" with { type: "json" };

const prog = sade("prototypey");

prog.version(pkg.version).describe("atproto lexicon typescript toolkit");

prog
	.command("gen-emit <outdir> <sources...>")
	.describe("Emit JSON lexicon schemas from authored TypeScript")
	.example("gen-emit ./lexicons ./src/lexicons/**/*.ts")
	.action(genEmit);

prog.parse(process.argv);
