import React from 'react';
import { Session } from '../types';
import { Play, Timer, FlaskConical, Tag } from 'lucide-react';
import { formatDuration } from '../utils/format';

interface DashboardProps {
  sessions: Session[];
  onStartSession: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions, onStartSession }) => {
  // Calculate today's stats
  const today = new Date();
  const todayString = today.toDateString();
  
  const todaysSessions = sessions.filter(s => new Date(s.startTime).toDateString() === todayString);
  const totalSecondsToday = todaysSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const hoursToday = Math.floor(totalSecondsToday / 3600);
  const minutesToday = Math.floor((totalSecondsToday % 3600) / 60);


  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Welcome back!</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
        </header>
        
        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-10">
                <div className="flex flex-col gap-3 text-center">
                    <h2 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight">
                        Ready to focus?
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-relaxed">
                        Hit the button below and start new working session.
                    </p>
                </div>
                <button onClick={onStartSession} className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap cursor-pointer">
                    <Play size={20} fill="currentColor" />
                    <span>Start New Working Session</span>
                </button>
            </div>
        </section>

        {/* Dashboard Grid */}
        <div className="flex flex-col gap-6">
            {/* Daily Summary */}
            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Timer size={24} />
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold">Daily Summary</h3>
                    </div>
                    <div className="flex flex-col gap-1 mb-6">
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Hours Today</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{formatDuration(totalSecondsToday / 3600)}</p>
                    </div>
                    <div className="h-px bg-slate-100 dark:bg-white/10 w-full mb-4"></div>
                    <div className="flex flex-col gap-4">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Last 3 Sessions</p>
                        {todaysSessions.slice().reverse().slice(0, 3).map((session, i) => (
                           <div key={i} className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                  i === 0 ? 'bg-purple-500/10 text-purple-500' : 
                                  i === 1 ? 'bg-orange-500/10 text-orange-500' : 'bg-pink-500/10 text-pink-500'
                                }`}>
                                    {session.tags[0] === 'Math' ? <FlaskConical size={20} /> : <Tag size={20} />}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.tags[0] || 'Uncategorized'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.notes || 'No notes'}</p>
                                </div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{Math.floor(session.durationSeconds / 60)}m</p>
                            </div>
                        ))}
                        {todaysSessions.length === 0 && <p className="text-sm text-slate-500">No sessions today.</p>}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};