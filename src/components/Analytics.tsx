'use client';

import React, { useMemo } from 'react';
import { Session } from '@/types';
import { PageLayout } from './layout/PageLayout';
import { PageHeader } from './layout/PageHeader';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import { ActivityChart } from './analytics/ActivityChart';
import { PieChartCard } from './analytics/PieChartCard';
import { useTags } from '../hooks/useTags';
import { useTagToggle } from '../hooks/useTagToggle';
import { WeeklyCalendar } from './analytics/WeeklyCalendar';
import { MonthlyCalendar } from './analytics/MonthlyCalendar';
import { useSettings } from '../context/SettingsContext';
import { FocusInsights } from './FocusInsights';
import { ShareCard } from './ShareCard';

interface AnalyticsProps {
  sessions: Session[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ sessions }) => {
  const { tags: allTags } = useTags();
  const { settings } = useSettings();
  const { selectedTags: selectedFilterTags, toggleTag: toggleFilterTag, setSelectedTags: setSelectedFilterTags } = useTagToggle();

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

  return (
    <PageLayout className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Analytics"
        description="View your productivity analytics."
      />
        
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

        {/* Focus Insights */}
        <FocusInsights sessions={sessions} />

        {/* Share Card */}
        <ShareCard sessions={sessions} />

        {/* Pie Chart */}
      <PieChartCard sessions={sessions} allTags={allTags} excludeWeekends={settings.excludeWeekends} />
    </PageLayout>
  );
};
