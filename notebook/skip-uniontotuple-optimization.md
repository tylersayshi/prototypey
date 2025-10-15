# Skip UnionToTuple When Empty - Optimization Notes

## Starting Point

**Initial Benchmark Results (from todo.md):**

- Simple object (2 properties): **578 instantiations** (baseline: 62, 9.3x over)
- Complex nested (3 defs): **971 instantiations** (baseline: 124, 7.8x over)

**Target:** Reduce to ~200-250 instantiations for simple case

## Before This Optimization

Previous optimizations had already been applied (likely "Make Prettify Lazy"):

- Simple object: **275 instantiations**
- Complex nested: **542 instantiations**

## The Problem

The `ObjectResult` and `ParamsResult` types were computing `RequiredKeys<T>` and `NullableKeys<T>` as intermediate type parameters:

```typescript
type ObjectResult<
  T extends ObjectProperties,
  R = RequiredKeys<T>,  // ← Intermediate type parameter
  N = NullableKeys<T>,  // ← Intermediate type parameter
> = {
  type: "object";
  properties: {...};
} & ([R] extends [never] ? {} : { required: UnionToTuple<R> })
  & ([N] extends [never] ? {} : { nullable: UnionToTuple<N> });
```

While the conditional checks prevented calling `UnionToTuple` when keys were `never`, TypeScript still had to instantiate the intermediate type parameters `R` and `N`, adding overhead.

## What We Tried

### Attempt 1: Remove Intermediate Type Parameters ✅ SUCCESS

**Change:** Inline the `RequiredKeys<T>` and `NullableKeys<T>` calls directly into the conditional checks, removing the intermediate type parameter assignments.

```typescript
type ObjectResult<T extends ObjectProperties> = {
  type: "object";
  properties: {...};
} & ([RequiredKeys<T>] extends [never]
  ? {}
  : { required: UnionToTuple<RequiredKeys<T>> })
  & ([NullableKeys<T>] extends [never]
    ? {}
    : { nullable: UnionToTuple<NullableKeys<T>> });
```

**Results:**

- Simple object: 275 → **244 instantiations** (31 saved, ~11% improvement)
- Complex nested: 542 → **507 instantiations** (35 saved, ~6% improvement)

**Why it worked:** Removing intermediate type parameter assignments reduced the number of type instantiations. TypeScript now evaluates the key extraction inline within conditionals, which is more efficient than creating separate type aliases.

### Attempt 2: Extract Helper Types ❌ FAILED

**Change:** Created `AddRequiredField` and `AddNullableField` helper types to encapsulate the conditional logic:

```typescript
type AddRequiredField<R> = [R] extends [never]
  ? {}
  : { required: UnionToTuple<R> };

type AddNullableField<N> = [N] extends [never]
  ? {}
  : { nullable: UnionToTuple<N> };

type ObjectResult<T extends ObjectProperties> = {
  type: "object";
  properties: {...};
} & AddRequiredField<RequiredKeys<T>>
  & AddNullableField<NullableKeys<T>>;
```

**Results:**

- Simple object: 244 → **263 instantiations** (19 worse, regressed)
- Complex nested: 507 → **506 instantiations** (1 better, negligible)

**Why it failed:** The helper types added additional type instantiation overhead that outweighed any benefits from code organization. Each helper type invocation created extra work for TypeScript's type checker.

**Action taken:** Reverted to Attempt 1.

## Final Results

**Benchmark after this optimization:**

- Simple object: **244 instantiations** (down from 275, saved 31)
- Complex nested: **507 instantiations** (down from 542, saved 35)

**Total progress from original todo.md baseline:**

- Simple object: **578 → 244** (334 saved, 57.8% improvement) ✅ **GOAL MET** (target: 200-250)
- Complex nested: **971 → 507** (464 saved, 47.8% improvement) ⚠️ Still above 400 target

## Files Modified

- `src/lib.ts`:
  - `ObjectResult<T>` type (lines 212-225)
  - `ParamsResult<T>` type (lines 237-245)

## Validation

- ✅ All 172 tests passing (`pnpm test`)
- ✅ Type checking passes (`pnpm tsc`)
- ✅ No runtime behavior changes (types erase at runtime)
- ✅ IDE autocomplete still works with clean type display

## Key Learnings

1. **Intermediate type parameters have a cost**: Even when they're just aliases, TypeScript must instantiate them.

2. **Inline conditionals can be more efficient**: Computing values inline within conditional types can reduce instantiation count compared to pre-computing and storing in type parameters.

3. **Helper types aren't always helpful**: While helper types improve code organization, they can add overhead. Always benchmark after introducing abstractions.

4. **Small changes add up**: A 31-instantiation reduction (11%) might seem modest, but combined with other optimizations, we achieved a 57.8% total improvement.

---

## Further Optimization Attempts (Post-Initial Success)

### Attempt 3: Reduce InferObject Intersections (4 → 2) ❌ FAILED

**Change:** Attempted to reduce the number of intersected mapped types in `InferObject` from 4 to 2 by combining key categories:

```typescript
type InferObject<...> = Prettify<
  T extends { properties: any }
    ? {
        // All REQUIRED keys (with and without nullable)
        -readonly [K in keyof Props as K extends Required & string ? K : never]-?:
          K extends NullableAndRequired
            ? InferType<Props[K]> | null
            : InferType<Props[K]>;
      } & {
        // All OPTIONAL keys (normal and nullable-only)
        -readonly [K in keyof Props as K extends Exclude<keyof Props & string, Required> ? K : never]?:
          K extends Nullable
            ? InferType<Props[K]> | null
            : InferType<Props[K]>;
      }
    : {}
>;
```

**Results:**
- Simple object: **244 instantiations** (unchanged)
- Complex nested: **507 instantiations** (unchanged)

**Why it failed:**
- The number of intersections wasn't the bottleneck
- TypeScript still evaluates the same number of conditional checks
- Property ordering changed (required first, then optional), breaking snapshot tests
- No performance benefit to justify the breaking change

**Action taken:** Reverted.

### Attempt 4: Inline Type Parameters in InferObject ❌ FAILED

**Change:** Removed all intermediate type parameters from `InferObject`, similar to what worked for `ObjectResult`:

```typescript
type InferObject<T> = Prettify<
  T extends { properties: infer P }
    ? {
        -readonly [K in "properties" extends keyof T
          ? Exclude<keyof T["properties"], (GetRequired<T> & string) | (GetNullable<T> & string)> & string
          : never]?: InferType<P[K & keyof P]>;
      } & {
        -readonly [K in Exclude<GetRequired<T> & string, ...>]-?: InferType<P[K & keyof P]>;
      } & ...
    : {}
>;
```

**Results:**
- Simple object: **244 instantiations** (unchanged)
- Complex nested: **507 instantiations** (unchanged)

**Why it failed:**
- Unlike `ObjectResult` (which is only evaluated at definition time), `InferObject` is called recursively during type inference
- The intermediate type parameters are likely cached/memoized by TypeScript during recursive evaluation
- Inlining forces re-computation of the same values multiple times in each mapped type key
- Tests passed but no performance improvement

**Action taken:** Reverted.

## Updated Key Learnings

5. **Context matters for optimizations**: What works in one context (removing intermediate params in `ObjectResult`) may not work in another (`InferObject`). The recursive nature of type inference behaves differently than one-time type construction.

6. **Intersection count isn't always the bottleneck**: Reducing from 4 to 2 intersections had zero impact, suggesting the real cost is elsewhere (likely `Prettify` at every nesting level or the recursive `InferType` calls).

7. **TypeScript may optimize intermediate parameters**: In recursive scenarios, intermediate type parameters might be cached, making inlining counterproductive.

### Attempt 5: Reorder InferType Dispatch Chain ❌ FAILED

**Change:** Reordered the `InferType` conditional chain to prioritize the most commonly used types:

**New order:**
1. object (most common container)
2. string (most common primitive)
3. ref (common for schema references)
4. array (common for collections)
5. union (common for polymorphic types)
6. integer, boolean (other common primitives)
7. record, params, null, token, unknown, bytes, cid-link, blob (less common)

**Previous order:**
1. record, object, array, params, union, token, ref, unknown, null, boolean, integer, string, bytes, cid-link, blob

```typescript
type InferType<T> = T extends { type: "object" }
  ? InferObject<T>
  : T extends { type: "string" }
    ? string
    : T extends { type: "ref" }
      ? InferRef<T>
      : T extends { type: "array" }
        ? InferArray<T>
        // ... rest of the chain
```

**Results:**
- Simple object: **244 instantiations** (unchanged)
- Complex nested: **507 instantiations** (unchanged)

**Why it failed:**
- TypeScript's type checker likely doesn't evaluate conditional chains linearly
- The order of conditionals has no impact on performance
- TypeScript may cache or optimize type instantiations internally regardless of order
- Tests pass, proving functional correctness, but zero performance benefit

**Action taken:** Kept the new order (it's more readable with common types first), but no performance gain.

## Next Potential Optimizations to Try

1. **Optimize `Prettify` itself** - Since it's called at every nesting level, making it more efficient could have cascading benefits
2. **Combine `GetRequired` and `GetNullable`** - Extract both in a single pass to reduce type instantiations
3. **Cache commonly used helper types** - Though previous attempts suggest this might not help
4. **Reduce Prettify calls** - Only call Prettify at the outermost level, not at every nesting
