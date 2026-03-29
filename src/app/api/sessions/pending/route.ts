import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/apiUtils';

export async function GET(_request: Request) {
  try {
    const user = await requireAuth();

    const pendingSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        endTime: {
          not: null,
        },
        OR: [
          { notes: null },
          { notes: '' },
        ],
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json(pendingSession || null);
  } catch (error) {
    return handleApiError(error, 'Error fetching pending session');
  }
}
