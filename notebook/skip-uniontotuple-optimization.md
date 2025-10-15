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
