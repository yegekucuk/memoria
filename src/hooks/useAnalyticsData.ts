import { useState, useMemo } from 'react';
import { Session } from '../types';
import { calculateChartData, ChartBar, ViewMode } from '../utils/analyticsHelpers';

export type { ViewMode, ChartBar }; // Re-export for compatibility

export const useAnalyticsData = (sessions: Session[]) => {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'monthly') newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const dateLabel = useMemo(() => {
    if (viewMode === 'daily') return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
    return calculateChartData(sessions, viewMode, currentDate);
  }, [viewMode, currentDate, sessions]);

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
    topTagPct
  };
};
