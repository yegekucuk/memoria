import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/constants/rateLimit';
import { PROTECTED_PATHS } from '@/constants/routes';

const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
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

  return NextResponse.next();
}

export const config = {
  // Next.js requires `matcher` to be statically analyzable.
  matcher: [
    '/dashboard/:path*',
    '/api/sessions/:path*',
    '/api/tags/:path*',
    '/api/settings/:path*',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/me',
    '/api/auth/logout',
    '/api/auth/password',
    '/analytics/:path*',
    '/settings/:path*',
    '/sessions/:path*',
  ],
};
