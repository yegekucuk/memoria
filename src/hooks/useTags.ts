import { useState, useEffect, useCallback } from 'react';
import { Tag } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { CACHE_TAGS_KEY } from '@/constants';
import { isCacheFresh, readCacheEntry, writeCacheEntry } from '@/lib/clientCache';

const TAGS_CACHE_TTL_MS = 60 * 1000;
const inflightTagRequests = new Map<string, Promise<Tag[]>>();

export const useTags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (!user) {
        setTags([]);
        setIsLoading(false);
        return;
    }

    const cacheKey = `${CACHE_TAGS_KEY}:${user.id}`;
    const cached = readCacheEntry<Tag[]>(cacheKey);

    if (cached && isCacheFresh(cached.timestamp, TAGS_CACHE_TTL_MS)) {
      setTags(cached.data);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      let request = inflightTagRequests.get(cacheKey);

      if (!request) {
        request = fetch('/api/tags')
          .then((response) => {
            if (!response.ok) {
              throw new Error('Failed to fetch tags');
            }
            return response.json() as Promise<Tag[]>;
          })
          .finally(() => {
            inflightTagRequests.delete(cacheKey);
          });

        inflightTagRequests.set(cacheKey, request);
      }

      const data = await request;
      setTags(data);
      writeCacheEntry(cacheKey, data);
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
          name: newTagName.trim(),
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tag');
      }

      const newTag = await response.json();
      setTags(prev => {
        const updatedTags = [...prev, newTag];
        writeCacheEntry(`${CACHE_TAGS_KEY}:${user.id}`, updatedTags);
        return updatedTags;
      });
      return newTag;
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred');
        }
        throw err;
    }
  };

  const deleteTag = async (tagId: string) => {
      if (!user) return;
      setError(null);
      try {
        const response = await fetch(`/api/tags/${tagId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete tag');
        }

        setTags(prev => {
          const updatedTags = prev.filter(t => t.id !== tagId);
          writeCacheEntry(`${CACHE_TAGS_KEY}:${user.id}`, updatedTags);
          return updatedTags;
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
             setError('Failed to delete tag');
        }
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
          name: name.trim(),
          color,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update tag');
      }

      const updatedTag = await response.json();
      setTags(prev => {
        const updatedTags = prev.map(t => t.id === tagId ? updatedTag : t);
        writeCacheEntry(`${CACHE_TAGS_KEY}:${user.id}`, updatedTags);
        return updatedTags;
      });
      return updatedTag;
    } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Failed to update tag');
        }
        throw err;
    }
  };

  return { tags, isLoading, error, fetchTags, addTag, deleteTag, updateTag };
};
