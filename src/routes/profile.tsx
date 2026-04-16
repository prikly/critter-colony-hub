import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { assignCreature, getElementColor } from '@/lib/creatures';
import { generateIceBreakers } from '@/lib/gemini';
import { Button, Input, Badge, Chip } from '@/components/ui';

export const Route = createFileRoute('/profile')({
  head: () => ({
    meta: [
      { title: 'Set Up Your Profile — CritterZone' },
      { name: 'description', content: 'Choose your creature name and set up your arena profile.' },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { uid, isLoggedIn, setProfile, profileCompleted } = useGameStore();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [designation, setDesignation] = useState('');
  const [iceBreaker, setIceBreaker] = useState('');
  const [creatureName, setCreatureName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  if (!isLoggedIn) {
    navigate({ to: '/' });
    return null;
  }

  if (profileCompleted) {
    navigate({ to: '/arena' });
    return null;
  }

  const creature = assignCreature(uid);
  const colors = getElementColor(creature.element);
  if (!creatureName) setCreatureName(creature.name);

  const handleSuggest = async () => {
    setLoadingSuggestions(true);
    const results = await generateIceBreakers(name || 'Player', college || 'Unknown', designation || 'Attendee');
    setSuggestions(results);
    setLoadingSuggestions(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    setProfile({
      displayName: name.trim(),
      college: college.trim(),
      designation: designation.trim(),
      iceBreaker: iceBreaker.trim(),
      creatureName: creatureName.trim() || creature.name,
    });
    navigate({ to: '/arena' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.h1
          className="font-heading font-black text-3xl text-foreground text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Your Creature Awaits
        </motion.h1>

        {/* Creature preview card */}
        <motion.div
          className={`${colors.bg} rounded-3xl p-8 text-center mb-8 border border-border/50 shadow-card relative overflow-hidden`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-3xl" />

          <motion.div
            className="text-7xl leading-none mb-3 drop-shadow-md relative"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            {creature.emoji}
          </motion.div>
          <input
            className="bg-transparent text-center font-heading font-bold text-xl text-foreground border-b-2 border-dashed border-foreground/15 focus:border-primary focus:outline-none pb-1 w-48 mx-auto relative transition-colors duration-200"
            value={creatureName}
            onChange={(e) => setCreatureName(e.target.value)}
            placeholder={creature.name}
          />
          <div className="mt-3 relative">
            <Badge element={creature.element} glow>
              {creature.element} · {creature.trait}
            </Badge>
          </div>
        </motion.div>

        {/* Form fields */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Input placeholder="Your display name *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="College / Company" value={college} onChange={(e) => setCollege(e.target.value)} />
          <Input placeholder="Designation / Year of study" value={designation} onChange={(e) => setDesignation(e.target.value)} />

          <div>
            <Input
              placeholder="Your ice-breaker line ✨"
              value={iceBreaker}
              onChange={(e) => setIceBreaker(e.target.value)}
            />
            <motion.button
              onClick={handleSuggest}
              disabled={loadingSuggestions}
              className="mt-2.5 text-sm font-semibold text-primary hover:text-primary/80 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
            >
              {loadingSuggestions ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>✨</motion.span>
              ) : '✨'}
              Suggest with AI
            </motion.button>

            {suggestions.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2 mt-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Chip onClick={() => setIceBreaker(s)} className="text-xs">
                      {s}
                    </Chip>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={handleSubmit} disabled={!name.trim()} className="w-full mt-8" size="lg">
            Enter the Arena 🏟️
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
