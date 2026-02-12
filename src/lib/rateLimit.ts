/**
 * In-memory sliding window rate limiter.
 * Edge Runtime compatible — no setInterval, uses lazy cleanup.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

// Separate stores per route group so limits don't collide
const stores = new Map<string, Map<string, RateLimitEntry>>();

// Track last cleanup time per store to avoid cleaning on every call
const lastCleanup = new Map<string, number>();
const CLEANUP_INTERVAL_MS = 60 * 1000; // Lazy cleanup at most once per minute

function getStore(key: string): Map<string, RateLimitEntry> {
  let store = stores.get(key);
  if (!store) {
    store = new Map();
    stores.set(key, store);
  }
  return store;
}

function lazyCleanup(storeKey: string, store: Map<string, RateLimitEntry>, now: number) {
  const last = lastCleanup.get(storeKey) || 0;
  if (now - last < CLEANUP_INTERVAL_MS) return;

  lastCleanup.set(storeKey, now);
  for (const [ip, entry] of store) {
    if (now >= entry.resetTime) {
      store.delete(ip);
    }
  }
}

/**
 * Check rate limit for a given identifier (typically IP) and route group.
 *
 * @param identifier - Client identifier (IP address)
 * @param storeKey   - A unique key per route group (e.g. "auth-login")
 * @param config     - { windowMs, max }
 * @returns { success, remaining, resetTime }
 */
export function rateLimit(
  identifier: string,
  storeKey: string,
  config: RateLimitConfig
): RateLimitResult {
  const store = getStore(storeKey);
  const now = Date.now();

  // Lazy cleanup of expired entries
  lazyCleanup(storeKey, store, now);

  const entry = store.get(identifier);

  // If no entry or window expired, create fresh entry
  if (!entry || now >= entry.resetTime) {
    store.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.max - 1,
      resetTime: now + config.windowMs,
    };
  }

  // Increment count within the window
  entry.count += 1;

  if (entry.count > config.max) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    success: true,
    remaining: config.max - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Extract client IP from request headers.
 * Falls back to "unknown" if no IP is found.
 */
export function getClientIp(request: { headers: { get(name: string): string | null } }): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; take the first
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// Rate limit presets
export const RATE_LIMITS = {
  AUTH_LOGIN:    { windowMs: 15 * 60 * 1000, max: 5 },   // 5 per 15 min
  AUTH_REGISTER: { windowMs: 15 * 60 * 1000, max: 3 },   // 3 per 15 min
  AUTH_PASSWORD: { windowMs: 15 * 60 * 1000, max: 5 },   // 5 per 15 min
  GENERAL:       { windowMs: 60 * 1000,      max: 60 },  // 60 per 1 min
} as const;
