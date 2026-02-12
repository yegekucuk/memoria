import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/apiUtils';

export async function GET(_req: Request) {
  try {
    const user = await requireAuth();

    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    return handleApiError(error, 'Error fetching tags');
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

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
    return handleApiError(error, 'Error creating tag');
  }
}
