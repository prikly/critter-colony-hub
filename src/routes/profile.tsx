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
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading font-black text-2xl text-foreground text-center mb-6">
          Your Creature Awaits
        </h1>

        <motion.div
          className={`${colors.bg} rounded-2xl p-6 text-center mb-6`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="text-6xl leading-none mb-2"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            {creature.emoji}
          </motion.div>
          <input
            className="bg-transparent text-center font-heading font-bold text-xl text-foreground border-b-2 border-dashed border-foreground/20 focus:border-primary focus:outline-none pb-1 w-48 mx-auto"
            value={creatureName}
            onChange={(e) => setCreatureName(e.target.value)}
            placeholder={creature.name}
          />
          <div className="mt-2">
            <Badge element={creature.element}>
              {creature.element} · {creature.trait}
            </Badge>
          </div>
        </motion.div>

        <div className="space-y-3">
          <Input placeholder="Your display name *" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="College / Company" value={college} onChange={(e) => setCollege(e.target.value)} />
          <Input placeholder="Designation / Year of study" value={designation} onChange={(e) => setDesignation(e.target.value)} />

          <div>
            <Input
              placeholder="Your ice-breaker line ✨"
              value={iceBreaker}
              onChange={(e) => setIceBreaker(e.target.value)}
            />
            <button
              onClick={handleSuggest}
              disabled={loadingSuggestions}
              className="mt-2 text-sm font-medium text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              {loadingSuggestions ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>✨</motion.span>
              ) : '✨'}{' '}
              Suggest with AI
            </button>

            {suggestions.length > 0 && (
              <motion.div
                className="flex flex-wrap gap-2 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {suggestions.map((s, i) => (
                  <Chip key={i} onClick={() => setIceBreaker(s)} className="text-xs">
                    {s}
                  </Chip>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!name.trim()} className="w-full mt-6" size="lg">
          Enter the Arena 🏟️
        </Button>
      </motion.div>
    </div>
  );
}
