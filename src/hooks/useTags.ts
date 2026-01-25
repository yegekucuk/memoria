import { useState, useEffect, useCallback } from 'react';
import { Tag } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const useTags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tags?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data = await response.json();
      setTags(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = async (newTagName: string, selectedColor: string) => {
    if (!user) return;
    setError(null);

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newTagName.trim(),
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tag');
      }

      const newTag = await response.json();
      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (err: any) {
        setError(err.message);
        throw err;
    }
  };

  const deleteTag = async (tagId: string) => {
      if (!user) return;
      setError(null);
      try {
        const response = await fetch(`/api/tags/${tagId}?userId=${user.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete tag');
        }

        setTags(prev => prev.filter(t => t.id !== tagId));
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
  };

  const updateTag = async (tagId: string, name: string, color: string) => {
    if (!user) return;
    setError(null);

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: name.trim(),
          color,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update tag');
      }

      const updatedTag = await response.json();
      setTags(prev => prev.map(t => t.id === tagId ? updatedTag : t));
      return updatedTag;
    } catch (err: any) {
        setError(err.message);
        throw err;
    }
  };

  return { tags, isLoading, error, fetchTags, addTag, deleteTag, updateTag };
};
