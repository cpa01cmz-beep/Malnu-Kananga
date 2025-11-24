// Security middleware for Cloudflare Worker
class SecurityMiddleware {
  constructor(env) {
    this.env = env;
    this.rateLimitStore = new Map();
  }

  // Enhanced rate limiting with multiple tiers
  isRateLimitExceeded(clientId, maxRequests = 100, windowMs = 60000, endpoint = 'default') {
    const now = Date.now();
    
    // SECURITY: Validate inputs
    if (!clientId || typeof clientId !== 'string') {
      console.warn('SECURITY: Invalid clientId for rate limiting');
      return true; // Block invalid requests
    }
    
    const key = `${clientId}:${endpoint}`;
    const clientData = this.rateLimitStore.get(key);

    if (!clientData) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      });
      return false;
    }

    if (now > clientData.resetTime) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      });
      return false;
    }

    clientData.count++;
    
    // Progressive rate limiting for abusive clients
    if (clientData.count > maxRequests * 2) {
      console.warn(`SECURITY: Hard block for abusive client: ${clientId}`);
      return true; // Hard block
    }
    
    const isExceeded = clientData.count > maxRequests;
    if (isExceeded) {
      console.warn(`SECURITY: Rate limit exceeded for client: ${clientId}, count: ${clientData.count}`);
    }
    
    return isExceeded;
  }

  // Enhanced input validation and sanitization
  validateInput(data, type = 'string') {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(data) && data.length <= 254;
    }
    
    if (type === 'string') {
      // Enhanced XSS prevention
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /data:text\/html/i,
        /vbscript:/i,
        /expression\s*\(/i
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
     let sanitized = data;
    
    // Remove control characters using string methods instead of regex to avoid lint error
    const controlChars = ['\0', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', 
                          '\x08', '\x0B', '\x0C', '\x0E', '\x0F', '\x10', '\x11', '\x12', 
                          '\x13', '\x14', '\x15', '\x16', '\x17', '\x18', '\x19', '\x1A', 
                          '\x1B', '\x1C', '\x1D', '\x1E', '\x1F', '\x7F'];
    
    for (const char of controlChars) {
      sanitized = sanitized.split(char).join('');
    }
    
    // Remove invalid Unicode
    sanitized = sanitized.split('\uFFFE').join('').split('\uFFFF').join('');
    
    sanitized = sanitized.trim();
    
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

  // Enhanced security headers
  getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';",
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin'
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
    // SECURITY: Use Web Crypto API instead of Node.js crypto
    const data = `${ip}:${userAgent}`;
    
    // Simple hash implementation for Cloudflare Workers
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
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