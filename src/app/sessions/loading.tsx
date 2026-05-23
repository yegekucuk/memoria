import React from 'react';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';

export default function Loading() {
  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-10 w-44 rounded-xl" />
          <SkeletonBlock className="h-5 w-[520px] max-w-[80vw] rounded-lg" />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-4 w-16 rounded-md" />
            <SkeletonBlock className="h-4 w-16 rounded-md" />
            <SkeletonBlock className="h-4 w-20 rounded-md" />
            <SkeletonBlock className="h-4 w-20 rounded-md" />
            <SkeletonBlock className="h-4 w-48 rounded-md ml-auto" />
          </div>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-white/5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <SkeletonBlock className="h-4 w-24 rounded-md" />
              <SkeletonBlock className="h-4 w-20 rounded-md" />
              <SkeletonBlock className="h-4 w-16 rounded-md" />
              <SkeletonBlock className="h-6 w-28 rounded-full" />
              <SkeletonBlock className="h-4 w-full rounded-md" />
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
                <SkeletonBlock className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
