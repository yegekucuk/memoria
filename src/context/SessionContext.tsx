'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@/types';

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

  // Load from local storage
  useEffect(() => {
    const savedSessions = localStorage.getItem('ft_sessions');
    if (savedSessions) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (sessions.length > 0) {
       localStorage.setItem('ft_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const startSession = () => {
    setActiveSessionStartTime(new Date().toISOString());
  };

  const endSession = (durationSeconds: number, startTime: Date) => {
    setActiveSessionStartTime(null);
    setReportData({ duration: durationSeconds, startTime: startTime.toISOString() });
  };

  const saveSession = (data: Pick<Session, 'tags' | 'notes'>) => {
    if (!reportData) return;

    const newSession: Session = {
      id: crypto.randomUUID(),
      startTime: reportData.startTime,
      endTime: new Date().toISOString(),
      durationSeconds: reportData.duration,
      tags: data.tags,
      notes: data.notes,
    };

    setSessions(prev => [...prev, newSession]);
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
