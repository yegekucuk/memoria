import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleApiError, getRandomTagColor, formatSession } from '@/lib/apiUtils';

// PATCH /api/sessions/[id]
// Updates a session (End it, or Save details)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Security check: ensure session belongs to user
    const currentSession = await prisma.session.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!currentSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (currentSession.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { endTime, durationSeconds, notes, tags } = body;

    // Use a dynamic data object to only update what's passed
    const updateData: {
      endTime?: Date;
      durationSeconds?: number;
      notes?: string;
      tags?: object;
    } = {};

    if (endTime) {
      updateData.endTime = new Date(endTime);
    }
    if (durationSeconds !== undefined) {
      updateData.durationSeconds = durationSeconds;
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Handle tags update if provided
    if (tags && Array.isArray(tags)) {
      const userId = user.id;

      // Upsert all tags first to ensure they exist
      await Promise.all(tags.map((tagName: string) => {
        return prisma.tag.upsert({
          where: { name_userId: { name: tagName, userId } },
          create: { name: tagName, userId, color: getRandomTagColor() },
          update: {},
        });
      }));

      // Use 'set' to replace existing tags with the new selection
      updateData.tags = {
        set: tags.map((tagName: string) => ({
          name_userId: { name: tagName, userId },
        })),
      };
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
      include: { tags: true },
    });

    // Format response to match frontend expectations (flatten tags)
    return NextResponse.json(formatSession(updatedSession));
  } catch (error) {
    return handleApiError(error, 'Error updating session');
  }
}

// DELETE /api/sessions/[id]
// Discards a session
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Verify ownership
    const session = await prisma.session.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Error deleting session');
  }
}
