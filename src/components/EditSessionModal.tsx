'use client';

import React, { useState, useEffect } from 'react';
import { Session } from '@/types';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { TagSelector } from './TagSelector';
import { useTagToggle } from '@/hooks/useTagToggle';
import { validateSessionForm } from '@/utils/sessionHelpers';

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
  const [notes, setNotes] = useState(session.notes || '');
  const { selectedTags, toggleTag, setSelectedTags } = useTagToggle(session.tags);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { tags: availableTags } = useTags();

  useEffect(() => {
    if (isOpen) {
        setNotes(session.notes || '');
        setSelectedTags(session.tags);
        setError(null);
    }
  }, [isOpen, session, setSelectedTags]);

  const handleSave = async () => {
    if (isSaving) return;
    setError(null);

    const validationError = validateSessionForm(selectedTags, notes);
    if (validationError) {
      setError(validationError);
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
      <div className="relative bg-white dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Session</h2>
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
            {/* Tags Input */}
            <TagSelector
              selectedTags={selectedTags}
              onToggle={toggleTag}
              availableTags={availableTags}
              disabled={isSaving}
            />

            {/* Notes Input */}
            <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-medium leading-normal">Session Notes <span className="text-red-500">*</span></label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input w-full resize-none rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary min-h-[140px] p-4 text-sm font-normal leading-relaxed transition-all outline-none disabled:opacity-50" 
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
                  className="px-6 py-3 rounded-lg bg-transparent border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
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
