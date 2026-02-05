'use client';

import React, { useState } from 'react';
import { X, Loader2, Trash2, Pencil, Check } from 'lucide-react';
import { COLORS } from '@/constants/colors';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagItemProps {
  tag: Tag;
  onUpdate: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export const TagItem: React.FC<TagItemProps> = ({ tag, onUpdate, onDelete, isDeleting }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [editColor, setEditColor] = useState(tag.color);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditName(tag.name);
    setEditColor(tag.color);
    setError(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleUpdate = async () => {
    if (!editName.trim() || (editName === tag.name && editColor === tag.color)) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await onUpdate(tag.id, editName.trim(), editColor);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm group hover:border-primary/30 transition-all"
    >
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 px-2 py-1 text-sm rounded bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-primary"
              autoFocus
              maxLength={20}
            />
            <div className="flex gap-1">
              <button
                onClick={handleUpdate}
                disabled={isUpdating || !editName.trim()}
                className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded cursor-pointer"
                title="Save changes"
              >
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded cursor-pointer"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setEditColor(c.value)}
                className={`w-4 h-4 rounded-full transition-all ${
                  editColor === c.value 
                    ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-110' 
                    : 'hover:scale-110'
                } cursor-pointer`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
          
          {error && <p className="text-xs text-red-500">{error}</p>}
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
              onClick={handleStartEdit}
              disabled={isDeleting}
              className="text-slate-400 hover:text-primary p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Edit tag"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(tag.id)}
              disabled={isDeleting}
              className="text-slate-400 hover:text-red-500 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Delete tag"
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
