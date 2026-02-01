import React from 'react';
import { Session } from '../types';
import { Play, Timer, FlaskConical, Tag } from 'lucide-react';
import { formatDuration } from '../utils/format';

interface DashboardProps {
  sessions: Session[];
  onStartSession: () => void;
  isLoading?: boolean;
}

import { useAuth } from '@/context/AuthContext';
import { PageLayout } from './layout/PageLayout';
import { PageHeader } from './layout/PageHeader';
import { useTags } from '@/hooks/useTags';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const Dashboard: React.FC<DashboardProps> = ({ sessions, onStartSession, isLoading }) => {
  const { user } = useAuth();
  // Calculate today's stats
  const today = new Date();
  const todayString = today.toDateString();
  
  const todaysSessions = sessions.filter(s => new Date(s.startTime).toDateString() === todayString);
  const totalSecondsToday = todaysSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const hoursToday = Math.floor(totalSecondsToday / 3600);
  const minutesToday = Math.floor((totalSecondsToday % 3600) / 60);

  const { tags } = useTags();
  const [isStarting, setIsStarting] = React.useState(false);

  const handleStartSession = () => {
      // Check if user has any tags
      if (tags.length === 0) {
          toast.error('Please create tags first!');
          return;
      }

      if (isStarting) return;
      setIsStarting(true);
      onStartSession();
      
      // Re-enable after 10 seconds to prevent double clicks
      setTimeout(() => {
          setIsStarting(false);
      }, 10000);
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
                <button 
                    onClick={handleStartSession} 
                    disabled={isStarting}
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
                >
                    <Play size={20} fill="currentColor" />
                    <span className='text-xs sm:text-base'>{isStarting ? 'Starting...' : 'Start New Working Session'}</span>
                </button>
            </div>
        </section>

        {/* Dashboard Grid */}
        <div className="flex flex-col gap-6">
            {/* Daily Summary */}
            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm min-h-[200px] flex flex-col justify-center">
                    {isLoading ? (
                         <div className="flex items-center justify-center h-full w-full py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                         </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Timer size={24} />
                                </div>
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold">Daily Summary</h3>
                            </div>
                            <div className="flex flex-col gap-1 mb-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Hours Today</p>
                                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{formatDuration(totalSecondsToday / 3600)}</p>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-white/10 w-full mb-4"></div>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Today's Sessions</p>
                                </div>
                                {todaysSessions.slice().reverse().map((session, i) => {
                                   const colors = [
                                       'bg-purple-500/10 text-purple-500',
                                       'bg-orange-500/10 text-orange-500',
                                       'bg-pink-500/10 text-pink-500',
                                       'bg-blue-500/10 text-blue-500',
                                       'bg-teal-500/10 text-teal-500',
                                       'bg-indigo-500/10 text-indigo-500'
                                   ];
                                   const colorClass = colors[i % colors.length];
                                   
                                   return (
                                   <div key={i} className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                                            {session.tags[0] === 'Math' ? <FlaskConical size={20} /> : <Tag size={20} />}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.tags[0] || 'Uncategorized'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.notes || 'No notes'}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{Math.floor(session.durationSeconds / 60)}m</p>
                                    </div>
                                )})}
                                {todaysSessions.length === 0 && <p className="text-sm text-slate-500">No sessions today.</p>}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </PageLayout>
  );
};