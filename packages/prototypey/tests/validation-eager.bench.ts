import { bench, describe } from "vitest";
import { lx } from "../src/lib.ts";

// Phase 2 Benchmarks: Eager loading strategy

describe("eager: lexicon instantiation with validator", () => {
	bench("simple lexicon with eager validator", () => {
		lx.lexicon("test.simple", {
			main: lx.object({
				id: lx.string({ required: true }),
				name: lx.string({ required: true }),
			}),
		});
	});

	bench("complex lexicon with eager validator", () => {
		lx.lexicon("test.complex", {
			user: lx.object({
				handle: lx.string({ required: true }),
				displayName: lx.string(),
			}),
			reply: lx.object({
				text: lx.string({ required: true }),
				author: lx.ref("#user", { required: true }),
			}),
			main: lx.record({
				key: "tid",
				record: lx.object({
					author: lx.ref("#user", { required: true }),
					replies: lx.array(lx.ref("#reply")),
					content: lx.string({ required: true }),
					createdAt: lx.string({ required: true, format: "datetime" }),
				}),
			}),
		});
	});

	bench("100 lexicons with eager validators", () => {
		for (let i = 0; i < 100; i++) {
			lx.lexicon(`test.schema${i}`, {
				main: lx.object({
					id: lx.string({ required: true }),
					name: lx.string({ required: true }),
				}),
			});
		}
	});
});

describe("eager: validation (validator already loaded)", () => {
	const simpleSchema = lx.lexicon("test.simple", {
		main: lx.object({
			id: lx.string({ required: true }),
			name: lx.string({ required: true }),
		}),
	});
	const complexSchema = lx.lexicon("test.complex", {
		user: lx.object({
			handle: lx.string({ required: true }),
			displayName: lx.string(),
		}),
		reply: lx.object({
			text: lx.string({ required: true }),
			author: lx.ref("#user", { required: true }),
		}),
		main: lx.record({
			key: "tid",
			record: lx.object({
				author: lx.ref("#user", { required: true }),
				replies: lx.array(lx.ref("#reply")),
				content: lx.string({ required: true }),
				createdAt: lx.string({ required: true, format: "datetime" }),
			}),
		}),
	});

	bench("first validation call (already loaded)", () => {
		simpleSchema.validate({
			id: "123",
			name: "test",
		});
	});

	bench("validate simple object", () => {
		simpleSchema.validate({
			id: "123",
			name: "test",
		});
	});

	bench("validate complex object", () => {
		complexSchema.validate({
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

	bench("1000 sequential validations", () => {
		for (let i = 0; i < 1000; i++) {
			simpleSchema.validate({
				id: `${i}`,
				name: `test${i}`,
			});
		}
	});
});
