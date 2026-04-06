# prototypey

## 0.4.0

### Minor Changes

- b23cb32: Add support for permission-set lexicons with `lx.permissionSet()` and permission entry builders:
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

## 0.3.9

### Patch Changes

- 64d0fe4: update dependencies

## 0.3.8

### Patch Changes

- 7a19f90: releast changes from dep updates and #66

## 0.3.7

### Patch Changes

- e75de54: update docs

## 0.3.6

### Patch Changes

- 2b55317: fix exported type bug

## 0.3.5

### Patch Changes

- abb4b31: updated docs

## 0.3.4

### Patch Changes

- 3329654: fix for type of record key and description hint

## 0.3.3

### Patch Changes

- e7a7497: documentation update

## 0.3.2

### Patch Changes

- 6a6cae5: update deps

## 0.3.1

### Patch Changes

- d5d3143: update docs - we're featured!

## 0.3.0

### Minor Changes

- 91a8c84: generate prototypey lexicon utils from json definitions

## 0.2.6

### Patch Changes

- 6c5569b: only export intended items

## 0.2.5

### Patch Changes

- 15d5b7c: hide infer as ~infer

## 0.2.4

### Patch Changes

- 0b16bc3: use spaces for readme so npm doesn't format it weird

## 0.2.3

### Patch Changes

- 708fc60: fix loading of version in cli

## 0.2.2

### Patch Changes

- 0bb8603: moved cli into core library - no more @prototypey/cli separate
