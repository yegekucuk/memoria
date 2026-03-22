"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroProps {
  onRegisterClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick }) => {
  const words = ["work", "study", "read", "write"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    // Set seconds interval
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4 relative z-20 pt-48 pb-12">
      <div className="text-center max-w-5xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 tight">
          Visualize how you{" "}
          <span className="inline-grid text-left">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={currentWordIndex}
                className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary col-start-1 row-start-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {words[currentWordIndex]}.
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto tight">
          Transform your daily sessions into actionable insights. Manage, filter
          and grow with detailed analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRegisterClick}
            className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 cursor-pointer"
          >
            Start Tracking for Free
          </button>
          <button
            onClick={() => {
              const element = document.getElementById("how-it-works");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            How it works
          </button>
        </div>
      </div>
    </div>
  );
};
