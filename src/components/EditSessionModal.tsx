import React, { useState, useEffect } from 'react';
import { Session, Tag as TagType } from '../types';
import { X, Tag, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EditSessionModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Pick<Session, 'tags' | 'notes'>) => Promise<void>;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({ 
  session, 
  isOpen, 
  onClose,
  onSave 
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState(session.notes || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(session.tags);
  const [customTag, setCustomTag] = useState('');
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        setNotes(session.notes || '');
        setSelectedTags(session.tags);
        setError(null);
    }
  }, [isOpen, session]);

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
    if (isSaving) return;
    setError(null);

    if (selectedTags.length === 0) {
      setError("Please add at least one tag.");
      return;
    }

    if (!notes.trim()) {
      setError("Please add some notes.");
      return;
    }

    setIsSaving(true);
    try {
        await onSave(session.id, { tags: selectedTags, notes });
        onClose();
    } catch (error) {
        console.error("Error saving session:", error);
        setError("Failed to save changes.");
    } finally {
        setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={isSaving ? undefined : onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[#111418] dark:bg-[#1a2027] w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-[#283039]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#283039] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Session</h2>
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="p-2 hover:bg-[#283039] rounded-full transition-colors text-[#9dabb9]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
            {/* Tags Input */}
            <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-medium leading-normal">Categorize Session <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-[#222831] border border-[#283039] focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all min-h-[50px]">
                    {selectedTags.map(tag => {
                        const tagColor = availableTags.find(t => t.name === tag)?.color;
                        return (
                        <div key={tag} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-2 pr-2 cursor-pointer group transition-colors"
                                style={{ backgroundColor: tagColor ? tagColor + '33' : 'rgba(59, 130, 246, 0.2)', border: `1px solid ${tagColor ? tagColor + '4D' : 'rgba(59, 130, 246, 0.3)'}` }} 
                                onClick={() => !isSaving && toggleTag(tag)}>
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
                        readOnly={isSaving}
                    />
                </div>
                <div className="flex gap-2 mt-1 overflow-x-auto pb-1 scrollbar-hide">
                    {availableTags.filter(t => !selectedTags.includes(t.name)).map(tag => (
                        <button key={tag.id} onClick={() => toggleTag(tag.name)} disabled={isSaving} className="text-[#9dabb9] hover:text-white text-xs px-2 py-1 rounded-md bg-[#283039] hover:bg-[#3e4856] transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes Input */}
            <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-medium leading-normal">Session Notes <span className="text-red-500">*</span></label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input w-full resize-none rounded-lg text-white placeholder:text-[#6b7280] bg-[#222831] border border-[#283039] focus:border-primary focus:ring-1 focus:ring-primary min-h-[140px] p-4 text-sm font-normal leading-relaxed transition-all outline-none disabled:opacity-50" 
                    placeholder="Describe what you accomplished..."
                    disabled={isSaving}
                ></textarea>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                    {error}
                </div>
            )}
            
            <div className="flex justify-end gap-3 mt-2">
                <button 
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-lg bg-transparent border border-[#3e4856] text-[#9dabb9] font-bold text-sm hover:text-white hover:bg-[#283039] transition-colors cursor-pointer disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="px-6 py-3 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-blue-600 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
