import React from 'react';
import { AnalyticsSkeleton } from '@/components/loading/AnalyticsSkeleton';

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-background-light dark:bg-background-dark">
      <div className="mx-auto w-full max-w-[1200px] p-4 md:p-8">
        <AnalyticsSkeleton />
      </div>
    </div>
  );
}
