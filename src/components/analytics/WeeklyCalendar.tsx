import React from 'react';
import { Session } from '@/types';
import { formatDuration } from '../../utils/format';
import { useTags } from '../../hooks/useTags';
import { getStartOfWeek, getTagColor } from '../../utils/analyticsHelpers';

interface WeeklyCalendarProps {
  sessions: Session[];
  currentDate: Date;
  excludeWeekends?: boolean;
}

const HOUR_SLOT_HEIGHT = 36;
const CALENDAR_VIEWPORT_HEIGHT = 520;

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  sessions,
  currentDate,
  excludeWeekends = false,
}) => {
  const { tags: allTags } = useTags();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const hasAutoScrolledRef = React.useRef(false);

  const startOfWeek = React.useMemo(() => getStartOfWeek(currentDate), [currentDate]);

  // Generate 7 days (or 5 if excluding weekends)
  const days = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      if (excludeWeekends && (d.getDay() === 0 || d.getDay() === 6)) continue;
      result.push(d);
    }
    return result;
  }, [startOfWeek, excludeWeekends]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter sessions that overlap with the current week
  const weekSessions = React.useMemo(() => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + (excludeWeekends ? 5 : 7));
    
    return sessions.filter(s => {
      const sStart = new Date(s.startTime);
      const sEnd = new Date(s.endTime);
      return sStart < endOfWeek && sEnd > startOfWeek;
    });
  }, [sessions, startOfWeek, excludeWeekends]);



  // Current Time State
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  const isCurrentWeek = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + (excludeWeekends ? 5 : 7));

    return today >= startOfWeek && today < endOfWeek;
  }, [startOfWeek, excludeWeekends]);

  const currentTimeOffset = (now.getHours() + now.getMinutes() / 60) * HOUR_SLOT_HEIGHT;

  React.useEffect(() => {
    hasAutoScrolledRef.current = false;
  }, [startOfWeek, excludeWeekends]);

  React.useEffect(() => {
    if (!isCurrentWeek || hasAutoScrolledRef.current) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const targetTop = Math.max(0, currentTimeOffset - container.clientHeight / 2);
    container.scrollTo({ top: targetTop });
    hasAutoScrolledRef.current = true;
  }, [isCurrentWeek, currentTimeOffset]);

  return (
    <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-4 lg:p-6 shadow-sm mt-4 overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="flex border-b border-[#e5e7eb] dark:border-[#283039]">
          <div className="w-16 shrink-0" /> {/* Time column spacer */}
          {days.map((day, i) => (
            <div key={i} className="flex-1 py-2 text-center border-l border-[#e5e7eb] dark:border-[#283039]">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-sm font-bold ${day.toDateString() === new Date().toDateString() ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          ref={scrollContainerRef}
          className="relative overflow-y-auto"
          style={{ maxHeight: `${CALENDAR_VIEWPORT_HEIGHT}px` }}
        >
          <div className="relative flex">
            {/* Time column */}
            <div className="w-16 shrink-0">
              {hours.map(hour => (
                <div
                  key={hour}
                  className="text-[10px] text-slate-400 dark:text-slate-500 text-right pr-2 pt-1 border-b border-transparent"
                  style={{ height: `${HOUR_SLOT_HEIGHT}px` }}
                >
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            <div className="flex-1 flex relative">
              {days.map((day, dayIndex) => (
                <div key={dayIndex} className="flex-1 border-l border-[#e5e7eb] dark:border-[#283039] relative">
                  {/* Hour grid lines */}
                  {hours.map(hour => (
                    <div
                      key={hour}
                      className="border-b border-[#f1f5f9] dark:border-[#283039]/50"
                      style={{ height: `${HOUR_SLOT_HEIGHT}px` }}
                    />
                  ))}

                  {/* Sessions in this day */}
                  {weekSessions.map(session => {
                    const sStart = new Date(session.startTime);
                    const sEnd = new Date(session.endTime);

                    // Check if session falls on this day
                    const dayStart = new Date(day);
                    dayStart.setHours(0,0,0,0);
                    const dayEnd = new Date(day);
                    dayEnd.setHours(23,59,59,999);

                    if (sEnd < dayStart || sStart > dayEnd) return null;

                    // Calculate position
                    const startOffset = Math.max(0, (sStart.getTime() - dayStart.getTime()) / (1000 * 60 * 60));
                    const endOffset = Math.min(24, (sEnd.getTime() - dayStart.getTime()) / (1000 * 60 * 60));
                    const duration = endOffset - startOffset;

                    if (duration <= 0) return null;

                    const color = getTagColor(allTags, session.tags[0] || '');

                    return (
                      <div
                        key={session.id}
                        className="absolute left-0.5 right-0.5 rounded px-1.5 py-1 text-[10px] font-medium text-white overflow-hidden shadow-sm z-10 hover:z-20 transition-all opacity-90 hover:opacity-100 group"
                        style={{
                          top: `${startOffset * HOUR_SLOT_HEIGHT}px`,
                          height: `${duration * HOUR_SLOT_HEIGHT}px`,
                          backgroundColor: color,
                          minHeight: '20px',
                        }}
                      >
                        <div className="truncate font-bold">{session.tags.join(', ')}</div>
                        <div className="truncate opacity-90">{formatDuration(session.durationSeconds / 3600)}</div>

                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50">
                          <div className="bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                            {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Current Time Indicator */}
              {isCurrentWeek && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                  style={{ top: `${currentTimeOffset}px`, transform: 'translateY(-50%)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary -ml-1"></div>
                  <div className="flex-1 h-[2px] bg-primary/50"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
