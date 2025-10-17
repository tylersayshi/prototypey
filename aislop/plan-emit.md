# Plan: Lexicon Emission for Prototypey

## Current State

- **Project**: Type-safe lexicon inference library (similar to Arktype's approach)
- **Structure**: TypeScript library with `src/`, `lib/` (compiled output), `samples/` (example JSON lexicons)
- **Build**: Uses `tsdown` for bundling, pnpm for package management

## Emission Strategy

### 1. Two-Track Approach

Since prototypey is about **type inference** from lexicons (not traditional codegen), we should support both:

#### Track A: Traditional Code Generation (compatibility)

- Install `@atproto/lex-cli` as a dev dependency
- Emit standard TypeScript files like other atproto projects
- Useful for projects that want traditional generated types

#### Track B: Type Inference (prototypey's core value)

- Leverage your existing inference engine (`src/infer.ts`)
- Generate minimal runtime code with inferred types
- This is your differentiator from standard atproto tooling

### 2. Directory Structure

```
prototypey/
├── lexicons/                    # NEW: Input lexicon schemas
│   └── (empty initially, users add their schemas here)
├── samples/                     # Keep existing samples
│   └── *.json
├── src/
│   ├── cli/                     # NEW: CLI tool for codegen
│   │   ├── index.ts            # Main CLI entry
│   │   ├── commands/
│   │   │   ├── gen-types.ts    # Track A: Standard codegen
│   │   │   └── gen-inferred.ts # Track B: Inference-based
│   │   └── templates/
│   └── ...existing code
├── generated/                   # NEW: Default output directory
│   ├── types/                   # Track A output
│   └── inferred/               # Track B output
└── package.json
```

### 3. CLI Commands

Add to `package.json`:

```json
{
	"bin": {
		"prototypey": "./lib/cli/index.js"
	},
	"scripts": {
		"codegen": "prototypey gen-inferred ./generated/inferred ./lexicons/**/*.json"
	}
}
```

Provide these commands:

- `prototypey gen-inferred <outdir> <schemas...>` - Generate type-inferred code (your unique approach)
- `prototypey gen-types <outdir> <schemas...>` - Generate standard TypeScript (delegates to @atproto/lex-cli)
- `prototypey init` - Initialize a new lexicon project with sample configs

### 4. Track B: Inferred Code Generation (Your Secret Sauce)

Generate minimal runtime code that leverages your inference:

```typescript
// Example output: generated/inferred/app/bsky/feed/post.ts
import type { Infer } from "prototypey";
import schema from "../../../../lexicons/app/bsky/feed/post.json" with { type: "json" };

export type Post = Infer<typeof schema>;

// Minimal runtime helpers
export const PostSchema = schema;
export const isPost = (v: unknown): v is Post => {
	return (
		typeof v === "object" &&
		v !== null &&
		"$type" in v &&
		v.$type === "app.bsky.feed.post"
	);
};
```

Benefits:

- **No validation code duplication** - reuse @atproto/lexicon at runtime
- **Type inference magic** - your core competency
- **Smaller bundle size** - minimal generated code
- **Simpler output** - easier to understand

### 5. Dependencies to Add

```json
{
	"dependencies": {
		"@atproto/lexicon": "^0.3.0"
	},
	"devDependencies": {
		"@atproto/lex-cli": "^0.9.1",
		"commander": "^12.0.0",
		"glob": "^10.0.0"
	},
	"peerDependencies": {
		"typescript": ">=5.0.0"
	}
}
```

### 6. Build Pipeline Integration

Update `package.json` scripts:

```json
{
	"scripts": {
		"build": "tsdown",
		"build:cli": "tsdown --entry src/cli/index.ts --format esm --dts false",
		"codegen:samples": "prototypey gen-inferred ./generated/samples ./samples/*.json",
		"prepack": "pnpm build && pnpm build:cli"
	}
}
```

### 7. Configuration File (optional)

`prototypey.config.json`:

```json
{
	"lexicons": "./lexicons",
	"output": {
		"inferred": "./generated/inferred",
		"types": "./generated/types"
	},
	"include": ["**/*.json"],
	"exclude": ["**/node_modules/**"]
}
```

### 8. Documentation Updates

Create docs for:

1. **Quick Start**: How to run codegen on your lexicons
2. **Track Comparison**: When to use inferred vs. standard generation
3. **Migration Guide**: Moving from @atproto/lex-cli to prototypey
4. **Type Inference Deep Dive**: How your inference works (marketing!)

## Key Differentiators

### Prototypey's Unique Value

1. **Compile-time type inference** - No runtime validation code needed
2. **Smaller bundles** - Minimal generated code
3. **Better DX** - Types are inferred, not generated boilerplate
4. **Same safety guarantees** - Full TypeScript type checking

### vs. Standard @atproto/lex-cli

- **Standard**: Generates verbose validation code
- **Prototypey**: Generates minimal code + type inference
- **Both**: Same type safety, but prototypey is leaner

## Implementation Priority

1. ✅ **Phase 1**: Basic CLI structure + Track B (inferred generation) - COMPLETE
2. ✅ **Phase 2**: File organization + output directory structure - COMPLETE
3. ✅ **Phase 3**: Convert to pnpm workspaces monorepo - COMPLETE - this was marked complete but we still have src and packages
4. **Phase 4**: Track A (standard generation, delegate to lex-cli)
5. **Phase 5**: Configuration file support
6. **Phase 6**: Documentation + examples

## Phase 1 & 2 Implementation Notes

### ✅ Completed (2025-10-16)

**Tech Stack Choices:**

- Used `sade` instead of `commander` (modern, minimal CLI framework from awesome-e18e)
- Used `tinyglobby` instead of `glob` (faster, modern alternative)
- Built with `tsdown` for CLI bundling

**Structure Created:**

```
prototypey/
├── src/cli/
│   ├── index.ts                  # CLI entry with sade
│   ├── commands/
│   │   └── gen-inferred.ts       # Track B implementation
│   └── templates/
│       └── inferred.ts           # Code generation template
├── generated/
│   └── inferred/                 # Generated type files
├── lexicons/                     # Input directory (empty, ready for user schemas)
└── lib/cli/                      # Built CLI output
```

**Generated Code Pattern:**

```typescript
// generated/inferred/app/bsky/actor/profile.ts
import type { Infer } from "prototypey";
import schema from "../../../../../samples/demo.json" with { type: "json" };

export type Profile = Infer<typeof schema>;
export const ProfileSchema = schema;
export function isProfile(v: unknown): v is Profile { ... }
```

**CLI Usage:**

```bash
# Build CLI
pnpm build:cli

# Generate from samples
pnpm codegen:samples

# Direct usage
node lib/cli/index.js gen-inferred ./generated/inferred './samples/*.json'
```

**Key Features:**

- Converts NSID to file paths: `app.bsky.feed.post` → `app/bsky/feed/post.ts`
- Generates minimal runtime code with type inference
- Auto-creates directory structure
- Skips invalid schemas gracefully
- Type guard functions for runtime checks

**Testing:**

- Successfully generated types from sample lexicons
- Runtime validation works (tested with node)
- Schema imports work correctly with JSON modules

## Phase 3: Monorepo Strategy

### Why Monorepo?

The CLI tool should be a separate package from the core inference library for several reasons:

1. **Separation of concerns**: Core inference types vs. code generation tooling
2. **Dependency isolation**: CLI needs `sade`, `tinyglobby`, etc. - consumers of the core library don't
3. **Bundle size**: Users importing just types don't want CLI bloat
4. **Independent versioning**: CLI can evolve separately from type inference
5. **Better organization**: Clear boundaries between runtime and build-time code

### Proposed Structure

```
prototypey/
├── package.json                     # Root workspace config
├── pnpm-workspace.yaml             # Workspace definition
├── packages/
│   ├── prototypey/                 # Core inference library
│   │   ├── package.json           # Main package (prototypey)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── infer.ts
│   │   │   ├── lib.ts
│   │   │   └── type-utils.ts
│   │   ├── lib/                   # Built output
│   │   └── tests/
│   │
│   └── cli/                        # CLI package
│       ├── package.json           # Separate package (@prototypey/cli)
│       ├── src/
│       │   ├── index.ts
│       │   ├── commands/
│       │   │   └── gen-inferred.ts
│       │   └── templates/
│       │       └── inferred.ts
│       └── lib/                   # Built CLI output
│
├── samples/                        # Shared samples
├── generated/                      # Generated output (gitignored)
└── lexicons/                       # Input lexicons (gitignored)
```

### Package Configurations

**Root `pnpm-workspace.yaml`:**

```yaml
packages:
  - "packages/*"
```

**Root `package.json`:**

```json
{
	"name": "prototypey-monorepo",
	"private": true,
	"scripts": {
		"build": "pnpm -r build",
		"test": "pnpm -r test",
		"lint": "pnpm -r lint",
		"format": "prettier . --write"
	}
}
```

**`packages/prototypey/package.json`:**

```json
{
	"name": "prototypey",
	"version": "0.0.0",
	"main": "lib/index.js",
	"exports": {
		".": "./lib/index.js",
		"./infer": "./lib/infer.js"
	},
	"dependencies": {},
	"scripts": {
		"build": "tsdown",
		"test": "vitest run"
	}
}
```

**`packages/cli/package.json`:**

```json
{
	"name": "@prototypey/cli",
	"version": "0.0.0",
	"bin": {
		"prototypey": "./lib/index.js"
	},
	"dependencies": {
		"prototypey": "workspace:*",
		"sade": "^1.8.1",
		"tinyglobby": "^0.2.15"
	},
	"scripts": {
		"build": "tsdown --entry src/index.ts --format esm --dts false"
	}
}
```

### Migration Steps

1. Create `pnpm-workspace.yaml` at root
2. Create `packages/prototypey/` and move core files
3. Create `packages/cli/` and move CLI files
4. Update import paths in CLI to use `prototypey` package
5. Update root `package.json` to be private workspace root
6. Update build scripts to use `pnpm -r` (recursive)
7. Test both packages build independently
8. Update documentation

### Benefits

- **Cleaner dependency tree**: Core has zero dependencies
- **Better DX**: Users can `npm install prototypey` for types only
- **CLI as optional tool**: `npm install -D @prototypey/cli` when needed
- **Easier testing**: Each package can have its own test suite
- **Future expansion**: Easy to add more packages (e.g., `@prototypey/validator`)

## ATProto Lexicon Background Research

### Official Tooling: @atproto/lex-cli

ATProto projects use **lexicon schemas** (JSON files) to define data structures, API endpoints, and event streams. These schemas are then automatically transformed into type-safe TypeScript code using the **@atproto/lex-cli** code generation tool.

#### Installation

```bash
npm install @atproto/lex-cli
```

#### Available Commands

- **`lex gen-api <outdir> <schemas...>`** - Generate TypeScript client API
- **`lex gen-server <outdir> <schemas...>`** - Generate TypeScript server API
- **`lex gen-ts-obj <schemas...>`** - Generate a TS file that exports an array of schemas
- **`lex gen-md <schemas...>`** - Generate markdown documentation
- **`lex new [options] <nsid> [outfile]`** - Create a new schema JSON file

#### Common Options

- **`--yes`** - Auto-confirm overwrites during generation

### Typical Project Structure

```
project-root/
├── lexicons/                          # Input: JSON schema definitions
│   ├── com/
│   │   └── atproto/
│   │       ├── repo/
│   │       │   ├── getRecord.json
│   │       │   └── createRecord.json
│   │       └── server/
│   │           └── defs.json
│   └── app/
│       └── bsky/
│           ├── feed/
│           │   └── post.json
│           └── richtext/
│               └── facet.json
├── src/
│   ├── client/                        # Output: Generated client code
│   │   └── types/
│   │       ├── com/
│   │       │   └── atproto/
│   │       │       └── repo/
│   │       │           └── getRecord.ts
│   │       └── app/
│   │           └── bsky/
│   │               └── richtext/
│   │                   └── facet.ts
│   └── lexicon/                       # Output: Generated server code
└── package.json
```

### Naming Conventions

**NSIDs (Namespaced Identifiers)**:

- Format: Reverse-DNS + name (e.g., `com.atproto.repo.getRecord`)
- Domain authority: `com.atproto` (reverse DNS of `atproto.com`)
- Name segment: `getRecord`
- File path mirrors NSID: `lexicons/com/atproto/repo/getRecord.json`

**Definition Naming**:

- Records: Single nouns, not pluralized (e.g., `post`, `profile`)
- XRPC methods: verbNoun format (e.g., `getProfile`, `createRecord`)
- Shared definitions: Use `*.defs` lexicons (e.g., `com.atproto.server.defs`)

### Generated TypeScript Code Structure

The generated TypeScript file includes:

1. **TypeScript Interfaces** with explicit `$type` properties
2. **Type Guard Functions** (`is*`) for runtime type checking
3. **Validation Functions** (`validate*`) for schema validation

Example:

```typescript
/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult, BlobRef } from "@atproto/lexicon";
import { lexicons } from "../../../../lexicons";
import { isObj, hasProp } from "../../../../util";
import { CID } from "multiformats/cid";

export interface Main {
	$type?: "app.bsky.richtext.facet";
	index: ByteSlice;
	features: (Mention | Link | Tag | { $type: string; [k: string]: unknown })[];
	[k: string]: unknown;
}

export function isMain(v: unknown): v is Main {
	return (
		isObj(v) &&
		hasProp(v, "$type") &&
		(v.$type === "app.bsky.richtext.facet#main" ||
			v.$type === "app.bsky.richtext.facet")
	);
}

export function validateMain(v: unknown): ValidationResult {
	return lexicons.validate("app.bsky.richtext.facet#main", v);
}
```

### Build Scripts & Integration

Example `package.json` scripts:

```json
{
	"scripts": {
		"codegen": "lex gen-api --yes ./src/client ../../lexicons/com/atproto/*/* ../../lexicons/app/bsky/*/*",
		"build": "tsc --build tsconfig.build.json"
	},
	"devDependencies": {
		"@atproto/lex-cli": "^0.9.1"
	}
}
```

### Best Practices

1. **Use reverse-DNS NSIDs** for your domain (e.g., `com.example.*`)
2. **Group related schemas** by namespace hierarchy
3. **Create `*.defs` lexicons** for shared definitions used across multiple schemas
4. **Store lexicons in `/lexicons` directory** at repository root
5. **Mirror NSID structure in filesystem** (e.g., `lexicons/com/example/thing.json`)
6. **Run codegen before build** in your npm scripts
7. **Generate to predictable directories** (e.g., `./src/client`, `./src/lexicon`)

### Schema Evolution Rules

1. **New fields must be optional** to maintain backward compatibility
2. **Cannot remove non-optional fields** without breaking changes
3. **Cannot change field types** without creating new lexicon
4. **Cannot rename fields** - must deprecate and add new field
5. **Breaking changes require new NSID** (e.g., `v2` suffix)

### Type Categories in Lexicons

#### Primary Types (one per file)

- **record** - Repository-stored objects
- **query** - XRPC HTTP GET endpoints
- **procedure** - XRPC HTTP POST endpoints
- **subscription** - WebSocket event streams

#### Field Types

- **Primitives**: null, boolean, integer, string, bytes
- **Special**: cid-link, blob, unknown
- **Structures**: array, object, params
- **References**: ref, union, token

### Real-World Examples

- **Official ATProto Repository**: https://github.com/bluesky-social/atproto
  - Lexicons: `/lexicons/com/atproto/*`, `/lexicons/app/bsky/*`
  - Generated Client: `/packages/api/src/client/`
  - Generated Server: `/packages/pds/src/lexicon/`

## Next Steps

Start with **Phase 1** - building the CLI and the inferred code generation, since that's prototypey's core differentiator.
