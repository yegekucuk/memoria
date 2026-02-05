import React, { useState, useEffect } from 'react';
import { Session, Tag as TagType } from '../types';
import { X, Tag, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isProcessing = isSaving || isDiscarding;

  useEffect(() => {
    const fetchTags = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/tags');
            if (res.ok) {
                const data = await res.json();
                setAvailableTags(data);
            }
        } catch (error) {
            console.error("Failed to fetch tags", error);
        }
    };
    fetchTags();
  }, [user]);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleCustomTagKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
       if (!selectedTags.includes(customTag.trim())) {
        setSelectedTags([...selectedTags, customTag.trim()]);
      }
      setCustomTag('');
    }
  };

  const handleSave = async () => {
    if (isProcessing) return;
    setError(null);

    if (selectedTags.length === 0) {
      setError("Please add at least one tag to categorize your session.");
      return;
    }

    if (!notes.trim()) {
      setError("Please add some notes about your session.");
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

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

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
                                <p className="text-white text-2xl font-bold tracking-tight">{hours.toString().padStart(2, '0')}</p>
                            </div>
                            <p className="text-[#9dabb9] text-xs font-medium uppercase tracking-wider">Hours</p>
                        </div>
                        <div className="flex flex-col items-center justify-start pt-4">
                            <span className="text-[#9dabb9] font-bold text-xl">:</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#283039] border border-[#3e4856] shadow-inner">
                                <p className="text-white text-2xl font-bold tracking-tight">{minutes.toString().padStart(2, '0')}</p>
                            </div>
                            <p className="text-[#9dabb9] text-xs font-medium uppercase tracking-wider">Minutes</p>
                        </div>
                        <div className="flex flex-col items-center justify-start pt-4">
                            <span className="text-[#9dabb9] font-bold text-xl">:</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#283039] border border-[#3e4856] shadow-inner">
                                <p className="text-white text-2xl font-bold tracking-tight">{seconds.toString().padStart(2, '0')}</p>
                            </div>
                            <p className="text-[#9dabb9] text-xs font-medium uppercase tracking-wider">Seconds</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-white text-sm font-medium leading-normal">Categorize Session <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-[#222831] border border-[#283039] focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all min-h-[50px]">
                            {selectedTags.map(tag => {
                                const tagColor = availableTags.find(t => t.name === tag)?.color;
                                return (
                                <div key={tag} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-2 pr-2 cursor-pointer group transition-colors"
                                     style={{ backgroundColor: tagColor ? tagColor + '33' : 'rgba(59, 130, 246, 0.2)', border: `1px solid ${tagColor ? tagColor + '4D' : 'rgba(59, 130, 246, 0.3)'}` }} 
                                     onClick={() => !isProcessing && toggleTag(tag)}>
                                    <Tag size={18} style={{ color: tagColor || '#3b82f6' }} />
                                    <p className="text-xs font-semibold leading-normal" style={{ color: tagColor || '#3b82f6' }}>{tag}</p>
                                    <X size={16} className="text-primary/70 hover:text-white ml-1" style={{ color: tagColor ? tagColor + 'B3' : '' }} />
                                </div>
                            )})}
                            <input 
                                className="bg-transparent border-none text-white text-sm placeholder:text-[#6b7280] focus:ring-0 grow min-w-[120px] h-8 outline-none" 
                                placeholder="Add a tag..." 
                                type="text"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={handleCustomTagKey}
                                readOnly
                                disabled
                            />
                        </div>
                        <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-hide">
                            {availableTags.filter(t => !selectedTags.includes(t.name)).map(tag => (
                                <button key={tag.id} onClick={() => toggleTag(tag.name)} disabled={isProcessing} className="text-[#9dabb9] hover:text-white text-xs px-2 py-1 rounded-md bg-[#283039] hover:bg-[#3e4856] transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                    {tag.name}
                                </button>
                            ))}
                            {availableTags.length === 0 && (
                                <p className="text-gray-500 text-xs italic">No tags found. Go to Settings to add some!</p>
                            )}
                        </div>
                    </div>
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