import React from 'react';
import { BookOpenText, ChevronLeft, ChevronRight } from 'lucide-react';
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
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm dark:border-slate-700/60 dark:bg-[#1c232d]/90">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(30,64,175,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.15),transparent_45%)]" />

        <div className="relative rounded-2xl">
          <div className="pointer-events-none absolute left-0 top-0 h-full w-4 border-r border-slate-300/70 bg-slate-100/90 dark:border-slate-600/80 dark:bg-slate-800/70 sm:w-6" />

          <div className="pl-6 pr-4 py-5 sm:pl-10 sm:pr-8 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                  <BookOpenText size={20} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Journal Page</h2>
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
                  className="rounded-full border border-slate-300/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-700 transition-colors hover:bg-slate-100 cursor-pointer dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
                  aria-label="Go to today"
                >
                  Today
                </button>
                <button
                  onClick={handlePreviousDay}
                  className="flex size-9 items-center justify-center rounded-full border border-slate-300/80 text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
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
                      : 'cursor-pointer border-slate-300/80 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60'
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

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/90 bg-[#fffef8]/95 dark:border-slate-700/70 dark:bg-[#1a212a]/90">
              <div>
                <div className="min-h-[300px] px-4 py-6 sm:min-h-[360px] sm:px-6 sm:py-7">
                  {isLoading ? (
                    <JournalEntriesSkeleton />
                  ) : entries.length > 0 ? (
                    <div className="flex flex-col gap-1 text-slate-800 dark:text-slate-100">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="group flex items-start gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
                        >
                          <span className="mt-3 size-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />

                            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                              <span className="inline-flex w-fit items-center rounded-md border border-slate-300/80 bg-white px-2 py-1 font-mono text-xs font-semibold tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200">
                                {entry.time}
                              </span>

                              <span className="inline-flex w-fit items-center rounded-md border border-slate-300/80 bg-white px-2 py-1 font-mono text-xs font-semibold tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200">
                                {entry.duration}
                              </span>

                              <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="flex max-w-full flex-wrap gap-1">
                                {(entry.tags.length > 0 ? entry.tags : ['No Tags']).map((tag) => {
                                  const tagInfo = allTags.find((item) => item.name === tag);
                                  const color = tagInfo?.color;

                                  return (
                                    <span
                                      key={`${entry.id}-${tag}`}
                                      className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium"
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

                              <div className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-1.5 text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                                {entry.note}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="font-[family-name:var(--font-codec-pro)] text-[15px] leading-[31px] text-slate-500 dark:text-slate-400">
                      No entries for this day.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};
