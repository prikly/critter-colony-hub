import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { validateWordChain } from '@/lib/gemini';
import { Button, Input } from '@/components/ui';

export function WordChainGame() {
  const { wordChain, addWordToChain, setCurrentGame, addXp } = useGameStore();
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(10);
  const [feedback, setFeedback] = useState<{ valid: boolean; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [strikes, setStrikes] = useState(0);

  const resetTimer = useCallback(() => setTimer(10), []);

  useEffect(() => {
    resetTimer();
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setStrikes((s) => s + 1);
          setFeedback({ valid: false, reason: "Time's up!" });
          setTimeout(() => { setFeedback(null); resetTimer(); }, 1200);
          return 10;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [wordChain.length, resetTimer]);

  const lastWord = wordChain.length > 0 ? wordChain[wordChain.length - 1] : null;
  const lastLetter = lastWord ? lastWord[lastWord.length - 1].toUpperCase() : null;

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const result = await validateWordChain(wordChain, input.trim());
    setFeedback(result);
    if (result.valid) {
      addWordToChain(input.trim());
      addXp(15);
      setInput('');
    } else {
      setStrikes((s) => s + 1);
    }
    setLoading(false);
    setTimeout(() => setFeedback(null), 1500);
  };

  const isUrgent = timer <= 3;

  if (wordChain.length >= 20 || strikes >= 3) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center py-16"
      >
        <motion.div
          className="text-6xl mb-5"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {strikes >= 3 ? '💥' : '🎉'}
        </motion.div>
        <h3 className="font-heading font-black text-3xl text-foreground mb-2">
          {strikes >= 3 ? 'Game Over!' : 'Chain Complete!'}
        </h3>
        <p className="text-muted-foreground mb-2">Chain length: <span className="font-bold">{wordChain.length} words</span></p>
        <motion.p
          className="font-heading font-black text-4xl text-gradient-primary mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          {wordChain.length * 15} XP
        </motion.p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-8">
          {wordChain.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-medium"
            >
              {w}
            </motion.span>
          ))}
        </div>
        <Button onClick={() => setCurrentGame(null)} size="lg">Back to Games</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          🔗 {wordChain.length}/20
        </span>
        <motion.span
          className={`font-heading font-black text-xl tabular-nums ${isUrgent ? 'text-destructive' : 'text-foreground'}`}
          animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {timer}s
        </motion.span>
        <span className="font-heading font-bold text-sm text-destructive bg-destructive/10 px-3 py-1 rounded-full">
          ❌ {strikes}/3
        </span>
      </div>

      {/* Timer bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${isUrgent ? 'bg-destructive' : 'bg-primary'}`}
          animate={{ width: `${(timer / 10) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Word chain display */}
      <div className="flex flex-wrap gap-2 min-h-[4rem] bg-surface rounded-2xl p-4 border border-border">
        <AnimatePresence>
          {wordChain.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-primary text-primary-foreground rounded-full px-3.5 py-1.5 text-sm font-bold shadow-sm"
            >
              {w}
            </motion.span>
          ))}
        </AnimatePresence>
        {wordChain.length === 0 && (
          <span className="text-muted-foreground text-sm flex items-center">Type any word to start the chain!</span>
        )}
      </div>

      {lastLetter && (
        <motion.p
          className="text-center font-heading font-bold text-foreground"
          key={lastLetter}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Next word starts with: <span className="text-gradient-primary text-2xl font-black">{lastLetter}</span>
        </motion.p>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          className="flex-1"
          placeholder={lastLetter ? `Word starting with "${lastLetter}"...` : 'Type any word to begin!'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <Button onClick={handleSubmit} disabled={loading || !input.trim()} className="px-5">
          {loading ? (
            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}>⏳</motion.span>
          ) : '→'}
        </Button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5 }}
            className={`text-center font-heading font-bold text-sm rounded-2xl py-3 px-4 ${
              feedback.valid ? 'bg-earth-bg text-earth border border-earth/20' : 'bg-fire-bg text-fire border border-fire/20'
            }`}
          >
            {feedback.valid ? '✅' : '❌'} {feedback.reason}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
