import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Session } from '@/types';
import { formatDuration } from '@/utils/format';
import { useTags } from '@/hooks/useTags';
import { JournalEntriesSkeleton } from '@/components/loading/JournalEntriesSkeleton';
import {
  buildJournalEntries,
  formatJournalDateLabel,
  getJournalPageMeta,
  getSessionsForDay,
  isNextJournalDateDisabled,
  shiftJournalDate,
} from '@/utils/journalHelpers';

interface JournalProps {
  sessions: Session[];
  isLoading?: boolean;
}

export const Journal: React.FC<JournalProps> = ({ sessions, isLoading = false }) => {
  const { tags: allTags } = useTags();

  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const completedSessions = React.useMemo(() => {
    return sessions.filter((session) => session.durationSeconds > 0);
  }, [sessions]);

  const sessionsForDay = React.useMemo(() => {
    return getSessionsForDay(completedSessions, selectedDate);
  }, [completedSessions, selectedDate]);

  const entries = React.useMemo(() => {
    return buildJournalEntries(sessionsForDay);
  }, [sessionsForDay]);

  const pageMeta = React.useMemo(() => {
    return getJournalPageMeta(sessionsForDay);
  }, [sessionsForDay]);

  const dateLabel = formatJournalDateLabel(selectedDate);
  const isNextDisabled = isNextJournalDateDisabled(selectedDate);

  const handlePreviousDay = () => {
    setSelectedDate((current) => shiftJournalDate(current, 'prev'));
  };

  const handleNextDay = () => {
    if (isNextDisabled) {
      return;
    }

    setSelectedDate((current) => shiftJournalDate(current, 'next'));
  };

  return (
      <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
          <div className="px-4 py-5 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sessions List</h2>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{dateLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    setSelectedDate(today);
                  }}
                  className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary transition-colors hover:bg-primary/10 cursor-pointer dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20"
                  aria-label="Go to today"
                >
                  Today
                </button>
                <button
                  onClick={handlePreviousDay}
                  className="flex size-9 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary/10 cursor-pointer dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20"
                  aria-label="Previous day"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNextDay}
                  disabled={isNextDisabled}
                  className={`flex size-9 items-center justify-center rounded-full border transition-colors ${
                    isNextDisabled
                      ? 'cursor-pointer border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600'
                      : 'cursor-pointer border-primary/30 text-primary hover:bg-primary/10 dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20'
                  }`}
                  aria-label="Next day"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-600 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-slate-300">
              <span>{pageMeta.count} entries</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>{formatDuration(pageMeta.totalHours)}</span>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div className="min-h-[200px] flex items-center justify-center">
                  <JournalEntriesSkeleton />
                </div>
              ) : entries.length > 0 ? (
                <div className="flex flex-col">
                  {entries.map((entry, i) => (
                    <div key={entry.id} className="relative pl-8 pb-6 group last:pb-0">
                      {i < entries.length - 1 && (
                        <div className="absolute left-[7.5px] top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-700/60" />
                      )}
                      <span className="absolute left-0 top-4 z-10 size-4 rounded-full border-[2.5px] border-primary bg-white dark:bg-surface-dark ring-4 ring-primary/[0.07] dark:ring-primary/10" />

                      <div className="flex flex-col gap-2.5 pt-0.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg">
                            {entry.time}
                          </span>
                          <span className="font-mono text-xs font-bold text-primary bg-primary/[0.06] dark:bg-primary/10 px-2.5 py-1 rounded-lg">
                            {entry.duration}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {(entry.tags.length > 0 ? entry.tags : ['No Tags']).map((tag) => {
                            const tagInfo = allTags.find((item) => item.name === tag);
                            const color = tagInfo?.color;

                            return (
                              <span
                                key={`${entry.id}-${tag}`}
                                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: color ? `${color}1A` : 'rgba(var(--primary), 0.1)',
                                  color: color || 'var(--primary)',
                                  borderColor: color ? `${color}33` : 'rgba(var(--primary), 0.2)',
                                }}
                              >
                                {tag}
                              </span>
                            );
                          })}
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {entry.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500">No entries for this day.</p>
                </div>
              )}
            </div>
          </div>
      </section>
  );
};
