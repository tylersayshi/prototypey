---
"prototypey": minor
---

Add support for permission-set lexicons with `lx.permissionSet()` and permission entry builders:

- `lx.repoPermission()`
- `lx.rpcPermission()`
- `lx.blobPermission()`
- `lx.accountPermission()`
- `lx.identityPermission()`

Collections and endpoints accept both lexicon schema objects and plain NSID strings.

```ts
const authCore = lx.lexicon("com.example.authCore", {
  main: lx.permissionSet({
    title: "Example: Core functionality",
    detail: "The core functionality for Example",
    permissions: [
      lx.repoPermission({
        collection: [myRecord, "com.example.otherRecord"],
        action: ["create", "update"],
      }),
      lx.rpcPermission({
        lxm: [myProcedure],
        aud: "did:web:example.com",
      }),
      lx.blobPermission({
        accept: ["image/*"],
      }),
    ],
  }),
});
```
