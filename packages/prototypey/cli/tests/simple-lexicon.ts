import { lx } from "prototypey";

export const profileNamespace = lx.lexicon("app.bsky.actor.profile", {
	main: lx.record({
		key: "self",
		record: lx.object({
			displayName: lx.string({ maxLength: 64, maxGraphemes: 64 }),
			description: lx.string({ maxLength: 256, maxGraphemes: 256 }),
		}),
	}),
});
