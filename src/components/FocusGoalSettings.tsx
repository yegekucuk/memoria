'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { SubSetting } from './SubSetting';
import { useAuth } from '@/context/AuthContext';
import { 
  Check, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Minus, 
  Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FocusGoalSettings: React.FC = () => {
  const { settings, updateFocusGoals } = useSettings();
  const { user } = useAuth();
  
  const [dailyMinutes, setDailyMinutes] = React.useState<number | ''>(
    settings.dailyGoalMinutes ?? ''
  );
  const [weeklyMinutes, setWeeklyMinutes] = React.useState<number | ''>(
    settings.weeklyGoalMinutes ?? ''
  );
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  React.useEffect(() => {
    setDailyMinutes(settings.dailyGoalMinutes ?? '');
    setWeeklyMinutes(settings.weeklyGoalMinutes ?? '');
    setSaveStatus('idle');
  }, [settings.dailyGoalMinutes, settings.weeklyGoalMinutes]);

  // Derive Daily values
  const dailyHoursDisplay = dailyMinutes === '' ? '' : Math.floor(dailyMinutes / 60);
  const dailyMinsDisplay = dailyMinutes === '' ? '' : dailyMinutes % 60;

  // Derive Weekly values
  const weeklyHoursDisplay = weeklyMinutes === '' ? '' : Math.floor(weeklyMinutes / 60);
  const weeklyMinsDisplay = weeklyMinutes === '' ? '' : weeklyMinutes % 60;

  const handleDailyHoursChange = (valStr: string) => {
    if (valStr === '') {
      const currentMins = dailyMinutes === '' ? 0 : dailyMinutes % 60;
      setDailyMinutes(currentMins === 0 ? '' : currentMins);
    } else {
      const h = parseInt(valStr);
      if (!isNaN(h) && h >= 0) {
        const currentMins = dailyMinutes === '' ? 0 : dailyMinutes % 60;
        setDailyMinutes(h * 60 + currentMins);
      }
    }
  };

  const handleDailyMinsChange = (valStr: string) => {
    if (valStr === '') {
      const currentHours = dailyMinutes === '' ? 0 : Math.floor(dailyMinutes / 60);
      setDailyMinutes(currentHours === 0 ? '' : currentHours * 60);
    } else {
      const m = parseInt(valStr);
      if (!isNaN(m) && m >= 0 && m < 60) {
        const currentHours = dailyMinutes === '' ? 0 : Math.floor(dailyMinutes / 60);
        setDailyMinutes(currentHours * 60 + m);
      }
    }
  };

  const handleWeeklyHoursChange = (valStr: string) => {
    if (valStr === '') {
      const currentMins = weeklyMinutes === '' ? 0 : weeklyMinutes % 60;
      setWeeklyMinutes(currentMins === 0 ? '' : currentMins);
    } else {
      const h = parseInt(valStr);
      if (!isNaN(h) && h >= 0) {
        const currentMins = weeklyMinutes === '' ? 0 : weeklyMinutes % 60;
        setWeeklyMinutes(h * 60 + currentMins);
      }
    }
  };

  const handleWeeklyMinsChange = (valStr: string) => {
    if (valStr === '') {
      const currentHours = weeklyMinutes === '' ? 0 : Math.floor(weeklyMinutes / 60);
      setWeeklyMinutes(currentHours === 0 ? '' : currentHours * 60);
    } else {
      const m = parseInt(valStr);
      if (!isNaN(m) && m >= 0 && m < 60) {
        const currentHours = weeklyMinutes === '' ? 0 : Math.floor(weeklyMinutes / 60);
        setWeeklyMinutes(currentHours * 60 + m);
      }
    }
  };

  const stepDaily = (amount: number) => {
    const current = dailyMinutes === '' ? 0 : dailyMinutes;
    const next = Math.max(0, current + amount);
    setDailyMinutes(next === 0 ? '' : next);
  };

  const stepWeekly = (amount: number) => {
    const current = weeklyMinutes === '' ? 0 : weeklyMinutes;
    const next = Math.max(0, current + amount);
    setWeeklyMinutes(next === 0 ? '' : next);
  };

  const hasChanges =
    (dailyMinutes === '' ? null : dailyMinutes) !== (settings.dailyGoalMinutes ?? null) ||
    (weeklyMinutes === '' ? null : weeklyMinutes) !== (settings.weeklyGoalMinutes ?? null);

  const displayStatus = saveStatus === 'saving'
    ? 'saving'
    : saveStatus === 'error'
    ? 'error'
    : hasChanges
    ? 'unsaved'
    : saveStatus === 'saved'
    ? 'saved'
    : 'idle';

  const handleSave = async () => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      const dailyVal = dailyMinutes === '' ? null : dailyMinutes;
      const weeklyVal = weeklyMinutes === '' ? null : weeklyMinutes;
      
      await updateFocusGoals(dailyVal, weeklyVal);
      setSaveStatus('saved');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  return (
    <SubSetting
      sectionId="focus-goals"
      title="Focus Goals"
      subtitle="Set daily and weekly targets to stay motivated"
    >
      <div className="flex flex-col gap-4">
        
        {/* Daily Goal Card */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 hover:border-slate-300/80 dark:hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Goal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target active focus time per day
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            {/* Input Controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-sm group focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button
                type="button"
                onClick={() => stepDaily(-30)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="-30 minutes"
              >
                <Minus size={14} />
              </button>

              <div className="flex items-center gap-0.5 px-1">
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={dailyHoursDisplay}
                  onChange={(e) => handleDailyHoursChange(e.target.value)}
                  placeholder="0"
                  className="w-8 text-center bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 focus:outline-none placeholder:text-slate-400 font-mono"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold select-none">h</span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 font-bold select-none">:</span>

              <div className="flex items-center gap-0.5 px-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={dailyMinsDisplay}
                  onChange={(e) => handleDailyMinsChange(e.target.value)}
                  placeholder="00"
                  className="w-8 text-center bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 focus:outline-none placeholder:text-slate-400 font-mono"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold select-none">m</span>
              </div>

              <button
                type="button"
                onClick={() => stepDaily(30)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="+30 minutes"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1">
              {[60, 120, 180, 240, 480].map((mins) => {
                const isSelected = dailyMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyMinutes(mins)}
                    className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    {mins / 60}h
                  </button>
                );
              })}
              {dailyMinutes !== '' && (
                <button
                  type="button"
                  onClick={() => setDailyMinutes('')}
                  className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border border-red-200 dark:border-red-900/20 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/20 transition-all cursor-pointer flex items-center gap-1"
                  title="Remove daily goal"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 hover:border-slate-300/80 dark:hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Weekly Goal
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Target active focus time per week
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            {/* Input Controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-1 shadow-sm group focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <button
                type="button"
                onClick={() => stepWeekly(-60)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="-1 hour"
              >
                <Minus size={14} />
              </button>

              <div className="flex items-center gap-0.5 px-1">
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={weeklyHoursDisplay}
                  onChange={(e) => handleWeeklyHoursChange(e.target.value)}
                  placeholder="0"
                  className="w-10 text-center bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 focus:outline-none placeholder:text-slate-400 font-mono"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold select-none">h</span>
              </div>

              <span className="text-slate-300 dark:text-slate-700 font-bold select-none font-mono">:</span>

              <div className="flex items-center gap-0.5 px-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={weeklyMinsDisplay}
                  onChange={(e) => handleWeeklyMinsChange(e.target.value)}
                  placeholder="00"
                  className="w-8 text-center bg-transparent border-0 p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 focus:outline-none placeholder:text-slate-400 font-mono"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold select-none">m</span>
              </div>

              <button
                type="button"
                onClick={() => stepWeekly(60)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="+1 hour"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1">
              {[300, 600, 1200, 1800, 2400].map((mins) => {
                const isSelected = weeklyMinutes === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setWeeklyMinutes(mins)}
                    className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 dark:bg-indigo-500/20'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    {mins / 60}h
                  </button>
                );
              })}
              {weeklyMinutes !== '' && (
                <button
                  type="button"
                  onClick={() => setWeeklyMinutes('')}
                  className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border border-red-200 dark:border-red-900/20 bg-red-50 dark:bg-red-950/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/20 transition-all cursor-pointer flex items-center gap-1"
                  title="Remove weekly goal"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sync Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-white/5">
          
          {/* Status Indicators */}
          <div className="flex items-center h-8">
            <AnimatePresence mode="wait">
              {displayStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                >
                  <Check size={12} className="stroke-[3]" />
                  <span>Saved</span>
                </motion.div>
              )}

              {displayStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30"
                >
                  <Loader2 size={12} className="animate-spin stroke-[3]" />
                  <span>Saving...</span>
                </motion.div>
              )}

              {displayStatus === 'unsaved' && (
                <motion.div
                  key="unsaved"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Unsaved changes</span>
                </motion.div>
              )}

              {displayStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                >
                  <AlertCircle size={12} className="stroke-[2.5]" />
                  <span>Failed to save</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={!hasChanges || saveStatus === 'saving'}
            onClick={handleSave}
            className={`w-full sm:w-auto relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              hasChanges && saveStatus !== 'saving'
                ? 'bg-primary text-white shadow-md hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50'
                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200/50 dark:border-white/5'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>

        </div>

      </div>
    </SubSetting>
  );
};
