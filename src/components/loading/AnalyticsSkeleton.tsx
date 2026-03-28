import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3">
              <SkeletonBlock className="h-6 w-44" />
              <SkeletonBlock className="h-10 w-52" />
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <SkeletonBlock className="h-5 w-36" />
              <SkeletonBlock className="h-8 w-40 rounded-lg" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-6 w-24 rounded-full" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
            <SkeletonBlock className="h-6 w-28 rounded-full" />
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>

          <SkeletonBlock className="h-72 w-full rounded-xl" />
          <SkeletonBlock className="h-80 w-full rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-9 w-32" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-9 w-40" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};
