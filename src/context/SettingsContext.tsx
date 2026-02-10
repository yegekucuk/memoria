'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Settings {
  excludeWeekends: boolean;
}

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
      setIsLoading(true);
      fetch('/api/settings')
        .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch settings');
        })
        .then((data) => {
            setSettings({ excludeWeekends: data.excludeWeekends });
            localStorage.setItem('settings_excludeWeekends', JSON.stringify(data.excludeWeekends));
        })
        .catch((err) => {
            console.error(err);
            // Fallback to local storage if API fails or offline
            const local = localStorage.getItem('settings_excludeWeekends');
            if (local) {
                setSettings({ excludeWeekends: JSON.parse(local) });
            }
        })
        .finally(() => setIsLoading(false));
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const toggleExcludeWeekends = async () => {
    if (!user) return;

    // Optimistic update
    const newExcludeWeekends = !settings.excludeWeekends;
    setSettings((prev) => ({ ...prev, excludeWeekends: newExcludeWeekends }));
    
    // Persist locally for immediate feedback/offline
    localStorage.setItem('settings_excludeWeekends', JSON.stringify(newExcludeWeekends));

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
      setSettings((prev) => ({ ...prev, excludeWeekends: !newExcludeWeekends }));
      // Revert local storage
      localStorage.setItem('settings_excludeWeekends', JSON.stringify(!newExcludeWeekends));
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
