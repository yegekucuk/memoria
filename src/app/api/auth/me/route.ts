import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth, handleApiError, ApiError } from '@/lib/apiUtils';
import { AUTH_COOKIE_NAME } from '@/constants/auth';

export async function GET() {
  try {
    const userPayload = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error, 'Error in /api/auth/me');
  }
}

export async function DELETE(req: Request) {
  try {
    const userPayload = await requireAuth();

    const { password } = await req.json();

    if (!password || typeof password !== 'string') {
      throw new ApiError('Password is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: { password: true },
    });

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new ApiError('Invalid password', 401);
    }

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: userPayload.id } }),
      prisma.tag.deleteMany({ where: { userId: userPayload.id } }),
      prisma.settings.deleteMany({ where: { userId: userPayload.id } }),
      prisma.user.delete({ where: { id: userPayload.id } }),
    ]);

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return handleApiError(error, 'Error deleting account');
  }
}
