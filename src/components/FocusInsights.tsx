'use client';

import React from 'react';
import { Session } from '@/types';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { formatDuration } from '@/utils/format';

interface FocusInsightsProps {
  sessions: Session[];
  isLoading?: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const FocusInsights: React.FC<FocusInsightsProps> = ({ sessions, isLoading }) => {
  const completed = React.useMemo(() => sessions.filter(s => s.durationSeconds > 0), [sessions]);

  const insights = React.useMemo(() => {
    if (completed.length === 0) return null;

    // Peak hour
    const hourBuckets = new Array(24).fill(0);
    completed.forEach(s => {
      const h = new Date(s.startTime).getHours();
      hourBuckets[h] += s.durationSeconds;
    });
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));
    const peakHourLabel = `${String(peakHour).padStart(2, '0')}:00 – ${String((peakHour + 1) % 24).padStart(2, '0')}:00`;

    // Peak day
    const dayBuckets = new Array(7).fill(0);
    completed.forEach(s => {
      const d = new Date(s.startTime).getDay();
      dayBuckets[d] += s.durationSeconds;
    });
    const peakDay = dayBuckets.indexOf(Math.max(...dayBuckets));

    // Top tag
    const tagTime = new Map<string, number>();
    completed.forEach(s => {
      s.tags.forEach(t => {
        tagTime.set(t, (tagTime.get(t) || 0) + s.durationSeconds);
      });
    });
    let topTag = '';
    let topTagSeconds = 0;
    tagTime.forEach((sec, tag) => {
      if (sec > topTagSeconds) {
        topTagSeconds = sec;
        topTag = tag;
      }
    });

    // Average session length
    const avgSeconds = completed.reduce((a, s) => a + s.durationSeconds, 0) / completed.length;

    return {
      peakHour: peakHourLabel,
      peakDay: DAY_NAMES[peakDay],
      topTag: topTag || '—',
      topTagHours: topTagSeconds / 3600,
      avgMinutes: Math.round(avgSeconds / 60),
      totalSessions: completed.length,
      totalHours: completed.reduce((a, s) => a + s.durationSeconds, 0) / 3600,
    };
  }, [completed]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-slate-400" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] animate-pulse">
              <div className="h-3 w-16 bg-slate-200 dark:bg-white/10 rounded" />
              <div className="h-5 w-20 bg-slate-200 dark:bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <TrendingUp size={16} className="text-slate-400" />
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Complete some sessions to unlock insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <TrendingUp size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Insights</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-primary/[0.04] dark:bg-primary/5">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-primary/70" />
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Peak Hour</p>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{insights.peakHour}</p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-purple-500/[0.04] dark:bg-purple-500/5">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-purple-500/70" />
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Best Day</p>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{insights.peakDay}</p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-emerald-500/[0.04] dark:bg-emerald-500/5">
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-emerald-500/70" />
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Top Tag</p>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
            {insights.topTag}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {formatDuration(insights.topTagHours)}
          </p>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-orange-500/[0.04] dark:bg-orange-500/5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-orange-500/70" />
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Avg Session</p>
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{insights.avgMinutes}m</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            {insights.totalSessions} sessions · {formatDuration(insights.totalHours)}
          </p>
        </div>
      </div>
    </div>
  );
};
