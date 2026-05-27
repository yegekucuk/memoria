'use client';

import { useSession } from '@/context/SessionContext';
import { Analytics } from '@/components/Analytics';
import { LoadingScreen } from '@/components/LoadingScreen';


export default function AnalyticsPage() {
    const { sessions, isLoading } = useSession();
    if (isLoading) {
        return <LoadingScreen />;
    }

    return <Analytics sessions={sessions} />;
}
