import { useState, useMemo } from 'react';
import { Session } from '../types';
import { calculateChartData, ChartBar, ViewMode } from '../utils/analyticsHelpers';
import { useSettings } from '../context/SettingsContext';

export type { ViewMode, ChartBar }; // Re-export for compatibility

export const useAnalyticsData = (sessions: Session[]) => {
  const { settings } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'weekly') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const dateLabel = useMemo(() => {

    if (viewMode === 'weekly') {
        const curr = new Date(currentDate);
        const day = curr.getDay();
        const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(curr);
        start.setDate(diff);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    if (viewMode === 'monthly') {
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode]);

  const { chartData, totalPeriodHours, maxVal } = useMemo(() => {
    return calculateChartData(sessions, viewMode, currentDate, settings.excludeWeekends);
  }, [viewMode, currentDate, sessions, settings.excludeWeekends]);

  const totalHoursAllTime = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600;
  }, [sessions]);
  
  const { topTagName, topTagPct } = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    sessions.forEach(s => s.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + s.durationSeconds));
    const topTagEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    const name = topTagEntry ? topTagEntry[0] : 'None';
    const pct = topTagEntry ? Math.round((topTagEntry[1] / 3600 / (totalHoursAllTime || 1)) * 100) : 0;
    
    return { topTagName: name, topTagPct: pct };
  }, [sessions, totalHoursAllTime]);

  const isNextDisabled = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewMode === 'weekly') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      // Calculate the start of the next week period
      const day = nextWeek.getDay();
      const diff = nextWeek.getDate() - day + (day === 0 ? -6 : 1);
      const nextWeekStart = new Date(nextWeek);
      nextWeekStart.setDate(diff);
      nextWeekStart.setHours(0, 0, 0, 0);

      return nextWeekStart > today;
    }

    if (viewMode === 'monthly') {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      // Start of next month
      const nextMonthStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
      return nextMonthStart > today;
    }

    return false;
  }, [viewMode, currentDate]);

  return {
    viewMode,
    setViewMode,
    currentDate,
    dateLabel,
    handlePrev,
    handleNext,
    chartData,
    totalPeriodHours,
    maxVal,
    totalHoursAllTime,
    topTagName,
    topTagPct,
    isNextDisabled,
    filteredSessions: sessions // These are already filtered by tags in Analytics.tsx
  };
};
