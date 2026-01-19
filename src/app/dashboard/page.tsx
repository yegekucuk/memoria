'use client';

import React from 'react';
import { useSession } from '@/context/SessionContext';
import { Dashboard } from '@/components/Dashboard';
import { ActiveSession } from '@/components/ActiveSession';
import { SessionReport } from '@/components/SessionReport';

export default function DashboardPage() {
  const { 
    sessions, 
    activeSessionStartTime, 
    reportData, 
    startSession, 
    endSession, 
    saveSession, 
    discardSession 
  } = useSession();

  if (activeSessionStartTime) {
      return (
        <ActiveSession 
          startTime={new Date(activeSessionStartTime)} 
          onEndSession={endSession} 
        />
      );
  }

  return (
    <>
      {reportData && (
        <SessionReport
            durationSeconds={reportData.duration}
            startTime={new Date(reportData.startTime)}
            onSave={saveSession}
            onDiscard={discardSession}
        />
      )}
      <Dashboard sessions={sessions} onStartSession={startSession} />
    </>
  );
}
