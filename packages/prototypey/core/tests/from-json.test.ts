import { expect, test } from "vitest";
import { fromJSON, lx } from "../lib.ts";

test("fromJSON creates lexicon from JSON", () => {
	const lexicon = fromJSON({
		id: "app.bsky.actor.profile",
		defs: {
			main: {
				type: "record",
				key: "self",
				record: {
					type: "object",
					properties: {
						displayName: {
							type: "string",
							maxLength: 64,
							maxGraphemes: 64,
						},
						description: {
							type: "string",
							maxLength: 256,
							maxGraphemes: 256,
						},
					},
				},
			},
		},
	});

	expect(lexicon.json).toEqual({
		lexicon: 1,
		id: "app.bsky.actor.profile",
		defs: {
			main: {
				type: "record",
				key: "self",
				record: {
					type: "object",
					properties: {
						displayName: {
							type: "string",
							maxLength: 64,
							maxGraphemes: 64,
						},
						description: {
							type: "string",
							maxLength: 256,
							maxGraphemes: 256,
						},
					},
				},
			},
		},
	});
});

test("fromJSON and lx.lexicon produce equivalent results", () => {
	// Create using lx.lexicon
	const viaLx = lx.lexicon("app.bsky.feed.post", {
		main: lx.record({
			key: "tid",
			record: lx.object({
				text: lx.string({ maxLength: 300, required: true }),
				createdAt: lx.string({ format: "datetime", required: true }),
			}),
		}),
	});

	// Create using fromJSON
	const viaJSON = fromJSON({
		id: "app.bsky.feed.post",
		defs: {
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					properties: {
						text: {
							type: "string",
							maxLength: 300,
							required: true,
						},
						createdAt: {
							type: "string",
							format: "datetime",
							required: true,
						},
					},
					required: ["text", "createdAt"],
				},
			},
		},
	});

	expect(viaLx.json).toEqual(viaJSON.json);
});

test("fromJSON supports validation", () => {
	const lexicon = fromJSON({
		id: "com.example.post",
		defs: {
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					properties: {
						text: {
							type: "string",
							maxLength: 100,
							required: true,
						},
					},
					required: ["text"],
				},
			},
		},
	});

	// Valid data
	const validResult = lexicon.validate({
		text: "Hello world",
	});
	expect(validResult.success).toBe(true);

	// Invalid data - missing required field
	const invalidResult = lexicon.validate({});
	expect(invalidResult.success).toBe(false);

	// Invalid data - text too long
	const tooLongResult = lexicon.validate({
		text: "a".repeat(101),
	});
	expect(tooLongResult.success).toBe(false);
});
