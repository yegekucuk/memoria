import React, { useState, useEffect } from 'react';
import { Clock, StopCircle } from 'lucide-react';
import { formatDurationHMS } from '@/utils/format';

interface ActiveSessionProps {
  startTime: Date;
  onEndSession: (durationSeconds: number, startTime: Date) => void;
}

export const ActiveSession: React.FC<ActiveSessionProps> = ({ startTime, onEndSession }) => {
  const [seconds, setSeconds] = useState(() => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    return Math.max(0, diff);
  });
  const [isEnding, setIsEnding] = useState(false);

  const handleEndSession = () => {
      if (isEnding) return;
      setIsEnding(true);
      onEndSession(seconds, startTime);

      setTimeout(() => {
          setIsEnding(false);
      }, 10000);
  };

  useEffect(() => {
    // Determine the path to the worker script.
    // In production/Next.js, static files in 'public' are served at root.
    const worker = new Worker('/timer.worker.js');

    worker.onmessage = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setSeconds(Math.max(0, diff));
    };

    // Start the worker
    worker.postMessage('start');

    return () => {
      worker.terminate();
    };
  }, [startTime]);




  const { h, m, s } = formatDurationHMS(seconds);

  return (
    <div className="fixed inset-0 z-50 bg-mesh font-display text-slate-900 dark:text-white antialiased overflow-x-hidden min-h-screen flex flex-col">
        <main className="grow flex flex-col items-center justify-center py-12 px-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="w-full max-w-3xl flex flex-col items-center gap-12 z-10 animate-in zoom-in-95 duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Deep Work Session</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Stay focused. We are tracking your progress.</p>
                </div>
                
                {/* Timer Display */}
                <div className="relative group">
                    <div className="absolute -inset-4 rounded-full border border-slate-200 dark:border-slate-800 transition-all duration-700 opacity-50 scale-95"></div>
                    <div className="absolute -inset-8 rounded-full border border-slate-200 dark:border-slate-800 transition-all duration-1000 opacity-20 scale-90"></div>
                    
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
                </div>

                {/* Status Box - Start Time Only */}
                <div className="flex justify-center w-full max-w-lg bg-white/5 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</span>
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <Clock size={20} className="text-slate-400" />
                            <span className="text-lg font-medium">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <button 
                        onClick={handleEndSession} 
                        disabled={isEnding}
                        className="group relative flex w-full max-w-[280px] items-center justify-center gap-3 overflow-hidden rounded-full bg-red-600 px-8 py-4 text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-red-600/25 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-red-600"
                    >
                        <StopCircle size={24} fill="currentColor" />
                        <span className="text-lg font-bold">{isEnding ? 'Ending...' : 'End Session'}</span>
                    </button>

                </div>
            </div>
        </main>
    </div>
  );
};
