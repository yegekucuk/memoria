'use client';

import React from 'react';
import { Session } from '@/types';
import { Calendar, Flame } from 'lucide-react';

interface StreakHeatmapProps {
  sessions: Session[];
  isLoading?: boolean;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_SHORT = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const WEEKS_TO_SHOW = 12;

type Cell = {
  date: string;
  intensity: 0 | 1 | 2 | 3 | 4;
};

function getIntensity(durationSeconds: number): 0 | 1 | 2 | 3 | 4 {
  if (durationSeconds <= 0) return 0;
  if (durationSeconds < 1800) return 1;
  if (durationSeconds < 7200) return 2;
  if (durationSeconds < 14400) return 3;
  return 4;
}

function formatDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ sessions, isLoading }) => {
  const grid = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from Monday, 12 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS_TO_SHOW * 7 - 1));
    // Align to Monday (Sun=0 → shift back to previous Monday)
    const startDow = start.getDay();
    const mondayOffset = startDow === 0 ? 6 : startDow - 1;
    start.setDate(start.getDate() - mondayOffset);

    // Build date → seconds map
    const dayMap = new Map<string, number>();
    sessions.forEach(s => {
      const key = formatDateKey(new Date(s.startTime));
      dayMap.set(key, (dayMap.get(key) || 0) + s.durationSeconds);
    });

    // Build grid: rows[dayOfWeek 0=Sun..6=Sat] → columns[week index]
    const totalDays = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
    const numCols = Math.ceil(totalDays / 7);

    const rows: (Cell | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: numCols }, () => null)
    );

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = formatDateKey(d);
      const row = d.getDay(); // 0=Sun .. 6=Sat
      const col = Math.floor(i / 7);
      rows[row][col] = {
        date: key,
        intensity: getIntensity(dayMap.get(key) || 0),
      };
    }

    return { rows, numCols, start };
  }, [sessions]);

  const currentStreak = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    const check = new Date(today);

    while (true) {
      const key = formatDateKey(check);
      const hasSession = sessions.some(s => {
        return formatDateKey(new Date(s.startTime)) === key && s.durationSeconds > 0;
      });

      if (hasSession) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else if (check.getTime() === today.getTime()) {
        check.setDate(check.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    return streak;
  }, [sessions]);

  // Month labels: find first occurrence of each month
  const monthLabels = React.useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    for (let col = 0; col < grid.numCols; col++) {
      for (let row = 0; row < 7; row++) {
        const cell = grid.rows[row][col];
        if (cell) {
          const d = new Date(cell.date);
          const month = MONTHS_SHORT[d.getMonth()];
          if (labels.length === 0 || labels[labels.length - 1].label !== month) {
            labels.push({ label: month, col });
          }
          break;
        }
      }
    }
    return labels;
  }, [grid]);

  const CELL_COLOR = 'rounded-[3px]';
  const GAP = 'gap-[3px]';
  const INTENSITY_BLUE: Record<number, string> = {
    0: 'bg-slate-100 dark:bg-white/[0.04]',
    1: 'bg-blue-300 dark:bg-blue-800',
    2: 'bg-blue-400 dark:bg-blue-600',
    3: 'bg-blue-500 dark:bg-blue-500',
    4: 'bg-blue-600 dark:bg-blue-400',
  };

  const numCols = grid.numCols;

  // Build month label spans relative to column count
  const monthSpans = React.useMemo(() => {
    const spans: { label: string; cols: number }[] = [];
    for (let i = 0; i < monthLabels.length; i++) {
      const curr = monthLabels[i];
      const next = monthLabels[i + 1];
      spans.push({
        label: curr.label,
        cols: (next ? next.col : numCols) - curr.col,
      });
    }
    return spans;
  }, [monthLabels, numCols]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Calendar size={18} className="text-slate-500 dark:text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
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
        <div className={`w-full max-w-lg mx-auto flex ${GAP}`}>
          {Array.from({ length: WEEKS_TO_SHOW + 1 }).map((_, w) => (
            <div key={w} className={`flex-1 flex flex-col ${GAP}`}>
              {Array.from({ length: 7 }).map((_, d) => (
                <div key={d} className={`w-full aspect-square ${CELL_COLOR} bg-slate-100 dark:bg-white/5 animate-pulse`} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-lg mx-auto">
          {/* Month labels */}
          <div className={`flex ${GAP} mb-0.5`}>
            {monthSpans.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-slate-400 dark:text-slate-600 leading-none"
                style={{ flex: m.cols }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className={`flex w-full ${GAP}`}>
            {/* Day labels */}
            <div className={`flex flex-col ${GAP} justify-between py-[2px]`}>
              {DAY_SHORT.map((label, i) => (
                <div key={i} className="flex-1 flex items-center text-[10px] text-slate-400 dark:text-slate-600 leading-none">
                  {label}
                </div>
              ))}
            </div>

            {/* Grid columns */}
            {Array.from({ length: numCols }).map((_, col) => (
              <div key={col} className={`flex-1 flex flex-col ${GAP}`}>
                {Array.from({ length: 7 }).map((_, row) => {
                  const cell = grid.rows[row][col];
                  if (!cell) {
                    return <div key={row} className={`w-full aspect-square ${CELL_COLOR}`} />;
                  }
                  return (
                    <div
                      key={row}
                      className={`w-full aspect-square ${CELL_COLOR} ${INTENSITY_BLUE[cell.intensity]}`}
                      title={`${cell.date}${cell.intensity > 0 ? ` · Active` : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-[3px] mt-2.5 mr-0" style={{ marginRight: 'calc(100% / 7 + 3px)' }}>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`size-3.5 rounded-[3px] ${INTENSITY_BLUE[level]}`} />
            ))}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">More</span>
          </div>
        </div>
      )}
    </div>
  );
};
