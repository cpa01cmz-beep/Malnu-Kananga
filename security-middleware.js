// Security middleware for Cloudflare Worker
export class SecurityMiddleware {
  // Rate limiting store (in production, use KV or D1)
  static rateLimitStore = new Map();
  
  // Rate limiting configuration
  static RATE_LIMITS = {
    '/api/chat': { windowMs: 60000, maxRequests: 10 }, // 10 requests per minute
    '/api/student-support': { windowMs: 60000, maxRequests: 5 }, // 5 requests per minute
    '/request-login-link': { windowMs: 900000, maxRequests: 3 }, // 3 requests per 15 minutes
    'default': { windowMs: 60000, maxRequests: 20 } // 20 requests per minute for other endpoints
  };

  // Input validation patterns
  static VALIDATION_PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    studentId: /^[a-zA-Z0-9]{1,50}$/,
    message: /^[\s\S]{1,1000}$/,
    token: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
  };

  // Check rate limiting
  static checkRateLimit(clientId, endpoint) {
    const now = Date.now();
    const limit = this.RATE_LIMITS[endpoint] || this.RATE_LIMITS.default;
    const key = `${clientId}:${endpoint}`;
    
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, {
        requests: [{ timestamp: now }],
        windowStart: now
      });
      return { allowed: true, remaining: limit.maxRequests - 1 };
    }

    const data = this.rateLimitStore.get(key);
    
    // Clean old requests outside the window
    data.requests = data.requests.filter(req => now - req.timestamp < limit.windowMs);
    
    // Reset window if it's expired
    if (now - data.windowStart > limit.windowMs) {
      data.requests = [];
      data.windowStart = now;
    }

    // Check if limit exceeded
    if (data.requests.length >= limit.maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: data.windowStart + limit.windowMs
      };
    }

    // Add new request
    data.requests.push({ timestamp: now });
    return { 
      allowed: true, 
      remaining: limit.maxRequests - data.requests.length - 1
    };
  }

  // Validate input data
  static validateInput(data, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      
      // Required field check
      if (rule.required && (!value || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if field is not provided and not required
      if (!value && !rule.required) {
        continue;
      }
      
      // Type check
      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be of type ${rule.type}`);
        continue;
      }
      
      // Pattern check
      if (rule.pattern && !this.VALIDATION_PATTERNS[rule.pattern].test(value)) {
        errors.push(`${field} format is invalid`);
        continue;
      }
      
      // Length check
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} must not exceed ${rule.maxLength} characters`);
      }
    }
    
    return errors;
  }

  // Get client identifier for rate limiting
  static getClientId(request) {
    // Try to get client IP from various headers
    const cfConnectingIp = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIp = request.headers.get('X-Real-IP');
    
    return cfConnectingIp || xForwardedFor?.split(',')[0] || xRealIp || 'unknown';
  }

  // Security headers
  static getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };
  }

  // Sanitize input to prevent injection
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
}