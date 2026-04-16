import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { CreatureCard, Leaderboard } from '@/features/arena';
import { TriviaGame, WordChainGame } from '@/features/games';
import { Badge } from '@/components/ui';

export const Route = createFileRoute('/arena')({
  head: () => ({
    meta: [
      { title: 'The Arena — CritterZone' },
      { name: 'description', content: 'Join the arena, react to creatures, and play mini-games!' },
    ],
  }),
  component: ArenaPage,
});

function ArenaPage() {
  const navigate = useNavigate();
  const { isLoggedIn, profileCompleted, players, activeTab, setActiveTab, currentGame, setCurrentGame, profile, uid } = useGameStore();

  if (!isLoggedIn || !profileCompleted) {
    navigate({ to: '/' });
    return null;
  }

  const tabs = [
    { key: 'arena' as const, label: '🏟️ Arena' },
    { key: 'play' as const, label: '🎮 Play' },
    { key: 'leaderboard' as const, label: '🏆 Board' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-heading font-black text-lg">
          Critter<span className="text-primary">Zone</span>
        </h1>
        <div className="flex items-center gap-2">
          <Badge element="earth">🟢 {players.length} online</Badge>
          {profile && <span className="text-xl">{profile.creature.emoji}</span>}
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-20 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'arena' && (
            <motion.div key="arena" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {players.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🌍</div>
                  <h2 className="font-heading font-bold text-xl text-foreground mb-2">You're the first creature here!</h2>
                  <p className="text-muted-foreground">Share the link to invite others to the arena.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {players.map((p) => (
                    <CreatureCard
                      key={p.uid}
                      uid={p.uid}
                      displayName={p.displayName}
                      college={p.college}
                      iceBreaker={p.iceBreaker}
                      creature={p.creature}
                      creatureName={p.creatureName}
                      reactions={p.reactions}
                      xp={p.xp}
                      isOwn={p.uid === uid}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'play' && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {currentGame === 'trivia' ? (
                <TriviaGame />
              ) : currentGame === 'wordchain' ? (
                <WordChainGame />
              ) : (
                <div className="space-y-4">
                  <h2 className="font-heading font-bold text-xl text-foreground">Mini Games</h2>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentGame('trivia')}
                    className="w-full bg-water-bg border-2 border-water/20 rounded-2xl p-5 text-left"
                  >
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="font-heading font-bold text-lg text-foreground">Trivia Blitz</h3>
                    <p className="text-sm text-muted-foreground mt-1">5 rapid-fire questions · 15 seconds each · Earn up to 100 XP</p>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentGame('wordchain')}
                    className="w-full bg-thunder-bg border-2 border-thunder/20 rounded-2xl p-5 text-left"
                  >
                    <div className="text-3xl mb-2">🔗</div>
                    <h3 className="font-heading font-bold text-lg text-foreground">Word Chain</h3>
                    <p className="text-sm text-muted-foreground mt-1">Chain words together · 10 seconds per turn · 15 XP per word</p>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border z-20">
        <div className="flex max-w-4xl mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-center text-sm font-heading font-bold transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
