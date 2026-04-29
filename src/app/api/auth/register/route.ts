import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations/auth';
import { setAuthCookie } from '@/lib/auth';
import { DEFAULT_TAG_COLORS, BCRYPT_SALT_ROUNDS } from '@/constants';
import { handleApiError } from '@/lib/apiUtils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user with default tags
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tags: {
          create: [
            { name: 'Reading', color: DEFAULT_TAG_COLORS[0] },
            { name: 'Writing', color: DEFAULT_TAG_COLORS[4] },
            { name: 'Coding', color: DEFAULT_TAG_COLORS[5] },
            { name: 'Math', color: DEFAULT_TAG_COLORS[2] },
            { name: 'Meeting', color: DEFAULT_TAG_COLORS[4] },
          ]
        }
      },
    });

    // Return user without password
    const { password: _password, ...userWithoutPassword } = user;

    const response = NextResponse.json({ user: userWithoutPassword });
    setAuthCookie(response, user);

    return response;
  } catch (error) {
    return handleApiError(error, 'Registration error');
  }
}
