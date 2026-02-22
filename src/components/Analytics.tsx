import React, { useState, useMemo } from 'react';
import { Session } from '../types';
import { Tag, Sigma, Loader2, X } from 'lucide-react';
import { formatDuration } from '../utils/format';
import { PageLayout } from './layout/PageLayout';
import { PageHeader } from './layout/PageHeader';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { ActivityChart } from './analytics/ActivityChart';
import { PieChartCard } from './analytics/PieChartCard';
import { useTags } from '../hooks/useTags';
import { WeeklyCalendar } from './analytics/WeeklyCalendar';
import { MonthlyCalendar } from './analytics/MonthlyCalendar';
import { useSettings } from '../context/SettingsContext';

interface AnalyticsProps {
  sessions: Session[];
  isLoading?: boolean;
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions, isLoading }) => {
  const { tags: allTags } = useTags();
  const { settings } = useSettings();
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);

  const toggleFilterTag = (tagName: string) => {
    setSelectedFilterTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const filteredSessions = useMemo(() => {
    if (selectedFilterTags.length === 0) return sessions;
    return sessions.filter(s =>
      selectedFilterTags.every(tag => s.tags.includes(tag))
    );
  }, [sessions, selectedFilterTags]);

  const {
    viewMode,
    setViewMode,
    dateLabel,
    handlePrev,
    handleNext,
    chartData,
    totalPeriodHours,
    maxVal,
    isNextDisabled,
    filteredSessions: currentViewSessions,
  } = useAnalyticsData(filteredSessions);

  // Insights always use unfiltered sessions so they don't change with tag filter
  const totalHoursAllTime = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600;
  }, [sessions]);

  const { topTagName, topTagPct } = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    sessions.forEach(s => s.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + s.durationSeconds));
    const topEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    const name = topEntry ? topEntry[0] : 'None';
    const pct = topEntry ? Math.round((topEntry[1] / 3600 / (totalHoursAllTime || 1)) * 100) : 0;
    return { topTagName: name, topTagPct: pct };
  }, [sessions, totalHoursAllTime]);

  return (
    <PageLayout className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Analytics"
        description="View your productivity analytics."
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
                    allTags={allTags}
                    selectedFilterTags={selectedFilterTags}
                    onToggleFilterTag={toggleFilterTag}
                    onClearFilters={() => setSelectedFilterTags([])}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    dateLabel={dateLabel}
                    setViewMode={setViewMode}
                    isNextDisabled={isNextDisabled}
                >
                    {/* Calendar View */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-900 dark:text-white capitalize">{viewMode} Calendar</h2>
                        {viewMode === 'weekly' ? (
                            <WeeklyCalendar 
                                sessions={currentViewSessions} 
                                currentDate={chartData[0]?.fullDate ? new Date(chartData[0].fullDate) : new Date()}
                                excludeWeekends={settings.excludeWeekends}
                            />
                        ) : (
                            <MonthlyCalendar 
                                sessions={currentViewSessions} 
                                currentDate={chartData[0]?.fullDate ? new Date(chartData[0].fullDate) : new Date()}
                                excludeWeekends={settings.excludeWeekends}
                            />
                        )}
                    </div>
                </ActivityChart>

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

                    {/* Pie Chart */}
                    <PieChartCard sessions={sessions} allTags={allTags} excludeWeekends={settings.excludeWeekends} />
                </div>
            </>
        )}
    </PageLayout>
  );
};