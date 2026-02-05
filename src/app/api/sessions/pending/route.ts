import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_request: Request) {
  try {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const pendingSession = await prisma.session.findFirst({
      where: {
        userId,
        endTime: {
          not: null
        },
        OR: [
          { notes: null },
          { notes: "" }
        ]
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    return NextResponse.json(pendingSession || null);
  } catch (error) {
    console.error('Error fetching pending session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
