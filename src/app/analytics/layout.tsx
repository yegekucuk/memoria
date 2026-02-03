'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
