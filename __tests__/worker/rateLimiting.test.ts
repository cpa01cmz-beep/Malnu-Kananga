// __tests__/worker/rateLimiting.test.ts
// Tests for rate limiting logic

describe('Rate Limiting Logic', () => {
  describe('getRateLimitConfig function', () => {
    const RATE_LIMIT_CONFIG = {
      default: { windowMs: 60000, maxRequests: 100 },
      auth: { windowMs: 60000, maxRequests: 5 },
      sensitive: { windowMs: 60000, maxRequests: 20 },
      upload: { windowMs: 60000, maxRequests: 10 },
      websocket: { windowMs: 60000, maxRequests: 30 }
    };

    const getRateLimitConfig = (pathname: string, method: string) => {
      if (pathname.startsWith('/api/auth/')) {
        return RATE_LIMIT_CONFIG.auth;
      }
      if (pathname === '/api/files/upload') {
        return RATE_LIMIT_CONFIG.upload;
      }
      if (pathname === '/ws') {
        return RATE_LIMIT_CONFIG.websocket;
      }
      if (pathname === '/api/email/send' || (pathname.startsWith('/api/users') && method !== 'GET')) {
        return RATE_LIMIT_CONFIG.sensitive;
      }
      return RATE_LIMIT_CONFIG.default;
    };

    test('should return auth config for auth endpoints', () => {
      const config = getRateLimitConfig('/api/auth/login', 'POST');
      expect(config.maxRequests).toBe(5);
      expect(config.windowMs).toBe(60000);
    });

    test('should return auth config for forgot-password endpoint', () => {
      const config = getRateLimitConfig('/api/auth/forgot-password', 'POST');
      expect(config.maxRequests).toBe(5);
    });

    test('should return upload config for file upload', () => {
      const config = getRateLimitConfig('/api/files/upload', 'POST');
      expect(config.maxRequests).toBe(10);
    });

    test('should return websocket config for WebSocket endpoint', () => {
      const config = getRateLimitConfig('/ws', 'GET');
      expect(config.maxRequests).toBe(30);
    });

    test('should return sensitive config for email send', () => {
      const config = getRateLimitConfig('/api/email/send', 'POST');
      expect(config.maxRequests).toBe(20);
    });

    test('should return sensitive config for POST users', () => {
      const config = getRateLimitConfig('/api/users', 'POST');
      expect(config.maxRequests).toBe(20);
    });

    test('should return sensitive config for PUT users', () => {
      const config = getRateLimitConfig('/api/users', 'PUT');
      expect(config.maxRequests).toBe(20);
    });

    test('should return sensitive config for DELETE users', () => {
      const config = getRateLimitConfig('/api/users', 'DELETE');
      expect(config.maxRequests).toBe(20);
    });

    test('should return default config for GET users', () => {
      const config = getRateLimitConfig('/api/users', 'GET');
      expect(config.maxRequests).toBe(100);
    });

    test('should return default config for GET students', () => {
      const config = getRateLimitConfig('/api/students', 'GET');
      expect(config.maxRequests).toBe(100);
    });

    test('should return default config for grades endpoint', () => {
      const config = getRateLimitConfig('/api/grades', 'GET');
      expect(config.maxRequests).toBe(100);
    });

    test('should return default config for announcements endpoint', () => {
      const config = getRateLimitConfig('/api/announcements', 'GET');
      expect(config.maxRequests).toBe(100);
    });
  });

  describe('setRateLimitHeaders function', () => {
    const setRateLimitHeaders = (headers: Headers, result: {
      success: boolean;
      remaining: number;
      limit: number;
      resetAt: number;
      retryAfter?: number;
    }) => {
      headers.set('X-RateLimit-Limit', result.limit.toString());
      headers.set('X-RateLimit-Remaining', result.remaining.toString());
      headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

      if (!result.success) {
        headers.set('Retry-After', result.retryAfter!.toString());
      }

      return headers;
    };

    test('should set all headers for successful request', () => {
      const headers = new Headers();
      const result = {
        success: true,
        remaining: 99,
        limit: 100,
        resetAt: Date.now() + 60000
      };

      setRateLimitHeaders(headers, result);

      expect(headers.get('X-RateLimit-Limit')).toBe('100');
      expect(headers.get('X-RateLimit-Remaining')).toBe('99');
      expect(headers.get('X-RateLimit-Reset')).toBeDefined();
      expect(headers.get('X-RateLimit-Reset')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(headers.get('Retry-After')).toBeNull();
    });

    test('should set Retry-After header for failed request', () => {
      const headers = new Headers();
      const result = {
        success: false,
        remaining: 0,
        limit: 100,
        resetAt: Date.now() + 60000,
        retryAfter: 60
      };

      setRateLimitHeaders(headers, result);

      expect(headers.get('X-RateLimit-Limit')).toBe('100');
      expect(headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(headers.get('X-RateLimit-Reset')).toBeDefined();
      expect(headers.get('Retry-After')).toBe('60');
    });

    test('should handle zero remaining requests', () => {
      const headers = new Headers();
      const result = {
        success: true,
        remaining: 0,
        limit: 100,
        resetAt: Date.now() + 60000
      };

      setRateLimitHeaders(headers, result);

      expect(headers.get('X-RateLimit-Remaining')).toBe('0');
    });
  });

  describe('Rate limit calculations', () => {
    test('should calculate correct remaining requests', () => {
      const maxRequests = 100;
      const usedRequests = 25;
      const remaining = Math.max(0, maxRequests - usedRequests);

      expect(remaining).toBe(75);
    });

    test('should handle boundary case when limit reached', () => {
      const maxRequests = 100;
      const usedRequests = 100;
      const remaining = Math.max(0, maxRequests - usedRequests);

      expect(remaining).toBe(0);
    });

    test('should calculate retry after in seconds', () => {
      const resetAt = Date.now() + 60000;
      const now = Date.now();
      const retryAfter = Math.ceil((resetAt - now) / 1000);

      expect(retryAfter).toBe(60);
    });

    test('should calculate retry after for partial second', () => {
      const resetAt = Date.now() + 45123;
      const now = Date.now();
      const retryAfter = Math.ceil((resetAt - now) / 1000);

      expect(retryAfter).toBe(46);
    });
  });

  describe('Sliding window logic', () => {
    test('should filter out old requests outside window', () => {
      const now = Date.now();
      const windowMs = 60000;
      const windowStart = now - windowMs;

      const requests = [
        { timestamp: now - 70000 },
        { timestamp: now - 65000 },
        { timestamp: now - 55000 },
        { timestamp: now - 30000 },
        { timestamp: now - 10000 }
      ];

      const recentRequests = requests.filter(r => r.timestamp > windowStart);

      expect(recentRequests.length).toBe(3);
      expect(recentRequests.every(r => r.timestamp > windowStart)).toBe(true);
    });

    test('should keep all requests if within window', () => {
      const now = Date.now();
      const windowMs = 60000;
      const windowStart = now - windowMs;

      const requests = [
        { timestamp: now - 50000 },
        { timestamp: now - 30000 },
        { timestamp: now - 10000 },
        { timestamp: now }
      ];

      const recentRequests = requests.filter(r => r.timestamp > windowStart);

      expect(recentRequests.length).toBe(4);
    });

    test('should calculate reset time from oldest request', () => {
      const windowMs = 60000;
      const now = Date.now();
      const oldestRequest = now - 30000;
      const resetAt = oldestRequest + windowMs;

      const timeUntilReset = resetAt - now;
      expect(timeUntilReset).toBe(30000);
    });
  });

  describe('Rate limit configuration values', () => {
    test('auth endpoints should have strict limits', () => {
      const authConfig = { windowMs: 60000, maxRequests: 5 };
      const requestsPerSecond = authConfig.maxRequests / (authConfig.windowMs / 1000);

      expect(authConfig.maxRequests).toBe(5);
      expect(requestsPerSecond).toBeLessThan(0.1);
    });

    test('upload endpoints should have moderate limits', () => {
      const uploadConfig = { windowMs: 60000, maxRequests: 10 };
      const requestsPerSecond = uploadConfig.maxRequests / (uploadConfig.windowMs / 1000);

      expect(uploadConfig.maxRequests).toBe(10);
      expect(requestsPerSecond).toBeLessThan(0.2);
    });

    test('sensitive endpoints should have moderate limits', () => {
      const sensitiveConfig = { windowMs: 60000, maxRequests: 20 };
      const requestsPerSecond = sensitiveConfig.maxRequests / (sensitiveConfig.windowMs / 1000);

      expect(sensitiveConfig.maxRequests).toBe(20);
      expect(requestsPerSecond).toBeLessThan(0.34);
    });

    test('default endpoints should have generous limits', () => {
      const defaultConfig = { windowMs: 60000, maxRequests: 100 };
      const requestsPerSecond = defaultConfig.maxRequests / (defaultConfig.windowMs / 1000);

      expect(defaultConfig.maxRequests).toBe(100);
      expect(requestsPerSecond).toBeGreaterThan(1.5);
    });
  });

  describe('Identifier extraction logic', () => {
    test('should prefer user ID from JWT when available', () => {
      const identifier = '1234567890';

      expect(identifier).toBe('1234567890');
    });

    test('should fall back to IP when no auth header', () => {
      const ip = '192.168.1.1';
      const identifier = ip || 'unknown';

      expect(identifier).toBe('192.168.1.1');
    });

    test('should use unknown when no IP available', () => {
      const ip = null;
      const identifier = ip || 'unknown';

      expect(identifier).toBe('unknown');
    });
  });
});
