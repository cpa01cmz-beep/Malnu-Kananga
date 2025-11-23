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

  // Input validation and sanitization
  validateInput(data, type = 'string') {
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(data);
    }
    
    if (type === 'string') {
      // Basic XSS prevention
      return typeof data === 'string' && 
             !data.includes('<script>') && 
             !data.includes('javascript:') &&
             data.length < 10000;
    }
    
    return false;
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