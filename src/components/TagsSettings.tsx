
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTags } from '@/hooks/useTags';
import { Loader2 } from 'lucide-react';
import { TagForm } from './tags/TagForm';
import { TagList } from './tags/TagList';

export const TagsSettings: React.FC = () => {
  const { user } = useAuth();
  const { tags, isLoading, error: hookError, addTag, deleteTag, updateTag } = useTags();
  
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTag = async (name: string, color: string) => {
    if (!user) return;
    setIsCreating(true);
    setError(null);
    try {
      await addTag(name, color);
    } catch (err: any) {
      setError(err.message);
      throw err; // Let TagForm handle its own UI if needed
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
      console.error("Failed to delete", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateTag = async (id: string, name: string, color: string) => {
    if (!user) return;
    await updateTag(id, name, color);
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

      <TagForm 
        onAddTag={handleCreateTag} 
        isLoading={isCreating} 
        error={error || hookError} 
      />

      <TagList 
        tags={tags} 
        onUpdateTag={handleUpdateTag} 
        onDeleteTag={handleDeleteTag} 
        deletingId={deletingId}
        isLoading={isLoading}
      />
    </div>
  );
};
