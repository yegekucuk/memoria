import React from 'react';

interface SectionTitleProps {
  title: string;
  description?: string;
  id?: string;
  className?: string; // Allow additional classes if needed, though we aim for consistency
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, description, id, className = "" }) => {
  return (
    <div id={id} className={`text-center mb-16 ${className}`}>
      <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};
