import React, { ReactNode } from 'react';

interface StepItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  videoPlaceholder: string;
}

export const StepItem: React.FC<StepItemProps> = ({ icon, title, description, videoPlaceholder }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Video Placeholder Container */}
      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center group overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-br from-transparent to-slate-900/5 dark:to-white/5 pointer-events-none" />
        <div className="text-slate-400 dark:text-slate-500 font-medium flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-xs">
            {icon}
          </div>
          <span>{videoPlaceholder}</span>
        </div>
      </div>

      {/* Content */}
      <div className="text-center px-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
