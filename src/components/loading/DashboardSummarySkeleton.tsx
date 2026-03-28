import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const DashboardSummarySkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="h-10 w-10 rounded-lg" />
        <SkeletonBlock className="h-6 w-40" />
      </div>

      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-10 w-48" />
      </div>

      <SkeletonBlock className="h-px w-full rounded-none" />

      <div className="flex flex-col gap-4">
        <SkeletonBlock className="h-3 w-28" />
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonBlock className="h-3.5 w-36" />
            <SkeletonBlock className="h-3 w-44" />
          </div>
          <SkeletonBlock className="h-4 w-10" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <SkeletonBlock className="h-3.5 w-28" />
            <SkeletonBlock className="h-3 w-40" />
          </div>
          <SkeletonBlock className="h-4 w-8" />
        </div>
      </div>
    </div>
  );
};
