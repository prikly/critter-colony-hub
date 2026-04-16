import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export function Leaderboard() {
  const players = useGameStore((s) => s.players);
  const uid = useGameStore((s) => s.uid);
  const sorted = [...players].sort((a, b) => b.xp - a.xp);

  const rankStyle = (i: number) => {
    if (i === 0) return 'bg-gradient-to-r from-amber-50 to-yellow-50/60 border-amber-200/80';
    if (i === 1) return 'bg-gradient-to-r from-slate-50 to-gray-50/60 border-slate-200/80';
    if (i === 2) return 'bg-gradient-to-r from-orange-50 to-amber-50/60 border-orange-200/80';
    return 'bg-card border-border';
  };

  const rankIcon = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `${i + 1}`;
  };

  return (
    <div className="space-y-2.5">
      <motion.h2
        className="font-heading font-black text-xl text-foreground mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🏆 Leaderboard
      </motion.h2>

      {sorted.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground py-12"
        >
          No players yet!
        </motion.p>
      )}

      {sorted.map((player, i) => (
        <motion.div
          key={player.uid}
          className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 border transition-all duration-300 ${rankStyle(i)} ${
            player.uid === uid ? 'ring-2 ring-primary/40 shadow-card' : ''
          } ${i < 3 ? 'shadow-card' : ''}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{ x: 4 }}
        >
          <span className={`text-lg font-black w-8 text-center shrink-0 ${i < 3 ? 'text-2xl' : 'text-muted-foreground'}`}>
            {rankIcon(i)}
          </span>
          <motion.span
            className="text-2xl shrink-0"
            animate={i < 3 ? { y: [0, -3, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
          >
            {player.creature.emoji}
          </motion.span>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-sm truncate">
              {player.displayName}
              {player.uid === uid && <span className="text-primary ml-1 text-xs">(You)</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{player.college}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-heading font-black text-primary tabular-nums">{player.xp}</p>
            <p className="text-[10px] text-muted-foreground font-medium">XP</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
