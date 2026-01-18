'use client';

import React, { useState, useEffect } from 'react';
import { ViewState, Session } from '@/types';

import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ActiveSession } from '@/components/ActiveSession';
import { SessionReport } from '@/components/SessionReport';
import { Analytics } from '@/components/Analytics';

const Home = () => {
  // State
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionData, setCurrentSessionData] = useState<{ duration: number; startTime: Date } | null>(null);


  // Initialization
  useEffect(() => {
    // Load sessions from local storage or use mock
    const savedSessions = localStorage.getItem('ft_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    } else {
      setSessions([]);
    }


  }, []);
  // Persist sessions
  useEffect(() => {
    localStorage.setItem('ft_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Handlers
  const handleStartSession = () => {
    setView(ViewState.ACTIVE_SESSION);
  };

  const handleEndSession = (durationSeconds: number, startTime: Date) => {
    setCurrentSessionData({ duration: durationSeconds, startTime });
    setView(ViewState.REPORT);
  };

  const handleSaveSession = (data: Pick<Session, 'tags' | 'notes'>) => {
    if (!currentSessionData) return;

    const newSession: Session = {
      id: crypto.randomUUID(),
      startTime: currentSessionData.startTime.toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: currentSessionData.duration,
      tags: data.tags,
      notes: data.notes,
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionData(null);
    setView(ViewState.DASHBOARD);
  };

  const handleDiscardSession = () => {
    setCurrentSessionData(null);
    setView(ViewState.DASHBOARD);
  };



  // Render content based on view state
  const renderContent = () => {
    switch (view) {
      case ViewState.ACTIVE_SESSION:
        return <ActiveSession onEndSession={handleEndSession} />;
      case ViewState.REPORT:
        // We render Dashboard underneath, but the modal takes focus. 
        // Ideally we structure this differently but for this flow:
        return (
          <>
             {currentSessionData && (
              <SessionReport 
                durationSeconds={currentSessionData.duration} 
                startTime={currentSessionData.startTime}
                onSave={handleSaveSession} 
                onDiscard={handleDiscardSession} 
              />
            )}
             <Dashboard sessions={sessions} onStartSession={handleStartSession} />
          </>
        );
      case ViewState.ANALYTICS:
        return <Analytics sessions={sessions} />;
      case ViewState.DASHBOARD:
      default:
        return <Dashboard sessions={sessions} onStartSession={handleStartSession} />;
    }
  };

  return (
    <Layout 
      currentView={view} 
      onChangeView={setView} 
    >
      {renderContent()}
    </Layout>
  );
};

export default Home;
