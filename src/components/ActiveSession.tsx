import React, { useState, useEffect } from 'react';
import { Timer, Pause, Clock, StopCircle } from 'lucide-react';

interface ActiveSessionProps {
  onEndSession: (durationSeconds: number, startTime: Date) => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({ onEndSession }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startTime] = useState(new Date());
  


  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);

      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive]);



  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return { 
      h: hours.toString().padStart(2, '0'), 
      m: minutes.toString().padStart(2, '0'), 
      s: secs.toString().padStart(2, '0') 
    };
  };

  const { h, m, s } = formatTime(seconds);

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased overflow-x-hidden min-h-screen flex flex-col">
        {/* Header Overlay */}
        <header className="absolute top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center size-8 rounded bg-primary text-white">
                            <Timer size={20} />
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">howmanyhours?</h2>
                    </div>
                </div>
            </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="w-full max-w-3xl flex flex-col items-center gap-12 z-10 animate-in zoom-in-95 duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Deep Work Session</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Stay focused. We are tracking your progress.</p>
                </div>
                
                {/* Timer Display */}
                <div className="relative group cursor-pointer" onClick={() => setIsActive(!isActive)}>
                    <div className={`absolute -inset-4 rounded-full border border-slate-200 dark:border-slate-800 transition-all duration-700 ${isActive ? 'opacity-50 scale-95' : 'opacity-20 scale-90'}`}></div>
                    <div className={`absolute -inset-8 rounded-full border border-slate-200 dark:border-slate-800 transition-all duration-1000 ${isActive ? 'opacity-20 scale-90' : 'opacity-10 scale-85'}`}></div>
                    
                    <div className="flex items-baseline gap-2 sm:gap-4 font-mono font-bold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-6xl sm:text-8xl md:text-9xl">{h}</span>
                            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hours</span>
                        </div>
                        <span className="text-4xl sm:text-6xl md:text-8xl text-slate-300 dark:text-slate-700 -translate-y-8">:</span>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-6xl sm:text-8xl md:text-9xl">{m}</span>
                            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Minutes</span>
                        </div>
                        <span className="text-4xl sm:text-6xl md:text-8xl text-slate-300 dark:text-slate-700 -translate-y-8">:</span>
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-6xl sm:text-8xl md:text-9xl text-primary">{s}</span>
                            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Seconds</span>
                        </div>
                    </div>
                    {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Pause size={80} className="text-slate-900 dark:text-white opacity-50" />
                        </div>
                    )}
                </div>

                {/* Status Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg bg-white/5 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                    <div className="flex flex-col items-center sm:items-start gap-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</span>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <Clock size={20} className="text-slate-400" />
                            <span className="text-lg font-medium">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-end gap-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Status</span>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            </span>
                            <span className="text-lg font-medium text-slate-900 dark:text-white">{isActive ? 'Active' : 'Paused'}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <button onClick={() => onEndSession(seconds, startTime)} className="group relative flex w-full max-w-[280px] items-center justify-center gap-3 overflow-hidden rounded-full bg-red-600 px-8 py-4 text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-red-600/25 active:scale-95">
                        <StopCircle size={24} fill="currentColor" />
                        <span className="text-lg font-bold">End Session</span>
                    </button>

                </div>
            </div>
        </main>
    </div>
  );
};