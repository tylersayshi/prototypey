---
"prototypey": major
---

**BREAKING:** `gen-emit` now writes schemas into a nested directory structure based on each lexicon's NSID (e.g. `com/atproto/repo/strongRef.json` instead of `com.atproto.repo.strongRef.json`). The previous flat dot-separated layout has been removed.

This is the layout expected by [goat](https://github.com/bluesky-social/goat), [lex](https://github.com/bluesky-social/atproto/tree/main/packages/lex/lex), [lpm](https://github.com/lexicon-community/lpm), and other tooling in the atproto ecosystem.
