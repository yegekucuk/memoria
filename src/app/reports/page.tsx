'use client';

import { useSession } from '@/context/SessionContext';
import { Analytics } from '@/components/Analytics';


export default function ReportsPage() {
    const { sessions, isLoading } = useSession();
    return <Analytics sessions={sessions} isLoading={isLoading} />;
}
