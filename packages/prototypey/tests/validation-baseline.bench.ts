import { bench, describe } from "vitest";
import { Lexicons } from "@atproto/lexicon";
import { lx } from "../src/lib.ts";

// Phase 1 Benchmarks: Baseline measurements before implementation

describe("baseline: lexicon instantiation", () => {
	bench("simple lexicon instantiation", () => {
		lx.lexicon("test.simple", {
			main: lx.object({
				id: lx.string({ required: true }),
				name: lx.string({ required: true }),
			}),
		});
	});
});

describe("baseline: Lexicons class", () => {
	bench("create empty Lexicons instance", () => {
		new Lexicons();
	});

	bench("load 1 lexicon into Lexicons", () => {
		const lexicons = new Lexicons();
		lexicons.add({
			lexicon: 1,
			id: "test.simple",
			defs: {
				main: {
					type: "object",
					properties: {
						id: { type: "string" },
						name: { type: "string" },
					},
					required: ["id", "name"],
				},
			},
		});
	});

	bench("load 10 lexicons into Lexicons", () => {
		const lexicons = new Lexicons();
		for (let i = 0; i < 10; i++) {
			lexicons.add({
				lexicon: 1,
				id: `test.schema${i}`,
				defs: {
					main: {
						type: "object",
						properties: {
							id: { type: "string" },
							name: { type: "string" },
						},
						required: ["id", "name"],
					},
				},
			});
		}
	});

	bench("load 100 lexicons into Lexicons", () => {
		const lexicons = new Lexicons();
		for (let i = 0; i < 100; i++) {
			lexicons.add({
				lexicon: 1,
				id: `test.schema${i}`,
				defs: {
					main: {
						type: "object",
						properties: {
							id: { type: "string" },
							name: { type: "string" },
						},
						required: ["id", "name"],
					},
				},
			});
		}
	});
});

describe("baseline: validation", () => {
	bench("validate simple object", () => {
		const lexicons = new Lexicons([
			{
				lexicon: 1,
				id: "test.simple",
				defs: {
					main: {
						type: "object",
						properties: {
							id: { type: "string" },
							name: { type: "string" },
						},
						required: ["id", "name"],
					},
				},
			},
		]);
		lexicons.validate("test.simple#main", {
			id: "123",
			name: "test",
		});
	});

	bench("validate complex nested object", () => {
		const lexicons = new Lexicons([
			{
				lexicon: 1,
				id: "test.complex",
				defs: {
					user: {
						type: "object",
						properties: {
							handle: { type: "string" },
							displayName: { type: "string" },
						},
						required: ["handle"],
					},
					reply: {
						type: "object",
						properties: {
							text: { type: "string" },
							author: { type: "ref", ref: "#user" },
						},
						required: ["text", "author"],
					},
					main: {
						type: "record",
						key: "tid",
						record: {
							type: "object",
							properties: {
								author: { type: "ref", ref: "#user" },
								replies: {
									type: "array",
									items: { type: "ref", ref: "#reply" },
								},
								content: { type: "string" },
								createdAt: { type: "string", format: "datetime" },
							},
							required: ["author", "content", "createdAt"],
						},
					},
				},
			},
		]);
		lexicons.validate("test.complex#main", {
			author: { handle: "alice.bsky.social", displayName: "Alice" },
			replies: [
				{
					text: "Great post!",
					author: { handle: "bob.bsky.social", displayName: "Bob" },
				},
			],
			content: "Hello world",
			createdAt: "2025-01-01T00:00:00Z",
		});
	});

	bench("validate 1000 simple objects", () => {
		const lexicons = new Lexicons([
			{
				lexicon: 1,
				id: "test.simple",
				defs: {
					main: {
						type: "object",
						properties: {
							id: { type: "string" },
							name: { type: "string" },
						},
						required: ["id", "name"],
					},
				},
			},
		]);
		for (let i = 0; i < 1000; i++) {
			lexicons.validate("test.simple#main", {
				id: `${i}`,
				name: `test${i}`,
			});
		}
	});
});
