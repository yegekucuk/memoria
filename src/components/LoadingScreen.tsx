"use client";

import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[100000] grid place-items-center bg-background-light dark:bg-background-dark"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-6">
        <img
          src="/memoria-logo-3-removebg.png"
          alt="Memoria Logo"
          className="h-10 w-auto opacity-90 animate-pulse"
        />
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <span
            aria-hidden="true"
            className="size-5 rounded-full border-2 border-slate-300/80 dark:border-slate-600 border-t-primary animate-spin"
          />
          <span className="text-sm font-semibold tracking-wide">Loading...</span>
        </div>
      </div>
    </div>
  );
};
