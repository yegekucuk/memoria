import { NextResponse } from 'next/server';
// Trigger HMR update
import prisma from '@/lib/prisma';

// Helper to get userId (mocked or from headers/cookies in real app)
// For now, we'll assume it's passed in query param or body as per current context usage pattern
// But ideally should be from a secure session/token.
// Given the existing context uses `useAuth` and passes `userId` in query for GET,
// we will look for userId in logical places.

// GET /api/sessions/active
// Returns the currently active session (endTime is null)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        endTime: null,
      },
      include: {
        tags: true, // Include tags if any
      },
    });

    if (!activeSession) {
        // Return 200 with null or 404? 
        // 200 with null is often easier for frontend to handle "no active session" without throwing
        return NextResponse.json(null);
    }

    return NextResponse.json(activeSession);
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/sessions/active
// Starts a new session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Check if there is already an active session
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
        // endTime is null by default
        durationSeconds: 0,
      },
    });

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Error starting session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
