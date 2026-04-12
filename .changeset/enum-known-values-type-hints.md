---
"prototypey": patch
---

Add type-level inference for `enum` and `knownValues` on string fields.

Strings with `enum` now infer as a union of the literal values; strings with `knownValues` infer as the literal union widened with `string & {}` so unlisted values are still accepted.
