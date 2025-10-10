import { assertEquals } from "@std/assert";
import { lx } from "../lib.ts";

Deno.test("app.bsky.actor.defs - profileViewBasic", () => {
  const profileViewBasic = lx.object({
    did: lx.string({ required: true, format: "did" }),
    handle: lx.string({ required: true, format: "handle" }),
    displayName: lx.string({ maxGraphemes: 64, maxLength: 640 }),
    pronouns: lx.string(),
    avatar: lx.string({ format: "uri" }),
    associated: lx.ref("#profileAssociated"),
    viewer: lx.ref("#viewerState"),
    labels: lx.array(lx.ref("com.atproto.label.defs#label")),
    createdAt: lx.string({ format: "datetime" }),
    verification: lx.ref("#verificationState"),
    status: lx.ref("#statusView"),
  });

  assertEquals(profileViewBasic, {
    type: "object",
    properties: {
      did: { type: "string", required: true, format: "did" },
      handle: { type: "string", required: true, format: "handle" },
      displayName: { type: "string", maxGraphemes: 64, maxLength: 640 },
      pronouns: { type: "string" },
      avatar: { type: "string", format: "uri" },
      associated: { type: "ref", ref: "#profileAssociated" },
      viewer: { type: "ref", ref: "#viewerState" },
      labels: {
        type: "array",
        items: { type: "ref", ref: "com.atproto.label.defs#label" },
      },
      createdAt: { type: "string", format: "datetime" },
      verification: { type: "ref", ref: "#verificationState" },
      status: { type: "ref", ref: "#statusView" },
    },
    required: ["did", "handle"],
  });
});

Deno.test("app.bsky.actor.defs - profileView", () => {
  const profileView = lx.object({
    did: lx.string({ required: true, format: "did" }),
    handle: lx.string({ required: true, format: "handle" }),
    displayName: lx.string({ maxGraphemes: 64, maxLength: 640 }),
    pronouns: lx.string(),
    description: lx.string({ maxGraphemes: 256, maxLength: 2560 }),
    avatar: lx.string({ format: "uri" }),
    associated: lx.ref("#profileAssociated"),
    indexedAt: lx.string({ format: "datetime" }),
    createdAt: lx.string({ format: "datetime" }),
    viewer: lx.ref("#viewerState"),
    labels: lx.array(lx.ref("com.atproto.label.defs#label")),
    verification: lx.ref("#verificationState"),
    status: lx.ref("#statusView"),
  });

  assertEquals(profileView, {
    type: "object",
    properties: {
      did: { type: "string", required: true, format: "did" },
      handle: { type: "string", required: true, format: "handle" },
      displayName: { type: "string", maxGraphemes: 64, maxLength: 640 },
      pronouns: { type: "string" },
      description: { type: "string", maxGraphemes: 256, maxLength: 2560 },
      avatar: { type: "string", format: "uri" },
      associated: { type: "ref", ref: "#profileAssociated" },
      indexedAt: { type: "string", format: "datetime" },
      createdAt: { type: "string", format: "datetime" },
      viewer: { type: "ref", ref: "#viewerState" },
      labels: {
        type: "array",
        items: { type: "ref", ref: "com.atproto.label.defs#label" },
      },
      verification: { type: "ref", ref: "#verificationState" },
      status: { type: "ref", ref: "#statusView" },
    },
    required: ["did", "handle"],
  });
});

Deno.test("app.bsky.actor.defs - profileViewDetailed", () => {
  const profileViewDetailed = lx.object({
    did: lx.string({ required: true, format: "did" }),
    handle: lx.string({ required: true, format: "handle" }),
    displayName: lx.string({ maxGraphemes: 64, maxLength: 640 }),
    description: lx.string({ maxGraphemes: 256, maxLength: 2560 }),
    pronouns: lx.string(),
    website: lx.string({ format: "uri" }),
    avatar: lx.string({ format: "uri" }),
    banner: lx.string({ format: "uri" }),
    followersCount: lx.integer(),
    followsCount: lx.integer(),
    postsCount: lx.integer(),
    associated: lx.ref("#profileAssociated"),
    joinedViaStarterPack: lx.ref("app.bsky.graph.defs#starterPackViewBasic"),
    indexedAt: lx.string({ format: "datetime" }),
    createdAt: lx.string({ format: "datetime" }),
    viewer: lx.ref("#viewerState"),
    labels: lx.array(lx.ref("com.atproto.label.defs#label")),
    pinnedPost: lx.ref("com.atproto.repo.strongRef"),
    verification: lx.ref("#verificationState"),
    status: lx.ref("#statusView"),
  });

  assertEquals(profileViewDetailed, {
    type: "object",
    properties: {
      did: { type: "string", required: true, format: "did" },
      handle: { type: "string", required: true, format: "handle" },
      displayName: { type: "string", maxGraphemes: 64, maxLength: 640 },
      description: { type: "string", maxGraphemes: 256, maxLength: 2560 },
      pronouns: { type: "string" },
      website: { type: "string", format: "uri" },
      avatar: { type: "string", format: "uri" },
      banner: { type: "string", format: "uri" },
      followersCount: { type: "integer" },
      followsCount: { type: "integer" },
      postsCount: { type: "integer" },
      associated: { type: "ref", ref: "#profileAssociated" },
      joinedViaStarterPack: {
        type: "ref",
        ref: "app.bsky.graph.defs#starterPackViewBasic",
      },
      indexedAt: { type: "string", format: "datetime" },
      createdAt: { type: "string", format: "datetime" },
      viewer: { type: "ref", ref: "#viewerState" },
      labels: {
        type: "array",
        items: { type: "ref", ref: "com.atproto.label.defs#label" },
      },
      pinnedPost: { type: "ref", ref: "com.atproto.repo.strongRef" },
      verification: { type: "ref", ref: "#verificationState" },
      status: { type: "ref", ref: "#statusView" },
    },
    required: ["did", "handle"],
  });
});

Deno.test("app.bsky.actor.defs - profileAssociated", () => {
  const profileAssociated = lx.object({
    lists: lx.integer(),
    feedgens: lx.integer(),
    starterPacks: lx.integer(),
    labeler: lx.boolean(),
    chat: lx.ref("#profileAssociatedChat"),
    activitySubscription: lx.ref("#profileAssociatedActivitySubscription"),
  });

  assertEquals(profileAssociated, {
    type: "object",
    properties: {
      lists: { type: "integer" },
      feedgens: { type: "integer" },
      starterPacks: { type: "integer" },
      labeler: { type: "boolean" },
      chat: { type: "ref", ref: "#profileAssociatedChat" },
      activitySubscription: {
        type: "ref",
        ref: "#profileAssociatedActivitySubscription",
      },
    },
  });
});

Deno.test("app.bsky.actor.defs - profileAssociatedChat", () => {
  const profileAssociatedChat = lx.object({
    allowIncoming: lx.string({
      required: true,
      knownValues: ["all", "none", "following"],
    }),
  });

  assertEquals(profileAssociatedChat, {
    type: "object",
    properties: {
      allowIncoming: {
        type: "string",
        required: true,
        knownValues: ["all", "none", "following"],
      },
    },
    required: ["allowIncoming"],
  });
});

Deno.test("app.bsky.actor.defs - profileAssociatedActivitySubscription", () => {
  const profileAssociatedActivitySubscription = lx.object({
    allowSubscriptions: lx.string({
      required: true,
      knownValues: ["followers", "mutuals", "none"],
    }),
  });

  assertEquals(profileAssociatedActivitySubscription, {
    type: "object",
    properties: {
      allowSubscriptions: {
        type: "string",
        required: true,
        knownValues: ["followers", "mutuals", "none"],
      },
    },
    required: ["allowSubscriptions"],
  });
});

Deno.test("app.bsky.actor.defs - viewerState", () => {
  const viewerState = lx.object({
    muted: lx.boolean(),
    mutedByList: lx.ref("app.bsky.graph.defs#listViewBasic"),
    blockedBy: lx.boolean(),
    blocking: lx.string({ format: "at-uri" }),
    blockingByList: lx.ref("app.bsky.graph.defs#listViewBasic"),
    following: lx.string({ format: "at-uri" }),
    followedBy: lx.string({ format: "at-uri" }),
    knownFollowers: lx.ref("#knownFollowers"),
    activitySubscription: lx.ref(
      "app.bsky.notification.defs#activitySubscription"
    ),
  });

  assertEquals(viewerState, {
    type: "object",
    properties: {
      muted: { type: "boolean" },
      mutedByList: { type: "ref", ref: "app.bsky.graph.defs#listViewBasic" },
      blockedBy: { type: "boolean" },
      blocking: { type: "string", format: "at-uri" },
      blockingByList: { type: "ref", ref: "app.bsky.graph.defs#listViewBasic" },
      following: { type: "string", format: "at-uri" },
      followedBy: { type: "string", format: "at-uri" },
      knownFollowers: { type: "ref", ref: "#knownFollowers" },
      activitySubscription: {
        type: "ref",
        ref: "app.bsky.notification.defs#activitySubscription",
      },
    },
  });
});

Deno.test("app.bsky.actor.defs - knownFollowers", () => {
  const knownFollowers = lx.object({
    count: lx.integer({ required: true }),
    followers: lx.array(lx.ref("#profileViewBasic"), {
      required: true,
      minLength: 0,
      maxLength: 5,
    }),
  });

  assertEquals(knownFollowers, {
    type: "object",
    properties: {
      count: { type: "integer", required: true },
      followers: {
        type: "array",
        items: { type: "ref", ref: "#profileViewBasic" },
        required: true,
        minLength: 0,
        maxLength: 5,
      },
    },
    required: ["count", "followers"],
  });
});

Deno.test("app.bsky.actor.defs - verificationState", () => {
  const verificationState = lx.object({
    verifications: lx.array(lx.ref("#verificationView"), { required: true }),
    verifiedStatus: lx.string({
      required: true,
      knownValues: ["valid", "invalid", "none"],
    }),
    trustedVerifierStatus: lx.string({
      required: true,
      knownValues: ["valid", "invalid", "none"],
    }),
  });

  assertEquals(verificationState, {
    type: "object",
    properties: {
      verifications: {
        type: "array",
        items: { type: "ref", ref: "#verificationView" },
        required: true,
      },
      verifiedStatus: {
        type: "string",
        required: true,
        knownValues: ["valid", "invalid", "none"],
      },
      trustedVerifierStatus: {
        type: "string",
        required: true,
        knownValues: ["valid", "invalid", "none"],
      },
    },
    required: ["verifications", "verifiedStatus", "trustedVerifierStatus"],
  });
});

Deno.test("app.bsky.actor.defs - verificationView", () => {
  const verificationView = lx.object({
    issuer: lx.string({ required: true, format: "did" }),
    uri: lx.string({ required: true, format: "at-uri" }),
    isValid: lx.boolean({ required: true }),
    createdAt: lx.string({ required: true, format: "datetime" }),
  });

  assertEquals(verificationView, {
    type: "object",
    properties: {
      issuer: { type: "string", required: true, format: "did" },
      uri: { type: "string", required: true, format: "at-uri" },
      isValid: { type: "boolean", required: true },
      createdAt: { type: "string", required: true, format: "datetime" },
    },
    required: ["issuer", "uri", "isValid", "createdAt"],
  });
});

Deno.test("app.bsky.actor.defs - preferences", () => {
  const preferences = lx.array(
    lx.union([
      "#adultContentPref",
      "#contentLabelPref",
      "#savedFeedsPref",
      "#savedFeedsPrefV2",
      "#personalDetailsPref",
      "#feedViewPref",
      "#threadViewPref",
      "#interestsPref",
      "#mutedWordsPref",
      "#hiddenPostsPref",
      "#bskyAppStatePref",
      "#labelersPref",
      "#postInteractionSettingsPref",
      "#verificationPrefs",
    ])
  );

  assertEquals(preferences, {
    type: "array",
    items: {
      type: "union",
      refs: [
        "#adultContentPref",
        "#contentLabelPref",
        "#savedFeedsPref",
        "#savedFeedsPrefV2",
        "#personalDetailsPref",
        "#feedViewPref",
        "#threadViewPref",
        "#interestsPref",
        "#mutedWordsPref",
        "#hiddenPostsPref",
        "#bskyAppStatePref",
        "#labelersPref",
        "#postInteractionSettingsPref",
        "#verificationPrefs",
      ],
    },
  });
});

Deno.test("app.bsky.actor.defs - adultContentPref", () => {
  const adultContentPref = lx.object({
    enabled: lx.boolean({ required: true, default: false }),
  });

  assertEquals(adultContentPref, {
    type: "object",
    properties: {
      enabled: { type: "boolean", required: true, default: false },
    },
    required: ["enabled"],
  });
});

Deno.test("app.bsky.actor.defs - contentLabelPref", () => {
  const contentLabelPref = lx.object({
    labelerDid: lx.string({ format: "did" }),
    label: lx.string({ required: true }),
    visibility: lx.string({
      required: true,
      knownValues: ["ignore", "show", "warn", "hide"],
    }),
  });

  assertEquals(contentLabelPref, {
    type: "object",
    properties: {
      labelerDid: { type: "string", format: "did" },
      label: { type: "string", required: true },
      visibility: {
        type: "string",
        required: true,
        knownValues: ["ignore", "show", "warn", "hide"],
      },
    },
    required: ["label", "visibility"],
  });
});

Deno.test("app.bsky.actor.defs - savedFeed", () => {
  const savedFeed = lx.object({
    id: lx.string({ required: true }),
    type: lx.string({ required: true, knownValues: ["feed", "list", "timeline"] }),
    value: lx.string({ required: true }),
    pinned: lx.boolean({ required: true }),
  });

  assertEquals(savedFeed, {
    type: "object",
    properties: {
      id: { type: "string", required: true },
      type: {
        type: "string",
        required: true,
        knownValues: ["feed", "list", "timeline"],
      },
      value: { type: "string", required: true },
      pinned: { type: "boolean", required: true },
    },
    required: ["id", "type", "value", "pinned"],
  });
});

Deno.test("app.bsky.actor.defs - savedFeedsPrefV2", () => {
  const savedFeedsPrefV2 = lx.object({
    items: lx.array(lx.ref("app.bsky.actor.defs#savedFeed"), {
      required: true,
    }),
  });

  assertEquals(savedFeedsPrefV2, {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { type: "ref", ref: "app.bsky.actor.defs#savedFeed" },
        required: true,
      },
    },
    required: ["items"],
  });
});

Deno.test("app.bsky.actor.defs - savedFeedsPref", () => {
  const savedFeedsPref = lx.object({
    pinned: lx.array(lx.string({ format: "at-uri" }), { required: true }),
    saved: lx.array(lx.string({ format: "at-uri" }), { required: true }),
    timelineIndex: lx.integer(),
  });

  assertEquals(savedFeedsPref, {
    type: "object",
    properties: {
      pinned: {
        type: "array",
        items: { type: "string", format: "at-uri" },
        required: true,
      },
      saved: {
        type: "array",
        items: { type: "string", format: "at-uri" },
        required: true,
      },
      timelineIndex: { type: "integer" },
    },
    required: ["pinned", "saved"],
  });
});

Deno.test("app.bsky.actor.defs - personalDetailsPref", () => {
  const personalDetailsPref = lx.object({
    birthDate: lx.string({ format: "datetime" }),
  });

  assertEquals(personalDetailsPref, {
    type: "object",
    properties: {
      birthDate: { type: "string", format: "datetime" },
    },
  });
});

Deno.test("app.bsky.actor.defs - feedViewPref", () => {
  const feedViewPref = lx.object({
    feed: lx.string({ required: true }),
    hideReplies: lx.boolean(),
    hideRepliesByUnfollowed: lx.boolean({ default: true }),
    hideRepliesByLikeCount: lx.integer(),
    hideReposts: lx.boolean(),
    hideQuotePosts: lx.boolean(),
  });

  assertEquals(feedViewPref, {
    type: "object",
    properties: {
      feed: { type: "string", required: true },
      hideReplies: { type: "boolean" },
      hideRepliesByUnfollowed: { type: "boolean", default: true },
      hideRepliesByLikeCount: { type: "integer" },
      hideReposts: { type: "boolean" },
      hideQuotePosts: { type: "boolean" },
    },
    required: ["feed"],
  });
});

Deno.test("app.bsky.actor.defs - threadViewPref", () => {
  const threadViewPref = lx.object({
    sort: lx.string({
      knownValues: ["oldest", "newest", "most-likes", "random", "hotness"],
    }),
    prioritizeFollowedUsers: lx.boolean(),
  });

  assertEquals(threadViewPref, {
    type: "object",
    properties: {
      sort: {
        type: "string",
        knownValues: ["oldest", "newest", "most-likes", "random", "hotness"],
      },
      prioritizeFollowedUsers: { type: "boolean" },
    },
  });
});

Deno.test("app.bsky.actor.defs - interestsPref", () => {
  const interestsPref = lx.object({
    tags: lx.array(lx.string({ maxLength: 640, maxGraphemes: 64 }), {
      required: true,
      maxLength: 100,
    }),
  });

  assertEquals(interestsPref, {
    type: "object",
    properties: {
      tags: {
        type: "array",
        items: { type: "string", maxLength: 640, maxGraphemes: 64 },
        required: true,
        maxLength: 100,
      },
    },
    required: ["tags"],
  });
});

Deno.test("app.bsky.actor.defs - mutedWordTarget", () => {
  const mutedWordTarget = lx.string({
    knownValues: ["content", "tag"],
    maxLength: 640,
    maxGraphemes: 64,
  });

  assertEquals(mutedWordTarget, {
    type: "string",
    knownValues: ["content", "tag"],
    maxLength: 640,
    maxGraphemes: 64,
  });
});

Deno.test("app.bsky.actor.defs - mutedWord", () => {
  const mutedWord = lx.object({
    id: lx.string(),
    value: lx.string({ required: true, maxLength: 10000, maxGraphemes: 1000 }),
    targets: lx.array(lx.ref("app.bsky.actor.defs#mutedWordTarget"), {
      required: true,
    }),
    actorTarget: lx.string({
      knownValues: ["all", "exclude-following"],
      default: "all",
    }),
    expiresAt: lx.string({ format: "datetime" }),
  });

  assertEquals(mutedWord, {
    type: "object",
    properties: {
      id: { type: "string" },
      value: {
        type: "string",
        required: true,
        maxLength: 10000,
        maxGraphemes: 1000,
      },
      targets: {
        type: "array",
        items: { type: "ref", ref: "app.bsky.actor.defs#mutedWordTarget" },
        required: true,
      },
      actorTarget: {
        type: "string",
        knownValues: ["all", "exclude-following"],
        default: "all",
      },
      expiresAt: { type: "string", format: "datetime" },
    },
    required: ["value", "targets"],
  });
});

Deno.test("app.bsky.actor.defs - mutedWordsPref", () => {
  const mutedWordsPref = lx.object({
    items: lx.array(lx.ref("app.bsky.actor.defs#mutedWord"), {
      required: true,
    }),
  });

  assertEquals(mutedWordsPref, {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { type: "ref", ref: "app.bsky.actor.defs#mutedWord" },
        required: true,
      },
    },
    required: ["items"],
  });
});

Deno.test("app.bsky.actor.defs - hiddenPostsPref", () => {
  const hiddenPostsPref = lx.object({
    items: lx.array(lx.string({ format: "at-uri" }), { required: true }),
  });

  assertEquals(hiddenPostsPref, {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: { type: "string", format: "at-uri" },
        required: true,
      },
    },
    required: ["items"],
  });
});

Deno.test("app.bsky.actor.defs - labelersPref", () => {
  const labelersPref = lx.object({
    labelers: lx.array(lx.ref("#labelerPrefItem"), { required: true }),
  });

  assertEquals(labelersPref, {
    type: "object",
    properties: {
      labelers: {
        type: "array",
        items: { type: "ref", ref: "#labelerPrefItem" },
        required: true,
      },
    },
    required: ["labelers"],
  });
});

Deno.test("app.bsky.actor.defs - labelerPrefItem", () => {
  const labelerPrefItem = lx.object({
    did: lx.string({ required: true, format: "did" }),
  });

  assertEquals(labelerPrefItem, {
    type: "object",
    properties: {
      did: { type: "string", required: true, format: "did" },
    },
    required: ["did"],
  });
});

Deno.test("app.bsky.actor.defs - bskyAppStatePref", () => {
  const bskyAppStatePref = lx.object({
    activeProgressGuide: lx.ref("#bskyAppProgressGuide"),
    queuedNudges: lx.array(lx.string({ maxLength: 100 }), { maxLength: 1000 }),
    nuxs: lx.array(lx.ref("app.bsky.actor.defs#nux"), { maxLength: 100 }),
  });

  assertEquals(bskyAppStatePref, {
    type: "object",
    properties: {
      activeProgressGuide: { type: "ref", ref: "#bskyAppProgressGuide" },
      queuedNudges: {
        type: "array",
        items: { type: "string", maxLength: 100 },
        maxLength: 1000,
      },
      nuxs: {
        type: "array",
        items: { type: "ref", ref: "app.bsky.actor.defs#nux" },
        maxLength: 100,
      },
    },
  });
});

Deno.test("app.bsky.actor.defs - bskyAppProgressGuide", () => {
  const bskyAppProgressGuide = lx.object({
    guide: lx.string({ required: true, maxLength: 100 }),
  });

  assertEquals(bskyAppProgressGuide, {
    type: "object",
    properties: {
      guide: { type: "string", required: true, maxLength: 100 },
    },
    required: ["guide"],
  });
});

Deno.test("app.bsky.actor.defs - nux", () => {
  const nux = lx.object({
    id: lx.string({ required: true, maxLength: 100 }),
    completed: lx.boolean({ required: true, default: false }),
    data: lx.string({ maxLength: 3000, maxGraphemes: 300 }),
    expiresAt: lx.string({ format: "datetime" }),
  });

  assertEquals(nux, {
    type: "object",
    properties: {
      id: { type: "string", required: true, maxLength: 100 },
      completed: { type: "boolean", required: true, default: false },
      data: { type: "string", maxLength: 3000, maxGraphemes: 300 },
      expiresAt: { type: "string", format: "datetime" },
    },
    required: ["id", "completed"],
  });
});

Deno.test("app.bsky.actor.defs - verificationPrefs", () => {
  const verificationPrefs = lx.object({
    hideBadges: lx.boolean({ default: false }),
  });

  assertEquals(verificationPrefs, {
    type: "object",
    properties: {
      hideBadges: { type: "boolean", default: false },
    },
  });
});

Deno.test("app.bsky.actor.defs - postInteractionSettingsPref", () => {
  const postInteractionSettingsPref = lx.object({
    threadgateAllowRules: lx.array(
      lx.union([
        "app.bsky.feed.threadgate#mentionRule",
        "app.bsky.feed.threadgate#followerRule",
        "app.bsky.feed.threadgate#followingRule",
        "app.bsky.feed.threadgate#listRule",
      ]),
      { maxLength: 5 }
    ),
    postgateEmbeddingRules: lx.array(
      lx.union(["app.bsky.feed.postgate#disableRule"]),
      { maxLength: 5 }
    ),
  });

  assertEquals(postInteractionSettingsPref, {
    type: "object",
    properties: {
      threadgateAllowRules: {
        type: "array",
        items: {
          type: "union",
          refs: [
            "app.bsky.feed.threadgate#mentionRule",
            "app.bsky.feed.threadgate#followerRule",
            "app.bsky.feed.threadgate#followingRule",
            "app.bsky.feed.threadgate#listRule",
          ],
        },
        maxLength: 5,
      },
      postgateEmbeddingRules: {
        type: "array",
        items: {
          type: "union",
          refs: ["app.bsky.feed.postgate#disableRule"],
        },
        maxLength: 5,
      },
    },
  });
});

Deno.test("app.bsky.actor.defs - statusView", () => {
  const statusView = lx.object({
    status: lx.string({
      required: true,
      knownValues: ["app.bsky.actor.status#live"],
    }),
    record: lx.unknown({ required: true }),
    embed: lx.union(["app.bsky.embed.external#view"]),
    expiresAt: lx.string({ format: "datetime" }),
    isActive: lx.boolean(),
  });

  assertEquals(statusView, {
    type: "object",
    properties: {
      status: {
        type: "string",
        required: true,
        knownValues: ["app.bsky.actor.status#live"],
      },
      record: { type: "unknown", required: true },
      embed: {
        type: "union",
        refs: ["app.bsky.embed.external#view"],
      },
      expiresAt: { type: "string", format: "datetime" },
      isActive: { type: "boolean" },
    },
    required: ["status", "record"],
  });
});

Deno.test("app.bsky.actor.defs - full namespace", () => {
  const actorDefs = lx.namespace("app.bsky.actor.defs", {
    profileViewBasic: lx.object({
      did: lx.string({ required: true, format: "did" }),
      handle: lx.string({ required: true, format: "handle" }),
      displayName: lx.string({ maxGraphemes: 64, maxLength: 640 }),
      pronouns: lx.string(),
      avatar: lx.string({ format: "uri" }),
      associated: lx.ref("#profileAssociated"),
      viewer: lx.ref("#viewerState"),
      labels: lx.array(lx.ref("com.atproto.label.defs#label")),
      createdAt: lx.string({ format: "datetime" }),
      verification: lx.ref("#verificationState"),
      status: lx.ref("#statusView"),
    }),
    viewerState: lx.object({
      muted: lx.boolean(),
      mutedByList: lx.ref("app.bsky.graph.defs#listViewBasic"),
      blockedBy: lx.boolean(),
      blocking: lx.string({ format: "at-uri" }),
      blockingByList: lx.ref("app.bsky.graph.defs#listViewBasic"),
      following: lx.string({ format: "at-uri" }),
      followedBy: lx.string({ format: "at-uri" }),
      knownFollowers: lx.ref("#knownFollowers"),
      activitySubscription: lx.ref(
        "app.bsky.notification.defs#activitySubscription"
      ),
    }),
  });

  assertEquals(actorDefs.lexicon, 1);
  assertEquals(actorDefs.id, "app.bsky.actor.defs");
  assertEquals(actorDefs.defs.profileViewBasic.type, "object");
  assertEquals(actorDefs.defs.viewerState.type, "object");
});
