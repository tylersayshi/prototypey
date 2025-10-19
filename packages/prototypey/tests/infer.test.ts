import { test } from "vitest";
import { attest } from "@ark/attest";
import { lx } from "../src/lib.ts";

test("InferNS produces expected type shape", () => {
	const exampleLexicon = lx.lexicon("com.example.post", {
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
  $type: "com.example.post"
  tags?: string[] | undefined
  likes?: number | undefined
  createdAt: string
  text: string
}`);
});

test("InferObject handles required fields", () => {
	const schema = lx.lexicon("test", {
		main: lx.object({
			required: lx.string({ required: true }),
			optional: lx.string(),
		}),
	});

	attest(schema.infer).type.toString.snap(`{
  $type: "test"
  optional?: string | undefined
  required: string
}`);
});

test("InferObject handles nullable fields", () => {
	const schema = lx.lexicon("test", {
		main: lx.object({
			nullable: lx.string({ nullable: true, required: true }),
		}),
	});

	attest(schema.infer).type.toString.snap(
		'{ $type: "test"; nullable: string | null }',
	);
});

// ============================================================================
// PRIMITIVE TYPES TESTS
// ============================================================================

test("InferType handles string primitive", () => {
	const lexicon = lx.lexicon("test.string", {
		main: lx.object({
			simpleString: lx.string(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.string"
  simpleString?: string | undefined
}`);
});

test("InferType handles integer primitive", () => {
	const lexicon = lx.lexicon("test.integer", {
		main: lx.object({
			count: lx.integer(),
			age: lx.integer({ minimum: 0, maximum: 120 }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.integer"
  count?: number | undefined
  age?: number | undefined
}`);
});

test("InferType handles boolean primitive", () => {
	const lexicon = lx.lexicon("test.boolean", {
		main: lx.object({
			isActive: lx.boolean(),
			hasAccess: lx.boolean({ required: true }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.boolean"
  isActive?: boolean | undefined
  hasAccess: boolean
}`);
});

test("InferType handles null primitive", () => {
	const lexicon = lx.lexicon("test.null", {
		main: lx.object({
			nullValue: lx.null(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.null"
  nullValue?: null | undefined
}`);
});

test("InferType handles unknown primitive", () => {
	const lexicon = lx.lexicon("test.unknown", {
		main: lx.object({
			metadata: lx.unknown(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(
		'{ $type: "test.unknown"; metadata?: unknown }',
	);
});

test("InferType handles bytes primitive", () => {
	const lexicon = lx.lexicon("test.bytes", {
		main: lx.object({
			data: lx.bytes(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.bytes"
  data?: Uint8Array<ArrayBufferLike> | undefined
}`);
});

test("InferType handles blob primitive", () => {
	const lexicon = lx.lexicon("test.blob", {
		main: lx.object({
			image: lx.blob({ accept: ["image/png", "image/jpeg"] }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(
		'{ $type: "test.blob"; image?: Blob | undefined }',
	);
});

// ============================================================================
// TOKEN TYPE TESTS
// ============================================================================

test("InferToken handles basic token without enum", () => {
	const lexicon = lx.lexicon("test.token", {
		main: lx.object({
			symbol: lx.token("A symbolic value"),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.token"
  symbol?: string | undefined
}`);
});

// ============================================================================
// ARRAY TYPE TESTS
// ============================================================================

test("InferArray handles string arrays", () => {
	const lexicon = lx.lexicon("test.array.string", {
		main: lx.object({
			tags: lx.array(lx.string()),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.array.string"
  tags?: string[] | undefined
}`);
});

test("InferArray handles integer arrays", () => {
	const lexicon = lx.lexicon("test.array.integer", {
		main: lx.object({
			scores: lx.array(lx.integer(), { minLength: 1, maxLength: 10 }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.array.integer"
  scores?: number[] | undefined
}`);
});

test("InferArray handles boolean arrays", () => {
	const lexicon = lx.lexicon("test.array.boolean", {
		main: lx.object({
			flags: lx.array(lx.boolean()),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.array.boolean"
  flags?: boolean[] | undefined
}`);
});

test("InferArray handles unknown arrays", () => {
	const lexicon = lx.lexicon("test.array.unknown", {
		main: lx.object({
			items: lx.array(lx.unknown()),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.array.unknown"
  items?: unknown[] | undefined
}`);
});

// ============================================================================
// OBJECT PROPERTY COMBINATIONS
// ============================================================================

test("InferObject handles mixed optional and required fields", () => {
	const lexicon = lx.lexicon("test.mixed", {
		main: lx.object({
			id: lx.string({ required: true }),
			name: lx.string({ required: true }),
			email: lx.string(),
			age: lx.integer(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.mixed"
  age?: number | undefined
  email?: string | undefined
  id: string
  name: string
}`);
});

test("InferObject handles all optional fields", () => {
	const lexicon = lx.lexicon("test.allOptional", {
		main: lx.object({
			field1: lx.string(),
			field2: lx.integer(),
			field3: lx.boolean(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.allOptional"
  field1?: string | undefined
  field2?: number | undefined
  field3?: boolean | undefined
}`);
});

test("InferObject handles all required fields", () => {
	const lexicon = lx.lexicon("test.allRequired", {
		main: lx.object({
			field1: lx.string({ required: true }),
			field2: lx.integer({ required: true }),
			field3: lx.boolean({ required: true }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.allRequired"
  field1: string
  field2: number
  field3: boolean
}`);
});

// ============================================================================
// NULLABLE FIELDS TESTS
// ============================================================================

test("InferObject handles nullable optional field", () => {
	const lexicon = lx.lexicon("test.nullableOptional", {
		main: lx.object({
			description: lx.string({ nullable: true }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.nullableOptional"
  description?: string | null | undefined
}`);
});

test("InferObject handles multiple nullable fields", () => {
	const lexicon = lx.lexicon("test.multipleNullable", {
		main: lx.object({
			field1: lx.string({ nullable: true }),
			field2: lx.integer({ nullable: true }),
			field3: lx.boolean({ nullable: true }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.multipleNullable"
  field1?: string | null | undefined
  field2?: number | null | undefined
  field3?: boolean | null | undefined
}`);
});

test("InferObject handles nullable and required field", () => {
	const lexicon = lx.lexicon("test.nullableRequired", {
		main: lx.object({
			value: lx.string({ nullable: true, required: true }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.nullableRequired"
  value: string | null
}`);
});

test("InferObject handles mixed nullable, required, and optional", () => {
	const lexicon = lx.lexicon("test.mixedNullable", {
		main: lx.object({
			requiredNullable: lx.string({ required: true, nullable: true }),
			optionalNullable: lx.string({ nullable: true }),
			required: lx.string({ required: true }),
			optional: lx.string(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
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

test("InferRef handles basic reference", () => {
	const lexicon = lx.lexicon("test.ref", {
		main: lx.object({
			post: lx.ref("com.example.post"),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.ref"
  post?:
    | { [x: string]: unknown; $type: "com.example.post" }
    | undefined
}`);
});

test("InferRef handles required reference", () => {
	const lexicon = lx.lexicon("test.refRequired", {
		main: lx.object({
			author: lx.ref("com.example.user", { required: true }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.refRequired"
  author?:
    | { [x: string]: unknown; $type: "com.example.user" }
    | undefined
}`);
});

test("InferRef handles nullable reference", () => {
	const lexicon = lx.lexicon("test.refNullable", {
		main: lx.object({
			parent: lx.ref("com.example.node", { nullable: true }),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.refNullable"
  parent?:
    | { [x: string]: unknown; $type: "com.example.node" }
    | undefined
}`);
});

// ============================================================================
// UNION TYPE TESTS
// ============================================================================

test("InferUnion handles basic union", () => {
	const lexicon = lx.lexicon("test.union", {
		main: lx.object({
			content: lx.union(["com.example.text", "com.example.image"]),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.union"
  content?:
    | { [x: string]: unknown; $type: "com.example.text" }
    | { [x: string]: unknown; $type: "com.example.image" }
    | undefined
}`);
});

test("InferUnion handles required union", () => {
	const lexicon = lx.lexicon("test.unionRequired", {
		main: lx.object({
			media: lx.union(["com.example.video", "com.example.audio"], {
				required: true,
			}),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.unionRequired"
  media:
    | { [x: string]: unknown; $type: "com.example.video" }
    | { [x: string]: unknown; $type: "com.example.audio" }
}`);
});

test("InferUnion handles union with many types", () => {
	const lexicon = lx.lexicon("test.unionMultiple", {
		main: lx.object({
			attachment: lx.union([
				"com.example.image",
				"com.example.video",
				"com.example.audio",
				"com.example.document",
			]),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.unionMultiple"
  attachment?:
    | { [x: string]: unknown; $type: "com.example.image" }
    | { [x: string]: unknown; $type: "com.example.video" }
    | { [x: string]: unknown; $type: "com.example.audio" }
    | {
        [x: string]: unknown
        $type: "com.example.document"
      }
    | undefined
}`);
});

// ============================================================================
// PARAMS TYPE TESTS
// ============================================================================

test("InferParams handles basic params", () => {
	const lexicon = lx.lexicon("test.params", {
		main: lx.params({
			limit: lx.integer(),
			offset: lx.integer(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.params"
  limit?: number | undefined
  offset?: number | undefined
}`);
});

test("InferParams handles required params", () => {
	const lexicon = lx.lexicon("test.paramsRequired", {
		main: lx.params({
			query: lx.string({ required: true }),
			limit: lx.integer(),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.paramsRequired"
  limit?: number | undefined
  query: string
}`);
});

// ============================================================================
// RECORD TYPE TESTS
// ============================================================================

test("InferRecord handles record with object schema", () => {
	const lexicon = lx.lexicon("test.record", {
		main: lx.record({
			key: "tid",
			record: lx.object({
				title: lx.string({ required: true }),
				content: lx.string({ required: true }),
				published: lx.boolean(),
			}),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.record"
  published?: boolean | undefined
  content: string
  title: string
}`);
});

// ============================================================================
// NESTED OBJECTS TESTS
// ============================================================================

test("InferObject handles nested objects", () => {
	const lexicon = lx.lexicon("test.nested", {
		main: lx.object({
			user: lx.object({
				name: lx.string({ required: true }),
				email: lx.string({ required: true }),
			}),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.nested"
  user?: { name: string; email: string } | undefined
}`);
});

test("InferObject handles deeply nested objects", () => {
	const lexicon = lx.lexicon("test.deepNested", {
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

	attest(lexicon.infer).type.toString.snap(`{
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

test("InferArray handles arrays of objects", () => {
	const lexicon = lx.lexicon("test.arrayOfObjects", {
		main: lx.object({
			users: lx.array(
				lx.object({
					id: lx.string({ required: true }),
					name: lx.string({ required: true }),
				}),
			),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.arrayOfObjects"
  users?: { id: string; name: string }[] | undefined
}`);
});

test("InferArray handles arrays of arrays", () => {
	const schema = lx.object({
		matrix: lx.array(lx.array(lx.integer())),
	});

	const lexicon = lx.lexicon("test.nestedArrays", {
		main: schema,
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.nestedArrays"
  matrix?: number[][] | undefined
}`);
});

test("InferArray handles arrays of refs", () => {
	const lexicon = lx.lexicon("test.arrayOfRefs", {
		main: lx.object({
			followers: lx.array(lx.ref("com.example.user")),
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.arrayOfRefs"
  followers?:
    | { [x: string]: unknown; $type: "com.example.user" }[]
    | undefined
}`);
});

// ============================================================================
// COMPLEX NESTED STRUCTURES
// ============================================================================

test("InferObject handles complex nested structure", () => {
	const lexicon = lx.lexicon("test.complex", {
		main: lx.object({
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
		}),
	});

	attest(lexicon.infer).type.toString.snap(`{
  $type: "test.complex"
  tags?: string[] | undefined
  content?:
    | { [x: string]: unknown; $type: "com.example.text" }
    | { [x: string]: unknown; $type: "com.example.image" }
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

test("InferNS handles multiple defs in namespace", () => {
	const lexicon = lx.lexicon("com.example.app", {
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

	attest(lexicon.infer).type.toString.snap("never");
});

test("InferNS handles namespace with record and object defs", () => {
	const lexicon = lx.lexicon("com.example.blog", {
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

	attest(lexicon.infer).type.toString.snap(`{
  $type: "com.example.blog"
  title: string
  body: string
}`);
});

// ============================================================================
// LOCAL REF RESOLUTION TESTS
// ============================================================================

test("Local ref resolution: resolves refs to actual types", () => {
	const ns = lx.lexicon("test", {
		user: lx.object({
			name: lx.string({ required: true }),
			email: lx.string({ required: true }),
		}),
		main: lx.object({
			author: lx.ref("#user", { required: true }),
			content: lx.string({ required: true }),
		}),
	});

	attest(ns.infer).type.toString.snap(`{
  $type: "test"
  author?:
    | { name: string; email: string; $type: "#user" }
    | undefined
  content: string
}`);
});

test("Local ref resolution: refs in arrays", () => {
	const ns = lx.lexicon("test", {
		user: lx.object({
			name: lx.string({ required: true }),
		}),
		main: lx.object({
			users: lx.array(lx.ref("#user")),
		}),
	});

	attest(ns.infer).type.toString.snap(`{
  $type: "test"
  users?: { name: string; $type: "#user" }[] | undefined
}`);
});

test("Local ref resolution: refs in unions", () => {
	const ns = lx.lexicon("test", {
		text: lx.object({ content: lx.string({ required: true }) }),
		image: lx.object({ url: lx.string({ required: true }) }),
		main: lx.object({
			embed: lx.union(["#text", "#image"]),
		}),
	});

	attest(ns.infer).type.toString.snap(`{
  $type: "test"
  embed?:
    | { content: string; $type: "#text" }
    | { url: string; $type: "#image" }
    | undefined
}`);
});

test("Local ref resolution: nested refs", () => {
	const ns = lx.lexicon("test", {
		profile: lx.object({
			bio: lx.string({ required: true }),
		}),
		user: lx.object({
			name: lx.string({ required: true }),
			profile: lx.ref("#profile", { required: true }),
		}),
		main: lx.object({
			author: lx.ref("#user", { required: true }),
		}),
	});

	attest(ns.infer).type.toString.snap(`{
  $type: "test"
  author?:
    | {
        profile?:
          | { bio: string; $type: "#profile" }
          | undefined
        name: string
        $type: "#user"
      }
    | undefined
}`);
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

test("Edge case: circular reference detection", () => {
	const ns = lx.lexicon("test", {
		main: lx.object({
			value: lx.string({ required: true }),
			parent: lx.ref("#main"),
		}),
	});

	attest(ns.infer).type.toString.snap(`{
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

test("Edge case: circular reference between multiple types", () => {
	const ns = lx.lexicon("test", {
		user: lx.object({
			name: lx.string({ required: true }),
			posts: lx.array(lx.ref("#post")),
		}),
		post: lx.object({
			title: lx.string({ required: true }),
			author: lx.ref("#user", { required: true }),
		}),
		main: lx.object({
			users: lx.array(lx.ref("#user")),
		}),
	});

	attest(ns.infer).type.toString.snap(`{
  $type: "test"
  users?:
    | {
        posts?:
          | {
              author?:
                | "[Circular reference detected: #user]"
                | undefined
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

test("Edge case: missing reference detection", () => {
	const ns = lx.lexicon("test", {
		main: lx.object({
			author: lx.ref("#user", { required: true }),
		}),
	});

	attest(ns.infer).type.toString.snap(`{
  $type: "test"
  author?: "[Reference not found: #user]" | undefined
}`);
});
