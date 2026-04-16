import { motion, AnimatePresence } from 'framer-motion';
import { getElementColor, type Creature } from '@/lib/creatures';
import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card, Badge } from '@/components/ui';

interface CreatureCardProps {
  uid: string;
  displayName: string;
  college: string;
  iceBreaker: string;
  creature: Creature;
  creatureName: string;
  reactions: { wave: number; lightning: number; party: number; fire: number };
  xp: number;
  isOwn?: boolean;
  index?: number;
}

const REACTION_EMOJIS = [
  { key: 'wave' as const, emoji: '👋' },
  { key: 'lightning' as const, emoji: '⚡' },
  { key: 'party' as const, emoji: '🎉' },
  { key: 'fire' as const, emoji: '🔥' },
];

export function CreatureCard({ uid, displayName, college, iceBreaker, creature, creatureName, reactions, isOwn, index = 0 }: CreatureCardProps) {
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string }>>([]);
  const addReaction = useGameStore((s) => s.addReaction);
  const colors = getElementColor(creature.element);

  const handleReaction = (type: keyof typeof reactions, emoji: string) => {
    addReaction(uid, type);
    const id = Date.now() + Math.random();
    setFloatingReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card variant="creature" className={`relative overflow-hidden ${colors.bg} group`}>
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

        {isOwn && (
          <motion.div
            className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-heading font-bold px-2.5 py-0.5 rounded-full shadow-sm z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
          >
            YOU
          </motion.div>
        )}

        {/* Floating reactions */}
        <AnimatePresence>
          {floatingReactions.map((r) => (
            <motion.div
              key={r.id}
              className="absolute text-2xl pointer-events-none z-10"
              initial={{ opacity: 1, y: 10, x: Math.random() * 60 + 10, scale: 0.5 }}
              animate={{ opacity: 0, y: -70, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Creature emoji */}
        <div className="flex flex-col items-center gap-1.5 mb-3 relative">
          <motion.div
            className="text-5xl leading-none drop-shadow-sm"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2 + (index % 3) * 0.4, ease: 'easeInOut' }}
          >
            {creature.emoji}
          </motion.div>
          <span className="font-heading font-bold text-sm text-foreground">{creatureName}</span>
          <Badge element={creature.element} glow>
            {creature.element} · {creature.trait}
          </Badge>
        </div>

        {/* Player info */}
        <div className="text-center space-y-0.5">
          <p className="font-heading font-bold text-sm text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">{college}</p>
          {iceBreaker && (
            <p className="text-xs text-foreground/60 italic mt-1.5 line-clamp-2 leading-relaxed">"{iceBreaker}"</p>
          )}
        </div>

        {/* Reaction bar */}
        <div className="flex justify-center gap-1 mt-3">
          {REACTION_EMOJIS.map(({ key, emoji }) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 1.4 }}
              className="flex items-center gap-0.5 bg-background/60 backdrop-blur-sm rounded-full px-2 py-1 text-sm hover:bg-background/90 transition-all duration-200 border border-transparent hover:border-border/50"
              onClick={() => handleReaction(key, emoji)}
            >
              <span className="transition-transform duration-200">{emoji}</span>
              <span className="text-[10px] text-muted-foreground font-semibold tabular-nums">{reactions[key]}</span>
            </motion.button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
