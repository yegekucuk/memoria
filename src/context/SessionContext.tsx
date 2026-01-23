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
  refreshSessions: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionStartTime, setActiveSessionStartTime] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{ duration: number; startTime: string; sessionId: string } | null>(null);

  const { user, loading: authLoading } = useAuth();

  const refreshSessions = async () => {
    if (!user) return;
    try {
       const res = await fetch(`/api/sessions?userId=${user.id}`);
       const data = await res.json();
       if (Array.isArray(data)) {
         setSessions(data);
       }
    } catch (err) {
       console.error('Failed to load sessions', err);
    }
  };

  // Load from API
  useEffect(() => {
    if (!authLoading && user) {
        // Fetch history
       refreshSessions();

       // Fetch active session
       fetch(`/api/sessions/active?userId=${user.id}`)
         .then(res => res.json())
         .then(data => {
             if (data && data.id) {
                 setActiveSessionId(data.id);
                 setActiveSessionStartTime(data.startTime);
             }
         })
         .catch(err => console.error('Failed to load active session', err));
         
       // Clear local storage legacy data
       localStorage.removeItem('ft_sessions');
    }
  }, [user, authLoading]);

  const startSession = async () => {
    if (!user) return;
    try {
        const res = await fetch('/api/sessions/active', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
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
