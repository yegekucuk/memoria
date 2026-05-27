import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/constants/rateLimit';
import { MIDDLEWARE_MATCHER, PROTECTED_PATHS } from '@/constants/routes';
import { AUTH_COOKIE_NAME } from '@/constants/auth';
import { jwtVerify } from 'jose';

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;
  const method = request.method;
  const isDevLocalRequest =
    process.env.NODE_ENV === 'development' && LOCALHOST_HOSTNAMES.has(request.nextUrl.hostname);

  // --- Rate Limiting ---
  const ip = getClientIp(request);

  if (!isDevLocalRequest) {
    // Strict rate limits for auth routes (POST only)
    if (method === 'POST') {
      let rateLimitResult = null;

      if (pathname === '/api/auth/login') {
        rateLimitResult = rateLimit(ip, 'auth-login', RATE_LIMITS.AUTH_LOGIN);
      } else if (pathname === '/api/auth/register') {
        rateLimitResult = rateLimit(ip, 'auth-register', RATE_LIMITS.AUTH_REGISTER);
      } else if (pathname === '/api/auth/password') {
        rateLimitResult = rateLimit(ip, 'auth-password', RATE_LIMITS.AUTH_PASSWORD);
      }

      if (rateLimitResult && !rateLimitResult.success) {
        const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            },
          }
        );
      }
    }

    // General rate limit for all API routes
    if (pathname.startsWith('/api/')) {
      const isReadRequest = READ_METHODS.has(method);
      const generalStoreKey = isReadRequest ? 'general-read' : 'general-write';
      const generalConfig = isReadRequest ? RATE_LIMITS.GENERAL_READ : RATE_LIMITS.GENERAL_WRITE;
      const generalResult = rateLimit(ip, generalStoreKey, generalConfig);
      if (!generalResult.success) {
        const retryAfter = Math.ceil((generalResult.resetTime - Date.now()) / 1000);
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(generalResult.resetTime),
            },
          }
        );
      }
    }
  }

  // --- Authentication ---
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Pages redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isProtected && token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Mirror server-side hard requirement. Avoid silently accepting tokens.
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    try {
      // Edge-safe JWT verification. We only care that signature+exp are valid.
      const key = new TextEncoder().encode(secret);
      await jwtVerify(token, key);
    } catch {
      // Token expired/invalid: clear cookie to stop redirect loops.
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/', request.url));
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...MIDDLEWARE_MATCHER],
};
