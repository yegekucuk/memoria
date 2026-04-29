'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { SubSetting } from './SubSetting';
import { useAuth } from '@/context/AuthContext';

export const FocusGoalSettings: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [dailyMinutes, setDailyMinutes] = React.useState<number | ''>(
    settings.dailyGoalMinutes ?? ''
  );
  const [weeklyMinutes, setWeeklyMinutes] = React.useState<number | ''>(
    settings.weeklyGoalMinutes ?? ''
  );
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setDailyMinutes(settings.dailyGoalMinutes ?? '');
    setWeeklyMinutes(settings.weeklyGoalMinutes ?? '');
  }, [settings.dailyGoalMinutes, settings.weeklyGoalMinutes]);

  const saveGoal = async (field: 'dailyGoalMinutes' | 'weeklyGoalMinutes', value: number | null) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          excludeWeekends: settings.excludeWeekends,
          [field]: value,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch {
      // Revert on failure
      if (field === 'dailyGoalMinutes') setDailyMinutes(settings.dailyGoalMinutes ?? '');
      else setWeeklyMinutes(settings.weeklyGoalMinutes ?? '');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SubSetting
      sectionId="focus-goals"
      title="Focus Goals"
      subtitle="Set daily and weekly targets to stay motivated"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Daily goal</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Target hours per day</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Hours"
              value={dailyMinutes === '' ? '' : Math.floor((dailyMinutes as number) / 60)}
              onChange={(e) => {
                const hours = parseInt(e.target.value);
                if (e.target.value === '') {
                  setDailyMinutes('');
                } else if (!isNaN(hours) && hours >= 0) {
                  const mins = hours * 60;
                  setDailyMinutes(mins);
                }
              }}
              onBlur={() => {
                const val = dailyMinutes === '' ? null : (dailyMinutes as number);
                saveGoal('dailyGoalMinutes', val);
              }}
              disabled={isSaving}
              className="w-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">hours</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">Weekly goal</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Target hours per week</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              placeholder="Hours"
              value={weeklyMinutes === '' ? '' : Math.floor((weeklyMinutes as number) / 60)}
              onChange={(e) => {
                const hours = parseInt(e.target.value);
                if (e.target.value === '') {
                  setWeeklyMinutes('');
                } else if (!isNaN(hours) && hours >= 0) {
                  const mins = hours * 60;
                  setWeeklyMinutes(mins);
                }
              }}
              onBlur={() => {
                const val = weeklyMinutes === '' ? null : (weeklyMinutes as number);
                saveGoal('weeklyGoalMinutes', val);
              }}
              disabled={isSaving}
              className="w-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">hours</span>
          </div>
        </div>
      </div>
    </SubSetting>
  );
};
