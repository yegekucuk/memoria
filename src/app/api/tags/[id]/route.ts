
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params;
    const body = await req.json();
    const { userId, name, color } = body;

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    if (!userId || !name || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, color' },
        { status: 400 }
      );
    }

    // Verify ownership
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    if (tag.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check for duplicate name (excluding current tag)
    const existingTag = await prisma.tag.findUnique({
      where: {
        name_userId: {
          name,
          userId,
        },
      },
    });

    if (existingTag && existingTag.id !== tagId) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 409 }
      );
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name,
        color,
      },
    });

    return NextResponse.json(updatedTag);

  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tagId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId'); // Ensure the user owns the tag

    if (!tagId) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
       return NextResponse.json(
        { error: 'User ID is required for verification' },
        { status: 400 }
      );
    }
    
    // Verify ownership
    const tag = await prisma.tag.findUnique({
        where: { id: tagId }
    });

    if (!tag) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    if (tag.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.tag.delete({
      where: {
        id: tagId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
