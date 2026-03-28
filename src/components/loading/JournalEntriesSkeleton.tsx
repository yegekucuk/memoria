import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const JournalEntriesSkeleton: React.FC = () => {
  return (
    <div className="flex h-full min-h-[240px] flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="mt-3 h-2 w-2 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-7 w-18 rounded-md" />
            <SkeletonBlock className="h-7 w-14 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-1">
            <SkeletonBlock className="h-6 w-16 rounded-md" />
            <SkeletonBlock className="h-6 w-20 rounded-md" />
          </div>
          <SkeletonBlock className="h-12 w-full rounded-md" />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <SkeletonBlock className="mt-3 h-2 w-2 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-7 w-16 rounded-md" />
            <SkeletonBlock className="h-7 w-12 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-1">
            <SkeletonBlock className="h-6 w-18 rounded-md" />
          </div>
          <SkeletonBlock className="h-16 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
};
