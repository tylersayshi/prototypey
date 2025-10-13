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

// ============================================================================
// PRIMITIVE TYPES TESTS
// ============================================================================

test("InferType handles string primitive", () => {
	const namespace = lx.namespace("test.string", {
		main: lx.object({
			simpleString: lx.string(),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { simpleString?: string | undefined } }",
	);
});

test("InferType handles integer primitive", () => {
	const namespace = lx.namespace("test.integer", {
		main: lx.object({
			count: lx.integer(),
			age: lx.integer({ minimum: 0, maximum: 120 }),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    count?: number | undefined
    age?: number | undefined
  }
}`);
});

test("InferType handles boolean primitive", () => {
	const namespace = lx.namespace("test.boolean", {
		main: lx.object({
			isActive: lx.boolean(),
			hasAccess: lx.boolean({ required: true }),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    isActive?: boolean | undefined
    hasAccess: boolean
  }
}`);
});

test("InferType handles null primitive", () => {
	const namespace = lx.namespace("test.null", {
		main: lx.object({
			nullValue: lx.null(),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { nullValue?: null | undefined } }",
	);
});

test("InferType handles unknown primitive", () => {
	const namespace = lx.namespace("test.unknown", {
		main: lx.object({
			metadata: lx.unknown(),
		}),
	});

	attest(namespace.infer).type.toString.snap("{ main: { metadata?: unknown } }");
});

test("InferType handles bytes primitive", () => {
	const namespace = lx.namespace("test.bytes", {
		main: lx.object({
			data: lx.bytes(),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { data?: Uint8Array | undefined } }",
	);
});

test("InferType handles blob primitive", () => {
	const namespace = lx.namespace("test.blob", {
		main: lx.object({
			image: lx.blob({ accept: ["image/png", "image/jpeg"] }),
		}),
	});

	attest(namespace.infer).type.toString.snap("{ main: { image?: Blob | undefined } }");
});

// ============================================================================
// TOKEN TYPE TESTS
// ============================================================================

test("InferToken handles basic token without enum", () => {
	const namespace = lx.namespace("test.token", {
		main: lx.object({
			symbol: lx.token("A symbolic value"),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { symbol?: string | undefined } }",
	);
});

// ============================================================================
// ARRAY TYPE TESTS
// ============================================================================

test("InferArray handles string arrays", () => {
	const namespace = lx.namespace("test.array.string", {
		main: lx.object({
			tags: lx.array(lx.string()),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { tags?: string[] | undefined } }",
	);
});

test("InferArray handles integer arrays", () => {
	const namespace = lx.namespace("test.array.integer", {
		main: lx.object({
			scores: lx.array(lx.integer(), { minLength: 1, maxLength: 10 }),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { scores?: number[] | undefined } }",
	);
});

test("InferArray handles boolean arrays", () => {
	const namespace = lx.namespace("test.array.boolean", {
		main: lx.object({
			flags: lx.array(lx.boolean()),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { flags?: boolean[] | undefined } }",
	);
});

test("InferArray handles unknown arrays", () => {
	const namespace = lx.namespace("test.array.unknown", {
		main: lx.object({
			items: lx.array(lx.unknown()),
		}),
	});

	attest(namespace.infer).type.toString.snap("{ main: { items?: unknown[] } }");
});

// ============================================================================
// OBJECT PROPERTY COMBINATIONS
// ============================================================================

test("InferObject handles mixed optional and required fields", () => {
	const namespace = lx.namespace("test.mixed", {
		main: lx.object({
			id: lx.string({ required: true }),
			name: lx.string({ required: true }),
			email: lx.string(),
			age: lx.integer(),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    email?: string | undefined
    age?: number | undefined
    id: string
    name: string
  }
}`);
});

test("InferObject handles all optional fields", () => {
	const namespace = lx.namespace("test.allOptional", {
		main: lx.object({
			field1: lx.string(),
			field2: lx.integer(),
			field3: lx.boolean(),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    field1?: string | undefined
    field2?: number | undefined
    field3?: boolean | undefined
  }
}`);
});

test("InferObject handles all required fields", () => {
	const namespace = lx.namespace("test.allRequired", {
		main: lx.object({
			field1: lx.string({ required: true }),
			field2: lx.integer({ required: true }),
			field3: lx.boolean({ required: true }),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    field1: string
    field2: number
    field3: boolean
  }
}`);
});

// ============================================================================
// NULLABLE FIELDS TESTS
// ============================================================================

test("InferObject handles nullable optional field", () => {
	const namespace = lx.namespace("test.nullableOptional", {
		main: lx.object({
			description: lx.string({ nullable: true }),
		}),
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { description?: string | null | undefined } }",
	);
});

test("InferObject handles multiple nullable fields", () => {
	const namespace = lx.namespace("test.multipleNullable", {
		main: lx.object({
			field1: lx.string({ nullable: true }),
			field2: lx.integer({ nullable: true }),
			field3: lx.boolean({ nullable: true }),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    field1?: string | null | undefined
    field2?: number | null | undefined
    field3?: boolean | null | undefined
  }
}`);
});

test("InferObject handles nullable and required field", () => {
	const namespace = lx.namespace("test.nullableRequired", {
		main: lx.object({
			value: lx.string({ nullable: true, required: true }),
		}),
	});

	attest(namespace.infer).type.toString.snap("{ main: { value: string | null } }");
});

test("InferObject handles mixed nullable, required, and optional", () => {
	const namespace = lx.namespace("test.mixedNullable", {
		main: lx.object({
			requiredNullable: lx.string({ required: true, nullable: true }),
			optionalNullable: lx.string({ nullable: true }),
			required: lx.string({ required: true }),
			optional: lx.string(),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    optionalNullable?: string | null | undefined
    optional?: string | undefined
    required: string
    requiredNullable: string | null
  }
}`);
});

// ============================================================================
// REF TYPE TESTS
// ============================================================================

test("InferRef handles basic reference", () => {
	const namespace = lx.namespace("test.ref", {
		main: lx.object({
			post: lx.ref("com.example.post"),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    post?: {
      $type: "com.example.post"
      [key: string]: unknown
    } | undefined
  }
}`);
});

test("InferRef handles required reference", () => {
	const namespace = lx.namespace("test.refRequired", {
		main: lx.object({
			author: lx.ref("com.example.user", { required: true }),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    author: {
      $type: "com.example.user"
      [key: string]: unknown
    }
  }
}`);
});

test("InferRef handles nullable reference", () => {
	const namespace = lx.namespace("test.refNullable", {
		main: lx.object({
			parent: lx.ref("com.example.node", { nullable: true }),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    parent?: {
      $type: "com.example.node"
      [key: string]: unknown
    } | null | undefined
  }
}`);
});

// ============================================================================
// UNION TYPE TESTS
// ============================================================================

test("InferUnion handles basic union", () => {
	const namespace = lx.namespace("test.union", {
		main: lx.object({
			content: lx.union(["com.example.text", "com.example.image"]),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    content?: {
      $type: "com.example.text"
      [key: string]: unknown
    } | {
      $type: "com.example.image"
      [key: string]: unknown
    } | undefined
  }
}`);
});

test("InferUnion handles required union", () => {
	const namespace = lx.namespace("test.unionRequired", {
		main: lx.object({
			media: lx.union(["com.example.video", "com.example.audio"], {
				required: true,
			}),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    media: {
      $type: "com.example.video"
      [key: string]: unknown
    } | {
      $type: "com.example.audio"
      [key: string]: unknown
    }
  }
}`);
});

test("InferUnion handles union with many types", () => {
	const namespace = lx.namespace("test.unionMultiple", {
		main: lx.object({
			attachment: lx.union([
				"com.example.image",
				"com.example.video",
				"com.example.audio",
				"com.example.document",
			]),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    attachment?: {
      $type: "com.example.image"
      [key: string]: unknown
    } | {
      $type: "com.example.video"
      [key: string]: unknown
    } | {
      $type: "com.example.audio"
      [key: string]: unknown
    } | {
      $type: "com.example.document"
      [key: string]: unknown
    } | undefined
  }
}`);
});

// ============================================================================
// PARAMS TYPE TESTS
// ============================================================================

test("InferParams handles basic params", () => {
	const namespace = lx.namespace("test.params", {
		main: lx.params({
			limit: lx.integer(),
			offset: lx.integer(),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    limit?: number | undefined
    offset?: number | undefined
  }
}`);
});

test("InferParams handles required params", () => {
	const namespace = lx.namespace("test.paramsRequired", {
		main: lx.params({
			query: lx.string({ required: true }),
			limit: lx.integer(),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    limit?: number | undefined
    query: string
  }
}`);
});

// ============================================================================
// RECORD TYPE TESTS
// ============================================================================

test("InferRecord handles record with object schema", () => {
	const namespace = lx.namespace("test.record", {
		main: lx.record({
			key: "tid",
			record: lx.object({
				title: lx.string({ required: true }),
				content: lx.string({ required: true }),
				published: lx.boolean(),
			}),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    published?: boolean | undefined
    title: string
    content: string
  }
}`);
});

// ============================================================================
// NESTED OBJECTS TESTS
// ============================================================================

test("InferObject handles nested objects", () => {
	const namespace = lx.namespace("test.nested", {
		main: lx.object({
			user: lx.object({
				name: lx.string({ required: true }),
				email: lx.string({ required: true }),
			}),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    user?: {
      name: string
      email: string
    } | undefined
  }
}`);
});

test("InferObject handles deeply nested objects", () => {
	const namespace = lx.namespace("test.deepNested", {
		main: lx.object({
			data: lx.object({
				user: lx.object({
					profile: lx.object({
						name: lx.string({ required: true }),
					}),
				}),
			}),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    data?: {
      user?: {
        profile?: {
          name: string
        } | undefined
      } | undefined
    } | undefined
  }
}`);
});

// ============================================================================
// NESTED ARRAYS TESTS
// ============================================================================

test("InferArray handles arrays of objects", () => {
	const namespace = lx.namespace("test.arrayOfObjects", {
		main: lx.object({
			users: lx.array(
				lx.object({
					id: lx.string({ required: true }),
					name: lx.string({ required: true }),
				}),
			),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    users?: {
      id: string
      name: string
    }[] | undefined
  }
}`);
});

test("InferArray handles arrays of arrays", () => {
	const schema = lx.object({
		matrix: lx.array(lx.array(lx.integer())),
	});

	const namespace = lx.namespace("test.nestedArrays", {
		main: schema,
	});

	attest(namespace.infer).type.toString.snap(
		"{ main: { matrix?: number[][] | undefined } }",
	);
});

test("InferArray handles arrays of refs", () => {
	const namespace = lx.namespace("test.arrayOfRefs", {
		main: lx.object({
			followers: lx.array(lx.ref("com.example.user")),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    followers?: {
      $type: "com.example.user"
      [key: string]: unknown
    }[] | undefined
  }
}`);
});

// ============================================================================
// COMPLEX NESTED STRUCTURES
// ============================================================================

test("InferObject handles complex nested structure", () => {
	const schema = lx.object({
		id: lx.string({ required: true }),
		author: lx.object({
			did: lx.string({ required: true, format: "did" }),
			handle: lx.string({ required: true, format: "handle" }),
			avatar: lx.string(),
		}),
		content: lx.union(["com.example.text", "com.example.image"]),
		tags: lx.array(lx.string(), { maxLength: 10 }),
		metadata: lx.object({
			views: lx.integer(),
			likes: lx.integer(),
			shares: lx.integer(),
		}),
	});

	attest(schema.infer).type.toString.snap(`{
  main: {
    author?: {
      avatar?: string | undefined
      did: string
      handle: string
    } | undefined
    content?: {
      $type: "com.example.text"
      [key: string]: unknown
    } | {
      $type: "com.example.image"
      [key: string]: unknown
    } | undefined
    tags?: string[] | undefined
    metadata?: {
      views?: number | undefined
      likes?: number | undefined
      shares?: number | undefined
    } | undefined
    id: string
  }
}`);
});

// ============================================================================
// MULTIPLE DEFS IN NAMESPACE
// ============================================================================

test("InferNS handles multiple defs in namespace", () => {
	const namespace = lx.namespace("com.example.app", {
		user: lx.object({
			name: lx.string({ required: true }),
			email: lx.string({ required: true }),
		}),
		post: lx.object({
			title: lx.string({ required: true }),
			content: lx.string({ required: true }),
		}),
		comment: lx.object({
			text: lx.string({ required: true }),
			author: lx.ref("com.example.user"),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  user: {
    name: string
    email: string
  }
  post: {
    title: string
    content: string
  }
  comment: {
    author?: {
      $type: "com.example.user"
      [key: string]: unknown
    } | undefined
    text: string
  }
}`);
});

test("InferNS handles namespace with record and object defs", () => {
	const namespace = lx.namespace("com.example.blog", {
		main: lx.record({
			key: "tid",
			record: lx.object({
				title: lx.string({ required: true }),
				body: lx.string({ required: true }),
			}),
		}),
		metadata: lx.object({
			category: lx.string(),
			tags: lx.array(lx.string()),
		}),
	});

	attest(namespace.infer).type.toString.snap(`{
  main: {
    title: string
    body: string
  }
  metadata: {
    category?: string | undefined
    tags?: string[] | undefined
  }
}`);
});
