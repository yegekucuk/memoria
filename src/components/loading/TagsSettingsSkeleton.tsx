import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const TagsSettingsSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-8" aria-busy="true" aria-live="polite">
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SkeletonBlock className="h-4 w-28" />
            <SkeletonBlock className="mt-2 h-12 w-full rounded-lg" />
          </div>
          <div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-2 h-12 w-full rounded-lg" />
          </div>
          <div>
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="mt-2 h-12 w-full rounded-lg" />
          </div>
          <div className="sm:col-span-2">
            <SkeletonBlock className="h-11 w-44 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a2027] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-4 w-4 rounded-full" />
                <SkeletonBlock className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
