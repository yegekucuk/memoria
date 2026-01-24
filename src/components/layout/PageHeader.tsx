import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <div className="text-slate-500 dark:text-slate-400 text-base font-normal">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  );
};
