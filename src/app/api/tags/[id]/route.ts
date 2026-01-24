
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
