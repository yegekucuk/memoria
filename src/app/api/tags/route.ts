
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

    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
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
    const { name, color } = body;
    const userId = user.id;

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Missing required fields: name, color' },
        { status: 400 }
      );
    }

    // Check for existing tag with same name for this user
    const existingTag = await prisma.tag.findUnique({
      where: {
        name_userId: {
          name,
          userId,
        },
      },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 409 }
      );
    }

    const newTag = await prisma.tag.create({
      data: {
        userId,
        name,
        color,
      },
    });

    return NextResponse.json(newTag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
