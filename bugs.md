# Bugs Found in Type Inference System

## Critical Bugs

### 1. Required Fields Not Working (src/infer.ts)
**Location**: `InferObject` type in src/infer.ts:39-63

**Issue**: Fields marked with `required: true` are still inferred as optional (`field?: type | undefined`) instead of required (`field: type`).

**Examples**:
- Test: "InferType handles boolean primitive"
  - Expected: `hasAccess: boolean`
  - Actual: `hasAccess?: boolean | undefined`

- Test: "InferObject handles all required fields"
  - All fields marked as required are inferred as optional

- Test: "InferObject handles mixed optional and required fields"
  - `id` and `name` marked as required but inferred as optional

**Root Cause**: The `InferObject` type appears to extract required fields from a `required` array property, but `lx.object()` generates the required array at the object level, not as a type-level extraction from individual properties' `required: true` flags.

**Related Code**:
- src/lib.ts:461-478 (`lx.object` function)
- src/infer.ts:36-63 (`InferObject` type)

---

### 2. Nullable Fields Not Working (src/infer.ts)
**Location**: `InferObject` type in src/infer.ts:39-63

**Issue**: Fields marked with `nullable: true` do not include `| null` in their union type.

**Examples**:
- Test: "InferObject handles nullable optional field"
  - Expected: `description?: string | null | undefined`
  - Actual: `description?: string | undefined`

- Test: "InferObject handles multiple nullable fields"
  - All nullable fields missing `| null` in their type

- Test: "InferObject handles nullable and required field"
  - Expected: `value: string | null`
  - Actual: `value?: string | undefined`

**Root Cause**: Similar to required fields, the `nullable` array extraction doesn't match how the runtime `lx.object()` function generates the schema.

---

### 3. Nested Objects Completely Broken (src/infer.ts)
**Location**: `InferObject` type in src/infer.ts:39-63

**Issue**: When an object contains another object as a property (using `lx.object()` nested inside another `lx.object()`), the type inference produces `{ [x: string]: undefined }` instead of the actual nested object structure.

**Examples**:
- Test: "InferObject handles nested objects"
  - Expected: `user?: { name: string; email: string } | undefined`
  - Actual: `{ [x: string]: undefined }`

- Test: "InferObject handles deeply nested objects"
  - All nested structure lost, only `{ [x: string]: undefined }`

- Test: "InferObject handles complex nested structure"
  - Entire complex structure collapses to `{ [x: string]: undefined }`

**Root Cause**: The `InferType` type doesn't handle the case where a property is an `ObjectResult<T>` type (the return type of `lx.object()`). It only checks for `{ type: "object" }`, but `lx.object()` returns a more complex structure with `properties`, `required`, and `nullable` fields.

**TypeScript Errors**: This also causes TypeScript compilation errors:
```
Type 'ObjectResult<...>' is not assignable to type 'LexiconItem'.
Types of property 'required' are incompatible.
```

---

### 4. Arrays of Objects Don't Work (src/infer.ts)
**Location**: `InferArray` and `InferType` interaction

**Issue**: Arrays containing objects (created with `lx.array(lx.object({...}))`) infer as `never[]` instead of the correct object array type.

**Example**:
- Test: "InferArray handles arrays of objects"
  - Expected: `users?: { id: string; name: string }[] | undefined`
  - Actual: `users?: never[] | undefined`

**Root Cause**: Related to bug #3 - since nested objects aren't recognized properly, arrays of these unrecognized objects become `never[]`.

---

### 5. Params Type Returns Empty Object (src/infer.ts)
**Location**: `InferParams` type in src/infer.ts:81-83

**Issue**: The `params` type (created with `lx.params({...})`) infers as an empty object `{}` instead of containing the defined properties.

**Examples**:
- Test: "InferParams handles basic params"
  - Expected: `{ limit?: number | undefined; offset?: number | undefined }`
  - Actual: `{}`

- Test: "InferParams handles required params"
  - Expected: `{ limit?: number | undefined; query: string }`
  - Actual: `{}`

**Root Cause**: `InferParams` type is defined as:
```typescript
type InferParams<T> = T extends { properties: infer P }
	? InferObject<P>
	: never;
```
But it should be `InferObject<T>` since params have the same structure as objects.

---

### 6. Record Type Doesn't Respect Required Fields (src/infer.ts)
**Location**: `InferRecord` type in src/infer.ts:85-91

**Issue**: Records with required fields still show all fields as optional.

**Example**:
- Test: "InferRecord handles record with object schema"
  - Expected: `{ title: string; content: string; published?: boolean | undefined }`
  - Actual: `{ title?: string | undefined; content?: string | undefined; published?: boolean | undefined }`

**Root Cause**: Combination of bug #1 (required fields) affecting records.

---

## Minor Bugs

### 7. Uint8Array Type Display Inconsistency
**Location**: Type stringification

**Issue**: `Uint8Array` displays as `Uint8Array<ArrayBufferLike>` instead of just `Uint8Array`.

**Example**:
- Test: "InferType handles bytes primitive"
  - Expected: `data?: Uint8Array | undefined`
  - Actual: `data?: Uint8Array<ArrayBufferLike> | undefined`

**Impact**: Low - this is a cosmetic issue with how TypeScript stringifies the type, not a functional bug.

---

### 8. Unknown Arrays Include Undefined When They Shouldn't
**Location**: Type union generation

**Issue**: Arrays of `unknown` type include `| undefined` when the test expects them not to.

**Example**:
- Test: "InferArray handles unknown arrays"
  - Expected: `items?: unknown[]`
  - Actual: `items?: unknown[] | undefined`

**Impact**: Low - arguably the actual behavior might be more correct, as optional properties can be undefined.

---

## Summary

**Total Bugs**: 8 (6 critical, 2 minor)

**Most Critical Issues**:
1. Required fields mechanism completely broken
2. Nullable fields mechanism completely broken
3. Nested objects completely broken
4. Params type broken

**Tests Failing**: 25 out of 39 tests failed

**Tests Passing**: 14 tests (mostly simple primitive types and arrays of primitives)

**Recommended Fix Priority**:
1. Fix nested objects recognition (bug #3) - this is blocking many other tests
2. Fix required fields extraction (bug #1)
3. Fix nullable fields extraction (bug #2)
4. Fix params type inference (bug #5)
5. Fix arrays of objects (bug #4) - may be automatically fixed by #3
6. Fix record required fields (bug #6) - may be automatically fixed by #1
