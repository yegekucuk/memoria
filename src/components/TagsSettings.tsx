
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTags } from '@/hooks/useTags';
import { Loader2 } from 'lucide-react';
import { Tag } from '@/types';
import { TagForm } from './tags/TagForm';
import { TagList } from './tags/TagList';
import { ConfirmationModal } from './ConfirmationModal';
import { SubSetting } from './SubSetting';

export const TagsSettings: React.FC = () => {
  const { user } = useAuth();
  const { tags, isLoading, error: hookError, addTag, deleteTag, updateTag } = useTags();
  
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const handleCreateTag = async (name: string, color: string) => {
    if (!user) return;
    setIsCreating(true);
    try {
      await addTag(name, color);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = async (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) setTagToDelete(tag);
  };

  const confirmDeleteTag = async () => {
    if (!tagToDelete || !user) return;
    
    setDeletingId(tagToDelete.id);
    try {
      await deleteTag(tagToDelete.id);
      setTagToDelete(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
           console.error("Failed to delete", err);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateTag = async (id: string, name: string, color: string) => {
    if (!user) return;
    await updateTag(id, name, color);
  };

  return (
    <SubSetting 
      sectionId="tags"
      title="My Tags" 
      subtitle="Manage tags for categorizing your time"
    >
      <div className='w-full space-y-8'>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TagForm 
              onAddTag={handleCreateTag} 
              isLoading={isCreating} 
              error={hookError} 
            />
            
            <TagList 
              tags={tags} 
              onUpdateTag={handleUpdateTag} 
              onDeleteTag={handleDeleteClick} 
              deletingId={deletingId}
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!tagToDelete}
        onClose={() => setTagToDelete(null)}
        onConfirm={confirmDeleteTag}
        title="Delete Tag"
        message={
          <span>
            Are you sure that you want to delete <strong>{tagToDelete?.name}</strong> tag?
          </span>
        }
        confirmText="Delete"
        variant="danger"
        isLoading={!!deletingId}
      />
    </SubSetting>
  );
};
