# Ref Resolution Implementation Plan

## Problem Statement

Currently, `InferRef` and `InferUnion` return stub types:

```typescript
type InferRef<T> = { $type: R; [key: string]: unknown };
type InferUnion<T> = { $type: R; [key: string]: unknown };
```

This means references don't resolve to actual inferred types. For example:

```typescript
const ns = lx.namespace("test", {
	user: lx.object({
		name: lx.string({ required: true }),
	}),
	post: lx.object({
		author: lx.ref("#user"), // Currently: { $type: "#user"; [key: string]: unknown }
		// Want: { name: string; $type: "#user" }
	}),
});
```

## Solution: Two-Pass Inference Strategy

### Pass 1: Current Inference (Keep As-Is)

- Already working and tested
- Generates complete type structure with stub refs
- No changes needed to existing inference logic

**Output after Pass 1:**

```typescript
{
  user: { name: string; email: string },
  post: {
    author: { $type: "#user"; [key: string]: unknown }, // Stub
    content: string
  }
}
```

### Pass 2: Replace Refs

- Walk through the inferred types from Pass 1
- Find stub refs (objects with `$type: "#..."`)
- Replace them with the actual inferred type from the same namespace
- Handle circular refs gracefully

**Output after Pass 2:**

```typescript
{
  user: { name: string; email: string },
  post: {
    author: { name: string; email: string; $type: "#user" }, // Resolved!
    content: string
  }
}
```

## Implementation Details

### Type Signature

```typescript
type ReplaceRefsInType<T, Defs, Visited = never> = T extends {
	$type: `#${infer DefName}`;
}
	? DefName extends keyof Defs
		? DefName extends Visited
			? `[Circular reference detected: #${DefName}]`
			: ReplaceRefsInType<Defs[DefName], Defs, Visited | DefName> & {
					$type: T["$type"];
				}
		: `[Reference not found: #${DefName}]`
	: T extends readonly (infer Item)[]
		? ReplaceRefsInType<Item, Defs, Visited>[]
		: T extends object
			? { [K in keyof T]: ReplaceRefsInType<T[K], Defs, Visited> }
			: T;
```

### Key Features

1. **Ref Detection**: Check if type has `$type: "#..."`
2. **Ref Resolution**: Look up `DefName` in `Defs` and recursively infer it
3. **Preserve $type**: Intersect with original `$type` for discriminated unions
4. **Circular Detection**: Track visited refs in `Visited` union
5. **Error Messages**: Return string literal types for circular/missing refs
6. **Recursive Walk**: Handle arrays, objects, unions automatically

### Error Messages

Using string literal types as error messages (shows in IDE):

**Circular Reference:**

```typescript
author: `[Circular reference detected: #user]`;
```

**Missing Reference:**

```typescript
author: `[Reference not found: #userr]`; // typo caught!
```

### Top-Level API

```typescript
type ReplaceRefs<InferredDefs> = {
	[K in keyof InferredDefs]: ReplaceRefsInType<InferredDefs[K], InferredDefs>;
};

export type Infer<T extends { id: string; defs: Record<string, unknown> }> =
	Prettify<ReplaceRefs<InferDefs<T["defs"]>>>;
```

## Examples

### Local Ref Resolution

```typescript
const ns = lx.namespace("test", {
	user: lx.object({
		name: lx.string({ required: true }),
		email: lx.string({ required: true }),
	}),
	post: lx.object({
		author: lx.ref("#user", { required: true }),
		content: lx.string({ required: true }),
	}),
});

type Inferred = typeof ns.infer;
// {
//   user: { name: string; email: string },
//   post: {
//     author: { name: string; email: string; $type: "#user" },
//     content: string
//   }
// }
```

### Circular Reference Handling

```typescript
const ns = lx.namespace("test", {
	user: lx.object({
		posts: lx.array(lx.ref("#post")),
	}),
	post: lx.object({
		author: lx.ref("#user"), // Circular!
	}),
});

type Inferred = typeof ns.infer;
// {
//   user: {
//     posts: {
//       author: `[Circular reference detected: #user]`;
//       $type: "#post"
//     }[]
//   },
//   post: { author: { posts: ...[]; $type: "#user" } }
// }
```

### Refs in Arrays

```typescript
const ns = lx.namespace("test", {
	user: lx.object({
		name: lx.string({ required: true }),
	}),
	feed: lx.object({
		users: lx.array(lx.ref("#user")),
	}),
});

type Inferred = typeof ns.infer;
// {
//   user: { name: string },
//   feed: { users: { name: string; $type: "#user" }[] }
// }
```

### Refs in Unions

```typescript
const ns = lx.namespace("test", {
	text: lx.object({ content: lx.string({ required: true }) }),
	image: lx.object({ url: lx.string({ required: true }) }),
	post: lx.object({
		embed: lx.union(["#text", "#image"]),
	}),
});

type Inferred = typeof ns.infer;
// {
//   text: { content: string },
//   image: { url: string },
//   post: {
//     embed:
//       | { content: string; $type: "#text" }
//       | { url: string; $type: "#image" }
//   }
// }
```

## Implementation Checklist

- [ ] Implement `ReplaceRefsInType` utility
  - [ ] Handle ref detection and resolution
  - [ ] Handle array recursion
  - [ ] Handle object recursion
  - [ ] Handle circular detection with `Visited`
  - [ ] Add error messages for circular/missing refs
- [ ] Implement `ReplaceRefs` wrapper
- [ ] Update top-level `Infer` type to use `ReplaceRefs`
- [ ] Write tests for local ref resolution
- [ ] Write tests for circular reference handling
- [ ] Write tests for missing reference errors
- [ ] Run benchmarks to measure type instantiation impact
- [ ] Optimize if needed

## Out of Scope

These features are documented but NOT implemented in this phase:

- Cross-namespace ref resolution (e.g., `com.example.foo#bar`)
  - Would require external namespace registry
  - Keep returning stubs for now
- Advanced circular handling (lazy types)
- Ref validation beyond type-level checks

## Performance Considerations

**Current Benchmarks (Pass 1 only):**

- Simple object: 221 instantiations
- Complex nested: 454 instantiations
- Large bsky schema: 658 instantiations

**Target After Pass 2:**

- Keep under 2000 instantiations per schema
- Monitor for exponential blowup
- Add memoization if needed

**TypeScript Recursion Limits:**

- Default depth: ~50 levels
- Circular refs naturally stop at limit
- But we add explicit tracking for better DX

## Why Two-Pass?

**Rejected Alternative: Single-Pass with Context Threading**

- Would need to thread `Defs` through every inference type
- Complex string parsing at type level
- Order-dependent (ref before def fails)
- Harder to debug and maintain

**Chosen Alternative: Two-Pass Replace**

- Pass 1 already works perfectly
- Pass 2 is simple find-and-replace
- No order dependency
- Easy to debug
- Clearer separation of concerns
