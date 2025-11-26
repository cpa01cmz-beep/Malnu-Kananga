// Security middleware for Cloudflare Worker
class SecurityMiddleware {
  constructor(env) {
    this.env = env;
    this.rateLimitStore = new Map();
  }

  // Enhanced rate limiting with multiple tiers
  isRateLimitExceeded(clientId, endpoint = 'default') {
    const now = Date.now();
    const limits = {
      'default': { limit: 100, windowMs: 60000 },
      'auth': { limit: 10, windowMs: 60000 },
      'ai': { limit: 50, windowMs: 60000 },
      'upload': { limit: 5, windowMs: 60000 }
    };
    
    const config = limits[endpoint] || limits['default'];
    const key = `${clientId}:${endpoint}`;
    const clientData = this.rateLimitStore.get(key);

    if (!clientData) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now
      });
      return false;
    }

    if (now > clientData.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now
      });
      return false;
    }

    clientData.count++;
    
    // Progressive rate limiting for abusive clients
    if (clientData.count > config.limit * 2) {
      return true; // Hard block
    }
    
    return clientData.count > config.limit;
  }

  // Enhanced input validation and sanitization
  validateInput(data, type = 'string') {
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

  // Sanitize input data
  sanitizeInput(data, type = 'string') {
    if (typeof data !== 'string') return data;
    
    // Remove potentially dangerous characters
    let sanitized = data
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control characters
      .replace(/[\uFFFE\uFFFF]/g, '') // Invalid Unicode
      .trim();
    
    // Additional sanitization for specific types
    if (type === 'message') {
      sanitized = sanitized.replace(/<[^>]*>/g, ''); // Remove HTML tags
    }
    
    return sanitized;
  }

  // SQL injection prevention
  sanitizeSqlInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove SQL injection patterns
    return input
      .replace(/['"\\;]/g, '') // Remove quotes and semicolons
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove SQL block comments
      .trim();
  }

  // Enhanced security headers with comprehensive CSP
  getSecurityHeaders() {
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
  isBlockedIP(clientId) {
    const blockedIPs = this.env.BLOCKED_IPS?.split(',') || [];
    return blockedIPs.includes(clientId);
  }

  // Geographic blocking (optional)
  isAllowedCountry(request) {
    const cf = request.cf;
    const allowedCountries = this.env.ALLOWED_COUNTRIES?.split(',') || ['ID']; // Default to Indonesia
    return allowedCountries.includes(cf?.country);
  }

  // Request size validation
  validateRequestSize(request, maxSize = 10 * 1024 * 1024) { // 10MB default
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      return false;
    }
    return true;
  }

  // Bot detection
  isSuspiciousUserAgent(userAgent) {
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
  getClientId(request) {
    const cf = request.cf;
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For') || 
               'unknown';
    
    // Create a more unique client identifier
    const userAgent = request.headers.get('User-Agent') || '';
    const fingerprint = this.createFingerprint(ip, userAgent);
    
    return {
      ip: ip,
      fingerprint: fingerprint,
      country: cf?.country || 'unknown',
      colo: cf?.colo || 'unknown'
    };
  }

  // Create device fingerprint for enhanced tracking
  createFingerprint(ip, userAgent) {
    const crypto = require('crypto');
    const data = `${ip}:${userAgent}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  // Comprehensive security check
  async performSecurityCheck(request, endpoint = 'default') {
    const clientInfo = this.getClientId(request);
    const userAgent = request.headers.get('User-Agent') || '';
    
    // Check blocked IPs
    if (this.isBlockedIP(clientInfo.ip)) {
      return { allowed: false, reason: 'IP blocked' };
    }
    
    // Check geographic restrictions
    if (!this.isAllowedCountry(request)) {
      return { allowed: false, reason: 'Country not allowed' };
    }
    
    // Check rate limiting
    if (this.isRateLimitExceeded(clientInfo.fingerprint, endpoint)) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }
    
    // Check request size
    if (!this.validateRequestSize(request)) {
      return { allowed: false, reason: 'Request too large' };
    }
    
    // Check for suspicious user agents
    if (this.isSuspiciousUserAgent(userAgent) && endpoint === 'auth') {
      return { allowed: false, reason: 'Suspicious user agent' };
    }
    
    return { allowed: true, clientInfo };
  }
}

export default SecurityMiddleware;