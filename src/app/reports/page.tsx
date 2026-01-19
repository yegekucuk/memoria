'use client';

import React from 'react';
import { useSession } from '@/context/SessionContext';
import { Analytics } from '@/components/Analytics';

export default function ReportsPage() {
    const { sessions } = useSession();
    return <Analytics sessions={sessions} />;
}
