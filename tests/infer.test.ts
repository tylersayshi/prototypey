import { test } from "vitest";
import { attest } from "@ark/attest";
import type { InferNS } from "../src/infer.ts";
import { lx } from "../src/lib.ts";

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

	// Type snapshot - this captures how types appear on hover
	attest(exampleLexicon.infer).type.toString.snap(`{
  main: {
    createdAt?: string | undefined
    tags?: string[] | undefined
    text?: string | undefined
    likes?: number | undefined
  }
}`);
});

test("InferObject handles required fields", () => {
	const schema = lx.namespace("test", {
		main: lx.object({
			required: lx.string({ required: true }),
			optional: lx.string(),
		}),
	});

	attest(schema.infer).type.toString.snap(`{
  main: {
    required?: string | undefined
    optional?: string | undefined
  }
}`);
});

test("InferObject handles nullable fields", () => {
	const schema = lx.namespace("test", {
		main: lx.object({
			nullable: lx.string({ nullable: true, required: true }),
		}),
	});

	attest(schema.infer).type.toString.snap(
		"{ main: { nullable?: string | undefined } }",
	);
});
