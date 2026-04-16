import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { validateWordChain } from '@/lib/gemini';

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
          setFeedback({ valid: false, reason: 'Time\'s up!' });
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

  if (wordChain.length >= 20 || strikes >= 3) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="text-5xl mb-4">{strikes >= 3 ? '💥' : '🎉'}</div>
        <h3 className="font-heading font-bold text-2xl text-foreground mb-2">
          {strikes >= 3 ? 'Game Over!' : 'Chain Complete!'}
        </h3>
        <p className="text-muted-foreground mb-2">Chain length: {wordChain.length} words</p>
        <p className="font-heading font-bold text-2xl text-primary mb-6">{wordChain.length * 15} XP earned</p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-6">
          {wordChain.map((w, i) => (
            <span key={i} className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs font-medium">
              {w}
            </span>
          ))}
        </div>
        <button onClick={() => setCurrentGame(null)} className="btn-primary">Back to Games</button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-sm text-muted-foreground">
          Chain: {wordChain.length}/20
        </span>
        <span className={`font-heading font-bold text-lg ${timer <= 3 ? 'text-destructive' : 'text-foreground'}`}>
          ⏱ {timer}s
        </span>
        <span className="font-heading font-bold text-sm text-destructive">
          ❌ {strikes}/3
        </span>
      </div>

      {/* Word chain display */}
      <div className="flex flex-wrap gap-1.5 min-h-[3rem] bg-muted rounded-xl p-3">
        <AnimatePresence>
          {wordChain.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium"
            >
              {w}
            </motion.span>
          ))}
        </AnimatePresence>
        {wordChain.length === 0 && (
          <span className="text-muted-foreground text-sm">Type any word to start the chain!</span>
        )}
      </div>

      {lastLetter && (
        <p className="text-center font-heading font-bold text-foreground">
          Next word must start with: <span className="text-primary text-xl">{lastLetter}</span>
        </p>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="input-field flex-1"
          placeholder={lastLetter ? `Type a word starting with "${lastLetter}"...` : 'Type any word to begin!'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <button onClick={handleSubmit} disabled={loading || !input.trim()} className="btn-primary px-4 disabled:opacity-50">
          {loading ? '...' : '→'}
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center font-heading font-bold text-sm rounded-xl py-2 ${feedback.valid ? 'bg-earth-bg text-earth' : 'bg-fire-bg text-fire'}`}
          >
            {feedback.valid ? '✅' : '❌'} {feedback.reason}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
