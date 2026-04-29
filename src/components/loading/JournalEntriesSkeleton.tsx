import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const JournalEntriesSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col" aria-busy="true" aria-live="polite">
      <div className="relative pl-8 pb-6">
        <div className="absolute left-[7.5px] top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-700/60" />
        <SkeletonBlock className="absolute left-0 top-4 z-10 size-4 rounded-full" />
        <div className="flex flex-col gap-2.5 pt-0.5">
          <div className="flex items-center gap-2.5">
            <SkeletonBlock className="h-7 w-24 rounded-lg" />
            <SkeletonBlock className="h-7 w-16 rounded-lg" />
          </div>
          <div className="flex gap-1">
            <SkeletonBlock className="h-5 w-16 rounded-md" />
            <SkeletonBlock className="h-5 w-14 rounded-md" />
          </div>
          <SkeletonBlock className="h-12 w-full rounded-md" />
        </div>
      </div>

      <div className="relative pl-8 pb-6">
        <div className="absolute left-[7.5px] top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-700/60" />
        <SkeletonBlock className="absolute left-0 top-4 z-10 size-4 rounded-full" />
        <div className="flex flex-col gap-2.5 pt-0.5">
          <div className="flex items-center gap-2.5">
            <SkeletonBlock className="h-7 w-20 rounded-lg" />
            <SkeletonBlock className="h-7 w-14 rounded-lg" />
          </div>
          <div className="flex gap-1">
            <SkeletonBlock className="h-5 w-12 rounded-md" />
          </div>
          <SkeletonBlock className="h-16 w-full rounded-md" />
        </div>
      </div>

      <div className="relative pl-8">
        <SkeletonBlock className="absolute left-0 top-4 z-10 size-4 rounded-full" />
        <div className="flex flex-col gap-2.5 pt-0.5">
          <div className="flex items-center gap-2.5">
            <SkeletonBlock className="h-7 w-28 rounded-lg" />
            <SkeletonBlock className="h-7 w-12 rounded-lg" />
          </div>
          <div className="flex gap-1">
            <SkeletonBlock className="h-5 w-20 rounded-md" />
            <SkeletonBlock className="h-5 w-16 rounded-md" />
            <SkeletonBlock className="h-5 w-10 rounded-md" />
          </div>
          <SkeletonBlock className="h-10 w-3/4 rounded-md" />
        </div>
      </div>
    </div>
  );
};
