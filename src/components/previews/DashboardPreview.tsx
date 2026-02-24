import React, { useState } from 'react';
import { Play, Timer, FlaskConical, Tag, Code, LayoutDashboard, BarChart2, Table, Settings, LogOut, Menu, Zap } from 'lucide-react';

export const DashboardPreview: React.FC = () => {
  const [timeTargetEnabled, setTimeTargetEnabled] = useState(false);
  const [timeTargetMinutes, setTimeTargetMinutes] = useState<number | ''>('');

  const handleStartSession = (e: React.MouseEvent) => {
      e.preventDefault();
      // No action
  };

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
            <div className="flex h-[600px] w-full relative">
                
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
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Welcome back, Jane!</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Wednesday, February 11</p>
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
                                        onClick={handleStartSession} 
                                        className="flex w-full items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap cursor-pointer text-center"
                                    >
                                        <Play size={20} fill="currentColor" />
                                        <span className='text-xs sm:text-base'>Start New Working Session</span>
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
                                </div>
                            </div>
                        </section>

                        {/* Dashboard Grid */}
                        <div className="flex flex-col gap-6">
                            {/* Daily Summary */}
                            <div className="flex flex-col gap-6">
                                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm min-h-[200px] flex flex-col justify-center">
                                    <>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Timer size={24} />
                                            </div>
                                            <h3 className="text-slate-900 dark:text-white text-lg font-bold">Daily Summary</h3>
                                        </div>
                                        <div className="flex flex-col gap-1 mb-6">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Hours Today</p>
                                            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">5 hours 30 minutes</p>
                                        </div>
                                        <div className="h-px bg-slate-100 dark:bg-white/10 w-full mb-4"></div>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Today&apos;s Sessions</p>
                                            </div>
                                            
                                            {/* Session 1: Reading */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500">
                                                    <Tag size={20} />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Reading</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Sapiens</p>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">30m</p>
                                            </div>

                                             {/* Session 2: Coding */}
                                             <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
                                                    <Code size={20} />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Coding</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Working on the JWT authentication</p>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">90m</p>
                                            </div>



                                            {/* Session 4: Meditation */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-teal-500/10 text-teal-500">
                                                    <Zap size={20} />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Meditation</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Mindfulness practice</p>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">20m</p>
                                            </div>

                                            {/* Session 5: Studying */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-pink-500/10 text-pink-500">
                                                    <FlaskConical size={20} />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Studying</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Preparing for exams</p>
                                                </div>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">190m</p>
                                            </div>
                                        </div>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </div>
  );
};
