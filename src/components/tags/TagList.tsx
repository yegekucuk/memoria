'use client';

import React from 'react';
import { Tag } from '@/types';
import { TagItem } from './TagItem';

interface TagListProps {
  tags: Tag[];
  onUpdateTag: (id: string, name: string, color: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  deletingId: string | null;
  isLoading?: boolean;
}

export const TagList: React.FC<TagListProps> = ({ 
  tags, 
  onUpdateTag, 
  onDeleteTag, 
  deletingId,
  isLoading 
}) => {
  if (tags.length === 0 && !isLoading) {
    return (
      <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500 italic">
        No tags created yet. Add one above!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {tags.map((tag) => (
        <TagItem
          key={tag.id}
          tag={tag}
          onUpdate={onUpdateTag}
          onDelete={onDeleteTag}
          isDeleting={deletingId === tag.id}
        />
      ))}
    </div>
  );
};
