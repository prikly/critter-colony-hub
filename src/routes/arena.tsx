import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, PlayerProfile } from '@/store/gameStore';
import { CreatureCard, Leaderboard, EditProfileModal, ViewProfileModal } from '@/features/arena';
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

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function ArenaPage() {
  const navigate = useNavigate();
  const { isLoggedIn, profileCompleted, players, activeTab, setActiveTab, currentGame, setCurrentGame, profile, uid } = useGameStore();

  const [isEditProfileOpen, setEditProfileOpen] = useState(false);
  const [viewProfilePlayer, setViewProfilePlayer] = useState<PlayerProfile | null>(null);

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-30 glass-strong border-b border-border/50 px-4 py-3 flex items-center justify-between"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-heading font-black text-lg">
          Critter<span className="text-gradient-primary">Zone</span>
        </h1>
        <div className="flex items-center gap-2.5">
          <Badge element="earth" glow>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-earth mr-1.5 animate-glow-pulse" />
            {players.length} online
          </Badge>
          {profile && (
            <motion.button
              onClick={() => setEditProfileOpen(true)}
              className="text-xl w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {profile.creature.emoji}
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Content */}
      <main className="flex-1 px-4 py-5 pb-24 max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'arena' && (
            <motion.div
              key="arena"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {players.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    className="text-6xl mb-5"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    🌍
                  </motion.div>
                  <h2 className="font-heading font-black text-2xl text-foreground mb-2">You're the first creature here!</h2>
                  <p className="text-muted-foreground max-w-xs mx-auto">Share the link to invite others to the arena.</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {players.map((p, i) => (
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
                      index={i}
                      onClick={() => setViewProfilePlayer(p)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'play' && (
            <motion.div
              key="play"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {currentGame === 'trivia' ? (
                <TriviaGame />
              ) : currentGame === 'wordchain' ? (
                <WordChainGame />
              ) : (
                <div className="space-y-4">
                  <motion.h2
                    className="font-heading font-black text-2xl text-foreground"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Mini Games
                  </motion.h2>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentGame('trivia')}
                    className="w-full bg-water-bg border border-water/20 rounded-2xl p-6 text-left shadow-card hover:shadow-elevated transition-all duration-300 group"
                  >
                    <motion.div
                      className="text-4xl mb-3"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                    >
                      🎯
                    </motion.div>
                    <h3 className="font-heading font-black text-xl text-foreground group-hover:text-water transition-colors">Trivia Blitz</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      5 rapid-fire questions · 15 seconds each · Earn up to 100 XP
                    </p>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentGame('wordchain')}
                    className="w-full bg-thunder-bg border border-thunder/20 rounded-2xl p-6 text-left shadow-card hover:shadow-elevated transition-all duration-300 group"
                  >
                    <motion.div
                      className="text-4xl mb-3"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    >
                      🔗
                    </motion.div>
                    <h3 className="font-heading font-black text-xl text-foreground group-hover:text-thunder transition-colors">Word Chain</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      Chain words together · 10 seconds per turn · 15 XP per word
                    </p>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Leaderboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border/50 z-30 safe-area-bottom">
        <div className="flex max-w-5xl mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3.5 text-center text-sm font-heading font-bold transition-all duration-300 relative ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full"
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setEditProfileOpen(false)} />
      <ViewProfileModal player={viewProfilePlayer} onClose={() => setViewProfilePlayer(null)} />
    </div>
  );
}
