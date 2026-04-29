'use client';

import React from 'react';
import { Session } from '@/types';
import { Play } from 'lucide-react';
import { formatDuration } from '../utils/format';
import { useAuth } from '@/context/AuthContext';
import { PageLayout } from './layout/PageLayout';
import { PageHeader } from './layout/PageHeader';
import { useTags } from '@/hooks/useTags';
import { TIME_TARGET_KEY, TIME_TARGET_AUDIO_ONLY_KEY } from '@/constants';
import toast from 'react-hot-toast';
import { Journal } from '@/components/Journal';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { useSettings } from '@/context/SettingsContext';

interface DashboardProps {
  sessions: Session[];
  onStartSession: () => void;
  isLoading?: boolean;
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUnderstand: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onUnderstand }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Enable Notifications</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    To receive an alert when you reach your time target, please allow notifications when prompted by your browser.
                </p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onUnderstand}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        I understand
                    </button>
                </div>
            </div>
        </div>
    );
};

const GoalRing: React.FC<{ current: number; target: number; label: string }> = ({ current, target, label }) => {
  const pct = Math.min(current / target, 1);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const currentHours = current / 3600;
  const targetHours = target / 3600;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative size-12">
        <svg className="size-12 -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22" cy="22" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="22" cy="22" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-primary transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
          {Math.round(pct * 100)}%
        </span>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
          {currentHours.toFixed(1)}/{targetHours}h
        </p>
      </div>
    </div>
  );
};


export const Dashboard: React.FC<DashboardProps> = ({ sessions, onStartSession, isLoading }) => {
  const { user } = useAuth();
  // Calculate today's stats
  const todayTs = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const tomorrowTs = todayTs + 86400000;

  const todaysSessions = React.useMemo(() => sessions.map(session => {
      const sTime = new Date(session.startTime).getTime();
      const sessionEnd = sTime + session.durationSeconds * 1000;

      const overlapStart = sTime > todayTs ? sTime : todayTs;
      const overlapEnd = sessionEnd < tomorrowTs ? sessionEnd : tomorrowTs;

      const durationForThisDay = Math.max(0, (overlapEnd - overlapStart) / 1000);

      return {
          ...session,
          durationSeconds: durationForThisDay
      };
  }).filter(s => s.durationSeconds > 0), [sessions, todayTs, tomorrowTs]);

  const totalSecondsToday = todaysSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);

  const { settings } = useSettings();

  // Calculate this week's stats (Monday-Sunday)
  const weekStartTs = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const dow = d.getDay();
    const offset = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + offset);
    return d.getTime();
  }, []);

  const totalSecondsWeek = React.useMemo(() => {
    return sessions
      .filter(s => new Date(s.startTime).getTime() >= weekStartTs)
      .reduce((acc, s) => acc + s.durationSeconds, 0);
  }, [sessions, weekStartTs]);

  const { tags } = useTags();
  const [isStarting, setIsStarting] = React.useState(false);
  const [timeTargetEnabled, setTimeTargetEnabled] = React.useState(false);
  const [timeTargetMinutes, setTimeTargetMinutes] = React.useState<number | ''>('');
  const [showNotificationModal, setShowNotificationModal] = React.useState(false);

  /** Determine whether browser notifications are fully available */
  const canSendNotifications = () =>
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.isSecureContext;

  const handleStartSession = () => {
      if (tags.length === 0) {
          toast.error('Please create tags first!');
          return;
      }
      if (isStarting) return;

      if (timeTargetEnabled && timeTargetMinutes) {
          if (canSendNotifications()) {
              if (Notification.permission === 'default') {
                  setShowNotificationModal(true);
                  return; // Don't start session yet
              }
              // If denied, fall through — executeStartSession will set audio-only
          }
      }

      executeStartSession();
  };

  const executeStartSession = () => {
      setIsStarting(true);

      if (timeTargetEnabled && typeof timeTargetMinutes === 'number' && timeTargetMinutes > 0) {
          localStorage.setItem(TIME_TARGET_KEY, timeTargetMinutes.toString());

          // Decide audio-only mode
          const notificationsGranted =
              canSendNotifications() && Notification.permission === 'granted';

          if (!notificationsGranted) {
              localStorage.setItem(TIME_TARGET_AUDIO_ONLY_KEY, 'true');
              toast('Notifications unavailable — you will hear an audio chime when the target is reached.', { icon: '🔔' });
          } else {
              localStorage.removeItem(TIME_TARGET_AUDIO_ONLY_KEY);
          }
      } else {
          localStorage.removeItem(TIME_TARGET_KEY);
          localStorage.removeItem(TIME_TARGET_AUDIO_ONLY_KEY);
      }

      onStartSession();

      setTimeout(() => {
          setIsStarting(false);
      }, 10000);
  };

  const handleUnderstandNotification = async () => {
      setShowNotificationModal(false);
      if (canSendNotifications()) {
          const result = await Notification.requestPermission();
          if (result !== 'granted') {
              // Permission was not granted — session will run in audio-only mode
          }
      }
      executeStartSession();
  };


  return (
    <PageLayout>
        {/* Header Section */}
        <PageHeader 
            title={`Welcome back, ${user?.name}!`}
            description={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        />
        
        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-mesh border border-slate-200 dark:border-white/10 shadow-lg group">
            <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-10">
                <div className="flex flex-col gap-3 text-center">
                    <h2 className="text-slate-900 dark:text-white text-xl sm:text-3xl font-bold leading-tight">
                        Ready to focus?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base font-normal leading-relaxed">
                        Hit the button below and start new working session.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                    <button 
                        onClick={handleStartSession} 
                        disabled={isStarting}
                        className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
                    >
                        <Play size={20} fill="currentColor" />
                        <span className='text-xs sm:text-base'>{isStarting ? 'Starting...' : 'Start New Working Session'}</span>
                    </button>

                    <div className="flex flex-col w-full gap-3 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Target</span>
                            <div className="relative inline-flex items-center">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={timeTargetEnabled}
                                    onChange={(e) => setTimeTargetEnabled(e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                            </div>
                        </label>
                        
                        {timeTargetEnabled && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <input 
                                    type="number" 
                                    min="1"
                                    placeholder="Enter minutes"
                                    value={timeTargetMinutes}
                                    onChange={(e) => setTimeTargetMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">min</span>
                            </div>
                        )}
                    </div>

                    {/* Total Hours Today */}
                    {isLoading ? (
                      <SkeletonBlock className="h-5 w-32 rounded-md self-center" />
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
                        Total Today: <span className="font-bold text-slate-700 dark:text-slate-200">{formatDuration(totalSecondsToday / 3600)}</span>
                      </p>
                    )}

                    {/* Goal Progress */}
                    {!isLoading && (settings.dailyGoalMinutes || settings.weeklyGoalMinutes) ? (
                      <div className="flex items-center justify-center gap-5 pt-1">
                        {settings.dailyGoalMinutes ? (
                          <GoalRing
                            current={totalSecondsToday}
                            target={settings.dailyGoalMinutes * 60}
                            label="Daily"
                          />
                        ) : null}
                        {settings.weeklyGoalMinutes ? (
                          <GoalRing
                            current={totalSecondsWeek}
                            target={settings.weeklyGoalMinutes * 60}
                            label="Weekly"
                          />
                        ) : null}
                      </div>
                    ) : null}
                </div>
            </div>
        </section>

        <NotificationModal 
            isOpen={showNotificationModal} 
            onClose={() => setShowNotificationModal(false)} 
            onUnderstand={handleUnderstandNotification} 
        />

        {/* Journal */}
        <Journal sessions={sessions} isLoading={isLoading} />
    </PageLayout>
  );
};
