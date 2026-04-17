import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const CREATURE_NAMES = [
  "Foxlet", "Octavia", "Diploz", "Blowby", "Fluttrix", "Shelldon",
  "Buzzwick", "Prickles", "Chompy", "Sparky", "Embear", "Glaceon",
  "Thornix", "Cinders", "Bouncio", "Stormwing"
];

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    return user;
  },
});

export const createOrGetUser = mutation({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const tokenIdentifier = identity.tokenIdentifier;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        isOnline: true,
        lastSeen: Date.now(),
      });
      return existingUser._id;
    }

    const charSum = tokenIdentifier.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const creatureIndex = charSum % 16;
    const creatureName = CREATURE_NAMES[creatureIndex];

    const userId = await ctx.db.insert("users", {
      tokenIdentifier,
      eventId: args.eventId || "open",
      creatureIndex,
      creatureName,
      xp: 0,
      isOnline: true,
      lastSeen: Date.now(),
      profileComplete: false,
    });

    await ctx.db.insert("reactionCounts", {
      userId,
      wave: 0,
      lightning: 0,
      party: 0,
      fire: 0,
    });

    return userId;
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.string(),
    college: v.string(),
    program: v.optional(v.string()),
    techStack: v.optional(v.string()),
    designation: v.string(),
    iceBreaker: v.string(),
    creatureName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated");
    }

    const tokenIdentifier = identity.tokenIdentifier;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    if (args.displayName.length > 40) throw new Error("Display name too long");
    if (args.iceBreaker.length > 100) throw new Error("Ice breaker too long");

    await ctx.db.patch(user._id, {
      displayName: args.displayName,
      college: args.college,
      program: args.program,
      techStack: args.techStack,
      designation: args.designation,
      iceBreaker: args.iceBreaker,
      creatureName: args.creatureName,
      profileComplete: true,
    });
  },
});

export const setOffline = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        isOnline: false,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getArenaPlayers = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const users = await ctx.db
      .query("users")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("profileComplete"), true))
      .order("desc")
      .take(50);

    // manually sort by xp since we can't sort by non-indexed field easily in Convex query
    const sorted = users.sort((a, b) => b.xp - a.xp);

    return sorted.map(({ tokenIdentifier, ...safeFields }) => safeFields);
  },
});

export const getLeaderboard = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const users = await ctx.db
      .query("users")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("profileComplete"), true))
      .take(100);

    const sorted = users.sort((a, b) => b.xp - a.xp).slice(0, 20);

    return sorted.map(u => ({
      _id: u._id,
      displayName: u.displayName,
      college: u.college,
      creatureIndex: u.creatureIndex,
      creatureName: u.creatureName,
      xp: u.xp,
    }));
  },
});
