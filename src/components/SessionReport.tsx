import React, { useState } from 'react';
import { Session } from '../types';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { TagSelector } from './TagSelector';
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { tags: availableTags } = useTags();
  const isProcessing = isSaving || isDiscarding;

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

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
    <div className="fixed inset-0 z-60 font-display flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 w-full max-w-lg bg-[#111418] dark:bg-[#1a2027] rounded-xl shadow-2xl border border-[#283039] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="flex justify-end p-4 absolute top-0 right-0 z-20">

            </div>
            <div className="flex flex-col p-6 sm:p-8 gap-8">
                <div className="flex flex-col items-center gap-4 text-center mt-2">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-white text-3xl font-bold tracking-tight">Session Complete!</h1>
                        <p className="text-[#9dabb9] text-sm font-normal">Great job staying focused.</p>
                    </div>
                    <div className="flex gap-3 py-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#283039] border border-[#3e4856] shadow-inner">
                                <p className="text-white text-2xl font-bold tracking-tight">{hours}</p>
                            </div>
                            <p className="text-[#9dabb9] text-xs font-medium uppercase tracking-wider">Hours</p>
                        </div>
                        <div className="flex flex-col items-center justify-start pt-4">
                            <span className="text-[#9dabb9] font-bold text-xl">:</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#283039] border border-[#3e4856] shadow-inner">
                                <p className="text-white text-2xl font-bold tracking-tight">{minutes}</p>
                            </div>
                            <p className="text-[#9dabb9] text-xs font-medium uppercase tracking-wider">Minutes</p>
                        </div>
                        <div className="flex flex-col items-center justify-start pt-4">
                            <span className="text-[#9dabb9] font-bold text-xl">:</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#283039] border border-[#3e4856] shadow-inner">
                                <p className="text-white text-2xl font-bold tracking-tight">{seconds}</p>
                            </div>
                            <p className="text-[#9dabb9] text-xs font-medium uppercase tracking-wider">Seconds</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    <TagSelector
                      selectedTags={selectedTags}
                      onToggle={toggleTag}
                      availableTags={availableTags}
                      disabled={isProcessing}
                    />
                    <div className="flex flex-col gap-2">
                        <label className="text-white text-sm font-medium leading-normal">Session Notes <span className="text-red-500">*</span></label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-input w-full resize-none rounded-lg text-white placeholder:text-[#6b7280] bg-[#222831] border border-[#283039] focus:border-primary focus:ring-1 focus:ring-primary min-h-[140px] p-4 text-sm font-normal leading-relaxed transition-all outline-none disabled:opacity-50" 
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
                <div className="flex gap-3 mt-2">
                    <button onClick={handleDiscard} disabled={isProcessing} className="flex-1 h-12 rounded-lg bg-transparent border border-[#3e4856] text-[#9dabb9] font-bold text-sm hover:text-white hover:bg-[#283039] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {isDiscarding ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Discard'}
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isProcessing}
                        className="flex-2 h-12 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-600 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
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