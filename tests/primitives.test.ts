import { assertEquals } from "@std/assert";
import { lx } from "../lib.ts";

Deno.test("lx.null()", () => {
  const result = lx.null();
  assertEquals(result, { type: "null" });
});

Deno.test("lx.boolean()", () => {
  const result = lx.boolean();
  assertEquals(result, { type: "boolean" });
});

Deno.test("lx.boolean() with default", () => {
  const result = lx.boolean({ default: true });
  assertEquals(result, { type: "boolean", default: true });
});

Deno.test("lx.boolean() with const", () => {
  const result = lx.boolean({ const: false });
  assertEquals(result, { type: "boolean", const: false });
});

Deno.test("lx.integer()", () => {
  const result = lx.integer();
  assertEquals(result, { type: "integer" });
});

Deno.test("lx.integer() with minimum", () => {
  const result = lx.integer({ minimum: 0 });
  assertEquals(result, { type: "integer", minimum: 0 });
});

Deno.test("lx.integer() with maximum", () => {
  const result = lx.integer({ maximum: 100 });
  assertEquals(result, { type: "integer", maximum: 100 });
});

Deno.test("lx.integer() with minimum and maximum", () => {
  const result = lx.integer({ minimum: 0, maximum: 100 });
  assertEquals(result, { type: "integer", minimum: 0, maximum: 100 });
});

Deno.test("lx.integer() with enum", () => {
  const result = lx.integer({ enum: [1, 2, 3, 5, 8, 13] });
  assertEquals(result, { type: "integer", enum: [1, 2, 3, 5, 8, 13] });
});

Deno.test("lx.integer() with default", () => {
  const result = lx.integer({ default: 42 });
  assertEquals(result, { type: "integer", default: 42 });
});

Deno.test("lx.integer() with const", () => {
  const result = lx.integer({ const: 7 });
  assertEquals(result, { type: "integer", const: 7 });
});

Deno.test("lx.string()", () => {
  const result = lx.string();
  assertEquals(result, { type: "string" });
});

Deno.test("lx.string() with maxLength", () => {
  const result = lx.string({ maxLength: 64 });
  assertEquals(result, { type: "string", maxLength: 64 });
});

Deno.test("lx.string() with enum", () => {
  const result = lx.string({ enum: ["light", "dark", "auto"] });
  assertEquals(result, { type: "string", enum: ["light", "dark", "auto"] });
});

Deno.test("lx.unknown()", () => {
  const result = lx.unknown();
  assertEquals(result, { type: "unknown" });
});

Deno.test("lx.bytes()", () => {
  const result = lx.bytes();
  assertEquals(result, { type: "bytes" });
});

Deno.test("lx.bytes() with minLength", () => {
  const result = lx.bytes({ minLength: 1 });
  assertEquals(result, { type: "bytes", minLength: 1 });
});

Deno.test("lx.bytes() with maxLength", () => {
  const result = lx.bytes({ maxLength: 1024 });
  assertEquals(result, { type: "bytes", maxLength: 1024 });
});

Deno.test("lx.bytes() with minLength and maxLength", () => {
  const result = lx.bytes({ minLength: 1, maxLength: 1024 });
  assertEquals(result, { type: "bytes", minLength: 1, maxLength: 1024 });
});

Deno.test("lx.cidLink()", () => {
  const result = lx.cidLink(
    "bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a"
  );
  assertEquals(result, {
    type: "cid-link",
    $link: "bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a",
  });
});

Deno.test("lx.blob()", () => {
  const result = lx.blob();
  assertEquals(result, { type: "blob" });
});

Deno.test("lx.blob() with accept", () => {
  const result = lx.blob({ accept: ["image/png", "image/jpeg"] });
  assertEquals(result, { type: "blob", accept: ["image/png", "image/jpeg"] });
});

Deno.test("lx.blob() with maxSize", () => {
  const result = lx.blob({ maxSize: 1000000 });
  assertEquals(result, { type: "blob", maxSize: 1000000 });
});

Deno.test("lx.blob() with accept and maxSize", () => {
  const result = lx.blob({
    accept: ["image/png", "image/jpeg"],
    maxSize: 5000000,
  });
  assertEquals(result, {
    type: "blob",
    accept: ["image/png", "image/jpeg"],
    maxSize: 5000000,
  });
});

Deno.test("lx.array() with string items", () => {
  const result = lx.array(lx.string());
  assertEquals(result, { type: "array", items: { type: "string" } });
});

Deno.test("lx.array() with integer items", () => {
  const result = lx.array(lx.integer());
  assertEquals(result, { type: "array", items: { type: "integer" } });
});

Deno.test("lx.array() with minLength", () => {
  const result = lx.array(lx.string(), { minLength: 1 });
  assertEquals(result, {
    type: "array",
    items: { type: "string" },
    minLength: 1,
  });
});

Deno.test("lx.array() with maxLength", () => {
  const result = lx.array(lx.string(), { maxLength: 10 });
  assertEquals(result, {
    type: "array",
    items: { type: "string" },
    maxLength: 10,
  });
});

Deno.test("lx.array() with minLength and maxLength", () => {
  const result = lx.array(lx.string(), { minLength: 1, maxLength: 10 });
  assertEquals(result, {
    type: "array",
    items: { type: "string" },
    minLength: 1,
    maxLength: 10,
  });
});

Deno.test("lx.array() with required", () => {
  const result = lx.array(lx.string(), { required: true });
  assertEquals(result, {
    type: "array",
    items: { type: "string" },
    required: true,
  });
});

Deno.test("lx.token() with interaction event", () => {
  const result = lx.token(
    "Request that less content like the given feed item be shown in the feed"
  );
  assertEquals(result, {
    type: "token",
    description:
      "Request that less content like the given feed item be shown in the feed",
  });
});

Deno.test("lx.token() with content mode", () => {
  const result = lx.token(
    "Declares the feed generator returns posts containing app.bsky.embed.video embeds"
  );
  assertEquals(result, {
    type: "token",
    description:
      "Declares the feed generator returns posts containing app.bsky.embed.video embeds",
  });
});

Deno.test("lx.ref() with local definition", () => {
  const result = lx.ref("#profileAssociated");
  assertEquals(result, {
    type: "ref",
    ref: "#profileAssociated",
  });
});

Deno.test("lx.ref() with external schema", () => {
  const result = lx.ref("com.atproto.label.defs#label");
  assertEquals(result, {
    type: "ref",
    ref: "com.atproto.label.defs#label",
  });
});

Deno.test("lx.union() with local refs", () => {
  const result = lx.union(["#reasonRepost", "#reasonPin"]);
  assertEquals(result, {
    type: "union",
    refs: ["#reasonRepost", "#reasonPin"],
  });
});

Deno.test("lx.union() with external refs", () => {
  const result = lx.union([
    "app.bsky.embed.images#view",
    "app.bsky.embed.video#view",
    "app.bsky.embed.external#view",
    "app.bsky.embed.record#view",
    "app.bsky.embed.recordWithMedia#view",
  ]);
  assertEquals(result, {
    type: "union",
    refs: [
      "app.bsky.embed.images#view",
      "app.bsky.embed.video#view",
      "app.bsky.embed.external#view",
      "app.bsky.embed.record#view",
      "app.bsky.embed.recordWithMedia#view",
    ],
  });
});

Deno.test("lx.union() with closed option", () => {
  const result = lx.union(["#postView", "#notFoundPost", "#blockedPost"], {
    closed: true,
  });
  assertEquals(result, {
    type: "union",
    refs: ["#postView", "#notFoundPost", "#blockedPost"],
    closed: true,
  });
});

Deno.test("lx.union() with closed: false (open union)", () => {
  const result = lx.union(["#threadViewPost", "#notFoundPost"], {
    closed: false,
  });
  assertEquals(result, {
    type: "union",
    refs: ["#threadViewPost", "#notFoundPost"],
    closed: false,
  });
});

Deno.test("lx.params() with basic properties", () => {
  const result = lx.params({
    q: lx.string(),
    limit: lx.integer(),
  });
  assertEquals(result, {
    type: "params",
    properties: {
      q: { type: "string" },
      limit: { type: "integer" },
    },
  });
});

Deno.test("lx.params() with required properties", () => {
  const result = lx.params({
    q: lx.string({ required: true }),
    limit: lx.integer(),
  });
  assertEquals(result, {
    type: "params",
    properties: {
      q: { type: "string", required: true },
      limit: { type: "integer" },
    },
    required: ["q"],
  });
});

Deno.test("lx.params() with property options", () => {
  const result = lx.params({
    q: lx.string(),
    limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
    cursor: lx.string(),
  });
  assertEquals(result, {
    type: "params",
    properties: {
      q: { type: "string" },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
      cursor: { type: "string" },
    },
  });
});

Deno.test("lx.params() with array properties", () => {
  const result = lx.params({
    tags: lx.array(lx.string()),
    ids: lx.array(lx.integer()),
  });
  assertEquals(result, {
    type: "params",
    properties: {
      tags: { type: "array", items: { type: "string" } },
      ids: { type: "array", items: { type: "integer" } },
    },
  });
});

Deno.test("lx.params() real-world example from searchActors", () => {
  const result = lx.params({
    q: lx.string({ required: true }),
    limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
    cursor: lx.string(),
  });
  assertEquals(result, {
    type: "params",
    properties: {
      q: { type: "string", required: true },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
      cursor: { type: "string" },
    },
    required: ["q"],
  });
});

Deno.test("lx.query() basic", () => {
  const result = lx.query();
  assertEquals(result, { type: "query" });
});

Deno.test("lx.query() with description", () => {
  const result = lx.query({ description: "Search for actors" });
  assertEquals(result, { type: "query", description: "Search for actors" });
});

Deno.test("lx.query() with parameters", () => {
  const result = lx.query({
    parameters: lx.params({
      q: lx.string({ required: true }),
      limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
    }),
  });
  assertEquals(result, {
    type: "query",
    parameters: {
      type: "params",
      properties: {
        q: { type: "string", required: true },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
      },
      required: ["q"],
    },
  });
});

Deno.test("lx.query() with output", () => {
  const result = lx.query({
    output: {
      encoding: "application/json",
      schema: lx.object({
        posts: lx.array(lx.ref("app.bsky.feed.defs#postView"), {
          required: true,
        }),
        cursor: lx.string(),
      }),
    },
  });
  assertEquals(result, {
    type: "query",
    output: {
      encoding: "application/json",
      schema: {
        type: "object",
        properties: {
          posts: {
            type: "array",
            items: { type: "ref", ref: "app.bsky.feed.defs#postView" },
            required: true,
          },
          cursor: { type: "string" },
        },
        required: ["posts"],
      },
    },
  });
});

Deno.test("lx.query() with errors", () => {
  const result = lx.query({
    errors: [{ name: "BadQueryString" }],
  });
  assertEquals(result, {
    type: "query",
    errors: [{ name: "BadQueryString" }],
  });
});

Deno.test("lx.query() real-world example: searchPosts", () => {
  const result = lx.query({
    description: "Find posts matching search criteria",
    parameters: lx.params({
      q: lx.string({ required: true }),
      sort: lx.string({ enum: ["top", "latest"], default: "latest" }),
      limit: lx.integer({ minimum: 1, maximum: 100, default: 25 }),
      cursor: lx.string(),
    }),
    output: {
      encoding: "application/json",
      schema: lx.object({
        cursor: lx.string(),
        hitsTotal: lx.integer(),
        posts: lx.array(lx.ref("app.bsky.feed.defs#postView"), {
          required: true,
        }),
      }),
    },
    errors: [{ name: "BadQueryString" }],
  });
  assertEquals(result, {
    type: "query",
    description: "Find posts matching search criteria",
    parameters: {
      type: "params",
      properties: {
        q: { type: "string", required: true },
        sort: { type: "string", enum: ["top", "latest"], default: "latest" },
        limit: { type: "integer", minimum: 1, maximum: 100, default: 25 },
        cursor: { type: "string" },
      },
      required: ["q"],
    },
    output: {
      encoding: "application/json",
      schema: {
        type: "object",
        properties: {
          cursor: { type: "string" },
          hitsTotal: { type: "integer" },
          posts: {
            type: "array",
            items: { type: "ref", ref: "app.bsky.feed.defs#postView" },
            required: true,
          },
        },
        required: ["posts"],
      },
    },
    errors: [{ name: "BadQueryString" }],
  });
});

Deno.test("lx.procedure() basic", () => {
  const result = lx.procedure();
  assertEquals(result, { type: "procedure" });
});

Deno.test("lx.procedure() with description", () => {
  const result = lx.procedure({ description: "Create a new post" });
  assertEquals(result, { type: "procedure", description: "Create a new post" });
});

Deno.test("lx.procedure() with parameters", () => {
  const result = lx.procedure({
    parameters: lx.params({
      validate: lx.boolean({ default: true }),
    }),
  });
  assertEquals(result, {
    type: "procedure",
    parameters: {
      type: "params",
      properties: {
        validate: { type: "boolean", default: true },
      },
    },
  });
});

Deno.test("lx.procedure() with input", () => {
  const result = lx.procedure({
    input: {
      encoding: "application/json",
      schema: lx.object({
        text: lx.string({ required: true, maxGraphemes: 300 }),
        createdAt: lx.string({ format: "datetime" }),
      }),
    },
  });
  assertEquals(result, {
    type: "procedure",
    input: {
      encoding: "application/json",
      schema: {
        type: "object",
        properties: {
          text: { type: "string", required: true, maxGraphemes: 300 },
          createdAt: { type: "string", format: "datetime" },
        },
        required: ["text"],
      },
    },
  });
});

Deno.test("lx.procedure() with output", () => {
  const result = lx.procedure({
    output: {
      encoding: "application/json",
      schema: lx.object({
        uri: lx.string({ required: true }),
        cid: lx.string({ required: true }),
      }),
    },
  });
  assertEquals(result, {
    type: "procedure",
    output: {
      encoding: "application/json",
      schema: {
        type: "object",
        properties: {
          uri: { type: "string", required: true },
          cid: { type: "string", required: true },
        },
        required: ["uri", "cid"],
      },
    },
  });
});

Deno.test("lx.procedure() with errors", () => {
  const result = lx.procedure({
    errors: [
      { name: "InvalidRequest" },
      { name: "RateLimitExceeded", description: "Too many requests" },
    ],
  });
  assertEquals(result, {
    type: "procedure",
    errors: [
      { name: "InvalidRequest" },
      { name: "RateLimitExceeded", description: "Too many requests" },
    ],
  });
});

Deno.test("lx.procedure() real-world example: createPost", () => {
  const result = lx.procedure({
    description: "Create a post",
    input: {
      encoding: "application/json",
      schema: lx.object({
        repo: lx.string({ required: true }),
        collection: lx.string({ required: true }),
        record: lx.unknown({ required: true }),
        validate: lx.boolean({ default: true }),
      }),
    },
    output: {
      encoding: "application/json",
      schema: lx.object({
        uri: lx.string({ required: true }),
        cid: lx.string({ required: true }),
      }),
    },
    errors: [
      { name: "InvalidSwap" },
      { name: "InvalidRecord" },
    ],
  });
  assertEquals(result, {
    type: "procedure",
    description: "Create a post",
    input: {
      encoding: "application/json",
      schema: {
        type: "object",
        properties: {
          repo: { type: "string", required: true },
          collection: { type: "string", required: true },
          record: { type: "unknown", required: true },
          validate: { type: "boolean", default: true },
        },
        required: ["repo", "collection", "record"],
      },
    },
    output: {
      encoding: "application/json",
      schema: {
        type: "object",
        properties: {
          uri: { type: "string", required: true },
          cid: { type: "string", required: true },
        },
        required: ["uri", "cid"],
      },
    },
    errors: [
      { name: "InvalidSwap" },
      { name: "InvalidRecord" },
    ],
  });
});

Deno.test("lx.subscription() basic", () => {
  const result = lx.subscription();
  assertEquals(result, { type: "subscription" });
});

Deno.test("lx.subscription() with description", () => {
  const result = lx.subscription({
    description: "Repository event stream",
  });
  assertEquals(result, {
    type: "subscription",
    description: "Repository event stream",
  });
});

Deno.test("lx.subscription() with parameters", () => {
  const result = lx.subscription({
    parameters: lx.params({
      cursor: lx.integer(),
    }),
  });
  assertEquals(result, {
    type: "subscription",
    parameters: {
      type: "params",
      properties: {
        cursor: { type: "integer" },
      },
    },
  });
});

Deno.test("lx.subscription() with message", () => {
  const result = lx.subscription({
    message: {
      schema: lx.union([
        "#commit",
        "#identity",
        "#account",
      ]),
    },
  });
  assertEquals(result, {
    type: "subscription",
    message: {
      schema: {
        type: "union",
        refs: ["#commit", "#identity", "#account"],
      },
    },
  });
});

Deno.test("lx.subscription() with message description", () => {
  const result = lx.subscription({
    message: {
      description: "Event message types",
      schema: lx.union(["#commit", "#handle", "#migrate"]),
    },
  });
  assertEquals(result, {
    type: "subscription",
    message: {
      description: "Event message types",
      schema: {
        type: "union",
        refs: ["#commit", "#handle", "#migrate"],
      },
    },
  });
});

Deno.test("lx.subscription() with errors", () => {
  const result = lx.subscription({
    errors: [
      { name: "FutureCursor" },
      { name: "ConsumerTooSlow", description: "Consumer is too slow" },
    ],
  });
  assertEquals(result, {
    type: "subscription",
    errors: [
      { name: "FutureCursor" },
      { name: "ConsumerTooSlow", description: "Consumer is too slow" },
    ],
  });
});

Deno.test("lx.subscription() real-world example: subscribeRepos", () => {
  const result = lx.subscription({
    description: "Repository event stream, aka Firehose endpoint",
    parameters: lx.params({
      cursor: lx.integer(),
    }),
    message: {
      description: "Represents an update of repository state",
      schema: lx.union([
        "#commit",
        "#identity",
        "#account",
        "#handle",
        "#migrate",
        "#tombstone",
        "#info",
      ]),
    },
    errors: [
      { name: "FutureCursor" },
      { name: "ConsumerTooSlow" },
    ],
  });
  assertEquals(result, {
    type: "subscription",
    description: "Repository event stream, aka Firehose endpoint",
    parameters: {
      type: "params",
      properties: {
        cursor: {
          type: "integer",
        },
      },
    },
    message: {
      description: "Represents an update of repository state",
      schema: {
        type: "union",
        refs: [
          "#commit",
          "#identity",
          "#account",
          "#handle",
          "#migrate",
          "#tombstone",
          "#info",
        ],
      },
    },
    errors: [
      { name: "FutureCursor" },
      { name: "ConsumerTooSlow" },
    ],
  });
});
