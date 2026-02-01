import React from 'react';

interface SubSettingProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const SubSetting: React.FC<SubSettingProps> = ({ title, subtitle, children }) => {
  return (
    <div className="w-full">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
        {subtitle && (
          <p className="text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
};
