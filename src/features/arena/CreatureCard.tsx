import { motion, AnimatePresence } from 'framer-motion';
import { getElementColor, type Creature } from '@/lib/creatures';
import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui';

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
}

const REACTION_EMOJIS = [
  { key: 'wave' as const, emoji: '👋' },
  { key: 'lightning' as const, emoji: '⚡' },
  { key: 'party' as const, emoji: '🎉' },
  { key: 'fire' as const, emoji: '🔥' },
];

export function CreatureCard({ uid, displayName, college, iceBreaker, creature, creatureName, reactions, isOwn }: CreatureCardProps) {
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; emoji: string }>>([]);
  const addReaction = useGameStore((s) => s.addReaction);
  const colors = getElementColor(creature.element);

  const handleReaction = (type: keyof typeof reactions, emoji: string) => {
    addReaction(uid, type);
    const id = Date.now() + Math.random();
    setFloatingReactions((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1000);
  };

  return (
    <Card variant="creature" className={`relative overflow-hidden ${colors.bg}`}>
      {isOwn && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-heading font-bold px-2 py-0.5 rounded-full">
          YOU
        </div>
      )}

      <AnimatePresence>
        {floatingReactions.map((r) => (
          <motion.div
            key={r.id}
            className="absolute text-2xl pointer-events-none z-10"
            initial={{ opacity: 1, y: 0, x: Math.random() * 60 + 20 }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-1.5 mb-3">
        <motion.div
          className="text-5xl leading-none"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          {creature.emoji}
        </motion.div>
        <span className="font-heading font-bold text-sm text-foreground">{creatureName}</span>
        <Badge element={creature.element}>
          {creature.element} · {creature.trait}
        </Badge>
      </div>

      <div className="text-center space-y-0.5">
        <p className="font-heading font-bold text-sm text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{college}</p>
        {iceBreaker && (
          <p className="text-xs text-foreground/70 italic mt-1 line-clamp-2">"{iceBreaker}"</p>
        )}
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {REACTION_EMOJIS.map(({ key, emoji }) => (
          <motion.button
            key={key}
            whileTap={{ scale: 1.3 }}
            className="flex items-center gap-0.5 bg-background/60 rounded-full px-2 py-1 text-sm hover:bg-background transition-colors"
            onClick={() => handleReaction(key, emoji)}
          >
            <span>{emoji}</span>
            <span className="text-[10px] text-muted-foreground font-medium">{reactions[key]}</span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
