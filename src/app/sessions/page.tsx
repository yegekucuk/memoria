'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SessionsTable } from '@/components/SessionsTable';
import { useSession } from '@/context/SessionContext';

export default function SessionsPage() {
  const { sessions, refreshSessions } = useSession();

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader 
            title="All Sessions" 
            description="Manage your deep work history. View, edit, or delete your past sessions."
        />
        
        <div className="mt-8">
            <SessionsTable 
                sessions={sessions} 
                onUpdate={() => refreshSessions(false)} // refresh but don't set global loading state to avoid flicker
            />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
