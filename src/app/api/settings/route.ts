import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: currentUser.email },
    include: { settings: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // If settings don't exist, return default false (schema default)
  const settings = user.settings || { excludeWeekends: false };

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { excludeWeekends } = await req.json();

  if (typeof excludeWeekends !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
      where: { email: currentUser.email },
  });
  
  if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updatedSettings = await prisma.settings.upsert({
    where: { userId: user.id },
    update: { excludeWeekends },
    create: {
      userId: user.id,
      excludeWeekends,
    },
  });

  return NextResponse.json(updatedSettings);
}
