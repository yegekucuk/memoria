import { Session, Tag } from '../types';

export type ViewMode = 'weekly' | 'monthly';

export interface ChartBar {
  label: string;
  value: number;
  fullDate?: string;
  isFuture?: boolean;
  isToday?: boolean;
}

// ─── Shared Date & Navigation Helpers ────────────────────────────────

/** Returns the Monday 00:00:00 of the week containing `date`. */
export const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/** Human-readable label for the current period (e.g. "Jan 6 - Jan 12" or "January 2026"). */
export const getDateLabel = (viewMode: ViewMode, currentDate: Date): string => {
  if (viewMode === 'weekly') {
    const start = getStartOfWeek(currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/** Returns a new date shifted by one period in the given direction. */
export const navigateDate = (viewMode: ViewMode, currentDate: Date, direction: 'prev' | 'next'): Date => {
  const d = new Date(currentDate);
  const delta = direction === 'next' ? 1 : -1;
  if (viewMode === 'weekly') {
    d.setDate(d.getDate() + 7 * delta);
  } else {
    d.setMonth(d.getMonth() + delta);
  }
  return d;
};

/** True when the next period would be entirely in the future. */
export const isNextPeriodDisabled = (viewMode: ViewMode, currentDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (viewMode === 'weekly') {
    const nextWeekStart = getStartOfWeek(navigateDate('weekly', currentDate, 'next'));
    return nextWeekStart > today;
  }
  if (viewMode === 'monthly') {
    const next = navigateDate('monthly', currentDate, 'next');
    const nextMonthStart = new Date(next.getFullYear(), next.getMonth(), 1);
    return nextMonthStart > today;
  }
  return false;
};

/** Returns the inclusive [start, end] of the period containing `currentDate`. */
export const getDateRange = (viewMode: ViewMode, currentDate: Date): { start: Date; end: Date } => {
  if (viewMode === 'monthly') {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  const start = getStartOfWeek(currentDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/** Look up a tag's colour, falling back to a default blue. */
export const getTagColor = (allTags: Tag[], tagName: string): string => {
  const tag = allTags.find(t => t.name === tagName);
  return tag?.color || '#3b82f6';
};

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Splits a session into per-day hour buckets between `periodStart` and `periodEnd`.
 * Returns an array of { dateStr, hours } entries.
 */
const splitSessionIntoDays = (
  session: Session,
  periodStart: Date,
  periodEnd: Date
): { dateStr: string; hours: number }[] => {
  const result: { dateStr: string; hours: number }[] = [];
  let sTime = new Date(session.startTime);
  let remainingSeconds = session.durationSeconds;

  const sessionEnd = new Date(sTime.getTime() + remainingSeconds * 1000);
  if (sessionEnd < periodStart || sTime > periodEnd) return result;

  // If session started before the period, fast-forward
  if (sTime < periodStart) {
    remainingSeconds -= (periodStart.getTime() - sTime.getTime()) / 1000;
    sTime = new Date(periodStart);
  }

  while (remainingSeconds > 0 && sTime <= periodEnd) {
    const dateStr = sTime.toDateString();
    const nextMidnight = new Date(sTime);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    const secondsToNextDay = (nextMidnight.getTime() - sTime.getTime()) / 1000;
    const durationForDay = Math.min(remainingSeconds, secondsToNextDay);

    result.push({ dateStr, hours: durationForDay / 3600 });

    remainingSeconds -= durationForDay;
    sTime = new Date(nextMidnight);
  }
  return result;
};

export const calculateChartData = (
  sessions: Session[],
  viewMode: ViewMode,
  currentDate: Date,
  excludeWeekends: boolean = false
): { chartData: ChartBar[]; totalPeriodHours: number; maxVal: number } => {
  const data: ChartBar[] = [];
  const now = new Date();
  const { start: periodStart, end: periodEnd } = getDateRange(viewMode, currentDate);

  // Helper to add hours to a specific date string in the data array
  const addToData = (dateStr: string, hours: number) => {
    const entry = data.find((d) => d.fullDate === dateStr);
    if (entry) {
      entry.value += hours;
    }
  };

  if (viewMode === 'monthly') {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      if (excludeWeekends && isWeekend(d)) continue;
      data.push({
        label: `${i}`,
        value: 0,
        fullDate: d.toDateString(),
        isFuture: d > now,
        isToday: d.toDateString() === now.toDateString(),
      });
    }
  } else {
    const monday = getStartOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      if (excludeWeekends && isWeekend(d)) continue;
      data.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: 0,
        fullDate: d.toDateString(),
        isFuture: d > now,
        isToday: d.toDateString() === now.toDateString(),
      });
    }
  }

  // Distribute session hours across days using the shared splitter
  sessions.forEach((session) => {
    const chunks = splitSessionIntoDays(session, periodStart, periodEnd);
    chunks.forEach(({ dateStr, hours }) => addToData(dateStr, hours));
  });

  const max = Math.max(...data.map((d) => d.value), 0);
  const displayMax = Math.max(Math.ceil(max), 4);
  const totalPeriodHours = data.reduce((acc, curr) => acc + curr.value, 0);

  return { chartData: data, totalPeriodHours, maxVal: displayMax };
};

export interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

export const calculatePieChartData = (
  sessions: Session[],
  viewMode: ViewMode,
  currentDate: Date
): PieChartData[] => {
  const tagDurations: Record<string, number> = {};
  const { start: startDate, end: endDate } = getDateRange(viewMode, currentDate);

  sessions.forEach((session) => {
    const sTime = new Date(session.startTime);
    const sessionEnd = new Date(sTime.getTime() + session.durationSeconds * 1000);

    if (sessionEnd < startDate || sTime > endDate) return;

    // Calculate overlap
    const overlapStart = sTime < startDate ? startDate : sTime;
    const overlapEnd = sessionEnd > endDate ? endDate : sessionEnd;

    if (overlapStart < overlapEnd) {
      const duration = (overlapEnd.getTime() - overlapStart.getTime()) / 1000;
      session.tags.forEach(t => {
        tagDurations[t] = (tagDurations[t] || 0) + duration;
      });
    }
  });

  return Object.entries(tagDurations)
    .map(([name, duration]) => ({
      name,
      value: duration / 3600,
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);
};
