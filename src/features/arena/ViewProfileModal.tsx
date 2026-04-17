import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui';
import { PlayerProfile } from '@/store/gameStore';
import { getElementColor } from '@/lib/creatures';

interface ViewProfileModalProps {
  player: PlayerProfile | null;
  onClose: () => void;
}

export function ViewProfileModal({ player, onClose }: ViewProfileModalProps) {
  const colors = player ? getElementColor(player.creature.element) : null;

  return (
    <AnimatePresence>
      {player && colors && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full max-w-sm ${colors.bg} glass-strong border border-border shadow-elevated rounded-3xl p-6 overflow-hidden`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-background/20 hover:bg-background/40 text-foreground transition-colors backdrop-blur-md"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center mb-6 relative mt-4">
              <motion.div
                className="text-7xl leading-none drop-shadow-md mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              >
                {player.creature.emoji}
              </motion.div>
              <h2 className="font-heading font-black text-2xl text-foreground text-center mb-1">
                {player.displayName}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-heading font-bold text-sm text-foreground/80">{player.creatureName}</span>
                <Badge element={player.creature.element} glow>
                  {player.creature.element} · {player.creature.trait}
                </Badge>
              </div>
              
              <div className="bg-background/40 px-4 py-2 rounded-2xl backdrop-blur-sm inline-flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <span className="font-bold text-lg">{player.xp} XP</span>
              </div>
            </div>

            <div className="space-y-4 bg-background/60 backdrop-blur-md rounded-2xl p-5 border border-border/50">
              {player.iceBreaker && (
                <div className="text-center italic text-foreground/80 pb-3 border-b border-border/50">
                  "{player.iceBreaker}"
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm pt-2">
                {player.college && (
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-1">College/Org</div>
                    <div className="font-medium">{player.college}</div>
                  </div>
                )}
                {player.designation && (
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Designation</div>
                    <div className="font-medium">{player.designation}</div>
                  </div>
                )}
                {player.program && (
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Program</div>
                    <div className="font-medium">{player.program}</div>
                  </div>
                )}
                {player.techStack && (
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold mb-1">Tech Stack</div>
                    <div className="font-medium line-clamp-2">{player.techStack}</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
