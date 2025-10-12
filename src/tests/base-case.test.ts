import { expect, test } from "vitest";
import { lx } from "../lib.ts";

test("app.bsky.actor.profile", () => {
	const profileNamespace = lx.namespace("app.bsky.actor.profile", {
		main: lx.record({
			key: "self",
			record: lx.object({
				displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
				description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
			}),
		}),
	});

	expect(profileNamespace).toEqual({
		lexicon: 1,
		id: "app.bsky.actor.profile",
		defs: {
			main: {
				type: "record",
				key: "self",
				record: {
					type: "object",
					properties: {
						displayName: {
							type: "string",
							maxLength: 64,
							maxGraphemes: 64,
						},
						description: {
							type: "string",
							maxLength: 256,
							maxGraphemes: 256,
						},
					},
				},
			},
		},
	});
});
