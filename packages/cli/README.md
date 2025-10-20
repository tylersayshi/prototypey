# @prototypey/cli

CLI tool for generating types from ATProto lexicon schemas.

## Installation

```bash
npm install -g @prototypey/cli
```

Or use directly with npx:

```bash
npx @prototypey/cli
```

## Commands

### `gen-inferred`

Generate type-inferred TypeScript code from JSON lexicon schemas.

**Usage:**

```bash
prototypey gen-inferred <outdir> <schemas...>
```

**Arguments:**

- `outdir` - Output directory for generated TypeScript files
- `schemas...` - One or more glob patterns matching lexicon JSON schema files

**Example:**

```bash
prototypey gen-inferred ./generated/inferred ./lexicons/**/*.json
```

**What it does:**

- Reads ATProto lexicon JSON schemas
- Generates TypeScript types that match the schema structure
- Organizes output files by namespace (e.g., `app.bsky.feed.post` → `app/bsky/feed/post.ts`)
- Provides typescript definitions of the lexicons for inference and later: validation

### `gen-emit`

Emit JSON lexicon schemas from authored TypeScript files.

**Usage:**

```bash
prototypey gen-emit <outdir> <sources...>
```

**Arguments:**

- `outdir` - Output directory for emitted JSON schema files
- `sources...` - One or more glob patterns matching TypeScript source files

**Example:**

```bash
prototypey gen-emit ./lexicons ./src/lexicons/**/*.ts
```

**What it does:**

- Scans TypeScript files for exported lexicon definitions
- Extracts the `.json` property from each lexicon
- Emits properly formatted JSON lexicon schema files
- Names output files by lexicon ID (e.g., `app.bsky.feed.post.json`)

## Workflow

The typical workflow combines both commands for bidirectional type safety:

1. **Author lexicons in TypeScript** using the `prototypey` library
2. **Emit to JSON** with `gen-emit` for runtime validation and API contracts
3. **Generate inferred types** with `gen-inferred` for consuming code

```bash
# Write your lexicons in TypeScript
# src/lexicons/app.bsky.actor.profile.ts

# Emit JSON schemas
prototypey gen-emit ./schemas ./src/lexicons/**/*.ts

# Generate TypeScript types from schemas
prototypey gen-inferred ./generated ./schemas/**/*.json
```

## Requirements

- Node.js >= 20.19.0

## License

MIT
