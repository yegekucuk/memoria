import React from 'react';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { JournalEntriesSkeleton } from '@/components/loading/JournalEntriesSkeleton';

export default function Loading() {
  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-10 w-72 rounded-xl" />
          <SkeletonBlock className="h-5 w-56 rounded-lg" />
        </div>
      </div>

      {/* CTA skeleton */}
      <section className="relative overflow-hidden rounded-2xl bg-mesh border border-slate-200 dark:border-white/10 shadow-lg">
        <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-10">
          <div className="flex flex-col gap-3 text-center">
            <SkeletonBlock className="h-8 w-56 rounded-xl mx-auto" />
            <SkeletonBlock className="h-5 w-80 rounded-lg mx-auto" />
          </div>
          <div className="flex flex-col items-center gap-4 w-full max-w-xs">
            <SkeletonBlock className="h-12 w-full rounded-xl" />
            <div className="flex flex-col w-full gap-3 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="h-4 w-24 rounded-md" />
                <SkeletonBlock className="h-5 w-9 rounded-full" />
              </div>
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
            <SkeletonBlock className="h-5 w-32 rounded-md" />
            <div className="flex items-center justify-center gap-5 pt-1">
              <SkeletonBlock className="size-12 rounded-full" />
              <SkeletonBlock className="size-12 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Journal skeleton */}
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
        <div className="px-4 py-5 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-6 w-40 rounded-lg" />
              <SkeletonBlock className="h-4 w-28 rounded-md" />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SkeletonBlock className="h-8 w-16 rounded-full" />
              <SkeletonBlock className="size-9 rounded-full" />
              <SkeletonBlock className="size-9 rounded-full" />
            </div>
          </div>
          <div className="mt-4">
            <SkeletonBlock className="h-7 w-36 rounded-full" />
          </div>
          <div className="mt-6 min-h-[200px] flex items-center justify-center">
            <JournalEntriesSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
