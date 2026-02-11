'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroProps {
  onRegisterClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick }) => {
  const words = ["work?", "workout?", "read?", "write?", "study?"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4 relative z-20 pt-48 pb-12">
      <div className="text-center max-w-5xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          How many hours do you{' '}
          <span className="inline-flex justify-start">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWordIndex}
                className="bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-900 inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {words[currentWordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Track your productivity with precision. Gain insights into your habits.
          Simple, effective, and efficient time tracking for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRegisterClick}
            className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 cursor-pointer"
          >
            Login or Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
