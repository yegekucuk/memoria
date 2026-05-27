import React, { useState } from 'react';
import { Play, LayoutDashboard, BarChart2, Table, Settings, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

const GoalRing: React.FC<{ current: number; target: number; label: string }> = ({ current, target, label }) => {
  const pct = target <= 0 ? 0 : Math.min(current / target, 1);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  const currentHours = current / 3600;
  const targetHours = target / 3600;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
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

export const DashboardPreview: React.FC = () => {
  const [timeTargetEnabled, setTimeTargetEnabled] = useState(false);
  const [timeTargetMinutes, setTimeTargetMinutes] = useState<number | ''>('');

  const preventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="w-full flex justify-center">
        {/* Browser Window Frame */}
        <div className="w-full bg-background-light dark:bg-background-dark rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative group cursor-default">
            
            {/* Window Controls (Header) */}
            <div className="h-10 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* Application Layout */}
            <div className="flex h-[750px] w-full relative">
                
                {/* Sidebar - Desktop */}
                <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark h-full shrink-0">
                    <div className="flex flex-col h-full p-4 justify-between">
                        <div className="flex flex-col gap-6">
                            {/* User Info Mock */}
                            <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 pb-4">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Signed in as</p>
                                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">Jane</p>
                            </div>
                            
                            {/* Navigation */}
                            <nav className="flex flex-col gap-2">
                                <button 
                                  onClick={preventDefault}
                                  className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left bg-primary text-white cursor-pointer"
                                >
                                    <LayoutDashboard size={20} />
                                    <p className="text-sm font-medium leading-normal">Dashboard</p>
                                </button>
                                <button 
                                  onClick={preventDefault}
                                  className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <BarChart2 size={20} />
                                    <p className="text-sm font-medium leading-normal">Analytics</p>
                                </button>
                                <button 
                                  onClick={preventDefault}
                                  className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <Table size={20} />
                                    <p className="text-sm font-medium leading-normal">Sessions</p>
                                </button>
                                <button 
                                  onClick={preventDefault}
                                  className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <Settings size={20} />
                                    <p className="text-sm font-medium leading-normal">Settings</p>
                                </button>
                            </nav>
                        </div>

                        {/* Logout Mock */}
                        <div className="lg:mb-4">
                             <button
                                onClick={preventDefault}
                                className="flex items-center gap-3 px-3 py-3 rounded-lg w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer"
                            >
                                <LogOut size={20} />
                                <p className="text-sm font-medium leading-normal">Logout</p>
                             </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar Trigger (Mock) */}
                <div className="md:hidden absolute top-4 left-4 z-20">
                     <div className="p-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 rounded-lg shadow-sm">
                        <Menu size={24} />
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-y-auto w-full">
                    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 flex flex-col gap-8">
                        
                        {/* Header Section - Static for preview */}
                        <div className="flex flex-col gap-1 mt-12 md:mt-0">
                            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">
                                Welcome back, Jane!
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                                Wednesday, February 11
                            </p>
                        </div>
                        
                        {/* CTA Section */}
                        <section className="relative overflow-hidden rounded-2xl bg-mesh border border-slate-200 dark:border-white/10 shadow-lg">
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
                                        onClick={preventDefault} 
                                        className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap cursor-pointer text-center"
                                    >
                                        <Play size={20} fill="currentColor" />
                                        <span className="text-xs sm:text-base">Start New Working Session</span>
                                    </button>

                                    <div className="flex flex-col w-full gap-3 bg-white/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm">
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
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
                                        Total Today: <span className="font-bold text-slate-700 dark:text-slate-200">5h 30m</span>
                                    </p>

                                    {/* Goal Progress - Circle rings matching real app */}
                                    <div className="flex items-center justify-center gap-5 pt-1">
                                        <GoalRing
                                            current={5.5 * 3600}
                                            target={8 * 3600}
                                            label="Daily"
                                        />
                                        <GoalRing
                                            current={24 * 3600}
                                            target={40 * 3600}
                                            label="Weekly"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Sessions List (Journal View) - Timeline matching Journal.tsx */}
                        <section className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-surface-dark p-6 shadow-sm">
                            <div className="px-4 py-5 sm:px-8 sm:py-7">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col gap-0.5">
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sessions List</h2>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today - February 11</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                            onClick={preventDefault}
                                            className="rounded-full border border-primary/30 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary transition-colors hover:bg-primary/10 cursor-pointer dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20"
                                        >
                                            Today
                                        </button>
                                        <button
                                            onClick={preventDefault}
                                            className="flex w-9 h-9 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary/10 cursor-pointer dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <button
                                            disabled
                                            className="flex w-9 h-9 items-center justify-center rounded-full border transition-colors border-slate-200 text-slate-300 dark:border-slate-700 dark:text-slate-600 cursor-not-allowed"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-600 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-slate-300">
                                    <span>3 entries</span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <span>5h 30m</span>
                                </div>

                                <div className="mt-6">
                                    <div className="flex flex-col">
                                        {/* Entry 1 */}
                                        <div className="relative pl-8 pb-6 group last:pb-0">
                                            <div className="absolute left-[7.5px] top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-700/60" />
                                            <span className="absolute left-0 top-4 z-10 w-4 h-4 rounded-full border-[2.5px] border-primary bg-white dark:bg-surface-dark ring-4 ring-primary/[0.07] dark:ring-primary/10" />

                                            <div className="flex flex-col gap-2.5 pt-0.5">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="font-mono text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg">
                                                        04:30 PM
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-primary bg-primary/[0.06] dark:bg-primary/10 px-2.5 py-1 rounded-lg">
                                                        3h 10m
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    <span
                                                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-pink-500/10 text-pink-500 border-pink-500/20"
                                                    >
                                                        Studying
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    Preparing for exams
                                                </p>
                                            </div>
                                        </div>

                                        {/* Entry 2 */}
                                        <div className="relative pl-8 pb-6 group last:pb-0">
                                            <div className="absolute left-[7.5px] top-5 bottom-0 w-px bg-slate-200 dark:bg-slate-700/60" />
                                            <span className="absolute left-0 top-4 z-10 w-4 h-4 rounded-full border-[2.5px] border-primary bg-white dark:bg-surface-dark ring-4 ring-primary/[0.07] dark:ring-primary/10" />

                                            <div className="flex flex-col gap-2.5 pt-0.5">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="font-mono text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg">
                                                        10:15 AM
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-primary bg-primary/[0.06] dark:bg-primary/10 px-2.5 py-1 rounded-lg">
                                                        1h 30m
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    <span
                                                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                    >
                                                        Coding
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    Working on the JWT authentication
                                                </p>
                                            </div>
                                        </div>

                                        {/* Entry 3 */}
                                        <div className="relative pl-8 pb-6 group last:pb-0">
                                            <span className="absolute left-0 top-4 z-10 w-4 h-4 rounded-full border-[2.5px] border-primary bg-white dark:bg-surface-dark ring-4 ring-primary/[0.07] dark:ring-primary/10" />

                                            <div className="flex flex-col gap-2.5 pt-0.5">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="font-mono text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-lg">
                                                        09:30 AM
                                                    </span>
                                                    <span className="font-mono text-xs font-bold text-primary bg-primary/[0.06] dark:bg-primary/10 px-2.5 py-1 rounded-lg">
                                                        30m
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    <span
                                                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-500 border-purple-500/20"
                                                    >
                                                        Reading
                                                    </span>
                                                    <span
                                                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-teal-500/10 text-teal-500 border-teal-500/20"
                                                    >
                                                        Meditation
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                    Sapiens reading session and morning mindfulness
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    </div>
  );
};
