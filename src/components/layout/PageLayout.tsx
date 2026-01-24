import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-500 ${className}`}>
      {children}
    </div>
  );
};
