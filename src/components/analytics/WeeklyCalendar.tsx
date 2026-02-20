import React from 'react';
import { Session } from '../../types';
import { formatDuration } from '../../utils/format';
import { useTags } from '../../hooks/useTags';

interface WeeklyCalendarProps {
  sessions: Session[];
  currentDate: Date;
  excludeWeekends?: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  sessions,
  currentDate,
  excludeWeekends = false,
}) => {
  const { tags: allTags } = useTags();

  // Calculate the start of the week (Monday)
  const startOfWeek = React.useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [currentDate]);

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

  const getTagColor = (tagName: string) => {
    const tag = allTags.find(t => t.name === tagName);
    return tag?.color || '#3b82f6';
  };

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
        <div className="relative flex">
          {/* Time column */}
          <div className="w-16 shrink-0">
            {hours.map(hour => (
              <div key={hour} className="h-12 text-[10px] text-slate-400 dark:text-slate-500 text-right pr-2 pt-1 border-b border-transparent">
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
                  <div key={hour} className="h-12 border-b border-[#f1f5f9] dark:border-[#283039]/50" />
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

                  const color = getTagColor(session.tags[0] || '');

                  return (
                    <div
                      key={session.id}
                      className="absolute left-0.5 right-0.5 rounded px-1.5 py-1 text-[10px] font-medium text-white overflow-hidden shadow-sm z-10 hover:z-20 transition-all opacity-90 hover:opacity-100 group"
                      style={{
                        top: `${startOffset * 48}px`,
                        height: `${duration * 48}px`,
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
          </div>
        </div>
      </div>
    </div>
  );
};
