import React, { useState } from 'react';
import { Session } from '../types';
import { getMockTags } from '../mocks/tags';
import { X, Tag, Plus, CheckCircle, Loader2 } from 'lucide-react';

interface SessionReportProps {
  durationSeconds: number;
  startTime: Date;
  onSave: (sessionData: Pick<Session, 'tags' | 'notes'>) => Promise<void> | void;
  onDiscard: () => void;
}

export const SessionReport: React.FC<SessionReportProps> = ({ 
  durationSeconds, 
  onSave, 
  onDiscard 
}) => {
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    if (isSaving) return;
    setIsSaving(true);
    try {
        await onSave({ tags: selectedTags, notes });
    } catch (error) {
        console.error("Error saving session:", error);
        setIsSaving(false);
    }
  };

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  return (
    <div className="fixed inset-0 z-[60] font-display flex items-center justify-center p-4">
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
                        <label className="text-white text-sm font-medium leading-normal">Categorize Session</label>
                        <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-[#222831] border border-[#283039] focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all min-h-[50px]">
                            {selectedTags.map(tag => (
                                <div key={tag} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/20 border border-primary/30 pl-2 pr-2 cursor-pointer group hover:bg-primary/30 transition-colors" onClick={() => !isSaving && toggleTag(tag)}>
                                    <Tag size={18} className="text-primary" />
                                    <p className="text-primary text-xs font-semibold leading-normal">{tag}</p>
                                    <X size={16} className="text-primary/70 hover:text-white ml-1" />
                                </div>
                            ))}
                            <input 
                                className="bg-transparent border-none text-white text-sm placeholder:text-[#6b7280] focus:ring-0 grow min-w-[120px] h-8 outline-none" 
                                placeholder="Add a tag..." 
                                type="text"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                onKeyDown={handleCustomTagKey}
                                readOnly={isSaving}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-hide">
                            {getMockTags().filter(t => !selectedTags.includes(t.name)).slice(0, 4).map(tag => (
                                <button key={tag.id} onClick={() => toggleTag(tag.name)} disabled={isSaving} className="text-[#9dabb9] hover:text-white text-xs px-2 py-1 rounded-md bg-[#283039] hover:bg-[#3e4856] transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Plus size={14} /> {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-white text-sm font-medium leading-normal">Session Notes</label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="form-input w-full resize-none rounded-lg text-white placeholder:text-[#6b7280] bg-[#222831] border border-[#283039] focus:border-primary focus:ring-1 focus:ring-primary min-h-[140px] p-4 text-sm font-normal leading-relaxed transition-all outline-none disabled:opacity-50" 
                            placeholder="Describe what you accomplished..."
                            disabled={isSaving}
                        ></textarea>
                    </div>
                </div>
                <div className="flex gap-3 mt-2">
                    <button onClick={onDiscard} disabled={isSaving} className="flex-1 h-12 rounded-lg bg-transparent border border-[#3e4856] text-[#9dabb9] font-bold text-sm hover:text-white hover:bg-[#283039] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        Discard
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex-[2] h-12 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-600 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none"
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