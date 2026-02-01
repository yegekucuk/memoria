'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@/types';
import { useAuth } from './AuthContext';

interface SessionContextType {
  sessions: Session[];
  activeSessionStartTime: string | null; // ISO string
  reportData: { duration: number; startTime: string; sessionId: string } | null; // ISO string
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
  const [reportData, setReportData] = useState<{ duration: number; startTime: string; sessionId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();

  const refreshSessions = async (updateLoading = true) => {
    if (!user) return;
    if (updateLoading) setIsLoading(true);
    try {
       const res = await fetch('/api/sessions');
       const data = await res.json();
       if (Array.isArray(data)) {
         setSessions(data);
       }
    } catch (err) {
       console.error('Failed to load sessions', err);
    } finally {
       if (updateLoading) setIsLoading(false);
    }
  };

  // Load from API
  useEffect(() => {
    if (!authLoading && user) {
       const init = async () => {
          setIsLoading(true);
          try {
             await refreshSessions(false);

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
        setIsLoading(false);
    }
  }, [user, authLoading]);

  const startSession = async () => {
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
  };

  const endSession = async (durationSeconds: number, startTime: Date) => {
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
  };

  const saveSession = async (data: Pick<Session, 'tags' | 'notes'>) => {
    if (!reportData || !user) return;

    try {
        const res = await fetch(`/api/sessions/${reportData.sessionId}`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 notes: data.notes,
                 tags: data.tags // API handles connecting tags
             })
        });
        
        if (res.ok) {
             // Fetch latest data from server instead of local update to ensure strict sync
             await refreshSessions();
        }
    } catch (e) {
        console.error("Failed to save session", e);
    }
    
    setReportData(null);
  };

  const discardSession = async () => {
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
  };

  return (
    <SessionContext.Provider value={{
      sessions,
      activeSessionStartTime,
      reportData,
      isLoading,
      startSession,
      endSession,
      saveSession,
      discardSession,
      refreshSessions
    }}>
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
