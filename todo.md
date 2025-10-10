# typed-lexicon - Development TODO

## Project Goal

Build a toolkit for writing ATProto lexicon JSON schemas in TypeScript that:

- Removes boilerplate and improves ergonomics
- Provides type hints for
  [atproto type parameters](https://atproto.com/specs/lexicon#overview-of-types)
- Infers TypeScript type definitions for data shapes to avoid duplication and
  skew
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
  - https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/actor/defs.json
    (for `ref` examples)
  - https://github.com/bluesky-social/atproto/blob/main/lexicons/app/bsky/feed/defs.json
    (for `token` examples)

## Implementation Status

- ✅ Initial implementation of field types returning json definitions
- ✅ Bsky actor and feed test files created and passing
  (`tests/bsky-actor.test.ts` and `tests/bsky-feed.test.ts`)

## Todo

### CLI for JSON Emission

1. **Design CLI** - Determine command structure, flags, and output strategy
2. **Create JSON emission logic** - Traverse lexicon objects and serialize to
   formatted JSON
3. **Add file I/O** - Read TypeScript lexicon files, write JSON output files
4. **Write CLI documentation** - Usage examples, flag reference, common
   workflows

### Type Inference System

Infer TypeScript types from lexicon definitions

### `validate()`

validate any lexicon schema json at runtime
