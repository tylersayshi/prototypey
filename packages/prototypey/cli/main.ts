#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import sade from "sade";
import { genEmit } from "./gen-emit.ts";

const pkg = JSON.parse(
	await readFile(new URL("../package.json", import.meta.url), "utf-8"),
) as { version: string };

const prog = sade("prototypey");

prog.version(pkg.version).describe("atproto lexicon typescript toolkit");

prog
	.command("gen-emit <outdir> <sources...>")
	.describe("Emit JSON lexicon schemas from authored TypeScript")
	.example("gen-emit ./lexicons ./src/lexicons/**/*.ts")
	.action(genEmit);

prog.parse(process.argv);
