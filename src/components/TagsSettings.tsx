
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTags } from '@/hooks/useTags';
import { Plus, X, Loader2, Trash2, Pencil, Check } from 'lucide-react';

const COLORS = [
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Sky', value: '#0EA5E9' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Fuchsia', value: '#D946EF' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Slate', value: '#64748B' },
];

export const TagsSettings: React.FC = () => {
  const { user } = useAuth();
  const { tags, isLoading, error: hookError, addTag, deleteTag, updateTag } = useTags();
  
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value); // Default to Red
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim() || !user) return;

    setIsCreating(true);
    setFormError(null);

    try {
      await addTag(newTagName.trim(), selectedColor);
      setNewTagName('');
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!user) return;
    setDeletingId(tagId);
    try {
      await deleteTag(tagId);
    } catch (err: any) {
        // Error handling if needed, though useTags handles internal error state
        console.error("Failed to delete", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (tag: any) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditColor('');
    setFormError(null);
  };

  const handleUpdateTag = async () => {
    if (!editingId || !editName.trim() || !user) return;
    
    setIsUpdating(true);
    setFormError(null);

    try {
        await updateTag(editingId, editName.trim(), editColor);
        handleCancelEdit();
    } catch (err: any) {
        setFormError(err.message);
    } finally {
        setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">My Tags</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your custom tags for categorizing sessions.
        </p>
      </div>

      {/* Create Tag Form */}
      <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Tag</h3>
        <form onSubmit={handleCreateTag} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Coding, Reading, Workout"
                className="w-full px-4 py-2 rounded-lg bg-slate-50 dark:bg-[#222831] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                maxLength={20}
              />
            </div>
            
            <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
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

          {(formError || hookError) && (
            <p className="text-red-500 text-sm">{formError || hookError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isCreating || !newTagName.trim()}
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Add Tag
            </button>
          </div>
        </form>
      </div>

      {/* Tags List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm group hover:border-primary/30 transition-all"
          >
            {editingId === tag.id ? (
                <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm rounded bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-primary"
                            autoFocus
                        />
                        <div className="flex gap-1">
                             <button
                                onClick={handleUpdateTag}
                                disabled={isUpdating || !editName.trim()}
                                className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded cursor-pointer"
                             >
                                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                             </button>
                             <button
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded cursor-pointer"
                             >
                                <X size={16} />
                             </button>
                        </div>
                    </div>
                    {/* Simple Color Picker for Edit */}
                    <div className="flex flex-wrap gap-1">
                        {COLORS.slice(0,9).map(c => ( // Show a subset for compactness, or all if we want
                             <button
                                key={c.value}
                                onClick={() => setEditColor(c.value)}
                                className={`w-4 h-4 rounded-full ${editColor === c.value ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white cursor-pointer' : 'cursor-pointer'}`}
                                style={{ backgroundColor: c.value }}
                             />
                        ))}
                         {/* Show remaining colors if needed? let's just show all but smaller */}
                    </div>
                     <div className="flex flex-wrap gap-1 mt-1">
                        {COLORS.slice(9).map(c => (
                             <button
                                key={c.value}
                                onClick={() => setEditColor(c.value)}
                                className={`w-4 h-4 rounded-full ${editColor === c.value ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white cursor-pointer' : 'cursor-pointer'}`}
                                style={{ backgroundColor: c.value }}
                             />
                        ))}
                    </div>
                     {formError && editingId === tag.id && (
                        <p className="text-xs text-red-500">{formError}</p>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                    <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                        {tag.name}
                    </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                        onClick={() => handleStartEdit(tag)}
                        disabled={deletingId === tag.id}
                        className="text-slate-400 hover:text-primary p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="Edit tag"
                        >
                        <Pencil size={16} />
                        </button>
                        <button
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={deletingId === tag.id}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="Delete tag"
                        >
                        {deletingId === tag.id ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Trash2 size={16} />
                        )}
                        </button>
                    </div>
                </>
            )}
          </div>
        ))}
        {tags.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500 italic">
                No tags created yet. Add one above!
            </div>
        )}
      </div>
    </div>
  );
};
