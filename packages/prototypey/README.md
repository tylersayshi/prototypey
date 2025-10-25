# prototypey

A (soon-to-be) fully-featured sdk for developing lexicons with typescript.

## Installation

```bash
npm install prototypey
```

## Usage

Prototypey provides both a TypeScript library for authoring lexicons and a CLI for code generation.

### Authoring Lexicons

**what you'll write:**

```ts
const lex = lx.lexicon("app.bsky.actor.profile", {
  main: lx.record({
    key: "self",
    record: lx.object({
      displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
      description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
    }),
  }),
});
```

**generates to:**

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.profile",
  "defs": {
    "main": {
      "type": "record",
      "key": "self",
      "record": {
        "type": "object",
        "properties": {
          "displayName": {
            "type": "string",
            "maxLength": 64,
            "maxGraphemes": 64
          },
          "description": {
            "type": "string",
            "maxLength": 256,
            "maxGraphemes": 256
          }
        }
      }
    }
  }
}
```

you could also access the json definition with `lex.json()`.

### Runtime Validation

Prototypey provides runtime validation using [@atproto/lexicon](https://www.npmjs.com/package/@atproto/lexicon):

```ts
const lex = lx.lexicon("app.bsky.actor.profile", {
  main: lx.record({
    key: "self",
    record: lx.object({
      displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
      description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
    }),
  }),
});

// Validate data against the schema
const result = lex.validate({
  displayName: "Alice",
  description: "Software engineer",
});

if (result.success) {
  console.log("Valid data:", result.value);
} else {
  console.error("Validation error:", result.error);
}
```

**Validating against specific definitions:**

If your lexicon has multiple definitions, you can validate against a specific one:

```ts
const lex = lx.lexicon("app.bsky.feed.post", {
  user: lx.object({
    handle: lx.string({ required: true }),
    displayName: lx.string(),
  }),
  main: lx.record({
    key: "tid",
    record: lx.object({
      text: lx.string({ required: true }),
      author: lx.ref("#user", { required: true }),
    }),
  }),
});

// Validate against the "user" definition
const userResult = lex.validate(
  { handle: "alice.bsky.social", displayName: "Alice" },
  "user",
);

// Validate against "main" (default if not specified)
const postResult = lex.validate({
  text: "Hello world",
  author: { handle: "bob.bsky.social" },
});
```

### CLI Commands

The `prototypey` package includes a CLI with two main commands:

#### `gen-emit` - Emit JSON schemas from TypeScript

```bash
prototypey gen-emit <outdir> <sources...>
```

Extracts JSON schemas from TypeScript lexicon definitions.

**Example:**

```bash
prototypey gen-emit ./lexicons ./src/lexicons/**/*.ts
```

### Typical Workflow

1. Author lexicons in TypeScript using the library
2. Emit JSON schemas with `gen-emit` for runtime validation

**Recommended:** Add as a script to your `package.json`:

```json
{
  "scripts": {
    "lexicon:emit": "prototypey gen-emit ./schemas ./src/lexicons/**/*.ts"
  }
}
```

Then run:

```bash
npm run lexicon:emit
```

## State of the Project

**Done:**

- Full atproto spec lexicon authoring with in IDE docs & hints for each attribute (ts => json)
- CLI generates json from ts definitions
- CLI generates ts from json definitions
- Inferrance of valid type from full lexicon definition
  - the really cool part of this is that it fills in the refs from the defs all at the type level
- `lx.lexicon(...).validate(data)` for validating data using `@atproto/lexicon` and your lexicon definitions

**TODO/In Progress:**

- Library art! Please reach out if you'd be willing to contribute some drawings or anything!
- Add CLI support for inferring and validating from json as the starting point
- Please report bugs and feature requests!

## Disclaimer:

I'm considering how to use the json for validation (there will likely be some lazy-loading). For the cli,
files may need to adopt a convention so it's easy to determine what is an `lx.lexicon` and then generate out it's json and export it as a validator that lazy loads json to validate. (these are just ideas right now, but I want to share where we are now :)

Please give any and all feedback. I've not really written many lexicons much myself yet, so this project is at a point of "well I think this makes sense" 😂. Both the [issues page](https://github.com/tylersayshi/prototypey/issues) and [discussions](https://github.com/tylersayshi/prototypey/discussions) are open and ready for y'all 🙂.

---

> 💝 This package was templated with
> [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app)
> using the [Bingo framework](https://create.bingo).
