'use client';

import React from 'react';
import { Session } from '@/types';
import { Calendar, Flame } from 'lucide-react';

interface StreakHeatmapProps {
  sessions: Session[];
  isLoading?: boolean;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['', 'M', '', 'W', '', 'F', ''];

function getIntensity(durationSeconds: number): 0 | 1 | 2 | 3 | 4 {
  if (durationSeconds <= 0) return 0;
  if (durationSeconds < 1800) return 1; // < 30min
  if (durationSeconds < 7200) return 2; // < 2h
  if (durationSeconds < 14400) return 3; // < 4h
  return 4; // 4h+
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ sessions, isLoading }) => {
  const heatmapData = React.useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Build a map of date -> total seconds
    const dayMap = new Map<string, number>();
    sessions.forEach(s => {
      const d = new Date(s.startTime);
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, (dayMap.get(key) || 0) + s.durationSeconds);
    });

    // Generate last 84 days (12 weeks)
    const cells: { date: string; intensity: 0 | 1 | 2 | 3 | 4; dayOfWeek: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      cells.push({
        date: key,
        intensity: getIntensity(dayMap.get(key) || 0),
        dayOfWeek: d.getDay(),
      });
    }

    return cells;
  }, [sessions]);

  const currentStreak = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const check = new Date(today);

    while (true) {
      const key = check.toISOString().split('T')[0];
      const hasSession = sessions.some(s => {
        const sDate = new Date(s.startTime);
        return sDate.toISOString().split('T')[0] === key && s.durationSeconds > 0;
      });

      if (hasSession) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else if (check.getTime() === today.getTime()) {
        // Today hasn't happened yet, check yesterday
        check.setDate(check.getDate() - 1);
        continue;
      } else {
        break;
      }
    }

    return streak;
  }, [sessions]);

  // Determine which months to show labels
  const monthLabels: { label: string; col: number }[] = [];
  heatmapData.forEach((cell, i) => {
    const d = new Date(cell.date);
    if (d.getDate() <= 7) {
      monthLabels.push({ label: MONTHS_SHORT[d.getMonth()], col: Math.floor(i / 7) });
    }
  });

  // Devivi into rows of 7 (weeks)
  const weekRows: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weekRows.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Activity
          </h3>
        </div>
        {!isLoading && currentStreak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400">
            <Flame size={14} />
            {currentStreak} day streak
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-1">
          {Array.from({ length: 12 }).map((_, w) => (
            <div key={w} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, d) => (
                <div key={d} className="size-3 rounded-sm bg-slate-100 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex gap-1 min-w-fit">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-2 pt-5">
              {DAYS_SHORT.map((d, i) => (
                <div key={i} className="h-3 text-[9px] text-slate-400 dark:text-slate-600 leading-3">
                  {d}
                </div>
              ))}
            </div>

            <div>
              {/* Month labels */}
              <div className="flex mb-1" style={{ paddingLeft: 0 }}>
                {monthLabels.map((m, i) => (
                  <span
                    key={i}
                    className="text-[9px] text-slate-400 dark:text-slate-600"
                    style={{ width: `${14 * 1}px`, marginLeft: i === 0 ? 0 : undefined }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              {/* Grid */}
              <div className="flex gap-1">
                {weekRows.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((cell, di) => (
                      <div
                        key={di}
                        className="size-3 rounded-sm"
                        style={{
                          backgroundColor: cell.intensity === 0
                            ? undefined
                            : `rgba(59, 130, 246, ${cell.intensity * 0.25})`,
                        }}
                        title={`${cell.date}: ${cell.intensity > 0 ? 'Active' : 'No sessions'}`}
                      >
                        {cell.intensity === 0 && (
                          <div className="size-3 rounded-sm bg-slate-100 dark:bg-white/[0.03]" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 mr-1">Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className="size-2.5 rounded-sm"
                    style={{
                      backgroundColor: level === 0
                        ? 'var(--tw-slate-100)'
                        : `rgba(59, 130, 246, ${level * 0.25})`,
                    }}
                    title={`Level ${level}`}
                  />
                ))}
                <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-1">More</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
