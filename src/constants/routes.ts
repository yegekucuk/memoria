/** Paths that require a valid JWT token. */
export const PROTECTED_PATHS = [
  '/dashboard',
  '/api/sessions',
  '/api/tags',
  '/api/settings',
  '/api/auth/password',
  '/analytics',
  '/settings',
  '/sessions',
] as const;

