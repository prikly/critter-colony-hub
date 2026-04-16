import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button, Input } from '@/components/ui';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'CritterZone — Find Your Creature. Meet Your People.' },
      { name: 'description', content: 'A fun, browser-based group engagement game for hackathons, college fests, and workshops.' },
      { property: 'og:title', content: 'CritterZone — Find Your Creature' },
      { property: 'og:description', content: 'Join the arena. Get a creature. Play games. Meet people.' },
    ],
  }),
  component: JoinPage,
});

const FLOATING_CREATURES = ['🦊', '🐙', '🦕', '🐡', '🦋', '🐢', '🐝', '🦔', '🦈', '🐻', '🦭', '🦎', '🐸', '🦅'];

function JoinPage() {
  const [eventId, setEventId] = useState('');
  const login = useGameStore((s) => s.login);
  const isLoggedIn = useGameStore((s) => s.isLoggedIn);
  const navigate = useNavigate();

  if (isLoggedIn) {
    navigate({ to: '/profile' });
    return null;
  }

  const handleGoogle = () => {
    login('google');
    navigate({ to: '/profile' });
  };

  const handleEventId = () => {
    if (!eventId.trim()) return;
    login('eventId', eventId.trim());
    navigate({ to: '/profile' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {FLOATING_CREATURES.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-10 pointer-events-none select-none"
          style={{ top: `${(i * 7 + 5) % 90}%`, left: `${(i * 11 + 3) % 90}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.div>
      ))}

      <motion.div
        className="w-full max-w-sm text-center z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-7xl mb-2"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          🐾
        </motion.div>
        <h1 className="font-heading font-black text-4xl text-foreground tracking-tight">
          Critter<span className="text-primary">Zone</span>
        </h1>
        <p className="text-muted-foreground mt-2 mb-8 font-medium">
          Find your creature. Meet your people.
        </p>

        <div className="space-y-3">
          <Button variant="google" className="w-full" onClick={handleGoogle}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-2">
            <Input
              className="text-center"
              placeholder="Enter Event ID or Student ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEventId()}
            />
            <Button onClick={handleEventId} disabled={!eventId.trim()} className="w-full">
              Join the Arena 🎮
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          No download needed · Works on any device · Powered by creatures ✨
        </p>
      </motion.div>
    </div>
  );
}
