import { rateLimit, getClientIp } from '@/lib/rateLimit';
import { RATE_LIMITS } from '@/constants/rateLimit';

// We need to reset the module between tests to clear the in-memory stores
beforeEach(() => {
  jest.resetModules();
});

describe('rateLimit', () => {
  describe('basic functionality', () => {
    it('should allow requests within the limit', () => {
      const config = { windowMs: 60000, max: 3 };

      const result1 = rateLimit('192.168.1.1', 'test-basic', config);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = rateLimit('192.168.1.1', 'test-basic', config);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = rateLimit('192.168.1.1', 'test-basic', config);
      expect(result3.success).toBe(true);
      expect(result3.remaining).toBe(0);
    });

    it('should block requests exceeding the limit', () => {
      const config = { windowMs: 60000, max: 2 };

      rateLimit('10.0.0.1', 'test-block', config);
      rateLimit('10.0.0.1', 'test-block', config);

      const result = rateLimit('10.0.0.1', 'test-block', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should return a valid resetTime in the future', () => {
      const config = { windowMs: 60000, max: 5 };
      const before = Date.now();

      const result = rateLimit('10.0.0.2', 'test-reset', config);

      expect(result.resetTime).toBeGreaterThanOrEqual(before + config.windowMs);
    });
  });

  describe('isolation', () => {
    it('should track different IPs independently', () => {
      const config = { windowMs: 60000, max: 1 };

      const r1 = rateLimit('ip-a', 'test-ip-iso', config);
      expect(r1.success).toBe(true);

      // Second request from same IP should be blocked
      const r2 = rateLimit('ip-a', 'test-ip-iso', config);
      expect(r2.success).toBe(false);

      // Different IP should still be allowed
      const r3 = rateLimit('ip-b', 'test-ip-iso', config);
      expect(r3.success).toBe(true);
    });

    it('should track different store keys independently', () => {
      const config = { windowMs: 60000, max: 1 };

      const r1 = rateLimit('same-ip', 'store-a', config);
      expect(r1.success).toBe(true);

      // Same IP but different store key should be allowed
      const r2 = rateLimit('same-ip', 'store-b', config);
      expect(r2.success).toBe(true);

      // Same IP and same store key should be blocked
      const r3 = rateLimit('same-ip', 'store-a', config);
      expect(r3.success).toBe(false);
    });
  });

  describe('window expiry', () => {
    it('should reset count after the window expires', () => {
      const config = { windowMs: 1000, max: 1 };

      const r1 = rateLimit('expire-ip', 'test-expiry', config);
      expect(r1.success).toBe(true);

      const r2 = rateLimit('expire-ip', 'test-expiry', config);
      expect(r2.success).toBe(false);

      // Fast-forward time past the window
      const originalNow = Date.now;
      Date.now = () => originalNow() + 1500;

      const r3 = rateLimit('expire-ip', 'test-expiry', config);
      expect(r3.success).toBe(true);
      expect(r3.remaining).toBe(0); // max=1, used 1 → 0 remaining

      // Restore Date.now
      Date.now = originalNow;
    });
  });
});

describe('getClientIp', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = {
      headers: { get: (name: string) => name === 'x-forwarded-for' ? '203.0.113.50, 70.41.3.18' : null },
    };
    expect(getClientIp(request)).toBe('203.0.113.50');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = {
      headers: { get: (name: string) => name === 'x-real-ip' ? '198.51.100.25' : null },
    };
    expect(getClientIp(request)).toBe('198.51.100.25');
  });

  it('should return "unknown" when no IP headers are present', () => {
    const request = {
      headers: { get: () => null },
    };
    expect(getClientIp(request)).toBe('unknown');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const request = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '1.2.3.4';
          if (name === 'x-real-ip') return '5.6.7.8';
          return null;
        },
      },
    };
    expect(getClientIp(request)).toBe('1.2.3.4');
  });
});

describe('RATE_LIMITS presets', () => {
  it('should have correct AUTH_LOGIN preset', () => {
    expect(RATE_LIMITS.AUTH_LOGIN.windowMs).toBe(15 * 60 * 1000);
    expect(RATE_LIMITS.AUTH_LOGIN.max).toBe(5);
  });

  it('should have correct AUTH_REGISTER preset', () => {
    expect(RATE_LIMITS.AUTH_REGISTER.windowMs).toBe(15 * 60 * 1000);
    expect(RATE_LIMITS.AUTH_REGISTER.max).toBe(3);
  });

  it('should have correct AUTH_PASSWORD preset', () => {
    expect(RATE_LIMITS.AUTH_PASSWORD.windowMs).toBe(15 * 60 * 1000);
    expect(RATE_LIMITS.AUTH_PASSWORD.max).toBe(5);
  });

  it('should have correct GENERAL_READ preset', () => {
    expect(RATE_LIMITS.GENERAL_READ.windowMs).toBe(60 * 1000);
    expect(RATE_LIMITS.GENERAL_READ.max).toBe(240);
  });

  it('should have correct GENERAL_WRITE preset', () => {
    expect(RATE_LIMITS.GENERAL_WRITE.windowMs).toBe(60 * 1000);
    expect(RATE_LIMITS.GENERAL_WRITE.max).toBe(60);
  });
});
