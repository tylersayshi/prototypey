import { test } from "vitest";
import { attest } from "@ark/attest";
import type { InferNS } from "../infer.ts";
import { lx } from "../lib.ts";

test("InferNS produces expected type shape", () => {
	const exampleLexicon = lx.namespace("com.example.post", {
		main: lx.record({
			key: "tid",
			record: lx.object({
				text: lx.string({ required: true }),
				createdAt: lx.string({ required: true, format: "datetime" }),
				likes: lx.integer(),
				tags: lx.array(lx.string(), { maxLength: 5 }),
			}),
		}),
	});

	type Result = InferNS<typeof exampleLexicon>;

	// Type snapshot - this captures how types appear on hover
	const result = {} as Result;
	attest(result).type.toString.snap(`{
  main: {
    createdAt?: string | undefined
    tags?: string[] | undefined
    text?: string | undefined
    likes?: number | undefined
  }
}`);
});

test("InferObject handles required fields", () => {
	const schema = lx.object({
		required: lx.string({ required: true }),
		optional: lx.string(),
	});

	type Result = InferNS<{
		lexicon: 1;
		id: "test";
		defs: { main: typeof schema };
	}>;

	const result = {} as Result;
	attest(result).type.toString.snap(`{
  main: {
    required?: string | undefined
    optional?: string | undefined
  }
}`);
});

test("InferObject handles nullable fields", () => {
	const schema = lx.object({
		nullable: lx.string({ nullable: true, required: true }),
	});

	type Result = InferNS<{
		lexicon: 1;
		id: "test";
		defs: { main: typeof schema };
	}>;

	const result = {} as Result;
	attest(result).type.toString.snap(
		"{ main: { nullable?: string | undefined } }",
	);
});
