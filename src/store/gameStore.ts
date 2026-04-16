import { create } from 'zustand';
import type { Creature } from '@/lib/creatures';
import { assignCreature } from '@/lib/creatures';

export interface PlayerProfile {
  uid: string;
  displayName: string;
  college: string;
  designation: string;
  iceBreaker: string;
  creature: Creature;
  creatureName: string;
  xp: number;
  reactions: { wave: number; lightning: number; party: number; fire: number };
  eventId: string;
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium';
}

interface GameState {
  // Auth
  isLoggedIn: boolean;
  uid: string;
  authMethod: 'google' | 'eventId' | null;
  eventId: string;

  // Profile
  profile: PlayerProfile | null;
  profileCompleted: boolean;

  // Arena
  players: PlayerProfile[];
  activeTab: 'arena' | 'play' | 'leaderboard';

  // Games
  currentGame: 'trivia' | 'wordchain' | null;
  triviaQuestions: TriviaQuestion[];
  triviaIndex: number;
  triviaScore: number;
  wordChain: string[];
  wordChainTurn: boolean;

  // Actions
  login: (method: 'google' | 'eventId', eventId?: string) => void;
  setProfile: (profile: Omit<PlayerProfile, 'uid' | 'creature' | 'xp' | 'reactions' | 'eventId'>) => void;
  setActiveTab: (tab: 'arena' | 'play' | 'leaderboard') => void;
  addReaction: (targetUid: string, type: keyof PlayerProfile['reactions']) => void;
  startTrivia: (questions: TriviaQuestion[]) => void;
  answerTrivia: (optionIndex: number) => void;
  nextTriviaQuestion: () => void;
  addWordToChain: (word: string) => void;
  setCurrentGame: (game: 'trivia' | 'wordchain' | null) => void;
  addXp: (amount: number) => void;
}

function generateUid(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// Demo players for showcase
function generateDemoPlayers(eventId: string): PlayerProfile[] {
  const names = [
    { name: 'Aria Chen', college: 'MIT', designation: 'CS Junior', ice: 'I debug code in my dreams 💭' },
    { name: 'Dev Sharma', college: 'IIT Delhi', designation: 'ML Engineer', ice: 'My neural nets have feelings too 🤖' },
    { name: 'Luna Park', college: 'Stanford', designation: 'Design Lead', ice: 'Pixels are my love language 🎨' },
    { name: 'Kai Tanaka', college: 'Tokyo U', designation: 'Full Stack Dev', ice: 'I speak fluent JavaScript ☕' },
    { name: 'Zara Ahmed', college: 'Oxford', designation: 'Data Scientist', ice: 'I find patterns in chaos 📊' },
    { name: 'Rio Santos', college: 'USP Brazil', designation: 'Game Dev', ice: 'Life is just a simulation anyway 🎮' },
  ];

  return names.map((n, i) => {
    const uid = `demo_${i}_${n.name.replace(/\s/g, '')}`;
    const creature = assignCreature(uid);
    return {
      uid,
      displayName: n.name,
      college: n.college,
      designation: n.designation,
      iceBreaker: n.ice,
      creature,
      creatureName: creature.name,
      xp: Math.floor(Math.random() * 200) + 20,
      reactions: {
        wave: Math.floor(Math.random() * 10),
        lightning: Math.floor(Math.random() * 8),
        party: Math.floor(Math.random() * 12),
        fire: Math.floor(Math.random() * 6),
      },
      eventId,
    };
  });
}

export const useGameStore = create<GameState>((set, get) => ({
  isLoggedIn: false,
  uid: '',
  authMethod: null,
  eventId: '',
  profile: null,
  profileCompleted: false,
  players: [],
  activeTab: 'arena',
  currentGame: null,
  triviaQuestions: [],
  triviaIndex: 0,
  triviaScore: 0,
  wordChain: [],
  wordChainTurn: false,

  login: (method, eventId) => {
    const uid = generateUid();
    const eid = eventId || 'open';
    set({
      isLoggedIn: true,
      uid,
      authMethod: method,
      eventId: eid,
      players: generateDemoPlayers(eid),
    });
  },

  setProfile: (data) => {
    const state = get();
    const creature = assignCreature(state.uid);
    const profile: PlayerProfile = {
      uid: state.uid,
      displayName: data.displayName,
      college: data.college,
      designation: data.designation,
      iceBreaker: data.iceBreaker,
      creature,
      creatureName: data.creatureName || creature.name,
      xp: 0,
      reactions: { wave: 0, lightning: 0, party: 0, fire: 0 },
      eventId: state.eventId,
    };
    set({
      profile,
      profileCompleted: true,
      players: [...state.players, profile],
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  addReaction: (targetUid, type) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.uid === targetUid
          ? { ...p, reactions: { ...p.reactions, [type]: p.reactions[type] + 1 } }
          : p
      ),
    }));
  },

  startTrivia: (questions) => set({ currentGame: 'trivia', triviaQuestions: questions, triviaIndex: 0, triviaScore: 0 }),

  answerTrivia: (optionIndex) => {
    const state = get();
    const q = state.triviaQuestions[state.triviaIndex];
    if (!q) return;
    const correct = optionIndex === q.correctIndex;
    const points = correct ? (q.difficulty === 'easy' ? 10 : 20) : 0;
    set({ triviaScore: state.triviaScore + points });
    if (correct && state.profile) {
      get().addXp(points);
    }
  },

  nextTriviaQuestion: () => {
    const state = get();
    if (state.triviaIndex < state.triviaQuestions.length - 1) {
      set({ triviaIndex: state.triviaIndex + 1 });
    } else {
      set({ currentGame: null });
    }
  },

  addWordToChain: (word) => set((s) => ({ wordChain: [...s.wordChain, word] })),

  setCurrentGame: (game) => set({ currentGame: game, wordChain: game === 'wordchain' ? [] : get().wordChain }),

  addXp: (amount) => {
    set((state) => {
      if (!state.profile) return state;
      const updatedProfile = { ...state.profile, xp: state.profile.xp + amount };
      return {
        profile: updatedProfile,
        players: state.players.map((p) => (p.uid === state.uid ? updatedProfile : p)),
      };
    });
  },
}));
