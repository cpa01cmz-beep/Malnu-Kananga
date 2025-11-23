// Security middleware for Cloudflare Worker
class SecurityMiddleware {
  constructor(env) {
    this.env = env;
    this.rateLimitStore = new Map();
  }

  // Rate limiting implementation
  isRateLimitExceeded(clientId, limit = 100, windowMs = 60000) {
    const now = Date.now();
    const clientData = this.rateLimitStore.get(clientId);

    if (!clientData) {
      this.rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    if (now > clientData.resetTime) {
      this.rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    clientData.count++;
    return clientData.count > limit;
  }

  // Enhanced input validation and sanitization
  validateInput(data, type = 'string') {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(data) && data.length <= 254;
    }
    
    if (type === 'string') {
      // Enhanced XSS prevention
      return typeof data === 'string' && 
             data.length > 0 && 
             data.length <= 10000 &&
             !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(data) &&
             !/javascript:/gi.test(data) &&
             !/on\w+\s*=/gi.test(data) &&
             !/data:text\/html/gi.test(data);
    }
    
    if (type === 'number') {
      return !isNaN(data) && isFinite(data);
    }
    
    return false;
  }

  // SQL injection prevention
  sanitizeSqlInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove common SQL injection patterns
    return input.replace(/['"\\;]/g, '')
               .replace(/--/g, '')
               .replace(/\/\*/g, '')
               .replace(/\*\//g, '')
               .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '')
               .trim();
  }

  // Enhanced rate limiting with different limits per endpoint
  isRateLimitExceeded(clientId, limit = 100, windowMs = 60000, endpoint = 'default') {
    const now = Date.now();
    const key = `${clientId}:${endpoint}`;
    const clientData = this.rateLimitStore.get(key);

    // Different limits for different endpoints
    const limits = {
      'login': 3,      // 3 attempts per minute
      'api': 50,       // 50 requests per minute
      'default': 100   // 100 requests per minute
    };
    
    const effectiveLimit = limits[endpoint] || limit;

    if (!clientData) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    if (now > clientData.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    clientData.count++;
    return clientData.count > effectiveLimit;
  }

  // Security headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  // Client identification for rate limiting
  getClientId(request) {
    const cf = request.cf;
    return cf?.colo || request.headers.get('CF-Connecting-IP') || 'unknown';
  }
}

export default SecurityMiddleware;