'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SessionsTable } from '@/components/SessionsTable';
import { useSession } from '@/context/SessionContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function SessionsPage() {
  const { sessions, refreshSessions, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader 
            title="Sessions" 
            description="Manage your deep work history. View, edit, or delete your past sessions."
        />
        
        <div className="mt-8">
            <SessionsTable 
                sessions={sessions} 
                onUpdate={() => refreshSessions()} 
            />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
