---
"prototypey": minor
---

Infer `lx.blob(...)` as `BlobRef` instead of the browser's `Blob`.

The browser's `Blob` describes binary data on the client, not the AT Protocol blob shape that actually appears in records over the wire. Lexicons using `lx.blob(...)` now infer to a locally-defined `BlobRef`:

```ts
type BlobRef = {
	$type: "blob";
	ref: { $link: string } | Cid;
	mimeType: string;
	size: number;
};
```

This mirrors `BlobRef` from [`@atproto/api`](https://github.com/bluesky-social/atproto/tree/main/packages/api) / [`@atproto/lex-data`](https://github.com/bluesky-social/atproto/tree/main/packages/lex-data) without taking either as a dependency. `BlobRef` is exported from the package root for direct use.

**Breaking:** code that previously read blob fields as `Blob` (e.g. calling `.arrayBuffer()` on them) will need to update to the `BlobRef` shape.
