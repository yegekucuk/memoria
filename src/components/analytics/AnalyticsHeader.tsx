import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewMode } from '../../hooks/useAnalyticsData';
import { PageHeader } from '../layout/PageHeader';

interface AnalyticsHeaderProps {
  dateLabel: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  dateLabel,
  viewMode,
  setViewMode,
  onPrev,
  onNext,
}) => {
  const renderHeaderActions = () => (
    <div className="flex flex-col gap-3 items-start md:items-end">
      <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white select-none">
        <button 
          onClick={onPrev} 
          className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Previous period"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-bold min-w-[160px] text-center">{dateLabel}</span>
        <button 
          onClick={onNext} 
          className="size-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Next period"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="bg-[#e5e7eb] dark:bg-[#283039] p-1 rounded-lg inline-flex">
        <button 
          onClick={() => setViewMode('weekly')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
            viewMode === 'weekly' 
              ? 'bg-white dark:bg-[#111418] text-[#111418] dark:text-white shadow-sm' 
              : 'text-[#6b7280] dark:text-[#9dabb9]'
          }`}
        >
          Weekly
        </button>
        <button 
          onClick={() => setViewMode('monthly')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
            viewMode === 'monthly' 
              ? 'bg-white dark:bg-[#111418] text-[#111418] dark:text-white shadow-sm' 
              : 'text-[#6b7280] dark:text-[#9dabb9]'
          }`}
        >
          Monthly
        </button>
      </div>
    </div>
  );

  return (
    <PageHeader 
      title="Analytics"
      description="View your productivity analytics."
      actions={renderHeaderActions()}
    />
  );
};
