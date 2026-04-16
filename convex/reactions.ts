import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const sendReaction = mutation({
  args: {
    toUserId: v.id("users"),
    type: v.union(v.literal("wave"), v.literal("lightning"), v.literal("party"), v.literal("fire")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!currentUser) throw new Error("User not found");
    if (currentUser._id === args.toUserId) throw new Error("Cannot react to yourself");

    // Rate limiting: check recent reactions within last 30 seconds
    const threshold = Date.now() - 30 * 1000;
    const recentReactions = await ctx.db
      .query("reactions")
      .withIndex("by_sender", (q) => q.eq("fromUserId", currentUser._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("toUserId"), args.toUserId),
          q.eq(q.field("type"), args.type),
          q.gte(q.field("createdAt"), threshold)
        )
      )
      .collect();

    if (recentReactions.length > 0) {
      throw new Error(`Rate limit exceeded for reaction ${args.type}`);
    }

    // Insert reaction
    await ctx.db.insert("reactions", {
      fromUserId: currentUser._id,
      toUserId: args.toUserId,
      type: args.type,
      createdAt: Date.now(),
    });

    // Update counts
    const counts = await ctx.db
      .query("reactionCounts")
      .withIndex("by_user", (q) => q.eq("userId", args.toUserId))
      .unique();

    if (counts) {
      await ctx.db.patch(counts._id, {
        [args.type]: counts[args.type] + 1,
      });
    }

    // Award 2 XP to recipient
    const recipient = await ctx.db.get(args.toUserId);
    if (recipient) {
      await ctx.db.patch(recipient._id, {
        xp: recipient.xp + 2,
      });
    }
  },
});

export const getReactionCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactionCounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getRecentReactions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_recipient", (q) => q.eq("toUserId", args.userId))
      .order("desc")
      .take(10);
      
    // Join with user data to get display names
    const withUsers = await Promise.all(
      reactions.map(async (r) => {
        const sender = await ctx.db.get(r.fromUserId);
        return {
          ...r,
          senderName: sender?.creatureName || sender?.displayName || "Someone",
        };
      })
    );
    
    return withUsers;
  },
});
