/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware, config } from '@/middleware';

process.env.JWT_SECRET ||= 'test-jwt-secret';

// Mock jose so we don't depend on JWT parsing in unit tests.
jest.mock('jose', () => ({
  jwtVerify: jest.fn(async () => ({ payload: {} })),
}));

// Mock the rateLimit module
jest.mock('@/lib/rateLimit', () => ({
  rateLimit: jest.fn().mockReturnValue({ success: true, remaining: 59, resetTime: Date.now() + 60000 }),
  getClientIp: jest.fn().mockReturnValue('127.0.0.1'),
  RATE_LIMITS: {
    AUTH_LOGIN:    { windowMs: 900000, max: 5 },
    AUTH_REGISTER: { windowMs: 900000, max: 3 },
    AUTH_PASSWORD: { windowMs: 900000, max: 5 },
    GENERAL_READ:  { windowMs: 60000,  max: 240 },
    GENERAL_WRITE: { windowMs: 60000,  max: 60 },
  },
}));

import { rateLimit } from '@/lib/rateLimit';
const mockRateLimit = rateLimit as jest.MockedFunction<typeof rateLimit>;

function createRequest(pathname: string, options?: { method?: string; token?: string }) {
  const url = `http://localhost:3000${pathname}`;
  const req = new NextRequest(url, { method: options?.method || 'GET' });
  if (options?.token) {
    req.cookies.set('token', options.token);
  }
  return req;
}

beforeEach(() => {
  mockRateLimit.mockReset();
  mockRateLimit.mockReturnValue({ success: true, remaining: 59, resetTime: Date.now() + 60000 });
});

describe('middleware', () => {
  describe('rate limiting - localhost dev bypass', () => {
    const setNodeEnv = (value: string | undefined) => {
      (process.env as Record<string, string | undefined>).NODE_ENV = value;
    };

    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(() => {
      setNodeEnv(originalNodeEnv);
    });

    it('should skip rate limiting for localhost in development', async () => {
      setNodeEnv('development');

      const req = createRequest('/api/sessions', { token: 'valid-jwt' });
      await middleware(req);

      expect(mockRateLimit).not.toHaveBeenCalled();
    });

    it('should still apply rate limiting for localhost outside development', async () => {
      setNodeEnv('test');

      const req = createRequest('/api/sessions', { token: 'valid-jwt' });
      await middleware(req);

      expect(mockRateLimit).toHaveBeenCalledWith(
        '127.0.0.1',
        'general-read',
        { windowMs: 60000, max: 240 }
      );
    });
  });

  describe('config matcher', () => {
    it('should include all expected paths in the matcher', () => {
      expect(config.matcher).toContain('/dashboard/:path*');
      expect(config.matcher).toContain('/api/sessions/:path*');
      expect(config.matcher).toContain('/api/tags/:path*');
      expect(config.matcher).toContain('/api/settings/:path*');
      expect(config.matcher).toContain('/api/auth/login');
      expect(config.matcher).toContain('/api/auth/register');
      expect(config.matcher).toContain('/api/auth/me');
      expect(config.matcher).toContain('/api/auth/logout');
      expect(config.matcher).toContain('/api/auth/password');
      expect(config.matcher).toContain('/analytics/:path*');
      expect(config.matcher).toContain('/settings/:path*');
      expect(config.matcher).toContain('/sessions/:path*');
    });
  });

  describe('authentication', () => {
    it('should return 401 for protected API routes without token', async () => {
      const req = createRequest('/api/sessions');
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it('should return 401 for /api/settings without token', async () => {
      const req = createRequest('/api/settings');
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it('should return 401 for /api/auth/password without token', async () => {
      const req = createRequest('/api/auth/password', { method: 'POST' });
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it('should return 401 for /api/tags without token', async () => {
      const req = createRequest('/api/tags');
      const res = await middleware(req);
      expect(res.status).toBe(401);
    });

    it('should redirect page routes to / without token', async () => {
      const req = createRequest('/dashboard');
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('should redirect /analytics to / without token', async () => {
      const req = createRequest('/analytics');
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('should redirect /settings to / without token', async () => {
      const req = createRequest('/settings');
      const res = await middleware(req);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/');
    });

    it('should allow protected routes with a token', async () => {
      const req = createRequest('/api/sessions', { token: 'valid-jwt-token' });
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });

    it('should allow protected page routes with a token', async () => {
      const req = createRequest('/dashboard', { token: 'valid-jwt-token' });
      const res = await middleware(req);
      expect(res.status).toBe(200);
    });
  });

  describe('rate limiting - auth routes', () => {
    it('should apply AUTH_LOGIN rate limit on POST /api/auth/login', async () => {
      const req = createRequest('/api/auth/login', { method: 'POST' });
      await middleware(req);

      expect(mockRateLimit).toHaveBeenCalledWith(
        '127.0.0.1',
        'auth-login',
        { windowMs: 900000, max: 5 }
      );
    });

    it('should apply AUTH_REGISTER rate limit on POST /api/auth/register', async () => {
      const req = createRequest('/api/auth/register', { method: 'POST' });
      await middleware(req);

      expect(mockRateLimit).toHaveBeenCalledWith(
        '127.0.0.1',
        'auth-register',
        { windowMs: 900000, max: 3 }
      );
    });

    it('should apply AUTH_PASSWORD rate limit on POST /api/auth/password', async () => {
      const req = createRequest('/api/auth/password', { method: 'POST', token: 'valid-jwt' });
      await middleware(req);

      expect(mockRateLimit).toHaveBeenCalledWith(
        '127.0.0.1',
        'auth-password',
        { windowMs: 900000, max: 5 }
      );
    });

    it('should return 429 when auth rate limit is exceeded', async () => {
      mockRateLimit.mockReturnValueOnce({
        success: false,
        remaining: 0,
        resetTime: Date.now() + 300000,
      });

      const req = createRequest('/api/auth/login', { method: 'POST' });
      const res = await middleware(req);

      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeTruthy();
      expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('rate limiting - general', () => {
    it('should apply general read rate limit to GET API routes', async () => {
      const req = createRequest('/api/sessions', { token: 'valid-jwt' });
      await middleware(req);

      expect(mockRateLimit).toHaveBeenCalledWith(
        '127.0.0.1',
        'general-read',
        { windowMs: 60000, max: 240 }
      );
    });

    it('should apply general write rate limit to non-GET API routes', async () => {
      const req = createRequest('/api/sessions', { method: 'POST', token: 'valid-jwt' });
      await middleware(req);

      expect(mockRateLimit).toHaveBeenCalledWith(
        '127.0.0.1',
        'general-write',
        { windowMs: 60000, max: 60 }
      );
    });

    it('should return 429 when general rate limit is exceeded', async () => {
      mockRateLimit.mockReturnValue({
        success: false,
        remaining: 0,
        resetTime: Date.now() + 30000,
      });

      const req = createRequest('/api/sessions', { token: 'valid-jwt' });
      const res = await middleware(req);

      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBeTruthy();
    });

    it('should not apply rate limiting to non-API page routes', async () => {
      const req = createRequest('/dashboard', { token: 'valid-jwt' });
      await middleware(req);

      // rateLimit should NOT have been called with general API stores
      const generalCalls = mockRateLimit.mock.calls.filter(
        (call) => call[1] === 'general-read' || call[1] === 'general-write'
      );
      expect(generalCalls).toHaveLength(0);
    });
  });

  describe('rate limiting - 429 response format', () => {
    it('should include Retry-After header as positive integer', async () => {
      const futureReset = Date.now() + 120000;
      mockRateLimit.mockReturnValueOnce({
        success: false,
        remaining: 0,
        resetTime: futureReset,
      });

      const req = createRequest('/api/auth/login', { method: 'POST' });
      const res = await middleware(req);

      const retryAfter = Number(res.headers.get('Retry-After'));
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(120);

      const body = await res.json();
      expect(body.error).toContain('Too many requests');
    });
  });
});
