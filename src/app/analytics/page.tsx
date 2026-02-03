'use client';

import { useSession } from '@/context/SessionContext';
import { Analytics } from '@/components/Analytics';


export default function AnalyticsPage() {
    const { sessions, isLoading } = useSession();
    return <Analytics sessions={sessions} isLoading={isLoading} />;
}
