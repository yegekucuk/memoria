'use client';

import React, { useState } from 'react';
import { Session } from '@/types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { TagSelector } from './TagSelector';
import { useTagToggle } from '@/hooks/useTagToggle';
import { formatDurationHMS } from '@/utils/format';
import { validateSessionForm } from '@/utils/sessionHelpers';

interface SessionReportProps {
  durationSeconds: number;
  startTime: Date;
  onSave: (sessionData: Pick<Session, 'tags' | 'notes'>) => Promise<void> | void;
  onDiscard: () => Promise<void> | void;
}

export const SessionReport: React.FC<SessionReportProps> = ({ 
  durationSeconds, 
  onSave, 
  onDiscard 
}) => {
  const [notes, setNotes] = useState('');
  const { selectedTags, toggleTag } = useTagToggle();
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { tags: availableTags } = useTags();
  const isProcessing = isSaving || isDiscarding;

  const handleSave = async () => {
    if (isProcessing) return;
    setError(null);

    const validationError = validateSessionForm(selectedTags, notes);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
        await onSave({ tags: selectedTags, notes });
    } catch (error) {
        console.error("Error saving session:", error);
        setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
      if (isProcessing) return;
      setIsDiscarding(true);
      try {
          await onDiscard();
      } catch (error) {
          console.error("Error discarding session:", error);
          setIsDiscarding(false);
      }
  };

  const { h: hours, m: minutes, s: seconds } = formatDurationHMS(durationSeconds);

  return (
    <div className="fixed inset-0 z-60 font-display flex items-start sm:items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] bg-white dark:bg-[#1a2027] rounded-xl shadow-2xl border border-slate-200 dark:border-[#283039] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="flex flex-col p-5 sm:p-8 gap-5 sm:gap-8 overflow-y-auto">
                <div className="flex flex-col items-center gap-3 sm:gap-4 text-center mt-1 sm:mt-2">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-bold tracking-tight">Session Complete!</h1>
                        <p className="text-slate-500 dark:text-[#9dabb9] text-xs sm:text-sm font-normal">Great job staying focused.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 py-2 sm:py-4 max-[360px]:gap-1.5">
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2 max-[360px]:gap-1">
                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 max-[360px]:h-12 max-[360px]:w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#283039] border border-slate-200 dark:border-[#3e4856] shadow-inner">
                                <p className="text-slate-900 dark:text-white text-xl sm:text-2xl max-[360px]:text-lg font-bold tracking-tight">{hours}</p>
                            </div>
                            <p className="text-slate-500 dark:text-[#9dabb9] text-[11px] sm:text-xs font-medium uppercase tracking-wider">Hours</p>
                        </div>
                        <div className="flex flex-col items-center justify-start pt-3 sm:pt-4">
                            <span className="text-slate-500 dark:text-[#9dabb9] font-bold text-lg sm:text-xl max-[360px]:text-base">:</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2 max-[360px]:gap-1">
                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 max-[360px]:h-12 max-[360px]:w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#283039] border border-slate-200 dark:border-[#3e4856] shadow-inner">
                                <p className="text-slate-900 dark:text-white text-xl sm:text-2xl max-[360px]:text-lg font-bold tracking-tight">{minutes}</p>
                            </div>
                            <p className="text-slate-500 dark:text-[#9dabb9] text-[11px] sm:text-xs font-medium uppercase tracking-wider">Minutes</p>
                        </div>
                        <div className="flex flex-col items-center justify-start pt-3 sm:pt-4">
                            <span className="text-slate-500 dark:text-[#9dabb9] font-bold text-lg sm:text-xl max-[360px]:text-base">:</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2 max-[360px]:gap-1">
                            <div className="flex h-14 w-14 sm:h-16 sm:w-16 max-[360px]:h-12 max-[360px]:w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-[#283039] border border-slate-200 dark:border-[#3e4856] shadow-inner">
                                <p className="text-slate-900 dark:text-white text-xl sm:text-2xl max-[360px]:text-lg font-bold tracking-tight">{seconds}</p>
                            </div>
                            <p className="text-slate-500 dark:text-[#9dabb9] text-[11px] sm:text-xs font-medium uppercase tracking-wider">Seconds</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 sm:gap-6">
                    <TagSelector
                      selectedTags={selectedTags}
                      onToggle={toggleTag}
                      availableTags={availableTags}
                      disabled={isProcessing}
                    />
                    <div className="flex flex-col gap-2">
                        <label className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Session Notes <span className="text-red-500">*</span></label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-input w-full resize-none rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6b7280] bg-slate-100 dark:bg-[#222831] border border-slate-200 dark:border-[#283039] focus:border-primary focus:ring-1 focus:ring-primary min-h-[110px] sm:min-h-[140px] p-3 sm:p-4 text-sm font-normal leading-relaxed transition-all outline-none disabled:opacity-50" 
                            placeholder="Describe what you accomplished..."
                            disabled={isProcessing}
                        ></textarea>
                    </div>
                </div>
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                        {error}
                    </div>
                )}
                <div className="flex gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <button onClick={handleDiscard} disabled={isProcessing} className="flex-1 h-11 sm:h-12 rounded-lg bg-transparent border border-slate-200 dark:border-[#3e4856] text-slate-600 dark:text-[#9dabb9] font-bold text-xs sm:text-sm hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#283039] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {isDiscarding ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Discard'}
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isProcessing}
                        className="flex-2 h-11 sm:h-12 rounded-lg bg-primary text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 hover:bg-blue-600 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                        {isSaving ? 'Saving...' : 'Save Session'}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
