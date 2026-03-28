import React from 'react';
import { SkeletonBlock } from './SkeletonBlock';

export const AnalyticsToggleSkeleton: React.FC = () => {
  return (
    <div aria-busy="true" aria-live="polite">
      <SkeletonBlock className="h-6 w-11 rounded-full" />
    </div>
  );
};
