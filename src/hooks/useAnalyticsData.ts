import { useState, useMemo } from 'react';
import { Session } from '../types';

export type ViewMode = 'daily' | 'weekly';

export interface ChartBar {
  label: string;
  value: number;
  fullDate?: string;
  isFuture?: boolean;
}

export const useAnalyticsData = (sessions: Session[]) => {
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + 7);
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
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate, viewMode]);

  const { chartData, totalPeriodHours, maxVal } = useMemo(() => {
    const data: ChartBar[] = [];
    let total = 0;
    const now = new Date();
    const selectedDate = new Date(currentDate);

    if (viewMode === 'daily') {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      for (let i = 0; i < 24; i++) {
        data.push({ label: `${i}`, value: 0 });
      }

      sessions.forEach(session => {
        const sTime = new Date(session.startTime);
        if (sTime >= startOfDay && sTime <= endOfDay) {
          const hour = sTime.getHours();
          const duration = session.durationSeconds / 3600;
          if (data[hour]) {
             data[hour].value += duration;
             total += duration;
          }
        }
      });
    } else {
      const cur = new Date(selectedDate);
      const day = cur.getDay();
      const diff = cur.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(cur);
      monday.setDate(diff);
      monday.setHours(0,0,0,0);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        data.push({ 
            label: d.toLocaleDateString('en-US', { weekday: 'short' }), 
            value: 0, 
            fullDate: d.toDateString(),
            isFuture: d > now
        });
      }

      sessions.forEach(session => {
        const sTime = new Date(session.startTime);
        const sDateStr = sTime.toDateString();
        const entry = data.find(d => d.fullDate === sDateStr);
        if (entry) {
          const duration = session.durationSeconds / 3600;
          entry.value += duration;
          total += duration;
        }
      });
    }

    const max = Math.max(...data.map(d => d.value), 0);
    const displayMax = Math.max(Math.ceil(max), 4); 

    return { chartData: data, totalPeriodHours: total, maxVal: displayMax };
  }, [viewMode, currentDate, sessions]);

  const totalHoursAllTime = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 3600;
  }, [sessions]);
  
  const { topTagName, topTagPct, avgDailyHours } = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    sessions.forEach(s => s.tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + s.durationSeconds));
    const topTagEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    const name = topTagEntry ? topTagEntry[0] : 'None';
    const pct = topTagEntry ? Math.round((topTagEntry[1] / 3600 / (totalHoursAllTime || 1)) * 100) : 0;
    
    const distinctDays = new Set(sessions.map(s => new Date(s.startTime).toDateString())).size;
    const avg = distinctDays > 0 ? totalHoursAllTime / distinctDays : 0;

    return { topTagName: name, topTagPct: pct, avgDailyHours: avg };
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
    topTagPct,
    avgDailyHours
  };
};
