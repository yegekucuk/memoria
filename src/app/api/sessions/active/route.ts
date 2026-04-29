import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleApiError, formatSession } from '@/lib/apiUtils';

export async function GET(_request: Request) {
  try {
    const user = await requireAuth();

    const activeSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
      include: {
        tags: true,
      },
    });

    if (!activeSession) {
      return NextResponse.json(null);
    }

    return NextResponse.json(formatSession(activeSession));
  } catch (error) {
    return handleApiError(error, 'Error fetching active session');
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();

    try {
      await request.json();
    } catch {
      // Parse body for future use (e.g. tags, notes)
    }

    const existingActive = await prisma.session.findFirst({
      where: {
        userId: user.id,
        endTime: null,
      },
    });

    if (existingActive) {
      return NextResponse.json(
        { error: 'Session already active', session: formatSession(existingActive) },
        { status: 409 }
      );
    }

    const newSession = await prisma.session.create({
      data: {
        userId: user.id,
        startTime: new Date(),
        durationSeconds: 0,
      },
    });

    return NextResponse.json(formatSession(newSession));
  } catch (error) {
    return handleApiError(error, 'Error starting session');
  }
}
