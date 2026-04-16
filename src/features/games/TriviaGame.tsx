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
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="text-4xl">🎯</motion.div>
        <p className="font-heading font-bold text-foreground">Loading Trivia...</p>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-heading font-bold text-2xl text-foreground mb-2">Trivia Complete!</h3>
        <p className="text-lg text-muted-foreground mb-1">Your score</p>
        <p className="font-heading font-bold text-4xl text-primary mb-6">{triviaScore} XP</p>
        <Button onClick={() => setCurrentGame(null)}>Back to Games</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-heading font-bold text-sm text-muted-foreground">
          Q{triviaIndex + 1}/{triviaQuestions.length}
        </span>
        <span className={`font-heading font-bold text-lg ${timer <= 5 ? 'text-destructive' : 'text-foreground'}`}>
          ⏱ {timer}s
        </span>
        <span className="font-heading font-bold text-sm text-primary">{triviaScore} XP</span>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5">
        <motion.div className="bg-primary h-1.5 rounded-full" animate={{ width: `${(timer / 15) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={triviaIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <p className="font-heading font-bold text-lg text-foreground mb-4">{currentQ.question}</p>
          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, i) => {
              let bg = 'bg-card border-2 border-border';
              if (answered !== null) {
                if (i === currentQ.correctIndex) bg = 'bg-earth-bg border-2 border-earth';
                else if (i === answered) bg = 'bg-fire-bg border-2 border-fire';
              }
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  className={`${bg} rounded-xl px-4 py-3 text-left font-medium transition-all text-sm`}
                  onClick={() => handleAnswer(i)}
                  disabled={answered !== null}
                >
                  <span className="font-heading font-bold text-muted-foreground mr-2">
                    {String.fromCharCode(65 + i)}.
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
