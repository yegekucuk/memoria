import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

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
