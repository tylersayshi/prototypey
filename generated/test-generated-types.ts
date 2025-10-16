// Test file to verify generated types work correctly
import type { Profile } from "./inferred/app/bsky/actor/profile.js";
import type { Defs } from "./inferred/app/bsky/actor/defs.js";
import { isProfile } from "./inferred/app/bsky/actor/profile.js";
import { isDefs } from "./inferred/app/bsky/actor/defs.js";

// Test that the types are inferred correctly
const profile: Profile = {
	$type: "app.bsky.actor.profile",
	displayName: "Tyler",
	description: "Building cool stuff",
};

// Test type guard
const unknownValue: unknown = { $type: "app.bsky.actor.defs" };
if (isDefs(unknownValue)) {
	// Type should be narrowed to Defs
	const defs: Defs = unknownValue;
	console.log("Is Defs:", defs.$type);
}

console.log("Types work! ✓");
console.log("Profile:", profile);
