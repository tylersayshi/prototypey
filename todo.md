# typed-lexicon - Development TODO

## Project Goal

Build a toolkit for writing ATProto lexicon JSON schemas in TypeScript that:

- Removes boilerplate and improves ergonomics
- Provides type hints for [atproto type parameters](https://atproto.com/specs/lexicon#overview-of-types)
- Infers TypeScript type definitions for data shapes to avoid duplication and skew
- Includes methods and a CLI for generating JSON

## Files to Read

When working on this project, always reference:

1. **`lib.ts`** - Main implementation file with all `lx.*` methods
2. **`tests/primitives.test.ts`** - Tests for all implemented types
3. **`tests/base-case.test.ts`** - Example usage test
4. **`README.md`** - Project direction and example usage

## Essential Resources

When implementing new lexicon types, fetch from:

- **Main spec**: https://atproto.com/specs/lexicon#overview-of-types
- **Data model**: https://atproto.com/specs/data-model
- **ATProto lexicon examples**:
  - https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/defs.json (for `ref` examples)
  - https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/defs.json (for `token` examples)

## Implementation Status

### ✅ Completed Types

**Concrete types:**

- `null` - No options
- `boolean` - Options: `default`, `const`
- `integer` - Options: `minimum`, `maximum`, `enum`, `default`, `const`
- `string` - Options: `format`, `maxLength`, `minLength`, `maxGraphemes`, `minGraphemes`, `knownValues`, `enum`, `default`, `const`
- `bytes` - Options: `minLength`, `maxLength`
- `cid-link` - Takes a `link` parameter (CID string), returns `{ type: "cid-link", $link: link }`
- `blob` - Options: `accept` (MIME types), `maxSize`

**Container types:**

- `array` - Required: `items`, Options: `minLength`, `maxLength`
- `object` - Required: `properties`, Options: `required`, `nullable`
- `params` - Required: `properties`, Options: `required`, Limited property types: `boolean`, `integer`, `string`, `unknown`, `array`

**Meta types:**

- `token` - Takes `description` parameter
- `ref` - Takes `ref` parameter (can be local `#name` or external `namespace#name`)
- `union` - Required: `refs`, Optional: `closed` (defaults to false)
- `unknown` - No options

**Primary types:**

- `record` - Required: `key`, `record`
- `query` - Optional: `description`, `parameters`, `output`, `errors`
- `procedure` - Optional: `description`, `parameters`, `input`, `output`, `errors`

### ❌ TODO: Remaining Types

**Primary types:**

- [ ] `subscription` - Optional: `description`, `parameters`, `message`, `errors`

## Implementation Pattern

When adding a new type:

1. **Check the spec** - Fetch the ATProto lexicon spec for the type's properties
2. **Look at real examples** - Search the bluesky-social/atproto repo for actual usage
3. **Add to `lib.ts`**:
   - Create interface for options (if needed)
   - Add method to `lx` object with proper TypeScript generics
   - Follow naming convention: camelCase method names (e.g., `cidLink` for `cid-link`)
4. **Add tests to `tests/primitives.test.ts`**:
   - Basic usage test
   - Tests with common options
   - Real-world example tests based on ATProto usage
5. **Run tests**: `deno test`

## Current Task

Working through remaining types in order of complexity:

- `subscription` (final primary type) - pending
