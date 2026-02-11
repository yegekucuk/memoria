'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { FeaturesSection } from '@/components/FeaturesSection';
import { DashboardPreview } from '@/components/previews/DashboardPreview';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const words = ["work?", "workout?", "read?", "write?", "study?"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (!loading && isAuthenticated) {
        router.refresh();
        router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Change every 2 seconds
  
      return () => clearInterval(interval);
    }, [words.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background-light dark:bg-background-dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent flash of content if authenticated but waiting for redirect
  if (isAuthenticated) {
    return null; 
  }

  return (
    <div className="flex flex-col w-full bg-mesh gap-y-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] w-full p-4 relative z-10 pt-20">
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
              onClick={() => setIsAuthModalOpen(true)}
              className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 cursor-pointer"
            >
              Login or Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="w-full hidden xl:flex justify-center px-4 relative z-10">
          <div className="w-full max-w-7xl transform transition-transform duration-500 hover:scale-[1.01]">
              <DashboardPreview />
          </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-transparent relative z-10">
        <FeaturesSection />
      </div>

      {/* Footer */}
      <footer className="py-2 text-center text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/10 relative z-10">
        <p>© 2026 @yegekucuk. All rights reserved.</p>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
