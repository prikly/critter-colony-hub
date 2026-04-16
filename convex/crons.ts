import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export const cleanupOfflineUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const threshold = Date.now() - 2 * 60 * 1000;
    
    // In Convex, without an index we need to use filter to iterate.
    // We fetch users where `isOnline` is true and update if `lastSeen < threshold`
    const onlineUsers = await ctx.db
      .query("users")
      .filter((q) => q.and(
          q.eq(q.field("isOnline"), true),
          q.lt(q.field("lastSeen"), threshold)
      ))
      .collect();

    for (const user of onlineUsers) {
      await ctx.db.patch(user._id, {
        isOnline: false,
      });
    }
  },
});

const crons = cronJobs();

crons.interval(
  "cleanup inactive users",
  { minutes: 5 },
  internal.crons.cleanupOfflineUsers,
  {}
);

export default crons;
