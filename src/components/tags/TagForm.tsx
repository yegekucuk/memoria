'use client';

import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { COLORS } from '@/constants/colors';

interface TagFormProps {
  onAddTag: (name: string, color: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const TagForm: React.FC<TagFormProps> = ({ onAddTag, isLoading, error }) => {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await onAddTag(newTagName.trim(), selectedColor);
      setNewTagName('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('An error occurred while adding the tag');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Tag</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">
              Tag Name
            </label>
            <div className="relative">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Coding, Reading, Workout"
                  className="w-full h-12 rounded-lg bg-slate-50 dark:bg-[#222831] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#6b7280] px-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  maxLength={20}
                />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
             <label className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">
              Color
            </label>
            <div className="flex flex-wrap gap-2 max-w-[300px]">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-full transition-all border-2 cursor-pointer ${
                    selectedColor === color.value
                      ? 'border-slate-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </div>

        {(localError || error) && (
          <p className="text-red-500 text-sm">{localError || error}</p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isLoading || !newTagName.trim()}
            className="px-6 py-2 bg-primary text-white font-bold text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Add Tag
          </button>
        </div>
      </form>
    </div>
  );
};
