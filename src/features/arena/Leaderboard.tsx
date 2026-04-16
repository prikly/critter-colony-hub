import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export function Leaderboard() {
  const players = useGameStore((s) => s.players);
  const uid = useGameStore((s) => s.uid);
  const sorted = [...players].sort((a, b) => b.xp - a.xp);

  const rankClass = (i: number) => {
    if (i === 0) return 'bg-gradient-to-r from-amber-100 to-yellow-50 border-amber-300 border-2';
    if (i === 1) return 'bg-gradient-to-r from-gray-100 to-slate-50 border-gray-300 border-2';
    if (i === 2) return 'bg-gradient-to-r from-orange-100 to-amber-50 border-orange-300 border-2';
    return 'bg-card border border-border';
  };

  const rankIcon = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `${i + 1}`;
  };

  return (
    <div className="space-y-2">
      <h2 className="font-heading font-bold text-lg text-foreground mb-3">🏆 Leaderboard</h2>
      {sorted.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No players yet!</p>
      )}
      {sorted.map((player, i) => (
        <motion.div
          key={player.uid}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 ${rankClass(i)} ${player.uid === uid ? 'ring-2 ring-primary' : ''}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <span className="text-lg font-bold w-8 text-center shrink-0">{rankIcon(i)}</span>
          <span className="text-2xl shrink-0">{player.creature.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-heading font-bold text-sm truncate">
              {player.displayName}
              {player.uid === uid && <span className="text-primary ml-1">(You)</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{player.college}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-heading font-bold text-primary">{player.xp}</p>
            <p className="text-[10px] text-muted-foreground">XP</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
