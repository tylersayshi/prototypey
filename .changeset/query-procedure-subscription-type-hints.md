---
"prototypey": minor
---

Add type-level inference for `query`, `procedure`, and `subscription` lexicon types.

The `~infer` type on a lexicon now resolves `parameters`, `input`, `output`, and `message` bodies into the shapes you'd expect, so you can pull request/response types directly off the schema instead of hand-writing them.

```ts
const getUser = lx.lexicon("com.example.getUser", {
	main: lx.query({
		parameters: lx.params({
			did: lx.string({ required: true, format: "did" }),
		}),
		output: {
			encoding: "application/json",
			schema: lx.object({
				name: lx.string({ required: true }),
				bio: lx.string(),
			}),
		},
	}),
});

type GetUser = (typeof getUser)["~infer"];
// {
//   $type: "com.example.getUser"
//   parameters: { did: string }
//   output: { name: string; bio?: string | undefined }
// }
```
