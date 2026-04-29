import { useState, useCallback } from 'react';

export function useTagToggle(initialTags: string[] = []) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  const toggleTag = useCallback((tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  }, []);

  return { selectedTags, toggleTag, setSelectedTags };
}
