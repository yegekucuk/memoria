import { NextResponse } from 'next/server';
// Trigger HMR update
import prisma from '@/lib/prisma';

// PATCH /api/sessions/[id]
// Updates a session (End it, or Save details)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Type definition might need update too if strict
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Security check: ensure session belongs to user
    const currentSession = await prisma.session.findUnique({
        where: { id },
        select: { userId: true }
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
        // We already have userId from user.id
        const userId = user.id;
        const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

        // Upsert all tags first to ensure they exist
        await Promise.all(tags.map((tagName: string) => {
             const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
             return prisma.tag.upsert({
                 where: { name_userId: { name: tagName, userId } },
                 create: { name: tagName, userId, color: randomColor },
                 update: {} 
             });
        }));

        // Use 'set' to replace existing tags with the new selection
        updateData.tags = {
            set: tags.map((tagName: string) => ({ 
                name_userId: { name: tagName, userId } 
            })),
        };
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: updateData,
      include: { tags: true },
    });
    
    // Format response to match frontend expectations (flatten tags)
    const formattedSession = {
      ...updatedSession,
      startTime: updatedSession.startTime.toISOString(),
      endTime: updatedSession.endTime ? updatedSession.endTime.toISOString() : null,
      tags: updatedSession.tags.map(t => t.name)
    };

    return NextResponse.json(formattedSession);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message, stack: (error as Error).stack }, { status: 500 });
  }
}

// DELETE /api/sessions/[id]
// Discards a session
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth');
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
