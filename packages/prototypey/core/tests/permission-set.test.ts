import { expect, test } from "vitest";
import { lx } from "../lib.ts";

test("permission-set with repo permissions", () => {
	const recordA = lx.lexicon("com.example.recordA", {
		main: lx.record({
			key: "tid",
			record: lx.object({ name: lx.string({ required: true }) }),
		}),
	});

	const recordB = lx.lexicon("com.example.recordB", {
		main: lx.record({
			key: "tid",
			record: lx.object({ value: lx.integer() }),
		}),
	});

	const authCore = lx.lexicon("com.example.authCore", {
		main: lx.permissionSet({
			title: "Example: Core functionality",
			detail: "The core functionality for Example",
			permissions: [
				lx.repoPermission({
					collection: [recordA],
					action: ["create"],
				}),
				lx.repoPermission({
					collection: [recordB, "com.example.recordC"],
					action: ["create", "update", "delete"],
				}),
			],
		}),
	});

	expect(authCore.json).toEqual({
		lexicon: 1,
		id: "com.example.authCore",
		defs: {
			main: {
				type: "permission-set",
				key: "literal:self",
				title: "Example: Core functionality",
				detail: "The core functionality for Example",
				permissions: [
					{
						type: "permission",
						resource: "repo",
						collection: ["com.example.recordA"],
						action: ["create"],
					},
					{
						type: "permission",
						resource: "repo",
						collection: ["com.example.recordB", "com.example.recordC"],
						action: ["create", "update", "delete"],
					},
				],
			},
		},
	});
});

test("permission-set with rpc permissions", () => {
	const endpoint = lx.lexicon("com.example.doThing", {
		main: lx.procedure({
			input: { encoding: "application/json" },
		}),
	});

	const permSet = lx.lexicon("com.example.rpcPerms", {
		main: lx.permissionSet({
			title: "RPC permissions",
			detail: "Grants access to call endpoints",
			permissions: [
				lx.rpcPermission({
					lxm: [endpoint],
					aud: "did:web:example.com",
				}),
				lx.rpcPermission({
					lxm: ["com.example.otherEndpoint"],
					inheritAud: true,
				}),
			],
		}),
	});

	expect(permSet.json.defs.main.permissions).toEqual([
		{
			type: "permission",
			resource: "rpc",
			lxm: ["com.example.doThing"],
			aud: "did:web:example.com",
		},
		{
			type: "permission",
			resource: "rpc",
			lxm: ["com.example.otherEndpoint"],
			inheritAud: true,
		},
	]);
});

test("permission-set with blob permission", () => {
	const permSet = lx.lexicon("com.example.blobPerms", {
		main: lx.permissionSet({
			title: "Blob permissions",
			detail: "Grants blob upload access",
			permissions: [
				lx.blobPermission({
					accept: ["image/*", "video/mp4"],
				}),
			],
		}),
	});

	expect(permSet.json.defs.main.permissions[0]).toEqual({
		type: "permission",
		resource: "blob",
		accept: ["image/*", "video/mp4"],
	});
});

test("permission-set with account permission", () => {
	const permSet = lx.lexicon("com.example.accountPerms", {
		main: lx.permissionSet({
			title: "Account permissions",
			detail: "Grants account access",
			permissions: [
				lx.accountPermission({
					attr: "email",
					action: "read",
				}),
				lx.accountPermission({
					attr: "repo",
				}),
			],
		}),
	});

	expect(permSet.json.defs.main.permissions).toEqual([
		{
			type: "permission",
			resource: "account",
			attr: "email",
			action: "read",
		},
		{
			type: "permission",
			resource: "account",
			attr: "repo",
		},
	]);
});

test("permission-set with identity permission", () => {
	const permSet = lx.lexicon("com.example.identityPerms", {
		main: lx.permissionSet({
			title: "Identity permissions",
			detail: "Grants identity access",
			permissions: [
				lx.identityPermission({
					attr: "handle",
				}),
			],
		}),
	});

	expect(permSet.json.defs.main.permissions[0]).toEqual({
		type: "permission",
		resource: "identity",
		attr: "handle",
	});
});

test("permission-set with i18n fields", () => {
	const permSet = lx.lexicon("com.example.i18nPerms", {
		main: lx.permissionSet({
			title: "My App: Core",
			"title:lang": {
				es: "Mi App: Núcleo",
				fr: "Mon App: Noyau",
			},
			detail: "Core functionality",
			"detail:lang": {
				es: "Funcionalidad principal",
				fr: "Fonctionnalité principale",
			},
			permissions: [
				lx.repoPermission({
					collection: ["com.example.post"],
					action: ["create"],
				}),
			],
		}),
	});

	expect(permSet.json.defs.main).toMatchObject({
		title: "My App: Core",
		"title:lang": {
			es: "Mi App: Núcleo",
			fr: "Mon App: Noyau",
		},
		detail: "Core functionality",
		"detail:lang": {
			es: "Funcionalidad principal",
			fr: "Fonctionnalité principale",
		},
	});
});

test("permission-set validation is not supported by @atproto/lexicon yet", () => {
	const permSet = lx.lexicon("com.example.noValidate", {
		main: lx.permissionSet({
			title: "Test",
			detail: "Test",
			permissions: [],
		}),
	});

	// @atproto/lexicon doesn't support permission-set validation yet
	expect(() => permSet.validate({})).toThrow();
});
