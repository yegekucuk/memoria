'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { Settings } from '@/types';
import { CACHE_SETTINGS_KEY, SETTINGS_EXCLUDE_WEEKENDS_KEY } from '@/constants/storage';
import { isCacheFresh, readCacheEntry, writeCacheEntry } from '@/lib/clientCache';

const SETTINGS_CACHE_TTL_MS = 60 * 1000;
const inflightSettingsRequests = new Map<string, Promise<Settings>>();

interface SettingsContextType {
  settings: Settings;
  toggleExcludeWeekends: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({ excludeWeekends: false });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings on load
  useEffect(() => {
    if (user) {
      const cacheKey = `${CACHE_SETTINGS_KEY}:${user.id}`;
      const cached = readCacheEntry<Settings>(cacheKey);

      if (cached && isCacheFresh(cached.timestamp, SETTINGS_CACHE_TTL_MS)) {
        setSettings(cached.data);
        localStorage.setItem(SETTINGS_EXCLUDE_WEEKENDS_KEY, JSON.stringify(cached.data.excludeWeekends));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      let request = inflightSettingsRequests.get(cacheKey);

      if (!request) {
        request = fetch('/api/settings')
          .then((res) => {
            if (res.ok) {
              return res.json();
            }
            throw new Error('Failed to fetch settings');
          })
          .then((data) => ({ excludeWeekends: data.excludeWeekends as boolean }))
          .finally(() => {
            inflightSettingsRequests.delete(cacheKey);
          });

        inflightSettingsRequests.set(cacheKey, request);
      }

      request
        .then((nextSettings) => {
            setSettings(nextSettings);
            localStorage.setItem(SETTINGS_EXCLUDE_WEEKENDS_KEY, JSON.stringify(nextSettings.excludeWeekends));
            writeCacheEntry(cacheKey, nextSettings);
        })
        .catch((err) => {
            console.error(err);
            // Fallback to local storage if API fails or offline
            const local = localStorage.getItem(SETTINGS_EXCLUDE_WEEKENDS_KEY);
            if (local) {
                const fallbackSettings = { excludeWeekends: JSON.parse(local) as boolean };
                setSettings(fallbackSettings);
                writeCacheEntry(cacheKey, fallbackSettings);
            }
        })
        .finally(() => setIsLoading(false));
    } else {
        setSettings({ excludeWeekends: false });
        setIsLoading(false);
    }
  }, [user]);

  const toggleExcludeWeekends = async () => {
    if (!user) return;

    // Optimistic update
    const newExcludeWeekends = !settings.excludeWeekends;
    const nextSettings = { ...settings, excludeWeekends: newExcludeWeekends };
    setSettings(nextSettings);
    
    // Persist locally for immediate feedback/offline
    localStorage.setItem(SETTINGS_EXCLUDE_WEEKENDS_KEY, JSON.stringify(newExcludeWeekends));
    writeCacheEntry(`${CACHE_SETTINGS_KEY}:${user.id}`, nextSettings);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ excludeWeekends: newExcludeWeekends }),
      });

      if (!res.ok) {
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      console.error(err);
      // Revert on failure
      const revertedSettings = { ...settings, excludeWeekends: !newExcludeWeekends };
      setSettings(revertedSettings);
      // Revert local storage
      localStorage.setItem(SETTINGS_EXCLUDE_WEEKENDS_KEY, JSON.stringify(!newExcludeWeekends));
      writeCacheEntry(`${CACHE_SETTINGS_KEY}:${user.id}`, revertedSettings);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, toggleExcludeWeekends, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
