import React, { ReactNode } from 'react';

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  return (
    <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
      <div className="mb-4 p-3 bg-white dark:bg-white/10 rounded-xl w-fit shadow-xs">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
};
