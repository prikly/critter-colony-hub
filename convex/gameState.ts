import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

export const startTriviaGame = mutation({
  args: { 
    eventId: v.string(), 
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctIndex: v.number(),
      difficulty: v.union(v.literal("easy"), v.literal("medium")),
    }))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const hostUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!hostUser) throw new Error("Host user not found");

    const activeGame = await ctx.db
      .query("gameState")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (activeGame) {
      throw new Error("An active game already exists for this event");
    }

    const gameId = await ctx.db.insert("gameState", {
      eventId: args.eventId,
      status: "active",
      gameType: "trivia",
      hostUserId: hostUser._id,
      questions: args.questions,
      currentQuestionIndex: 0,
      questionStartTime: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const arenaPlayers = await ctx.db
      .query("users")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("profileComplete"), true))
      .collect();

    for (const player of arenaPlayers) {
      await ctx.db.insert("gameScores", {
        gameId,
        userId: player._id,
        eventId: args.eventId,
        xpEarned: 0,
        answeredCorrectly: 0,
      });
    }

    await ctx.scheduler.runAfter(15000, api.gameState.advanceQuestion, { gameId, expectedQuestionIndex: 0 });

    return gameId;
  },
});

export const submitTriviaAnswer = mutation({
  args: { gameId: v.id("gameState"), selectedIndex: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "active" || game.gameType !== "trivia" || game.currentQuestionIndex === undefined || !game.questions) {
      throw new Error("Invalid or inactive trivia game");
    }

    const questionIndex = game.currentQuestionIndex;

    const existingAnswer = await ctx.db
      .query("triviaAnswers")
      .withIndex("by_game_question", (q) => q.eq("gameId", args.gameId).eq("questionIndex", questionIndex))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existingAnswer) {
      throw new Error("Already answered this question");
    }

    const correctIndex = game.questions[questionIndex].correctIndex;
    const isCorrect = args.selectedIndex === correctIndex;
    
    await ctx.db.insert("triviaAnswers", {
      gameId: args.gameId,
      userId: user._id,
      questionIndex,
      selectedIndex: args.selectedIndex,
      isCorrect,
      answeredAt: Date.now(),
    });

    let xpEarned = 0;
    if (isCorrect) {
      xpEarned = game.questions[questionIndex].difficulty === "easy" ? 10 : 20;

      const userScore = await ctx.db
        .query("gameScores")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("gameId"), args.gameId))
        .first();

      if (userScore) {
        await ctx.db.patch(userScore._id, {
          xpEarned: userScore.xpEarned + xpEarned,
          answeredCorrectly: (userScore.answeredCorrectly || 0) + 1,
        });
      }

      await ctx.db.patch(user._id, {
        xp: user.xp + xpEarned,
      });
    }

    return { isCorrect, correctIndex, xpEarned };
  },
});

export const advanceQuestion = mutation({
  args: { gameId: v.id("gameState"), expectedQuestionIndex: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "active" || game.gameType !== "trivia" || game.currentQuestionIndex === undefined || !game.questions) {
      return;
    }

    // Only advance if we haven't already moved past the expected index
    if (args.expectedQuestionIndex !== undefined && game.currentQuestionIndex > args.expectedQuestionIndex) {
       return;
    }

    const nextIndex = game.currentQuestionIndex + 1;

    if (nextIndex >= game.questions.length) {
      await ctx.scheduler.runAfter(0, api.gameState.finishGame, { gameId: args.gameId });
    } else {
      await ctx.db.patch(args.gameId, {
        currentQuestionIndex: nextIndex,
        questionStartTime: Date.now(),
        updatedAt: Date.now(),
      });
      await ctx.scheduler.runAfter(15000, api.gameState.advanceQuestion, { gameId: args.gameId, expectedQuestionIndex: nextIndex });
    }
  },
});

export const startWordChainGame = mutation({
  args: { eventId: v.string(), firstWord: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const hostUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!hostUser) throw new Error("Host user not found");

    const activeGame = await ctx.db
        .query("gameState")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

    if (activeGame) {
      throw new Error("An active game already exists for this event");
    }

    const arenaPlayers = await ctx.db
      .query("users")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("profileComplete"), true))
      .collect();

    if (arenaPlayers.length === 0) {
      throw new Error("No players available to start word chain");
    }

    const turnStartTime = Date.now();
    const gameId = await ctx.db.insert("gameState", {
      eventId: args.eventId,
      status: "active",
      gameType: "wordchain",
      hostUserId: hostUser._id,
      wordChain: [args.firstWord],
      currentTurnUserId: arenaPlayers[0]._id,
      turnStartTime,
      skippedCounts: arenaPlayers.reduce((acc, p) => ({ ...acc, [p._id]: 0 }), {}),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    for (const player of arenaPlayers) {
      await ctx.db.insert("gameScores", {
        gameId,
        userId: player._id,
        eventId: args.eventId,
        xpEarned: 0,
        wordsContributed: 0,
      });
    }

    await ctx.scheduler.runAfter(10000, api.gameState.turnTimeout, { gameId, expectedTurnStartTime: turnStartTime });
    
    return gameId;
  },
});

export const submitWord = mutation({
  args: { gameId: v.id("gameState"), word: v.string(), isValid: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");

    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "active" || game.gameType !== "wordchain") {
      throw new Error("Invalid or inactive word chain game");
    }

    if (game.currentTurnUserId !== user._id) {
      throw new Error("Not your turn");
    }

    const skippedCounts = { ...(game.skippedCounts || {}) };
    let currentWordChain = [...(game.wordChain || [])];

    if (args.isValid) {
      currentWordChain.push(args.word);
      
      const userScore = await ctx.db
        .query("gameScores")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("gameId"), args.gameId))
        .first();

      if (userScore) {
        await ctx.db.patch(userScore._id, {
          xpEarned: userScore.xpEarned + 15,
          wordsContributed: (userScore.wordsContributed || 0) + 1,
        });
      }

      await ctx.db.patch(user._id, { xp: user.xp + 15 });
    } else {
      skippedCounts[user._id] = (skippedCounts[user._id] || 0) + 1;
    }

    // Determine next player
    const arenaPlayers = await ctx.db
        .query("users")
        .withIndex("by_event", (q) => q.eq("eventId", game.eventId))
        .filter((q) => q.eq(q.field("profileComplete"), true))
        .collect();

    const eligiblePlayers = arenaPlayers.filter(p => (skippedCounts[p._id] || 0) < 3);

    if (currentWordChain.length >= 20 || eligiblePlayers.length <= 1) {
       await ctx.scheduler.runAfter(0, api.gameState.finishGame, { gameId: args.gameId });
    } else {
        const currentIndex = eligiblePlayers.findIndex(p => p._id === user._id);
        const nextPlayer = eligiblePlayers[(currentIndex + 1) % eligiblePlayers.length];
        
        const turnStartTime = Date.now();
        await ctx.db.patch(game._id, {
            wordChain: currentWordChain,
            skippedCounts,
            currentTurnUserId: nextPlayer._id,
            turnStartTime,
            updatedAt: Date.now(),
        });

        await ctx.scheduler.runAfter(10000, api.gameState.turnTimeout, { gameId: game._id, expectedTurnStartTime: turnStartTime });
    }
  },
});

export const turnTimeout = mutation({
  args: { gameId: v.id("gameState"), expectedTurnStartTime: v.number() },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "active" || game.gameType !== "wordchain") {
      return;
    }

    // If turn has moved on since this timeout was scheduled or no turn tracking, do nothing
    if (!game.turnStartTime || game.turnStartTime !== args.expectedTurnStartTime) {
       return;
    }

    const skippedCounts = { ...(game.skippedCounts || {}) };
    const currentUserId = game.currentTurnUserId;
    if (currentUserId) {
        skippedCounts[currentUserId] = (skippedCounts[currentUserId] || 0) + 1;
    }

    const arenaPlayers = await ctx.db
        .query("users")
        .withIndex("by_event", (q) => q.eq("eventId", game.eventId))
        .filter((q) => q.eq(q.field("profileComplete"), true))
        .collect();

    const eligiblePlayers = arenaPlayers.filter(p => (skippedCounts[p._id] || 0) < 3);

    let currentWordChain = [...(game.wordChain || [])];

    if (currentWordChain.length >= 20 || eligiblePlayers.length <= 1) {
       await ctx.scheduler.runAfter(0, api.gameState.finishGame, { gameId: args.gameId });
    } else {
        let nextPlayerIndex = 0;
        if (currentUserId) {
             const currentIndex = eligiblePlayers.findIndex(p => p._id === currentUserId);
             nextPlayerIndex = currentIndex >= 0 ? (currentIndex + 1) % eligiblePlayers.length : 0;
        }
        
        const nextPlayer = eligiblePlayers[nextPlayerIndex];
        
        const turnStartTime = Date.now();
        await ctx.db.patch(game._id, {
            skippedCounts,
            currentTurnUserId: nextPlayer._id,
            turnStartTime,
            updatedAt: Date.now(),
        });

        await ctx.scheduler.runAfter(10000, api.gameState.turnTimeout, { gameId: game._id, expectedTurnStartTime: turnStartTime });
    }
  },
});


export const finishGame = mutation({
  args: { gameId: v.id("gameState") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status === "finished") return [];

    await ctx.db.patch(args.gameId, {
      status: "finished",
      updatedAt: Date.now(),
    });

    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const topScores = scores.sort((a, b) => b.xpEarned - a.xpEarned).slice(0, 3);
    const results = [];
    for (const score of topScores) {
        const u = await ctx.db.get(score.userId);
        if (u) {
            results.push({
                _id: u._id,
                displayName: u.displayName,
                creatureIndex: u.creatureIndex,
                creatureName: u.creatureName,
                xpEarned: score.xpEarned
            });
        }
    }
    
    return results;
  },
});

export const getActiveGame = query({
  args: { eventId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gameState")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getGameScores = query({
  args: { gameId: v.id("gameState") },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("gameScores")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();

    const sorted = scores.sort((a, b) => b.xpEarned - a.xpEarned);
    
    const enriched = await Promise.all(sorted.map(async s => {
        const user = await ctx.db.get(s.userId);
        return {
           ...s,
           displayName: user?.displayName,
           creatureName: user?.creatureName,
           creatureIndex: user?.creatureIndex
        };
    }));

    return enriched;
  },
});

export const getTriviaAnswers = query({
  args: { gameId: v.id("gameState"), questionIndex: v.number() },
  handler: async (ctx, args) => {
    const answers = await ctx.db
      .query("triviaAnswers")
      .withIndex("by_game_question", (q) => q.eq("gameId", args.gameId).eq("questionIndex", args.questionIndex))
      .collect();
    
    return answers.length;
  },
});
