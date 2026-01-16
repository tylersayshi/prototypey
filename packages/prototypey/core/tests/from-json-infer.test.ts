import { test } from "vitest";
import { attest } from "@ark/attest";
import { fromJSON } from "../lib.ts";
import { Infer } from "../infer.ts";

test("fromJSON InferNS produces expected type shape", () => {
	const exampleLexicon = fromJSON({
		id: "com.example.post",
		defs: {
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					properties: {
						text: { type: "string", required: true },
						createdAt: { type: "string", required: true, format: "datetime" },
						likes: { type: "integer" },
						tags: { type: "array", items: { type: "string" }, maxLength: 5 },
					},
					required: ["text", "createdAt"],
				},
			},
		},
	});

	// Type snapshot - this captures how types appear on hover
	attest(exampleLexicon["~infer"]).type.toString.snap(`{
  $type: "com.example.post"
  tags?: string[] | undefined
  likes?: number | undefined
  createdAt: string
  text: string
}`);
});

test("fromJSON InferObject handles required fields", () => {
	const schema = fromJSON({
		id: "test",
		defs: {
			main: {
				type: "object",
				properties: {
					required: { type: "string", required: true },
					optional: { type: "string" },
				},
				required: ["required"],
			},
		},
	});

	attest(schema["~infer"]).type.toString.snap(`{
  $type: "test"
  optional?: string | undefined
  required: string
}`);
});

test("fromJSON InferObject handles nullable fields", () => {
	const schema = fromJSON({
		id: "test",
		defs: {
			main: {
				type: "object",
				properties: {
					nullable: { type: "string", nullable: true, required: true },
				},
				required: ["nullable"],
				nullable: ["nullable"],
			},
		},
	});

	attest(schema["~infer"]).type.toString.snap(
		'{ $type: "test"; nullable: string | null }',
	);
});

// ============================================================================
// PRIMITIVE TYPES TESTS
// ============================================================================

test("fromJSON InferType handles string primitive", () => {
	const lexicon = fromJSON({
		id: "test.string",
		defs: {
			main: {
				type: "object",
				properties: {
					simpleString: { type: "string" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.string"
  simpleString?: string | undefined
}`);
});

test("fromJSON InferType handles integer primitive", () => {
	const lexicon = fromJSON({
		id: "test.integer",
		defs: {
			main: {
				type: "object",
				properties: {
					count: { type: "integer" },
					age: { type: "integer", minimum: 0, maximum: 120 },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.integer"
  count?: number | undefined
  age?: number | undefined
}`);
});

test("fromJSON InferType handles boolean primitive", () => {
	const lexicon = fromJSON({
		id: "test.boolean",
		defs: {
			main: {
				type: "object",
				properties: {
					isActive: { type: "boolean" },
					hasAccess: { type: "boolean", required: true },
				},
				required: ["hasAccess"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.boolean"
  isActive?: boolean | undefined
  hasAccess: boolean
}`);
});

test("fromJSON InferType handles null primitive", () => {
	const lexicon = fromJSON({
		id: "test.null",
		defs: {
			main: {
				type: "object",
				properties: {
					nullValue: { type: "null" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.null"
  nullValue?: null | undefined
}`);
});

test("fromJSON InferType handles unknown primitive", () => {
	const lexicon = fromJSON({
		id: "test.unknown",
		defs: {
			main: {
				type: "object",
				properties: {
					metadata: { type: "unknown" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(
		'{ $type: "test.unknown"; metadata?: unknown }',
	);
});

test("fromJSON InferType handles bytes primitive", () => {
	const lexicon = fromJSON({
		id: "test.bytes",
		defs: {
			main: {
				type: "object",
				properties: {
					data: { type: "bytes" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.bytes"
  data?: Uint8Array<ArrayBufferLike> | undefined
}`);
});

test("fromJSON InferType handles blob primitive", () => {
	const lexicon = fromJSON({
		id: "test.blob",
		defs: {
			main: {
				type: "object",
				properties: {
					image: {
						type: "blob",
						accept: ["image/png", "image/jpeg"],
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(
		'{ $type: "test.blob"; image?: Blob | undefined }',
	);
});

// ============================================================================
// TOKEN TYPE TESTS
// ============================================================================

test("fromJSON InferToken handles basic token without enum", () => {
	const lexicon = fromJSON({
		id: "test.token",
		defs: {
			main: {
				type: "object",
				properties: {
					symbol: { type: "token", description: "A symbolic value" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.token"
  symbol?: string | undefined
}`);
});

// ============================================================================
// ARRAY TYPE TESTS
// ============================================================================

test("fromJSON InferArray handles string arrays", () => {
	const lexicon = fromJSON({
		id: "test.array.string",
		defs: {
			main: {
				type: "object",
				properties: {
					tags: { type: "array", items: { type: "string" } },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.array.string"
  tags?: string[] | undefined
}`);
});

test("fromJSON InferArray handles integer arrays", () => {
	const lexicon = fromJSON({
		id: "test.array.integer",
		defs: {
			main: {
				type: "object",
				properties: {
					scores: {
						type: "array",
						items: { type: "integer" },
						minLength: 1,
						maxLength: 10,
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.array.integer"
  scores?: number[] | undefined
}`);
});

test("fromJSON InferArray handles boolean arrays", () => {
	const lexicon = fromJSON({
		id: "test.array.boolean",
		defs: {
			main: {
				type: "object",
				properties: {
					flags: { type: "array", items: { type: "boolean" } },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.array.boolean"
  flags?: boolean[] | undefined
}`);
});

test("fromJSON InferArray handles unknown arrays", () => {
	const lexicon = fromJSON({
		id: "test.array.unknown",
		defs: {
			main: {
				type: "object",
				properties: {
					items: { type: "array", items: { type: "unknown" } },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.array.unknown"
  items?: unknown[] | undefined
}`);
});

// ============================================================================
// OBJECT PROPERTY COMBINATIONS
// ============================================================================

test("fromJSON InferObject handles mixed optional and required fields", () => {
	const lexicon = fromJSON({
		id: "test.mixed",
		defs: {
			main: {
				type: "object",
				properties: {
					id: { type: "string", required: true },
					name: { type: "string", required: true },
					email: { type: "string" },
					age: { type: "integer" },
				},
				required: ["id", "name"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.mixed"
  age?: number | undefined
  email?: string | undefined
  id: string
  name: string
}`);
});

test("fromJSON InferObject handles all optional fields", () => {
	const lexicon = fromJSON({
		id: "test.allOptional",
		defs: {
			main: {
				type: "object",
				properties: {
					field1: { type: "string" },
					field2: { type: "integer" },
					field3: { type: "boolean" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.allOptional"
  field1?: string | undefined
  field2?: number | undefined
  field3?: boolean | undefined
}`);
});

test("fromJSON InferObject handles all required fields", () => {
	const lexicon = fromJSON({
		id: "test.allRequired",
		defs: {
			main: {
				type: "object",
				properties: {
					field1: { type: "string", required: true },
					field2: { type: "integer", required: true },
					field3: { type: "boolean", required: true },
				},
				required: ["field1", "field2", "field3"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.allRequired"
  field1: string
  field2: number
  field3: boolean
}`);
});

// ============================================================================
// NULLABLE FIELDS TESTS
// ============================================================================

test("fromJSON InferObject handles nullable optional field", () => {
	const lexicon = fromJSON({
		id: "test.nullableOptional",
		defs: {
			main: {
				type: "object",
				properties: {
					description: { type: "string", nullable: true },
				},
				nullable: ["description"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.nullableOptional"
  description?: string | null | undefined
}`);
});

test("fromJSON InferObject handles multiple nullable fields", () => {
	const lexicon = fromJSON({
		id: "test.multipleNullable",
		defs: {
			main: {
				type: "object",
				properties: {
					field1: { type: "string", nullable: true },
					field2: { type: "integer", nullable: true },
					field3: { type: "boolean", nullable: true },
				},
				nullable: ["field1", "field2", "field3"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.multipleNullable"
  field1?: string | null | undefined
  field2?: number | null | undefined
  field3?: boolean | null | undefined
}`);
});

test("fromJSON InferObject handles nullable and required field", () => {
	const lexicon = fromJSON({
		id: "test.nullableRequired",
		defs: {
			main: {
				type: "object",
				properties: {
					value: { type: "string", nullable: true, required: true },
				},
				required: ["value"],
				nullable: ["value"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.nullableRequired"
  value: string | null
}`);
});

test("fromJSON InferObject handles mixed nullable, required, and optional", () => {
	const lexicon = fromJSON({
		id: "test.mixedNullable",
		defs: {
			main: {
				type: "object",
				properties: {
					requiredNullable: { type: "string", required: true, nullable: true },
					optionalNullable: { type: "string", nullable: true },
					required: { type: "string", required: true },
					optional: { type: "string" },
				},
				required: ["requiredNullable", "required"],
				nullable: ["requiredNullable", "optionalNullable"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.mixedNullable"
  optional?: string | undefined
  required: string
  optionalNullable?: string | null | undefined
  requiredNullable: string | null
}`);
});

// ============================================================================
// REF TYPE TESTS
// ============================================================================

test("fromJSON InferRef handles external reference (unknown)", () => {
	const lexicon = fromJSON({
		id: "test.ref",
		defs: {
			main: {
				type: "object",
				properties: {
					post: { type: "ref", ref: "com.example.post" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.ref"
  post?:
    | { [x: string]: unknown; $type: "com.example.post" }
    | undefined
}`);
});

// ============================================================================
// UNION TYPE TESTS
// ============================================================================

test("fromJSON InferUnion handles external union (unknown)", () => {
	const lexicon = fromJSON({
		id: "test.union",
		defs: {
			main: {
				type: "object",
				properties: {
					content: {
						type: "union",
						refs: ["com.example.text", "com.example.image"],
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.union"
  content?:
    | { [x: string]: unknown; $type: "com.example.text" }
    | { [x: string]: unknown; $type: "com.example.image" }
    | undefined
}`);
});

// ============================================================================
// PARAMS TYPE TESTS
// ============================================================================

test("fromJSON InferParams handles basic params", () => {
	const lexicon = fromJSON({
		id: "test.params",
		defs: {
			main: {
				type: "params",
				properties: {
					limit: { type: "integer" },
					offset: { type: "integer" },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.params"
  limit?: number | undefined
  offset?: number | undefined
}`);
});

test("fromJSON InferParams handles required params", () => {
	const lexicon = fromJSON({
		id: "test.paramsRequired",
		defs: {
			main: {
				type: "params",
				properties: {
					query: { type: "string", required: true },
					limit: { type: "integer" },
				},
				required: ["query"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.paramsRequired"
  limit?: number | undefined
  query: string
}`);
});

// ============================================================================
// RECORD TYPE TESTS
// ============================================================================

test("fromJSON InferRecord handles record with object schema", () => {
	const lexicon = fromJSON({
		id: "test.record",
		defs: {
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					properties: {
						title: { type: "string", required: true },
						content: { type: "string", required: true },
						published: { type: "boolean" },
					},
					required: ["title", "content"],
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.record"
  published?: boolean | undefined
  content: string
  title: string
}`);
});

// ============================================================================
// NESTED OBJECTS TESTS
// ============================================================================

test("fromJSON InferObject handles nested objects", () => {
	const lexicon = fromJSON({
		id: "test.nested",
		defs: {
			main: {
				type: "object",
				properties: {
					user: {
						type: "object",
						properties: {
							name: { type: "string", required: true },
							email: { type: "string", required: true },
						},
						required: ["name", "email"],
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.nested"
  user?: { name: string; email: string } | undefined
}`);
});

test("fromJSON InferObject handles deeply nested objects", () => {
	const lexicon = fromJSON({
		id: "test.deepNested",
		defs: {
			main: {
				type: "object",
				properties: {
					data: {
						type: "object",
						properties: {
							user: {
								type: "object",
								properties: {
									profile: {
										type: "object",
										properties: {
											name: { type: "string", required: true },
										},
										required: ["name"],
									},
								},
							},
						},
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.deepNested"
  data?:
    | {
        user?:
          | { profile?: { name: string } | undefined }
          | undefined
      }
    | undefined
}`);
});

// ============================================================================
// NESTED ARRAYS TESTS
// ============================================================================

test("fromJSON InferArray handles arrays of objects", () => {
	const lexicon = fromJSON({
		id: "test.arrayOfObjects",
		defs: {
			main: {
				type: "object",
				properties: {
					users: {
						type: "array",
						items: {
							type: "object",
							properties: {
								id: { type: "string", required: true },
								name: { type: "string", required: true },
							},
							required: ["id", "name"],
						},
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.arrayOfObjects"
  users?: { id: string; name: string }[] | undefined
}`);
});

test("fromJSON InferArray handles arrays of arrays", () => {
	const lexicon = fromJSON({
		id: "test.nestedArrays",
		defs: {
			main: {
				type: "object",
				properties: {
					matrix: {
						type: "array",
						items: { type: "array", items: { type: "integer" } },
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.nestedArrays"
  matrix?: number[][] | undefined
}`);
});

test("fromJSON InferArray handles arrays of refs", () => {
	const lexicon = fromJSON({
		id: "test.arrayOfRefs",
		defs: {
			user: {
				type: "object",
				properties: {
					name: { type: "string", required: true },
					handle: { type: "string", required: true },
				},
				required: ["name", "handle"],
			},
			main: {
				type: "object",
				properties: {
					followers: {
						type: "array",
						items: { type: "ref", ref: "#user" },
					},
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.arrayOfRefs"
  followers?:
    | { handle: string; name: string; $type: "#user" }[]
    | undefined
}`);
});

// ============================================================================
// COMPLEX NESTED STRUCTURES
// ============================================================================

test("fromJSON InferObject handles complex nested structure", () => {
	const lexicon = fromJSON({
		id: "test.complex",
		defs: {
			text: {
				type: "object",
				properties: {
					content: { type: "string", required: true },
				},
				required: ["content"],
			},
			image: {
				type: "object",
				properties: {
					url: { type: "string", required: true },
					alt: { type: "string" },
				},
				required: ["url"],
			},
			main: {
				type: "object",
				properties: {
					id: { type: "string", required: true },
					author: {
						type: "object",
						properties: {
							did: { type: "string", required: true, format: "did" },
							handle: { type: "string", required: true, format: "handle" },
							avatar: { type: "string" },
						},
						required: ["did", "handle"],
					},
					content: {
						type: "union",
						refs: ["#text", "#image"],
					},
					tags: { type: "array", items: { type: "string" }, maxLength: 10 },
					metadata: {
						type: "object",
						properties: {
							views: { type: "integer" },
							likes: { type: "integer" },
							shares: { type: "integer" },
						},
					},
				},
				required: ["id"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "test.complex"
  tags?: string[] | undefined
  content?:
    | { content: string; $type: "#text" }
    | {
        alt?: string | undefined
        url: string
        $type: "#image"
      }
    | undefined
  author?:
    | {
        avatar?: string | undefined
        did: string
        handle: string
      }
    | undefined
  metadata?:
    | {
        likes?: number | undefined
        views?: number | undefined
        shares?: number | undefined
      }
    | undefined
  id: string
}`);
});

// ============================================================================
// MULTIPLE DEFS IN NAMESPACE
// ============================================================================

test("fromJSON InferNS handles multiple defs in namespace", () => {
	const lexicon = fromJSON({
		id: "com.example.app",
		defs: {
			user: {
				type: "object",
				properties: {
					name: { type: "string", required: true },
					email: { type: "string", required: true },
				},
				required: ["name", "email"],
			},
			post: {
				type: "object",
				properties: {
					title: { type: "string", required: true },
					content: { type: "string", required: true },
				},
				required: ["title", "content"],
			},
			comment: {
				type: "object",
				properties: {
					text: { type: "string", required: true },
					author: { type: "ref", ref: "#user" },
				},
				required: ["text"],
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap("never");
});

test("fromJSON InferNS handles namespace with record and object defs", () => {
	const lexicon = fromJSON({
		id: "com.example.blog",
		defs: {
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					properties: {
						title: { type: "string", required: true },
						body: { type: "string", required: true },
					},
					required: ["title", "body"],
				},
			},
			metadata: {
				type: "object",
				properties: {
					category: { type: "string" },
					tags: { type: "array", items: { type: "string" } },
				},
			},
		},
	});

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "com.example.blog"
  title: string
  body: string
}`);
});

// ============================================================================
// LOCAL REF RESOLUTION TESTS
// ============================================================================

test("fromJSON Local ref resolution: resolves refs to actual types", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			user: {
				type: "object",
				properties: {
					name: { type: "string", required: true },
					email: { type: "string", required: true },
				},
				required: ["name", "email"],
			},
			main: {
				type: "object",
				properties: {
					author: { type: "ref", ref: "#user", required: true },
					content: { type: "string", required: true },
				},
				required: ["author", "content"],
			},
		},
	});

	attest(ns["~infer"]).type.toString.snap(`{
  $type: "test"
  content: string
  author: { name: string; email: string; $type: "#user" }
}`);
});

test("fromJSON Local ref resolution: refs in arrays", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			user: {
				type: "object",
				properties: {
					name: { type: "string", required: true },
				},
				required: ["name"],
			},
			main: {
				type: "object",
				properties: {
					users: { type: "array", items: { type: "ref", ref: "#user" } },
				},
			},
		},
	});

	attest(ns["~infer"]).type.toString.snap(`{
  $type: "test"
  users?: { name: string; $type: "#user" }[] | undefined
}`);
});

test("fromJSON Local ref resolution: refs in unions", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			text: {
				type: "object",
				properties: { content: { type: "string", required: true } },
				required: ["content"],
			},
			image: {
				type: "object",
				properties: { url: { type: "string", required: true } },
				required: ["url"],
			},
			main: {
				type: "object",
				properties: {
					embed: { type: "union", refs: ["#text", "#image"] },
				},
			},
		},
	});

	attest(ns["~infer"]).type.toString.snap(`{
  $type: "test"
  embed?:
    | { content: string; $type: "#text" }
    | { url: string; $type: "#image" }
    | undefined
}`);
});

test("fromJSON Local ref resolution: nested refs", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			profile: {
				type: "object",
				properties: {
					bio: { type: "string", required: true },
				},
				required: ["bio"],
			},
			user: {
				type: "object",
				properties: {
					name: { type: "string", required: true },
					profile: { type: "ref", ref: "#profile", required: true },
				},
				required: ["name", "profile"],
			},
			main: {
				type: "object",
				properties: {
					author: { type: "ref", ref: "#user", required: true },
				},
				required: ["author"],
			},
		},
	});

	attest(ns["~infer"]).type.toString.snap(`{
  $type: "test"
  author: {
    name: string
    profile: { bio: string; $type: "#profile" }
    $type: "#user"
  }
}`);
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

test("fromJSON Edge case: circular reference detection", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			main: {
				type: "object",
				properties: {
					value: { type: "string", required: true },
					parent: { type: "ref", ref: "#main" },
				},
				required: ["value"],
			},
		},
	});

	attest(ns["~infer"]).type.toString.snap(`{
  $type: "test"
  parent?:
    | {
        parent?:
          | "[Circular reference detected: #main]"
          | undefined
        value: string
        $type: "#main"
      }
    | undefined
  value: string
}`);
});

test("fromJSON Edge case: circular reference between multiple types", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			user: {
				type: "object",
				properties: {
					name: { type: "string", required: true },
					posts: { type: "array", items: { type: "ref", ref: "#post" } },
				},
				required: ["name"],
			},
			post: {
				type: "object",
				properties: {
					title: { type: "string", required: true },
					author: { type: "ref", ref: "#user", required: true },
				},
				required: ["title", "author"],
			},
			main: {
				type: "object",
				properties: {
					users: { type: "array", items: { type: "ref", ref: "#user" } },
				},
			},
		},
	});

	attest(ns["~infer"]).type.toString.snap(`{
  $type: "test"
  users?:
    | {
        posts?:
          | {
              author: "[Circular reference detected: #user]"
              title: string
              $type: "#post"
            }[]
          | undefined
        name: string
        $type: "#user"
      }[]
    | undefined
}`);
});

test("fromJSON Edge case: missing reference detection", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			main: {
				type: "object",
				properties: {
					author: { type: "ref", ref: "#user", required: true },
				},
				required: ["author"],
			},
		},
	});

	attest(ns["~infer"]).type.toString.snap(`{
  $type: "test"
  author: "[Reference not found: #user]"
}`);
});

// ============================================================================
// REAL-WORLD EXAMPLE: BLUESKY PROFILE
// ============================================================================

test("fromJSON Real-world example: app.bsky.actor.profile", () => {
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

	type Profile = Infer<typeof lexicon>;

	const george: Profile = {
		$type: "app.bsky.actor.profile",
		description: "George",
	};

	lexicon.validate({ foo: "bar" }); // will fail
	lexicon.validate(george); // will pass 🎉

	attest(lexicon["~infer"]).type.toString.snap(`{
  $type: "app.bsky.actor.profile"
  description?: string | undefined
  displayName?: string | undefined
}`);
});
