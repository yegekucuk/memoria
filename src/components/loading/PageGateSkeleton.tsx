import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const PageGateSkeleton: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 md:p-10" aria-busy="true" aria-live="polite">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-8 w-40 rounded-lg" />
          <SkeletonBlock className="h-10 w-32 rounded-xl" />
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-6 dark:bg-surface-dark/60">
          <div className="flex flex-col gap-4">
            <SkeletonBlock className="h-10 w-2/3" />
            <SkeletonBlock className="h-5 w-1/2" />
            <div className="mt-3 flex flex-wrap gap-3">
              <SkeletonBlock className="h-10 w-40 rounded-xl" />
              <SkeletonBlock className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-6 dark:bg-surface-dark/60">
            <div className="flex flex-col gap-3">
              <SkeletonBlock className="h-6 w-40" />
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-28 w-full rounded-xl" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 p-6 dark:bg-surface-dark/60">
            <div className="flex flex-col gap-3">
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="h-28 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
