import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export const useGetCurrentUser = () => useQuery(api.users.getCurrentUser);
export const useGetArenaPlayers = (eventId: string) => useQuery(api.users.getArenaPlayers, { eventId });
export const useCreateOrGetUser = () => useMutation(api.users.createOrGetUser);
export const useUpdateProfile = () => useMutation(api.users.updateProfile);
export const useSendReaction = () => useMutation(api.reactions.sendReaction);

export const useStartTriviaGame = () => useMutation(api.gameState.startTriviaGame);
export const useSubmitTriviaAnswer = () => useMutation(api.gameState.submitTriviaAnswer);
export const useSubmitWord = () => useMutation(api.gameState.submitWord);

export const useGetActiveGame = (eventId: string) => useQuery(api.gameState.getActiveGame, { eventId });
export const useGetGameScores = (gameId: Id<"gameState">) => useQuery(api.gameState.getGameScores, { gameId });
export const useGetLeaderboard = (eventId: string) => useQuery(api.users.getLeaderboard, { eventId });
