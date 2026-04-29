'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Session } from '@/types';
import type { SessionReportData } from '@/types';
import { useAuth } from './AuthContext';
import { CACHE_SESSIONS_KEY, TIME_TARGET_KEY, TIME_TARGET_AUDIO_ONLY_KEY } from '@/constants';
import { isCacheFresh, readCacheEntry, writeCacheEntry } from '@/lib/clientCache';

const SESSIONS_CACHE_TTL_MS = 60 * 1000;
const inflightSessionRequests = new Map<string, Promise<Session[]>>();

interface SessionContextType {
  sessions: Session[];
  activeSessionStartTime: string | null; // ISO string
  reportData: SessionReportData | null;
  startSession: () => void;
  endSession: (durationSeconds: number, startTime: Date) => void;
  saveSession: (data: Pick<Session, 'tags' | 'notes'>) => void;
  discardSession: () => void;
  refreshSessions: (updateLoading?: boolean) => Promise<void>;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionStartTime, setActiveSessionStartTime] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<SessionReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();


  const loadSessions = React.useCallback(async ({
    updateLoading = true,
    allowCache = false,
  }: {
    updateLoading?: boolean;
    allowCache?: boolean;
  } = {}) => {
    if (!user) return;

    const cacheKey = `${CACHE_SESSIONS_KEY}:${user.id}`;

    if (allowCache) {
      const cached = readCacheEntry<Session[]>(cacheKey);
      if (cached && isCacheFresh(cached.timestamp, SESSIONS_CACHE_TTL_MS)) {
        setSessions(cached.data);
        return;
      }
    }

    if (updateLoading) {
      setIsLoading(true);
    }

    try {
      let request = inflightSessionRequests.get(cacheKey);

      if (!request) {
        request = fetch('/api/sessions')
          .then(async (res) => {
            if (!res.ok) {
              throw new Error('Failed to fetch sessions');
            }
            const data = await res.json();
            return Array.isArray(data) ? data : [];
          })
          .finally(() => {
            inflightSessionRequests.delete(cacheKey);
          });

        inflightSessionRequests.set(cacheKey, request);
      }

      const nextSessions = await request;
      setSessions(nextSessions);
      writeCacheEntry(cacheKey, nextSessions);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      if (updateLoading) {
        setIsLoading(false);
      }
    }
  }, [user]);


  const refreshSessions = React.useCallback(async (updateLoading = true) => {
    await loadSessions({ updateLoading, allowCache: false });
  }, [loadSessions]);

  // Load from API
  useEffect(() => {
    if (!authLoading && user) {
       const init = async () => {
          setIsLoading(true);
          try {
             await loadSessions({ updateLoading: false, allowCache: true });

             // Fetch active session
              const activeRes = await fetch('/api/sessions/active');
             const activeData = await activeRes.json();
             
             if (activeData && activeData.id) {
                 setActiveSessionId(activeData.id);
                 setActiveSessionStartTime(activeData.startTime);
             } else {
                 // If no active session, check for pending session (ended but not saved)
                 const pendingRes = await fetch('/api/sessions/pending');
                 const pendingData = await pendingRes.json();
                 
                 if (pendingData && pendingData.id) {
                     setReportData({
                         duration: pendingData.durationSeconds,
                         startTime: pendingData.startTime,
                         sessionId: pendingData.id
                     });
                 }
             }
          } catch (err) {
             console.error('Failed to load session data', err);
          } finally {
             setIsLoading(false);
          }
       };

       init();
         
        // Clear local storage legacy data
        localStorage.removeItem('ft_sessions');
    } else if (!authLoading) {
        setSessions([]);
        setActiveSessionId(null);
        setActiveSessionStartTime(null);
        setReportData(null);
        setIsLoading(false);
    }
  }, [user, authLoading, loadSessions]);

  const startSession = useCallback(async () => {
    if (!user) return;
    try {
        const res = await fetch('/api/sessions/active', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        if (res.ok) {
            const session = await res.json();
            setActiveSessionId(session.id);
            setActiveSessionStartTime(session.startTime);
        }
    } catch (e) {
        console.error("Failed to start session", e);
    }
  }, [user]);

  const endSession = useCallback(async (durationSeconds: number, startTime: Date) => {
    if (!activeSessionId) return;

    try {
        const endTime = new Date();
        const res = await fetch(`/api/sessions/${activeSessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                endTime: endTime.toISOString(), 
                durationSeconds 
            })
        });

        if (res.ok) {
             setReportData({ 
                 duration: durationSeconds, 
                 startTime: startTime.toISOString(),
                 sessionId: activeSessionId 
             });
             setActiveSessionStartTime(null);
             setActiveSessionId(null);
        }
    } catch (e) {
        console.error("Failed to end session", e);
    }
  }, [activeSessionId]);

  const saveSession = useCallback(async (data: Pick<Session, 'tags' | 'notes'>) => {
    if (!reportData || !user) return;

    try {
        const res = await fetch(`/api/sessions/${reportData.sessionId}`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 notes: data.notes,
                 tags: data.tags
             })
        });
        
        if (res.ok) {
             await refreshSessions();
        }
    } catch (e) {
        console.error("Failed to save session", e);
    }
    
    setReportData(null);
    localStorage.removeItem(TIME_TARGET_KEY);
    localStorage.removeItem(TIME_TARGET_AUDIO_ONLY_KEY);
  }, [reportData, user, refreshSessions]);

  const discardSession = useCallback(async () => {
    if (!reportData) return;
    try {
        await fetch(`/api/sessions/${reportData.sessionId}`, {
            method: 'DELETE'
        });
        await refreshSessions();
    } catch (e) {
        console.error("Failed to discard session", e);
    }
    setReportData(null);
    localStorage.removeItem(TIME_TARGET_KEY);
    localStorage.removeItem(TIME_TARGET_AUDIO_ONLY_KEY);
  }, [reportData, refreshSessions]);

  const value = useMemo(() => ({
    sessions,
    activeSessionStartTime,
    reportData,
    isLoading,
    startSession,
    endSession,
    saveSession,
    discardSession,
    refreshSessions,
  }), [sessions, activeSessionStartTime, reportData, isLoading, startSession, endSession, saveSession, discardSession, refreshSessions]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
