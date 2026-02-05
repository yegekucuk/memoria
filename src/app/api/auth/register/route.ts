import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { registerSchema } from '@/lib/validations/auth';

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        tags: {
          create: [
            { name: 'Reading', color: '#EF4444' }, // Red
            { name: 'Writing', color: '#8B5CF6' }, // Violet
            { name: 'Coding', color: '#EC4899' },  // Pink
            { name: 'Math', color: '#10B981' },    // Emerald
            { name: 'Meeting', color: '#8B5CF6' }, // Violet
          ]
        }
      },
    });

    // Return user without password

    const { password: _password, ...userWithoutPassword } = user;

    // Generate JWT
    const { signToken } = await import('@/lib/auth');
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({ user: userWithoutPassword });

    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
