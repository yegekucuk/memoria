import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleApiError } from '@/lib/apiUtils';

export async function GET() {
  try {
    const currentUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { email: currentUser.email },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If settings don't exist, return default
    const settings = user.settings || { excludeWeekends: false, dailyGoalMinutes: null, weeklyGoalMinutes: null };

    return NextResponse.json(settings);
  } catch (error) {
    return handleApiError(error, 'Error fetching settings');
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await requireAuth();

    const { excludeWeekends, dailyGoalMinutes, weeklyGoalMinutes } = await req.json();

    if (typeof excludeWeekends !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: currentUser.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { excludeWeekends };
    if (dailyGoalMinutes !== undefined) {
      updateData.dailyGoalMinutes = dailyGoalMinutes === null ? null : Number(dailyGoalMinutes);
    }
    if (weeklyGoalMinutes !== undefined) {
      updateData.weeklyGoalMinutes = weeklyGoalMinutes === null ? null : Number(weeklyGoalMinutes);
    }

    const updatedSettings = await prisma.settings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        excludeWeekends,
        dailyGoalMinutes: dailyGoalMinutes === null ? null : Number(dailyGoalMinutes) || null,
        weeklyGoalMinutes: weeklyGoalMinutes === null ? null : Number(weeklyGoalMinutes) || null,
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    return handleApiError(error, 'Error updating settings');
  }
}
