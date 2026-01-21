'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
