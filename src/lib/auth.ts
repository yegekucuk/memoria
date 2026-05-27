import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { UserPayload } from '@/types';
import { AUTH_COOKIE_NAME, JWT_EXPIRY, AUTH_COOKIE_MAX_AGE } from '@/constants/auth';

export type { UserPayload };

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Hard fail: auth must never run with a default secret (esp. on Vercel).
  throw new Error('Missing required env var JWT_SECRET');
}

export function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Sign a JWT for the given user and set it as an httpOnly cookie on the response.
 * Used by both login and register routes.
 */
export function setAuthCookie(response: NextResponse, user: { id: string; email: string; name?: string | null }): void {
  // Keep JWT payload minimal; all user data comes from DB.
  const token = signToken({ id: user.id });

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
}
