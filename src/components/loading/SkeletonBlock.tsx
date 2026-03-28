import React from 'react';

interface SkeletonBlockProps {
  className?: string;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`motion-reduce:animate-none animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-700/60 ${className}`}
    />
  );
};
