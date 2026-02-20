import React from 'react';
import { Session } from '../../types';
import { formatDuration } from '../../utils/format';
import { useTags } from '../../hooks/useTags';
import { getTagColor } from '../../utils/analyticsHelpers';

interface MonthlyCalendarProps {
  sessions: Session[];
  currentDate: Date;
  excludeWeekends?: boolean;
}

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  sessions,
  currentDate,
  excludeWeekends = false,
}) => {
  const { tags: allTags } = useTags();

  const daysInMonth = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Adjust start to previous Monday
    const startDay = firstDayOfMonth.getDay();
    const diff = firstDayOfMonth.getDate() - startDay + (startDay === 0 ? -6 : 1);
    const startCalendar = new Date(firstDayOfMonth);
    startCalendar.setDate(diff);

    const days = [];
    const current = new Date(startCalendar);
    
    // Fill 6 weeks (42 days) to ensure full month coverage
    for (let i = 0; i < 42; i++) {
        const d = new Date(current);
        if (!(excludeWeekends && (d.getDay() === 0 || d.getDay() === 6))) {
            days.push(d);
        }
        current.setDate(current.getDate() + 1);
        
        // Stop if we've moved significantly past the month end and reached a weekend/Monday
        if (i >= 28 && d.getMonth() !== month && d.getDay() === 0) break;
    }
    return days;
  }, [currentDate, excludeWeekends]);

  const getDaySessions = (day: Date) => {
    const dayStart = new Date(day);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23,59,59,999);

    return sessions.filter(s => {
      const sStart = new Date(s.startTime);
      const sEnd = new Date(s.endTime);
      return sStart < dayEnd && sEnd > dayStart;
    });
  };



  return (
    <div className="bg-white dark:bg-[#1c232d] rounded-xl border border-[#e5e7eb] dark:border-[#283039] p-4 lg:p-6 shadow-sm mt-4">
      <div className={`grid ${excludeWeekends ? 'grid-cols-5' : 'grid-cols-7'} gap-px bg-[#e5e7eb] dark:bg-[#283039] border border-[#e5e7eb] dark:border-[#283039] rounded-lg overflow-hidden`}>
        {/* Day Names */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', ...(excludeWeekends ? [] : ['Sat', 'Sun'])].map(d => (
          <div key={d} className="bg-slate-50 dark:bg-[#1c232d]/50 p-2 text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {d}
          </div>
        ))}

        {/* Calendar Cells */}
        {daysInMonth.map((day, i) => {
          const daySessions = getDaySessions(day);
          const dayStart = new Date(day);
          dayStart.setHours(0,0,0,0);
          const dayEnd = new Date(day);
          dayEnd.setHours(23,59,59,999);

          const totalDuration = daySessions.reduce((acc, s) => {
            const sStart = new Date(s.startTime);
            const sEnd = new Date(s.endTime);
            const overlapStart = sStart < dayStart ? dayStart : sStart;
            const overlapEnd = sEnd > dayEnd ? dayEnd : sEnd;
            const duration = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / 1000);
            return acc + duration;
          }, 0);
          
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div 
              key={i} 
              className={`min-h-[100px] p-2 bg-white dark:bg-[#1c232d] flex flex-col gap-1 transition-colors hover:bg-slate-50 dark:hover:bg-[#232b36] border-b border-r border-[#e5e7eb] dark:border-[#283039] ${!isCurrentMonth ? 'opacity-40' : ''}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs font-bold ${isToday ? 'bg-primary text-white size-6 rounded-full flex items-center justify-center' : 'text-slate-900 dark:text-white'}`}>
                  {day.getDate()}
                </span>
                {totalDuration > 0 && (
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {formatDuration(totalDuration / 3600)}
                  </span>
                )}
              </div>
              
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {daySessions.slice(0, 3).map(s => {
                  const color = getTagColor(allTags, s.tags[0] || '');
                  return (
                    <div 
                        key={s.id} 
                        className="h-1.5 rounded-full w-full" 
                        style={{ backgroundColor: color }}
                        title={`${s.tags.join(', ')}: ${formatDuration(s.durationSeconds / 3600)}`}
                    />
                  );
                })}
                {daySessions.length > 3 && (
                  <div className="text-[9px] text-slate-400 text-center font-medium">
                    +{daySessions.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
