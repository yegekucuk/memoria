'use client';

import React from 'react';
import { Journal } from '@/components/Journal';
import { useSession } from '@/context/SessionContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function JournalPage() {
  const { sessions, isLoading } = useSession();

  return (
    <ProtectedRoute>
      <Journal sessions={sessions} isLoading={isLoading} />
    </ProtectedRoute>
  );
}
