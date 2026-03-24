import { Session } from '@/types';
import { formatDuration } from '@/utils/format';

export interface JournalEntry {
  id: string;
  text: string;
  startTime: Date;
  time: string;
  duration: string;
  tags: string[];
  note: string;
}

export const getDayBounds = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setMilliseconds(-1);

  return { start, end };
};

export const isSameDay = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const navigateJournalDate = (date: Date, direction: 'prev' | 'next'): Date => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + (direction === 'next' ? 1 : -1));
  return nextDate;
};

export const isNextJournalDateDisabled = (selectedDate: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedSelectedDate = new Date(selectedDate);
  normalizedSelectedDate.setHours(0, 0, 0, 0);

  return normalizedSelectedDate >= today;
};

export const formatJournalDateLabel = (date: Date): string => {
  const today = new Date();

  if (isSameDay(date, today)) {
    return 'Today';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getSessionsForDay = (sessions: Session[], day: Date): Session[] => {
  const { start, end } = getDayBounds(day);

  return sessions
    .filter((session) => {
      const sessionStart = new Date(session.startTime);
      return sessionStart >= start && sessionStart <= end;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
};

const formatEntryTime24h = (date: Date): string => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatJournalTimeRange = (session: Session): string => {
  const start = new Date(session.startTime);
  const end = session.endTime
    ? new Date(session.endTime)
    : new Date(start.getTime() + session.durationSeconds * 1000);

  return `${formatEntryTime24h(start)} - ${formatEntryTime24h(end)}`;
};

const formatTags = (tags: string[]): string => {
  if (tags.length === 0) {
    return 'No Tags';
  }

  return tags.join(', ');
};

export const buildJournalEntries = (sessions: Session[]): JournalEntry[] => {
  return sessions.map((session) => {
    const sessionStart = new Date(session.startTime);
    const time = formatJournalTimeRange(session);
    const duration = formatDuration(session.durationSeconds / 3600);
    const tags = formatTags(session.tags);
    const note = session.notes;

    return {
      id: session.id,
      startTime: sessionStart,
      time,
      duration,
      tags: session.tags,
      note,
      text: `- ${time}, [${tags}], ${note} | ${duration}`,
    };
  });
};

const getTotalHoursForDay = (sessions: Session[]): number => {
  const totalSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
  return totalSeconds / 3600;
};

const clampJournalDateToToday = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (normalized > today) {
    return today;
  }

  return normalized;
};

export const getJournalPageMeta = (sessions: Session[]): { count: number; totalHours: number } => {
  return {
    count: sessions.length,
    totalHours: getTotalHoursForDay(sessions),
  };
};

export const shiftJournalDate = (currentDate: Date, direction: 'prev' | 'next'): Date => {
  const next = navigateJournalDate(currentDate, direction);
  return clampJournalDateToToday(next);
};
