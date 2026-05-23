import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const LandingSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-mesh" aria-busy="true" aria-live="polite">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center bg-white/90 dark:bg-slate-900/90 border-b border-white/10">
        <div className="w-full max-w-7xl flex items-center justify-between px-6 md:px-8 py-2 md:py-3">
          <SkeletonBlock className="h-8 w-32 rounded-lg" />
          <div className="hidden md:flex items-center gap-8">
            <SkeletonBlock className="h-4 w-14 rounded-md" />
            <SkeletonBlock className="h-4 w-16 rounded-md" />
            <SkeletonBlock className="h-4 w-20 rounded-md" />
            <SkeletonBlock className="h-9 w-28 rounded-lg" />
          </div>
          <SkeletonBlock className="md:hidden h-8 w-8 rounded-lg" />
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-4 relative z-20 pt-48 pb-12">
        <div className="text-center max-w-5xl w-full">
          <SkeletonBlock className="h-12 md:h-16 lg:h-20 w-[92%] max-w-4xl mx-auto rounded-2xl" />
          <SkeletonBlock className="mt-6 h-7 md:h-8 w-[78%] max-w-3xl mx-auto rounded-xl" />
          <SkeletonBlock className="mt-3 h-7 md:h-8 w-[64%] max-w-2xl mx-auto rounded-xl" />
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <SkeletonBlock className="h-14 w-full sm:w-64 rounded-xl" />
            <SkeletonBlock className="h-14 w-full sm:w-44 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
