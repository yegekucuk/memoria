'use client';

import React, { useMemo, useState } from 'react';
import { Tag, X } from 'lucide-react';
import { Tag as TagType } from '@/types';

interface TagSelectorProps {
  selectedTags: string[];
  onToggle: (tagName: string) => void;
  availableTags: TagType[];
  disabled?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onToggle,
  availableTags,
  disabled = false,
}) => {
  const [customTag, setCustomTag] = useState('');

  const availableUnselectedTags = useMemo(
    () => availableTags.filter(tag => !selectedTags.includes(tag.name)),
    [availableTags, selectedTags],
  );

  const normalizedFilter = customTag.trim().toLowerCase();

  const filteredAvailableTags = useMemo(
    () =>
      normalizedFilter
        ? availableUnselectedTags.filter(tag => tag.name.toLowerCase().includes(normalizedFilter))
        : availableUnselectedTags,
    [availableUnselectedTags, normalizedFilter],
  );

  const handleCustomTagKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      if (!selectedTags.includes(customTag.trim())) {
        onToggle(customTag.trim());
      }
      setCustomTag('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-white text-sm font-medium leading-normal">
        Categorize Session <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-[#222831] border border-[#283039] focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all min-h-[50px]">
        {selectedTags.map(tag => {
          const tagColor = availableTags.find(t => t.name === tag)?.color;
          return (
            <div
              key={tag}
              className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-2 pr-2 cursor-pointer group transition-colors"
              style={{
                backgroundColor: tagColor ? tagColor + '33' : 'rgba(59, 130, 246, 0.2)',
                border: `1px solid ${tagColor ? tagColor + '4D' : 'rgba(59, 130, 246, 0.3)'}`,
              }}
              onClick={() => !disabled && onToggle(tag)}
            >
              <Tag size={18} style={{ color: tagColor || '#3b82f6' }} />
              <p className="text-xs font-semibold leading-normal" style={{ color: tagColor || '#3b82f6' }}>
                {tag}
              </p>
              <X size={16} className="text-primary/70 hover:text-white ml-1" style={{ color: tagColor ? tagColor + 'B3' : '' }} />
            </div>
          );
        })}
        <input
          className="bg-transparent border-none text-white text-sm placeholder:text-[#6b7280] focus:ring-0 grow min-w-[120px] h-8 outline-none"
          placeholder="Search tags..."
          type="text"
          value={customTag}
          onChange={(e) => setCustomTag(e.target.value)}
          onKeyDown={handleCustomTagKey}
          readOnly={disabled}
          disabled={disabled}
        />
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        {filteredAvailableTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => onToggle(tag.name)}
              disabled={disabled}
              className="flex max-w-full items-center gap-1 rounded-md bg-[#283039] px-2 py-1 text-xs text-[#9dabb9] transition-colors hover:bg-[#3e4856] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
              <span className="max-w-36 truncate whitespace-nowrap">{tag.name}</span>
            </button>
          ))}
        {availableTags.length === 0 && (
          <p className="text-gray-500 text-xs italic">No tags found. Go to Settings to add some!</p>
        )}
        {availableTags.length > 0 && availableUnselectedTags.length === 0 && (
          <p className="text-gray-500 text-xs italic">All tags are already selected.</p>
        )}
        {availableUnselectedTags.length > 0 && filteredAvailableTags.length === 0 && normalizedFilter && (
          <p className="text-gray-500 text-xs italic">
            No tags match <span className="font-medium text-gray-400 not-italic">{customTag.trim()}</span>.
          </p>
        )}
      </div>
    </div>
  );
};
