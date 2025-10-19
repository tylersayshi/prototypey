import { expect, test, describe } from "vitest";
import { generateInferredCode } from "../../src/templates/inferred.ts";

describe("Template Edge Cases", () => {
	test("handles NSID with trailing numbers correctly", () => {
		const schema = {
			lexicon: 1,
			id: "app.test.v1",
			defs: { main: { type: "record" } },
		};

		const code = generateInferredCode(schema, "/test/v1.json", "/output");
		expect(code).toContain("export type V1 = Infer<typeof schema>");
		expect(code).toContain("export const V1Schema = schema");
		expect(code).toContain("export function isV1(v: unknown): v is V1");
	});

	test("handles NSID with multiple consecutive separators", () => {
		const schema = {
			lexicon: 1,
			id: "app.test.my--double--dash",
			defs: { main: { type: "record" } },
		};

		const code = generateInferredCode(schema, "/test/double.json", "/output");
		expect(code).toContain("export type MyDoubleDash = Infer<typeof schema>");
	});

	test("handles single character NSID parts", () => {
		const schema = {
			lexicon: 1,
			id: "a.b.c",
			defs: { main: { type: "record" } },
		};

		const code = generateInferredCode(schema, "/test/single.json", "/output");
		expect(code).toContain("export type C = Infer<typeof schema>");
	});

	test("handles NSID with underscores and mixed case", () => {
		const schema = {
			lexicon: 1,
			id: "app.test.my_custom_Type_Name",
			defs: { main: { type: "record" } },
		};

		const code = generateInferredCode(schema, "/test/custom.json", "/output");
		expect(code).toContain(
			"export type MyCustomTypeName = Infer<typeof schema>",
		);
	});

	test("handles very long NSID name", () => {
		const longName = "a".repeat(100);
		const schema = {
			lexicon: 1,
			id: `app.test.${longName}`,
			defs: { main: { type: "record" } },
		};

		const code = generateInferredCode(schema, "/test/long.json", "/output");
		// Should not crash and should generate valid TypeScript
		expect(code).toContain("export type");
		expect(code).toContain("Infer<typeof schema>");
	});

	test("handles schema with no main def", () => {
		const schema = {
			lexicon: 1,
			id: "app.test.no-main",
			defs: {
				other: { type: "object" },
			},
		};

		const code = generateInferredCode(schema, "/test/no-main.json", "/output");
		// Should still generate valid code even without main def
		expect(code).toContain("export type NoMain = Infer<typeof schema>");
		// The path will be relative with ../../../ prefix
		expect(code).toContain(
			'import schema from "../../../test/no-main.json" with { type: "json" };',
		);
	});

	test("generates correct relative paths for deeply nested output", () => {
		const schema = {
			lexicon: 1,
			id: "app.bsky.feed.post",
			defs: { main: { type: "record" } },
		};

		const code = generateInferredCode(
			schema,
			"/project/schemas/feed.json",
			"/project/generated/inferred",
		);

		// Should have correct relative import path
		expect(code).toContain(
			'import schema from "../../../../../schemas/feed.json" with { type: "json" };',
		);
	});

	test("handles special characters in import paths", () => {
		const schema = {
			lexicon: 1,
			id: "app.test.special",
			defs: { main: { type: "record" } },
		};

		const code = generateInferredCode(
			schema,
			"/project/schemas with spaces/special[chars].json",
			"/project/generated",
		);

		// Should handle spaces and special characters in paths
		expect(code).toContain(
			'import schema from "../../../schemas with spaces/special[chars].json" with { type: "json" };',
		);
	});
});
