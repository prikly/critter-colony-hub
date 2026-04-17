import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    tokenIdentifier: v.string(),         // from Convex Auth, unique per user
    eventId: v.string(),                 // room/event they belong to
    displayName: v.optional(v.string()),
    college: v.optional(v.string()),
    program: v.optional(v.string()),
    techStack: v.optional(v.string()),
    designation: v.optional(v.string()),
    iceBreaker: v.optional(v.string()),
    creatureIndex: v.number(),           // 0–15, deterministic from tokenIdentifier
    creatureName: v.string(),            // default creature name, user can rename
    xp: v.number(),                      // total XP across all games
    isOnline: v.boolean(),
    lastSeen: v.number(),                // Date.now() timestamp
    profileComplete: v.boolean(),        // false until Screen 2 submitted
  })
  .index("by_token", ["tokenIdentifier"])
  .index("by_event", ["eventId"]),

  reactions: defineTable({
    toUserId: v.id("users"),             // who received the reaction
    fromUserId: v.id("users"),           // who sent it
    type: v.union(
      v.literal("wave"),
      v.literal("lightning"),
      v.literal("party"),
      v.literal("fire")
    ),
    createdAt: v.number(),
  })
  .index("by_recipient", ["toUserId"])
  .index("by_sender", ["fromUserId"]),

  reactionCounts: defineTable({
    userId: v.id("users"),
    wave: v.number(),
    lightning: v.number(),
    party: v.number(),
    fire: v.number(),
  })
  .index("by_user", ["userId"]),

  gameState: defineTable({
    eventId: v.string(),                 // one active game per event room
    status: v.union(
      v.literal("waiting"),
      v.literal("active"),
      v.literal("finished")
    ),
    gameType: v.union(
      v.literal("trivia"),
      v.literal("wordchain")
    ),
    hostUserId: v.id("users"),

    // Trivia fields
    questions: v.optional(v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),      // always 4 options
      correctIndex: v.number(),
      difficulty: v.union(v.literal("easy"), v.literal("medium")),
    }))),
    currentQuestionIndex: v.optional(v.number()),
    questionStartTime: v.optional(v.number()),

    // Word chain fields
    wordChain: v.optional(v.array(v.string())),
    currentTurnUserId: v.optional(v.id("users")),
    turnStartTime: v.optional(v.number()),
    skippedCounts: v.optional(v.any()),  // { userId: skipCount }

    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_event", ["eventId"]),

  gameScores: defineTable({
    gameId: v.id("gameState"),
    userId: v.id("users"),
    eventId: v.string(),
    xpEarned: v.number(),
    answeredCorrectly: v.optional(v.number()),   // trivia
    wordsContributed: v.optional(v.number()),     // word chain
  })
  .index("by_game", ["gameId"])
  .index("by_user", ["userId"])
  .index("by_event", ["eventId"]),

  triviaAnswers: defineTable({
    gameId: v.id("gameState"),
    userId: v.id("users"),
    questionIndex: v.number(),
    selectedIndex: v.number(),
    isCorrect: v.boolean(),
    answeredAt: v.number(),
  })
  .index("by_game_question", ["gameId", "questionIndex"])
  .index("by_user_game", ["userId", "gameId"]),

});
