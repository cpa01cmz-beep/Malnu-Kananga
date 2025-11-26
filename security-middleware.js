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

  // Enhanced input validation with comprehensive XSS prevention
  static validateInput(data, type = 'string') {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(data) && data.length <= 254;
    }
    
    if (type === 'string') {
      // Comprehensive XSS prevention - enhanced security patterns
      const dangerousPatterns = [
        // Script injection patterns
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
        /data:application\/javascript/gi,
        
        // Event handler patterns
        /on\w+\s*=/gi,
        /onclick\s*=/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onmouseover\s*=/gi,
        
        // HTML injection patterns
        /<iframe\b[^>]*>/gi,
        /<object\b[^>]*>/gi,
        /<embed\b[^>]*>/gi,
        /<link\b[^>]*>/gi,
        /<meta\b[^>]*>/gi,
        /<form\b[^>]*>/gi,
        /<input\b[^>]*>/gi,
        
        // CSS injection patterns
        /expression\s*\(/gi,
        /@import/gi,
        /behavior\s*:/gi,
        /binding\s*:/gi,
        
        // Protocol injection
        /file:\/\//gi,
        /ftp:\/\//gi,
        /mailto:/gi,
        
        // Encoding attacks
        /%3cscript/gi,
        /%3e/gi,
        /&#x3c;script/gi,
        /&#60;script/gi
      ];
      
      return typeof data === 'string' && 
             data.length <= 10000 &&
             !dangerousPatterns.some(pattern => pattern.test(data));
    }
    
    if (type === 'message') {
      // For AI chat messages
      return typeof data === 'string' && 
             data.length >= 1 && 
             data.length <= 5000 &&
             !/<script|javascript:|on\w+\s*=/i.test(data);
    }
    
    if (type === 'id') {
      // For database IDs
      return /^[a-zA-Z0-9\-_]{1,50}$/.test(data);
    }
    
    if (type === 'number') {
      return !isNaN(data) && isFinite(data);
    }
    
    return false;
  }

  // Validate input data using rules (for compatibility)
  static validateInputWithRules(data, rules) {
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

  // Sanitize input data
  static sanitizeInput(input, type = 'string') {
    if (typeof input !== 'string') return input;
    
    // Remove potentially dangerous characters
    let sanitized = input
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
      .replace(/[\uFFFE\uFFFF]/g, '') // Invalid Unicode
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
    
    // Additional sanitization for specific types
    if (type === 'message') {
      sanitized = sanitized.replace(/<[^>]*>/g, ''); // Remove HTML tags
    }
    
    return sanitized;
  }

  // SQL injection prevention
  static sanitizeSqlInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove SQL injection patterns
    return input
      .replace(/['"\\;]/g, '') // Remove quotes and semicolons
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove SQL block comments
      .trim();
  }

  // Get client identifier for rate limiting
  static getClientId(request) {
    // Try to get client IP from various headers
    const cfConnectingIp = request.headers.get('CF-Connecting-IP');
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    const xRealIp = request.headers.get('X-Real-IP');
    
    return cfConnectingIp || xForwardedFor?.split(',')[0] || xRealIp || 'unknown';
  }

  // Enhanced security headers with comprehensive CSP
  static getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Comprehensive Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self';",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';", // Required for React development
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
        "img-src 'self' data: https: https://images.unsplash.com;",
        "font-src 'self' https://fonts.gstatic.com;",
        "connect-src 'self' https: wss:;", // Allow WebSocket and HTTPS
        "frame-src 'none';",
        "frame-ancestors 'none';",
        "form-action 'self';",
        "base-uri 'self';",
        "manifest-src 'self';",
        "worker-src 'self' blob:;",
        "object-src 'none';",
        "media-src 'self';",
        "prefetch-src 'self';"
      ].join(' '),
      
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Cross-Origin-Opener-Policy': 'same-origin'
    };
  }

  // IP-based blocking for suspicious activity
  static isBlockedIP(clientId, env) {
    const blockedIPs = env?.BLOCKED_IPS?.split(',') || [];
    return blockedIPs.includes(clientId);
  }

  // Geographic blocking (optional)
  static isAllowedCountry(request, env) {
    const cf = request.cf;
    const allowedCountries = env?.ALLOWED_COUNTRIES?.split(',') || ['ID']; // Default to Indonesia
    return allowedCountries.includes(cf?.country);
  }

  // Request size validation
  static validateRequestSize(request, maxSize = 10 * 1024 * 1024) { // 10MB default
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      return false;
    }
    return true;
  }

  // Bot detection
  static isSuspiciousUserAgent(userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scraper/i,
      /spider/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /go-http/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  // Enhanced client identification for rate limiting
  static getClientInfo(request) {
    const cf = request.cf;
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For') || 
               'unknown';
    
    // Create a more unique client identifier
    const userAgent = request.headers.get('User-Agent') || '';
    const fingerprint = SecurityMiddleware.createFingerprint(ip, userAgent);
    
    return {
      ip: ip,
      fingerprint: fingerprint,
      country: cf?.country || 'unknown',
      colo: cf?.colo || 'unknown'
    };
  }

  // Create device fingerprint for enhanced tracking
  static createFingerprint(ip, userAgent) {
    const encoder = new TextEncoder();
    const data = `${ip}:${userAgent}`;
    // Use Web Crypto API to create hash
    const hashBuffer = new Uint8Array(32); // Placeholder - in real implementation, use crypto.subtle
    // For Cloudflare Workers, we'll just use a simple approach
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  }

  // Comprehensive security check
  static async performSecurityCheck(request, env, endpoint = 'default') {
    const clientInfo = SecurityMiddleware.getClientInfo(request);
    const userAgent = request.headers.get('User-Agent') || '';
    
    // Check blocked IPs
    if (SecurityMiddleware.isBlockedIP(clientInfo.ip, env)) {
      return { allowed: false, reason: 'IP blocked' };
    }
    
    // Check geographic restrictions
    if (!SecurityMiddleware.isAllowedCountry(request, env)) {
      return { allowed: false, reason: 'Country not allowed' };
    }
    
    // Check rate limiting
    const clientId = SecurityMiddleware.getClientId(request);
    const rateLimitResult = SecurityMiddleware.checkRateLimit(clientId, endpoint);
    if (!rateLimitResult.allowed) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }
    
    // Check request size
    if (!SecurityMiddleware.validateRequestSize(request)) {
      return { allowed: false, reason: 'Request too large' };
    }
    
    // Check for suspicious user agents
    if (SecurityMiddleware.isSuspiciousUserAgent(userAgent) && endpoint === 'auth') {
      return { allowed: false, reason: 'Suspicious user agent' };
    }
    
    return { allowed: true, clientInfo };
  }
}