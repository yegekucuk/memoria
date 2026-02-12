import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleApiError, formatSession, getRandomTagColor } from '@/lib/apiUtils';

export async function GET(_req: Request) {
  try {
    const user = await requireAuth();

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      include: {
        tags: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    const formattedSessions = sessions.map(formatSession);

    return NextResponse.json(formattedSessions);
  } catch (error) {
    return handleApiError(error, 'Error fetching sessions');
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const { startTime, endTime, durationSeconds, notes, tags } = body;
    const userId = user.id;

    // Handle tags: find existing or create new
    const tagConnectors = [];
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
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
            color: getRandomTagColor(),
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

    return NextResponse.json(formatSession(newSession));
  } catch (error) {
    return handleApiError(error, 'Error creating session');
  }
}
