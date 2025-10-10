# typed-lexicon

> [!WARNING]
> this project is in the middle of active initial development and not ready for
> use. there will be updates posted [here](https://bsky.app/profile/tylur.dev)
> if you'd like to follow along! or checkout the [todo.md](./todo.md)

<video
autoplay
loop
controls
playsinline
muted
disablepictureinpicture
src="https://github.com/user-attachments/assets/1dbc0901-a950-4779-bf20-2e818456fd3c"
/>

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
