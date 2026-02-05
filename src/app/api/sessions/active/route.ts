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

    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        endTime: null,
      },
      include: {
        tags: true,
      },
    });

    if (!activeSession) {
        return NextResponse.json(null);
    }

    return NextResponse.json(activeSession);
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    try {
        await request.json(); 
    } catch {} 

    const existingActive = await prisma.session.findFirst({
        where: {
            userId,
            endTime: null
        }
    });

    if (existingActive) {
        return NextResponse.json({ error: 'Session already active', session: existingActive }, { status: 409 });
    }

    const newSession = await prisma.session.create({
      data: {
        userId,
        startTime: new Date(),
        durationSeconds: 0,
      },
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
