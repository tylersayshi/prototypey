# Type Instantiation Optimization Plan

## Current State

**Benchmark Results:**

- Simple object (2 properties): **578 instantiations** (baseline: 62, 9.3x over)
- Complex nested (3 defs): **971 instantiations** (baseline: 124, 7.8x over)

**Target:** Reduce to ~200-250 instantiations for simple case (2-3x savings)

## Root Causes

The 10x overhead comes from:

1. **Excessive `Prettify` calls** - Applied at every level instead of just top-level
2. **Unnecessary `UnionToTuple` conversions** - Running even when no required/nullable fields exist
3. **Slow primitive inference** - All primitives go through 13-level conditional cascade
4. **Triple property iteration** - `RequiredKeys`, `NullableKeys`, then actual inference
5. **Complex `InferObject` intersections** - 4 separate mapped types intersected together

## Optimization Tasks

### 1. Make `Prettify` Lazy ⚡️ HIGH IMPACT

**Goal:** Only prettify at the top-level `InferNS` export, not at every intermediate step

**Files to modify:**

- `src/infer.ts` - Remove `Prettify` from `InferObject`, `InferDefs`
- `src/infer.ts` - Keep `Prettify` only in `InferNS<T>` final export
- `src/lib.ts` - Remove `Prettify` from `ObjectResult`, `ParamsResult`

**Expected savings:** 200-300 instantiations

**Validation:** Run benchmarks, verify IDE autocomplete still shows clean types

---

### 2. Skip `UnionToTuple` When Empty ⚡️ HIGH IMPACT

**Goal:** Avoid expensive union-to-tuple conversion when there are no required/nullable fields

**Files to modify:**

- `src/lib.ts` - Wrap `UnionToTuple` calls in conditional checks for `never`
- `src/lib.ts` - Update `ObjectResult` to conditionally omit `required`/`nullable` keys

**Expected savings:** 50-100 instantiations per object with no required/nullable fields

**Implementation:**

```typescript
type ObjectResult<T> = {
  type: "object";
  properties: {...};
} & (
  RequiredKeys<T> extends never
    ? {}
    : { required: UnionToTuple<RequiredKeys<T>> }
) & (
  NullableKeys<T> extends never
    ? {}
    : { nullable: UnionToTuple<NullableKeys<T>> }
);
```

**Validation:** Ensure objects without required/nullable fields don't have those keys

---

### 3. Fast-Path for Primitives in `InferType` 🚀 MEDIUM IMPACT

**Goal:** Early exit for common primitive types before checking complex conditionals

**Files to modify:**

- `src/infer.ts` - Reorder `InferType` to check primitives first
- `src/infer.ts` - Extract type tag and switch on it

**Expected savings:** 30-50 instantiations per primitive property

**Implementation:**

```typescript
type InferType<T> = T extends { type: infer Type }
	? Type extends "string"
		? string
		: Type extends "boolean"
			? boolean
			: Type extends "integer"
				? number
				: Type extends "null"
					? null
					: Type extends "bytes"
						? Uint8Array
						: Type extends "cid-link"
							? string
							: Type extends "blob"
								? Blob
								: Type extends "unknown"
									? unknown
									: // ... then complex types (record, object, array, params, union, token, ref)
										never
	: never;
```

**Validation:** All existing tests pass, primitives still infer correctly

---

### 4. Combine Key Extraction into Single Pass 🔧 MEDIUM IMPACT

**Goal:** Extract required/nullable keys in one iteration instead of two separate mapped types

**Files to modify:**

- `src/lib.ts` - Create unified `ExtractKeys<T>` helper
- `src/lib.ts` - Update `ObjectResult` to use single extraction
- `src/infer.ts` - Update `InferObject` to use single extraction

**Expected savings:** 20-40 instantiations per object

**Implementation:**

```typescript
type ExtractKeys<T> = {
  required: RequiredKeys<T>;
  nullable: NullableKeys<T>;
};

type ObjectResult<T, Keys = ExtractKeys<T>> = ...
```

**Validation:** Required and nullable fields still work correctly

---

### 5. Simplify `InferObject` to 2 Mapped Types 🔧 MEDIUM-HIGH IMPACT

**Goal:** Reduce from 4 intersected mapped types to 2 by using conditional types in values

**Files to modify:**

- `src/infer.ts` - Restructure `InferObject` type
- `src/infer.ts` - Combine required/optional logic into value-level conditionals

**Expected savings:** 50-100 instantiations per object

**Current structure:**

```typescript
{ [K in Normal]?: ... } &
{ [K in Required-NotNullable]-?: ... } &
{ [K in Nullable-NotRequired]?: ... } &
{ [K in RequiredAndNullable]: ... }
```

**Target structure:**

```typescript
{ [K in OptionalKeys]?: InferType<P[K]> | (K extends Nullable ? null : never) } &
{ [K in RequiredKeys]-?: InferType<P[K]> | (K extends Nullable ? null : never) }
```

**Validation:** All nullable/required combinations still work, existing tests pass

---

## Validation Process

After each optimization:

1. **Run type tests:** `pnpm tsc`
2. **Run unit tests:** `pnpm test`
3. **Run benchmarks:** `pnpm test:bench`
4. **Check IDE performance:** Open large schema file, verify autocomplete is fast
5. **Document results:** Update this file with actual savings

## Success Metrics

- ✅ Simple object: < 250 instantiations (currently 578)
- ✅ Complex nested: < 400 instantiations (currently 971)
- ✅ All tests passing
- ✅ IDE autocomplete remains fast and type display is clean

## Notes

- Maintain JSON compatibility (no nominal types)
- Preserve developer experience (clean type display in IDE)
- Keep runtime behavior unchanged (types erase anyway)
- This is for schema authoring + validated payload typing
