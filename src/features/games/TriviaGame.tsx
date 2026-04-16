import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type TriviaQuestion } from '@/store/gameStore';
import { generateTriviaQuestions } from '@/lib/gemini';
import { Button } from '@/components/ui';

export function TriviaGame() {
  const { triviaQuestions, triviaIndex, triviaScore, startTrivia, answerTrivia, nextTriviaQuestion, setCurrentGame } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState<number | null>(null);
  const [timer, setTimer] = useState(15);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const questions = await generateTriviaQuestions();
    startTrivia(questions as TriviaQuestion[]);
    setLoading(false);
  }, [startTrivia]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (loading || answered !== null) return;
    setTimer(15);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [triviaIndex, loading, answered]);

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    answerTrivia(idx);
    setTimeout(() => {
      setAnswered(null);
      nextTriviaQuestion();
    }, 1500);
  };

  const currentQ = triviaQuestions[triviaIndex];

  if (loading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { repeat: Infinity, duration: 1.5, ease: 'linear' }, scale: { repeat: Infinity, duration: 0.8 } }}
          className="text-5xl"
        >
          🎯
        </motion.div>
        <p className="font-heading font-bold text-foreground text-lg">Loading Trivia...</p>
        <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    );
  }

  if (!currentQ) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center py-16"
      >
        <motion.div
          className="text-6xl mb-5"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          🎉
        </motion.div>
        <h3 className="font-heading font-black text-3xl text-foreground mb-2">Trivia Complete!</h3>
        <p className="text-muted-foreground mb-1">Your score</p>
        <motion.p
          className="font-heading font-black text-5xl text-gradient-primary mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          {triviaScore} XP
        </motion.p>
        <Button onClick={() => setCurrentGame(null)} size="lg">Back to Games</Button>
      </motion.div>
    );
  }

  const timerPercent = (timer / 15) * 100;
  const isUrgent = timer <= 5;

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Q{triviaIndex + 1}/{triviaQuestions.length}
        </span>
        <motion.span
          className={`font-heading font-black text-xl tabular-nums ${isUrgent ? 'text-destructive' : 'text-foreground'}`}
          animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          {timer}s
        </motion.span>
        <span className="font-heading font-bold text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">{triviaScore} XP</span>
      </div>

      {/* Timer bar */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${isUrgent ? 'bg-destructive' : 'bg-primary'}`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={triviaIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p className="font-heading font-bold text-lg text-foreground mb-5 leading-relaxed">{currentQ.question}</p>
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, i) => {
              let styles = 'bg-card border border-border hover:border-primary/30 hover:shadow-card';
              if (answered !== null) {
                if (i === currentQ.correctIndex) styles = 'bg-earth-bg border-2 border-earth shadow-card';
                else if (i === answered) styles = 'bg-fire-bg border-2 border-fire shadow-card';
                else styles = 'bg-card border border-border opacity-50';
              }
              return (
                <motion.button
                  key={i}
                  whileHover={answered === null ? { scale: 1.01, x: 4 } : {}}
                  whileTap={answered === null ? { scale: 0.98 } : {}}
                  className={`${styles} rounded-2xl px-5 py-3.5 text-left font-medium transition-all duration-200 text-sm`}
                  onClick={() => handleAnswer(i)}
                  disabled={answered !== null}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <span className="font-heading font-black text-muted-foreground/60 mr-2.5 text-base">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
