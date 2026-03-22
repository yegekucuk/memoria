import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, StopCircle, Target } from 'lucide-react';
import { formatDurationHMS } from '@/utils/format';
import { TIME_TARGET_KEY, TIME_TARGET_AUDIO_ONLY_KEY } from '@/constants';

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
  const [timeTarget] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const target = window.localStorage.getItem(TIME_TARGET_KEY);
    if (!target) return null;
    const parsed = parseInt(target, 10);
    return Number.isNaN(parsed) ? null : parsed;
  });

  // Use refs so the worker callback always reads the latest values
  const timeTargetRef = useRef<number | null>(timeTarget);
  const notificationSentRef = useRef(false);
  const isAudioOnlyRef = useRef(
    typeof window !== 'undefined' && window.localStorage.getItem(TIME_TARGET_AUDIO_ONLY_KEY) === 'true'
  );

  const playChime = useCallback(() => {
      try {
          const audioContextClass =
            window.AudioContext ||
            (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

          if (!audioContextClass) {
            return;
          }

          const audioCtx = new audioContextClass();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
          oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // drop to A4
          
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
          
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 1);
      } catch (e) {
          console.error("Audio API not supported", e);
      }
  }, []);

  const handleEndSession = () => {
      if (isEnding) return;
      setIsEnding(true);
      onEndSession(seconds, startTime);

      setTimeout(() => {
          setIsEnding(false);
      }, 10000);
  };

  useEffect(() => {
    const worker = new Worker('/timer.worker.js');

    worker.onmessage = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const currentSeconds = Math.max(0, diff);
      setSeconds(currentSeconds);
      
      // Read latest values from refs (avoids stale closure)
      const target = timeTargetRef.current;
      const alreadySent = notificationSentRef.current;
      const audioOnly = isAudioOnlyRef.current;

      if (target && !alreadySent && currentSeconds >= target * 60) {
          notificationSentRef.current = true;

          // Always play the audio chime — works even when notifications are unavailable
          playChime();

          // Send browser notification only when permission is granted and not audio-only
          if (!audioOnly && 'Notification' in window && Notification.permission === 'granted') {
              try {
                  const n = new Notification('Time Target Reached', {
                      body: `You have reached your goal of ${target} minutes! Great work!`,
                      icon: '/favicon.ico',
                      requireInteraction: true,
                  });
                  n.onclick = () => {
                      window.focus();
                      n.close();
                  };
              } catch (e) {
                  console.error('Notification creation failed', e);
              }
          }
      }
    };

    worker.postMessage('start');

    return () => {
      worker.terminate();
    };
  }, [startTime, playChime]);




  const { h, m, s } = formatDurationHMS(seconds);

  return (
    <div className="fixed inset-0 z-50 bg-mesh font-display text-slate-900 dark:text-white antialiased overflow-x-hidden min-h-screen flex flex-col">
        <main className="grow flex flex-col items-center justify-center py-12 px-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
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

                {/* Status Box */}
                <div className="flex justify-center w-full max-w-lg bg-white/5 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                    {timeTarget ? (
                        <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col items-center gap-1 flex-1">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</span>
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Clock size={20} className="text-slate-400" />
                                    <span className="text-lg font-medium">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                                </div>
                            </div>
                            
                            <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 mx-4"></div>
                            
                            <div className="flex flex-col items-center gap-1 flex-1">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Goal</span>
                                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Target size={20} className="text-slate-400" />
                                    <span className={`text-lg font-medium ${seconds >= timeTarget * 60 ? 'text-green-500' : 'text-red-500'}`}>
                                        {Math.floor(seconds / 60)} min / {timeTarget} mins
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</span>
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <Clock size={20} className="text-slate-400" />
                                <span className="text-lg font-medium">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <button 
                        onClick={handleEndSession} 
                        disabled={isEnding}
                        className="group relative flex w-full max-w-70 items-center justify-center gap-3 overflow-hidden rounded-full bg-red-600 px-8 py-4 text-white shadow-lg transition-all hover:bg-red-700 hover:shadow-red-600/25 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:bg-red-600"
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
