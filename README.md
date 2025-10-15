# typed-lexicon

> [!WARNING]
> this project is in the middle of active initial development and not ready for
> use. there will be updates posted [here](https://bsky.app/profile/tylur.dev)
> if you'd like to follow along!

![demo of jsdoc with typed-lexicon](https://github.com/user-attachments/assets/1dbc0901-a950-4779-bf20-2e818456fd3c)

this will be a toolkit for writing lexicon json schema's in typescript and
providing types for lexicon data shape. it will:

- remove boilerplate and improve ergonomics
- type hint for
  [atproto type parameters](https://atproto.com/specs/lexicon#overview-of-types)
- infer the typescript type definitions for the data shape to avoid duplication
  and skew
- methods and a cli for generating json

With each of the above finished, i'll plan to write a `validate` method that
will be published alongside this that takes any lexicon json definition and
validates payloads off that.

My working hypothesis: it will be easier to write lexicons in typescript with a
single api, then validate based off the json definition, than it would be to
start with validation library types (standard-schema style) and attempt to use
those as the authoring and validation tools.

**what you'd write:**

```typescript
const profileNamespace = lx.namespace("app.bsky.actor.profile", {
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

---

<p align="center">
  <a href="https://github.com/tylersayshi/prototypey/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
  <a href="https://github.com/tylersayshi/prototypey/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
  <img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
</p>

## Usage

tbd

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then
[`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md). Thanks! 💖

<!-- You can remove this notice if you don't want it 🙂 no worries! -->

> 💝 This package was templated with
> [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app)
> using the [Bingo framework](https://create.bingo).
