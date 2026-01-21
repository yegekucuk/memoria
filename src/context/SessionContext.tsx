'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@/types';
import { useAuth } from './AuthContext';

interface SessionContextType {
  sessions: Session[];
  activeSessionStartTime: string | null; // ISO string
  reportData: { duration: number; startTime: string } | null; // ISO string
  startSession: () => void;
  endSession: (durationSeconds: number, startTime: Date) => void;
  saveSession: (data: Pick<Session, 'tags' | 'notes'>) => void;
  discardSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionStartTime, setActiveSessionStartTime] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{ duration: number; startTime: string } | null>(null);

  const { user, loading: authLoading } = useAuth();

  // Load from API
  useEffect(() => {
    if (!authLoading && user) {
       fetch(`/api/sessions?userId=${user.id}`)
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) {
              setSessions(data);
            }
         })
         .catch(err => console.error('Failed to load sessions', err));
         
       // Clear local storage legacy data
       localStorage.removeItem('ft_sessions');
    }
  }, [user, authLoading]);

  // Remove the save-to-localStorage useEffect
  // useEffect(() => {
  //   if (sessions.length > 0) {
  //      localStorage.setItem('ft_sessions', JSON.stringify(sessions));
  //   }
  // }, [sessions]);

  const startSession = () => {
    setActiveSessionStartTime(new Date().toISOString());
  };

  const endSession = (durationSeconds: number, startTime: Date) => {
    setActiveSessionStartTime(null);
    setReportData({ duration: durationSeconds, startTime: startTime.toISOString() });
  };

  const saveSession = async (data: Pick<Session, 'tags' | 'notes'>) => {
    if (!reportData || !user) return;

    try {
        const payload = {
          userId: user.id,
          startTime: reportData.startTime,
          endTime: new Date().toISOString(),
          durationSeconds: reportData.duration,
          tags: data.tags,
          notes: data.notes,
        };

        const res = await fetch('/api/sessions', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            const newSession = await res.json();
             setSessions(prev => [...prev, newSession]);
        }
    } catch (e) {
        console.error("Failed to save session", e);
    }
    
    setReportData(null);
  };

  const discardSession = () => {
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
      discardSession
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
