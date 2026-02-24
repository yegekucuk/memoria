/** Rate limit presets used by the middleware and rate limiter. */
export const RATE_LIMITS = {
  AUTH_LOGIN:    { windowMs: 15 * 60 * 1000, max: 5 },   // 5 per 15 min
  AUTH_REGISTER: { windowMs: 15 * 60 * 1000, max: 3 },   // 3 per 15 min
  AUTH_PASSWORD: { windowMs: 15 * 60 * 1000, max: 5 },   // 5 per 15 min
  GENERAL:       { windowMs: 60 * 1000,      max: 60 },  // 60 per 1 min
} as const;
