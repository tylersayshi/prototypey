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

initial implementation of field types returning json definitions is done

## todo

write two new test files, one for bsky actor and another for bsky feed. i want to see these fully implemented and tested in separate files. then wait.
