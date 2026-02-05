import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_req: Request) {
  try {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Original logic with user.id
    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      include: {
        tags: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Transform database sessions to match the frontend type
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime ? session.endTime.toISOString() : '', // Frontend expects string, maybe check type
      durationSeconds: session.durationSeconds,
      notes: session.notes || '',
      tags: session.tags.map((tag) => tag.name),
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { startTime, endTime, durationSeconds, notes, tags } = body;
    const userId = user.id;

    // Default colors for new tags
    const DEFAULT_COLORS = [
      '#EF4444', // red-500
      '#F59E0B', // amber-500
      '#10B981', // emerald-500
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
    ];

    // Handle tags: find existing or create new
    // We use connectOrCreate for each tag
    const tagConnectors = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
        tagConnectors.push({
          where: {
            name_userId: {
              name: tagName,
              userId: userId,
            },
          },
          create: {
            name: tagName,
            userId: userId,
            color: randomColor,
          },
        });
      }
    }

    const newSession = await prisma.session.create({
      data: {
        userId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        durationSeconds,
        notes,
        tags: {
          connectOrCreate: tagConnectors,
        },
      },
      include: {
        tags: true,
      },
    });

    // Format response
    const formattedSession = {
      id: newSession.id,
      startTime: newSession.startTime.toISOString(),
      endTime: newSession.endTime ? newSession.endTime.toISOString() : '',
      durationSeconds: newSession.durationSeconds,
      notes: newSession.notes || '',
      tags: newSession.tags.map(t => t.name),
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
