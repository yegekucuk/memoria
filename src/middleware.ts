import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/constants/rateLimit';
import { PROTECTED_PATHS } from '@/constants/routes';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const method = request.method;

  // --- Rate Limiting ---
  const ip = getClientIp(request);

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
    const generalResult = rateLimit(ip, 'general', RATE_LIMITS.GENERAL);
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/sessions/:path*',
    '/api/tags/:path*',
    '/api/settings/:path*',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/password',
    '/analytics/:path*',
    '/settings/:path*',
    '/sessions/:path*',
  ],
};
