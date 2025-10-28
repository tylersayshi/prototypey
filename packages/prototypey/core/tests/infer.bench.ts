import { bench } from "@ark/attest";
import { lx } from "../lib.ts";
import { fromJSON } from "../lib.ts";

bench("infer with simple object", () => {
	const schema = lx.lexicon("test.simple", {
		main: lx.object({
			id: lx.string({ required: true }),
			name: lx.string({ required: true }),
		}),
	});
	return schema["~infer"];
}).types([748, "instantiations"]);

bench("infer with complex nested structure", () => {
	const schema = lx.lexicon("test.complex", {
		user: lx.object({
			handle: lx.string({ required: true }),
			displayName: lx.string(),
		}),
		reply: lx.object({
			text: lx.string({ required: true }),
			author: lx.ref("#user", { required: true }),
		}),
		main: lx.record({
			key: "tid",
			record: lx.object({
				author: lx.ref("#user", { required: true }),
				replies: lx.array(lx.ref("#reply")),
				content: lx.string({ required: true }),
				createdAt: lx.string({ required: true, format: "datetime" }),
			}),
		}),
	});
	return schema["~infer"];
}).types([1047, "instantiations"]);

bench("infer with circular reference", () => {
	const ns = lx.lexicon("test", {
		user: lx.object({
			name: lx.string({ required: true }),
			posts: lx.array(lx.ref("#post")),
		}),
		post: lx.object({
			title: lx.string({ required: true }),
			author: lx.ref("#user", { required: true }),
		}),
		main: lx.object({
			users: lx.array(lx.ref("#user")),
		}),
	});
	return ns["~infer"];
}).types([699, "instantiations"]);

bench("infer with app.bsky.feed.defs lexicon", () => {
	const schema = lx.lexicon("app.bsky.feed.defs", {
		viewerState: lx.object({
			repost: lx.string({ format: "at-uri" }),
			like: lx.string({ format: "at-uri" }),
			bookmarked: lx.boolean(),
			threadMuted: lx.boolean(),
			replyDisabled: lx.boolean(),
			embeddingDisabled: lx.boolean(),
			pinned: lx.boolean(),
		}),
		main: lx.object({
			uri: lx.string({ required: true, format: "at-uri" }),
			cid: lx.string({ required: true, format: "cid" }),
			author: lx.ref("app.bsky.actor.defs#profileViewBasic", {
				required: true,
			}),
			record: lx.unknown({ required: true }),
			embed: lx.union([
				"app.bsky.embed.images#view",
				"app.bsky.embed.video#view",
				"app.bsky.embed.external#view",
				"app.bsky.embed.record#view",
				"app.bsky.embed.recordWithMedia#view",
			]),
			bookmarkCount: lx.integer(),
			replyCount: lx.integer(),
			repostCount: lx.integer(),
			likeCount: lx.integer(),
			quoteCount: lx.integer(),
			indexedAt: lx.string({ required: true, format: "datetime" }),
			viewer: lx.ref("#viewerState"),
			labels: lx.array(lx.ref("com.atproto.label.defs#label")),
			threadgate: lx.ref("#threadgateView"),
		}),
		requestLess: lx.token(
			"Request that less content like the given feed item be shown in the feed",
		),
		requestMore: lx.token(
			"Request that more content like the given feed item be shown in the feed",
		),
		clickthroughItem: lx.token("User clicked through to the feed item"),
		clickthroughAuthor: lx.token(
			"User clicked through to the author of the feed item",
		),
		clickthroughReposter: lx.token(
			"User clicked through to the reposter of the feed item",
		),
		clickthroughEmbed: lx.token(
			"User clicked through to the embedded content of the feed item",
		),
		contentModeUnspecified: lx.token(
			"Declares the feed generator returns any types of posts.",
		),
		contentModeVideo: lx.token(
			"Declares the feed generator returns posts containing app.bsky.embed.video embeds.",
		),
		interactionSeen: lx.token("Feed item was seen by user"),
		interactionLike: lx.token("User liked the feed item"),
		interactionRepost: lx.token("User reposted the feed item"),
		interactionReply: lx.token("User replied to the feed item"),
		interactionQuote: lx.token("User quoted the feed item"),
		interactionShare: lx.token("User shared the feed item"),
	});
	return schema["~infer"];
}).types([1292, "instantiations"]);

bench("fromJSON infer with simple object", () => {
	const schema = fromJSON({
		id: "test.simple",
		defs: {
			main: {
				type: "object",
				properties: {
					id: { type: "string", required: true },
					name: { type: "string", required: true },
				},
				required: ["id", "name"],
			},
		},
	});
	return schema["~infer"];
}).types([477, "instantiations"]);

bench("fromJSON infer with complex nested structure", () => {
	const schema = fromJSON({
		id: "test.complex",
		defs: {
			user: {
				type: "object",
				properties: {
					handle: { type: "string", required: true },
					displayName: { type: "string" },
				},
				required: ["handle"],
			},
			reply: {
				type: "object",
				properties: {
					text: { type: "string", required: true },
					author: { type: "ref", ref: "#user", required: true },
				},
				required: ["text", "author"],
			},
			main: {
				type: "record",
				key: "tid",
				record: {
					type: "object",
					properties: {
						author: { type: "ref", ref: "#user", required: true },
						replies: { type: "array", items: { type: "ref", ref: "#reply" } },
						content: { type: "string", required: true },
						createdAt: {
							type: "string",
							required: true,
							format: "datetime",
						},
					},
					required: ["author", "content", "createdAt"],
				},
			},
		},
	});
	return schema["~infer"];
}).types([538, "instantiations"]);

bench("fromJSON infer with circular reference", () => {
	const ns = fromJSON({
		id: "test",
		defs: {
			user: {
				type: "object",
				properties: {
					name: { type: "string", required: true },
					posts: { type: "array", items: { type: "ref", ref: "#post" } },
				},
				required: ["name"],
			},
			post: {
				type: "object",
				properties: {
					title: { type: "string", required: true },
					author: { type: "ref", ref: "#user", required: true },
				},
				required: ["title", "author"],
			},
			main: {
				type: "object",
				properties: {
					users: { type: "array", items: { type: "ref", ref: "#user" } },
				},
			},
		},
	});
	return ns["~infer"];
}).types([450, "instantiations"]);

bench("fromJSON infer with app.bsky.feed.defs lexicon", () => {
	const schema = fromJSON({
		id: "app.bsky.feed.defs",
		defs: {
			viewerState: {
				type: "object",
				properties: {
					repost: { type: "string", format: "at-uri" },
					like: { type: "string", format: "at-uri" },
					bookmarked: { type: "boolean" },
					threadMuted: { type: "boolean" },
					replyDisabled: { type: "boolean" },
					embeddingDisabled: { type: "boolean" },
					pinned: { type: "boolean" },
				},
			},
			main: {
				type: "object",
				properties: {
					uri: { type: "string", required: true, format: "at-uri" },
					cid: { type: "string", required: true, format: "cid" },
					author: {
						type: "ref",
						ref: "app.bsky.actor.defs#profileViewBasic",
						required: true,
					},
					record: { type: "unknown", required: true },
					embed: {
						type: "union",
						refs: [
							"app.bsky.embed.images#view",
							"app.bsky.embed.video#view",
							"app.bsky.embed.external#view",
							"app.bsky.embed.record#view",
							"app.bsky.embed.recordWithMedia#view",
						],
					},
					bookmarkCount: { type: "integer" },
					replyCount: { type: "integer" },
					repostCount: { type: "integer" },
					likeCount: { type: "integer" },
					quoteCount: { type: "integer" },
					indexedAt: { type: "string", required: true, format: "datetime" },
					viewer: { type: "ref", ref: "#viewerState" },
					labels: {
						type: "array",
						items: { type: "ref", ref: "com.atproto.label.defs#label" },
					},
					threadgate: { type: "ref", ref: "#threadgateView" },
				},
				required: ["uri", "cid", "author", "record", "indexedAt"],
			},
			requestLess: {
				type: "token",
				description:
					"Request that less content like the given feed item be shown in the feed",
			},
			requestMore: {
				type: "token",
				description:
					"Request that more content like the given feed item be shown in the feed",
			},
			clickthroughItem: {
				type: "token",
				description: "User clicked through to the feed item",
			},
			clickthroughAuthor: {
				type: "token",
				description: "User clicked through to the author of the feed item",
			},
			clickthroughReposter: {
				type: "token",
				description: "User clicked through to the reposter of the feed item",
			},
			clickthroughEmbed: {
				type: "token",
				description:
					"User clicked through to the embedded content of the feed item",
			},
			contentModeUnspecified: {
				type: "token",
				description: "Declares the feed generator returns any types of posts.",
			},
			contentModeVideo: {
				type: "token",
				description:
					"Declares the feed generator returns posts containing app.bsky.embed.video embeds.",
			},
			interactionSeen: {
				type: "token",
				description: "Feed item was seen by user",
			},
			interactionLike: {
				type: "token",
				description: "User liked the feed item",
			},
			interactionRepost: {
				type: "token",
				description: "User reposted the feed item",
			},
			interactionReply: {
				type: "token",
				description: "User replied to the feed item",
			},
			interactionQuote: {
				type: "token",
				description: "User quoted the feed item",
			},
			interactionShare: {
				type: "token",
				description: "User shared the feed item",
			},
		},
	});
	return schema["~infer"];
}).types([552, "instantiations"]);
