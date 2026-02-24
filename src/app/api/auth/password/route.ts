import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { updatePasswordSchema } from '@/lib/validations/auth';
import { requireAuth, handleApiError } from '@/lib/apiUtils';
import { BCRYPT_SALT_ROUNDS } from '@/constants/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const result = updatePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Fetch user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userWithPassword) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userWithPassword.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return handleApiError(error, 'Error changing password');
  }
}
