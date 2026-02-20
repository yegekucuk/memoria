import { useState, useMemo } from 'react';
import { Session } from '../types';
import {
  calculateChartData,
  ChartBar,
  ViewMode,
  navigateDate,
  getDateLabel,
  isNextPeriodDisabled,
} from '../utils/analyticsHelpers';
import { useSettings } from '../context/SettingsContext';

export type { ViewMode, ChartBar }; // Re-export for compatibility

export const useAnalyticsData = (sessions: Session[]) => {
  const { settings } = useSettings();
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => setCurrentDate(navigateDate(viewMode, currentDate, 'prev'));
  const handleNext = () => setCurrentDate(navigateDate(viewMode, currentDate, 'next'));

  const dateLabel = useMemo(() => getDateLabel(viewMode, currentDate), [currentDate, viewMode]);

  const { chartData, totalPeriodHours, maxVal } = useMemo(() => {
    return calculateChartData(sessions, viewMode, currentDate, settings.excludeWeekends);
  }, [viewMode, currentDate, sessions, settings.excludeWeekends]);

  const isNextDisabled = useMemo(
    () => isNextPeriodDisabled(viewMode, currentDate),
    [viewMode, currentDate]
  );

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
    isNextDisabled,
    filteredSessions: sessions // These are already filtered by tags in Analytics.tsx
  };
};
