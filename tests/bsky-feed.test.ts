import { expect, test } from "vitest";
import { lx } from "../src/lib.ts";

test("app.bsky.feed.defs - postView", () => {
	const postView = lx.object({
		uri: lx.string({ required: true, format: "at-uri" }),
		cid: lx.string({ required: true, format: "cid" }),
		author: lx.ref("app.bsky.actor.defs#profileViewBasic", { required: true }),
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
	});

	expect(postView).toEqual({
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
	});
});

test("app.bsky.feed.defs - viewerState", () => {
	const viewerState = lx.object({
		repost: lx.string({ format: "at-uri" }),
		like: lx.string({ format: "at-uri" }),
		bookmarked: lx.boolean(),
		threadMuted: lx.boolean(),
		replyDisabled: lx.boolean(),
		embeddingDisabled: lx.boolean(),
		pinned: lx.boolean(),
	});

	expect(viewerState).toEqual({
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
	});
});

test("app.bsky.feed.defs - threadContext", () => {
	const threadContext = lx.object({
		rootAuthorLike: lx.string({ format: "at-uri" }),
	});

	expect(threadContext).toEqual({
		type: "object",
		properties: {
			rootAuthorLike: { type: "string", format: "at-uri" },
		},
	});
});

test("app.bsky.feed.defs - feedViewPost", () => {
	const feedViewPost = lx.object({
		post: lx.ref("#postView", { required: true }),
		reply: lx.ref("#replyRef"),
		reason: lx.union(["#reasonRepost", "#reasonPin"]),
		feedContext: lx.string({ maxLength: 2000 }),
		reqId: lx.string({ maxLength: 100 }),
	});

	expect(feedViewPost).toEqual({
		type: "object",
		properties: {
			post: { type: "ref", ref: "#postView", required: true },
			reply: { type: "ref", ref: "#replyRef" },
			reason: {
				type: "union",
				refs: ["#reasonRepost", "#reasonPin"],
			},
			feedContext: { type: "string", maxLength: 2000 },
			reqId: { type: "string", maxLength: 100 },
		},
		required: ["post"],
	});
});

test("app.bsky.feed.defs - replyRef", () => {
	const replyRef = lx.object({
		root: lx.union(["#postView", "#notFoundPost", "#blockedPost"], {
			required: true,
		}),
		parent: lx.union(["#postView", "#notFoundPost", "#blockedPost"], {
			required: true,
		}),
		grandparentAuthor: lx.ref("app.bsky.actor.defs#profileViewBasic"),
	});

	expect(replyRef).toEqual({
		type: "object",
		properties: {
			root: {
				type: "union",
				refs: ["#postView", "#notFoundPost", "#blockedPost"],
				required: true,
			},
			parent: {
				type: "union",
				refs: ["#postView", "#notFoundPost", "#blockedPost"],
				required: true,
			},
			grandparentAuthor: {
				type: "ref",
				ref: "app.bsky.actor.defs#profileViewBasic",
			},
		},
		required: ["root", "parent"],
	});
});

test("app.bsky.feed.defs - reasonRepost", () => {
	const reasonRepost = lx.object({
		by: lx.ref("app.bsky.actor.defs#profileViewBasic", { required: true }),
		uri: lx.string({ format: "at-uri" }),
		cid: lx.string({ format: "cid" }),
		indexedAt: lx.string({ required: true, format: "datetime" }),
	});

	expect(reasonRepost).toEqual({
		type: "object",
		properties: {
			by: {
				type: "ref",
				ref: "app.bsky.actor.defs#profileViewBasic",
				required: true,
			},
			uri: { type: "string", format: "at-uri" },
			cid: { type: "string", format: "cid" },
			indexedAt: { type: "string", required: true, format: "datetime" },
		},
		required: ["by", "indexedAt"],
	});
});

test("app.bsky.feed.defs - reasonPin", () => {
	const reasonPin = lx.object({});

	expect(reasonPin).toEqual({
		type: "object",
		properties: {},
	});
});

test("app.bsky.feed.defs - threadViewPost", () => {
	const threadViewPost = lx.object({
		post: lx.ref("#postView", { required: true }),
		parent: lx.union(["#threadViewPost", "#notFoundPost", "#blockedPost"]),
		replies: lx.array(
			lx.union(["#threadViewPost", "#notFoundPost", "#blockedPost"]),
		),
		threadContext: lx.ref("#threadContext"),
	});

	expect(threadViewPost).toEqual({
		type: "object",
		properties: {
			post: { type: "ref", ref: "#postView", required: true },
			parent: {
				type: "union",
				refs: ["#threadViewPost", "#notFoundPost", "#blockedPost"],
			},
			replies: {
				type: "array",
				items: {
					type: "union",
					refs: ["#threadViewPost", "#notFoundPost", "#blockedPost"],
				},
			},
			threadContext: { type: "ref", ref: "#threadContext" },
		},
		required: ["post"],
	});
});

test("app.bsky.feed.defs - notFoundPost", () => {
	const notFoundPost = lx.object({
		uri: lx.string({ required: true, format: "at-uri" }),
		notFound: lx.boolean({ required: true, const: true }),
	});

	expect(notFoundPost).toEqual({
		type: "object",
		properties: {
			uri: { type: "string", required: true, format: "at-uri" },
			notFound: { type: "boolean", required: true, const: true },
		},
		required: ["uri", "notFound"],
	});
});

test("app.bsky.feed.defs - blockedPost", () => {
	const blockedPost = lx.object({
		uri: lx.string({ required: true, format: "at-uri" }),
		blocked: lx.boolean({ required: true, const: true }),
		author: lx.ref("#blockedAuthor", { required: true }),
	});

	expect(blockedPost).toEqual({
		type: "object",
		properties: {
			uri: { type: "string", required: true, format: "at-uri" },
			blocked: { type: "boolean", required: true, const: true },
			author: { type: "ref", ref: "#blockedAuthor", required: true },
		},
		required: ["uri", "blocked", "author"],
	});
});

test("app.bsky.feed.defs - blockedAuthor", () => {
	const blockedAuthor = lx.object({
		did: lx.string({ required: true, format: "did" }),
		viewer: lx.ref("app.bsky.actor.defs#viewerState"),
	});

	expect(blockedAuthor).toEqual({
		type: "object",
		properties: {
			did: { type: "string", required: true, format: "did" },
			viewer: { type: "ref", ref: "app.bsky.actor.defs#viewerState" },
		},
		required: ["did"],
	});
});

test("app.bsky.feed.defs - generatorView", () => {
	const generatorView = lx.object({
		uri: lx.string({ required: true, format: "at-uri" }),
		cid: lx.string({ required: true, format: "cid" }),
		did: lx.string({ required: true, format: "did" }),
		creator: lx.ref("app.bsky.actor.defs#profileView", { required: true }),
		displayName: lx.string({ required: true }),
		description: lx.string({ maxGraphemes: 300, maxLength: 3000 }),
		descriptionFacets: lx.array(lx.ref("app.bsky.richtext.facet")),
		avatar: lx.string({ format: "uri" }),
		likeCount: lx.integer({ minimum: 0 }),
		acceptsInteractions: lx.boolean(),
		labels: lx.array(lx.ref("com.atproto.label.defs#label")),
		viewer: lx.ref("#generatorViewerState"),
		contentMode: lx.string({
			knownValues: [
				"app.bsky.feed.defs#contentModeUnspecified",
				"app.bsky.feed.defs#contentModeVideo",
			],
		}),
		indexedAt: lx.string({ required: true, format: "datetime" }),
	});

	expect(generatorView).toEqual({
		type: "object",
		properties: {
			uri: { type: "string", required: true, format: "at-uri" },
			cid: { type: "string", required: true, format: "cid" },
			did: { type: "string", required: true, format: "did" },
			creator: {
				type: "ref",
				ref: "app.bsky.actor.defs#profileView",
				required: true,
			},
			displayName: { type: "string", required: true },
			description: { type: "string", maxGraphemes: 300, maxLength: 3000 },
			descriptionFacets: {
				type: "array",
				items: { type: "ref", ref: "app.bsky.richtext.facet" },
			},
			avatar: { type: "string", format: "uri" },
			likeCount: { type: "integer", minimum: 0 },
			acceptsInteractions: { type: "boolean" },
			labels: {
				type: "array",
				items: { type: "ref", ref: "com.atproto.label.defs#label" },
			},
			viewer: { type: "ref", ref: "#generatorViewerState" },
			contentMode: {
				type: "string",
				knownValues: [
					"app.bsky.feed.defs#contentModeUnspecified",
					"app.bsky.feed.defs#contentModeVideo",
				],
			},
			indexedAt: { type: "string", required: true, format: "datetime" },
		},
		required: ["uri", "cid", "did", "creator", "displayName", "indexedAt"],
	});
});

test("app.bsky.feed.defs - generatorViewerState", () => {
	const generatorViewerState = lx.object({
		like: lx.string({ format: "at-uri" }),
	});

	expect(generatorViewerState).toEqual({
		type: "object",
		properties: {
			like: { type: "string", format: "at-uri" },
		},
	});
});

test("app.bsky.feed.defs - skeletonFeedPost", () => {
	const skeletonFeedPost = lx.object({
		post: lx.string({ required: true, format: "at-uri" }),
		reason: lx.union(["#skeletonReasonRepost", "#skeletonReasonPin"]),
		feedContext: lx.string({ maxLength: 2000 }),
	});

	expect(skeletonFeedPost).toEqual({
		type: "object",
		properties: {
			post: { type: "string", required: true, format: "at-uri" },
			reason: {
				type: "union",
				refs: ["#skeletonReasonRepost", "#skeletonReasonPin"],
			},
			feedContext: { type: "string", maxLength: 2000 },
		},
		required: ["post"],
	});
});

test("app.bsky.feed.defs - skeletonReasonRepost", () => {
	const skeletonReasonRepost = lx.object({
		repost: lx.string({ required: true, format: "at-uri" }),
	});

	expect(skeletonReasonRepost).toEqual({
		type: "object",
		properties: {
			repost: { type: "string", required: true, format: "at-uri" },
		},
		required: ["repost"],
	});
});

test("app.bsky.feed.defs - skeletonReasonPin", () => {
	const skeletonReasonPin = lx.object({});

	expect(skeletonReasonPin).toEqual({
		type: "object",
		properties: {},
	});
});

test("app.bsky.feed.defs - threadgateView", () => {
	const threadgateView = lx.object({
		uri: lx.string({ format: "at-uri" }),
		cid: lx.string({ format: "cid" }),
		record: lx.unknown(),
		lists: lx.array(lx.ref("app.bsky.graph.defs#listViewBasic")),
	});

	expect(threadgateView).toEqual({
		type: "object",
		properties: {
			uri: { type: "string", format: "at-uri" },
			cid: { type: "string", format: "cid" },
			record: { type: "unknown" },
			lists: {
				type: "array",
				items: { type: "ref", ref: "app.bsky.graph.defs#listViewBasic" },
			},
		},
	});
});

test("app.bsky.feed.defs - interaction", () => {
	const interaction = lx.object({
		item: lx.string({ format: "at-uri" }),
		event: lx.string({
			knownValues: [
				"app.bsky.feed.defs#requestLess",
				"app.bsky.feed.defs#requestMore",
				"app.bsky.feed.defs#clickthroughItem",
				"app.bsky.feed.defs#clickthroughAuthor",
				"app.bsky.feed.defs#clickthroughReposter",
				"app.bsky.feed.defs#clickthroughEmbed",
				"app.bsky.feed.defs#interactionSeen",
				"app.bsky.feed.defs#interactionLike",
				"app.bsky.feed.defs#interactionRepost",
				"app.bsky.feed.defs#interactionReply",
				"app.bsky.feed.defs#interactionQuote",
				"app.bsky.feed.defs#interactionShare",
			],
		}),
		feedContext: lx.string({ maxLength: 2000 }),
		reqId: lx.string({ maxLength: 100 }),
	});

	expect(interaction).toEqual({
		type: "object",
		properties: {
			item: { type: "string", format: "at-uri" },
			event: {
				type: "string",
				knownValues: [
					"app.bsky.feed.defs#requestLess",
					"app.bsky.feed.defs#requestMore",
					"app.bsky.feed.defs#clickthroughItem",
					"app.bsky.feed.defs#clickthroughAuthor",
					"app.bsky.feed.defs#clickthroughReposter",
					"app.bsky.feed.defs#clickthroughEmbed",
					"app.bsky.feed.defs#interactionSeen",
					"app.bsky.feed.defs#interactionLike",
					"app.bsky.feed.defs#interactionRepost",
					"app.bsky.feed.defs#interactionReply",
					"app.bsky.feed.defs#interactionQuote",
					"app.bsky.feed.defs#interactionShare",
				],
			},
			feedContext: { type: "string", maxLength: 2000 },
			reqId: { type: "string", maxLength: 100 },
		},
	});
});

test("app.bsky.feed.defs - requestLess token", () => {
	const requestLess = lx.token(
		"Request that less content like the given feed item be shown in the feed",
	);

	expect(requestLess).toEqual({
		type: "token",
		description:
			"Request that less content like the given feed item be shown in the feed",
	});
});

test("app.bsky.feed.defs - requestMore token", () => {
	const requestMore = lx.token(
		"Request that more content like the given feed item be shown in the feed",
	);

	expect(requestMore).toEqual({
		type: "token",
		description:
			"Request that more content like the given feed item be shown in the feed",
	});
});

test("app.bsky.feed.defs - clickthroughItem token", () => {
	const clickthroughItem = lx.token("User clicked through to the feed item");

	expect(clickthroughItem).toEqual({
		type: "token",
		description: "User clicked through to the feed item",
	});
});

test("app.bsky.feed.defs - clickthroughAuthor token", () => {
	const clickthroughAuthor = lx.token(
		"User clicked through to the author of the feed item",
	);

	expect(clickthroughAuthor).toEqual({
		type: "token",
		description: "User clicked through to the author of the feed item",
	});
});

test("app.bsky.feed.defs - clickthroughReposter token", () => {
	const clickthroughReposter = lx.token(
		"User clicked through to the reposter of the feed item",
	);

	expect(clickthroughReposter).toEqual({
		type: "token",
		description: "User clicked through to the reposter of the feed item",
	});
});

test("app.bsky.feed.defs - clickthroughEmbed token", () => {
	const clickthroughEmbed = lx.token(
		"User clicked through to the embedded content of the feed item",
	);

	expect(clickthroughEmbed).toEqual({
		type: "token",
		description:
			"User clicked through to the embedded content of the feed item",
	});
});

test("app.bsky.feed.defs - contentModeUnspecified token", () => {
	const contentModeUnspecified = lx.token(
		"Declares the feed generator returns any types of posts.",
	);

	expect(contentModeUnspecified).toEqual({
		type: "token",
		description: "Declares the feed generator returns any types of posts.",
	});
});

test("app.bsky.feed.defs - contentModeVideo token", () => {
	const contentModeVideo = lx.token(
		"Declares the feed generator returns posts containing app.bsky.embed.video embeds.",
	);

	expect(contentModeVideo).toEqual({
		type: "token",
		description:
			"Declares the feed generator returns posts containing app.bsky.embed.video embeds.",
	});
});

test("app.bsky.feed.defs - interactionSeen token", () => {
	const interactionSeen = lx.token("Feed item was seen by user");

	expect(interactionSeen).toEqual({
		type: "token",
		description: "Feed item was seen by user",
	});
});

test("app.bsky.feed.defs - interactionLike token", () => {
	const interactionLike = lx.token("User liked the feed item");

	expect(interactionLike).toEqual({
		type: "token",
		description: "User liked the feed item",
	});
});

test("app.bsky.feed.defs - interactionRepost token", () => {
	const interactionRepost = lx.token("User reposted the feed item");

	expect(interactionRepost).toEqual({
		type: "token",
		description: "User reposted the feed item",
	});
});

test("app.bsky.feed.defs - interactionReply token", () => {
	const interactionReply = lx.token("User replied to the feed item");

	expect(interactionReply).toEqual({
		type: "token",
		description: "User replied to the feed item",
	});
});

test("app.bsky.feed.defs - interactionQuote token", () => {
	const interactionQuote = lx.token("User quoted the feed item");

	expect(interactionQuote).toEqual({
		type: "token",
		description: "User quoted the feed item",
	});
});

test("app.bsky.feed.defs - interactionShare token", () => {
	const interactionShare = lx.token("User shared the feed item");

	expect(interactionShare).toEqual({
		type: "token",
		description: "User shared the feed item",
	});
});

test("app.bsky.feed.defs - full namespace", () => {
	const feedDefs = lx.namespace("app.bsky.feed.defs", {
		postView: lx.object({
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
		viewerState: lx.object({
			repost: lx.string({ format: "at-uri" }),
			like: lx.string({ format: "at-uri" }),
			bookmarked: lx.boolean(),
			threadMuted: lx.boolean(),
			replyDisabled: lx.boolean(),
			embeddingDisabled: lx.boolean(),
			pinned: lx.boolean(),
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

	expect(feedDefs.json.lexicon).toEqual(1);
	expect(feedDefs.json.id).toEqual("app.bsky.feed.defs");
	expect(feedDefs.json.defs.postView.type).toEqual("object");
	expect(feedDefs.json.defs.viewerState.type).toEqual("object");
	expect(feedDefs.json.defs.requestLess.type).toEqual("token");
	expect(feedDefs.json.defs.contentModeVideo.type).toEqual("token");
});
