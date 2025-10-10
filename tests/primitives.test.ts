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
  const result = lx.cidLink("bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a");
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

Deno.test("lx.token() with interaction event", () => {
  const result = lx.token("Request that less content like the given feed item be shown in the feed");
  assertEquals(result, {
    type: "token",
    description: "Request that less content like the given feed item be shown in the feed",
  });
});

Deno.test("lx.token() with content mode", () => {
  const result = lx.token("Declares the feed generator returns posts containing app.bsky.embed.video embeds");
  assertEquals(result, {
    type: "token",
    description: "Declares the feed generator returns posts containing app.bsky.embed.video embeds",
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
