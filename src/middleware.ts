import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Paths to protect
  const protectedPaths = ['/dashboard', '/api/sessions', '/api/tags', '/analytics', '/settings', '/sessions'];
  
  // Check if the current path starts with any of the protected paths
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // If path is protected and no token exists
  if (isProtected && !token) {
    // If it's an API route, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // If it's a page, redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Allow request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/sessions/:path*',
    '/api/tags/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/sessions/:path*',
  ],
};
