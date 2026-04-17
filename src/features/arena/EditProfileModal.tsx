import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button, Input } from '@/components/ui';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { profile, updateProfile } = useGameStore();

  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [program, setProgram] = useState('');
  const [techStack, setTechStack] = useState('');
  const [designation, setDesignation] = useState('');
  const [iceBreaker, setIceBreaker] = useState('');

  useEffect(() => {
    if (profile && isOpen) {
      setName(profile.displayName || '');
      setCollege(profile.college || '');
      setProgram(profile.program || '');
      setTechStack(profile.techStack || '');
      setDesignation(profile.designation || '');
      setIceBreaker(profile.iceBreaker || '');
    }
  }, [profile, isOpen]);

  if (!profile) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    updateProfile({
      displayName: name.trim(),
      college: college.trim(),
      program: program.trim(),
      techStack: techStack.trim(),
      designation: designation.trim(),
      iceBreaker: iceBreaker.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md bg-card/90 glass-strong border border-border shadow-elevated rounded-3xl p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-black text-2xl">Edit Profile</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 -mx-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Display Name</label>
                <Input placeholder="Your display name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground ml-1">College/Company</label>
                <Input placeholder="College / Company" value={college} onChange={(e) => setCollege(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Program/Course</label>
                <Input placeholder="Program / Course" value={program} onChange={(e) => setProgram(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Tech Stack</label>
                <Input placeholder="E.g., React, Node" value={techStack} onChange={(e) => setTechStack(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Designation</label>
                <Input placeholder="Designation / Year of study" value={designation} onChange={(e) => setDesignation(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Ice-breaker Line</label>
                <Input placeholder="Your ice-breaker line ✨" value={iceBreaker} onChange={(e) => setIceBreaker(e.target.value)} />
              </div>
            </div>

            <div className="mt-6">
              <Button onClick={handleSubmit} disabled={!name.trim()} className="w-full">
                Save Changes
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
