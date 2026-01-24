'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

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
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background-light dark:bg-background-dark p-4">
      <div className="text-center max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-900 mb-6">
          How many hours do you work <span className='italic'>productively</span>?
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
          Track your productivity with precision. Gain insights into your productivity.
          Simple, effective, and efficient.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-8 py-4 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl cursor-pointer"
        >
          Login / Register
        </button>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
