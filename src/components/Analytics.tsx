import React from 'react';
import { Session } from '../types';
import { Clock, Tag, Sigma, Loader2 } from 'lucide-react';
import { formatDuration } from '../utils/format';
import { PageLayout } from './layout/PageLayout';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { AnalyticsHeader } from './analytics/AnalyticsHeader';
import { ActivityChart } from './analytics/ActivityChart';

interface AnalyticsProps {
  sessions: Session[];
  isLoading?: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions, isLoading }) => {
  const {
    viewMode,
    setViewMode,
    dateLabel,
    handlePrev,
    handleNext,
    chartData,
    totalPeriodHours,
    maxVal,
    totalHoursAllTime,
    topTagName,
    topTagPct
  } = useAnalyticsData(sessions);




  return (
    <PageLayout className="animate-in slide-in-from-bottom-4 duration-500">
        <AnalyticsHeader 
            dateLabel={dateLabel}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onPrev={handlePrev}
            onNext={handleNext}
        />
        
        {/* Content Wrapper */}
        {isLoading ? (
             <div className="flex flex-col h-[60vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-slate-500 dark:text-slate-400">Loading analytics...</p>
             </div>
        ) : (
            <>
                {/* Main Chart Card */}
                <ActivityChart 
                    chartData={chartData}
                    maxVal={maxVal}
                    viewMode={viewMode}
                    totalPeriodHours={totalPeriodHours}
                />

                {/* Insights Grid */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pt-2 text-slate-900 dark:text-white">Key Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="bg-white dark:bg-[#1c232d] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#283039] shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Tag size={24} />
                                </div>
                                <p className="text-[#6b7280] dark:text-[#9dabb9] text-sm font-medium">Most Productive Tag</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white truncate">{topTagName}</p>
                                <p className="text-xs text-[#6b7280] dark:text-[#9dabb9] mt-1">{topTagPct}% of total time</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#1c232d] p-5 rounded-xl border border-[#e5e7eb] dark:border-[#283039] shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <Sigma size={24} />
                                </div>
                                <p className="text-[#6b7280] dark:text-[#9dabb9] text-sm font-medium">Total Hours</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatDuration(totalHoursAllTime)}</p>
                                <p className="text-xs text-[#6b7280] dark:text-[#9dabb9] mt-1">All time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
    </PageLayout>
  );
};