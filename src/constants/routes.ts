/** Paths that require a valid JWT token. */
export const PROTECTED_PATHS = [
  '/dashboard',
  '/api/sessions',
  '/api/tags',
  '/api/settings',
  '/api/auth/me',
  '/api/auth/password',
  '/analytics',
  '/settings',
  '/sessions',
] as const;

/** Next.js middleware matcher configuration. */
export const MIDDLEWARE_MATCHER = [
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
] as const;
