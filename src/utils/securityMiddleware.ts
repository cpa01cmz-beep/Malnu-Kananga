// Security middleware for comprehensive security headers
// This middleware implements OWASP recommended security headers

export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Content Security Policy (CSP) - Prevent XSS and code injection
  headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: https://images.unsplash.com; " +
    "connect-src 'self' https://generativelanguage.googleapis.com https://*.workers.dev; " +
    "frame-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests"
  );
  
  // HTTP Strict Transport Security (HSTS) - Enforce HTTPS
  headers.set('Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // X-Frame-Options - Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options - Prevent MIME sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection - Legacy XSS protection (for older browsers)
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy - Control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy - Control browser features
  headers.set('Permissions-Policy', 
    'geolocation=(), ' +
    'microphone=(), ' +
    'camera=(), ' +
    'payment=(), ' +
    'usb=(), ' +
    'magnetometer=(), ' +
    'gyroscope=(), ' +
    'accelerometer=()'
  );
  
  // Clear Site Data on logout
  headers.set('Clear-Site-Data', '"cache", "cookies", "storage", "executionContexts"');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Security headers for API endpoints (more restrictive)
export function addApiSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // API-specific CSP - More restrictive
  headers.set('Content-Security-Policy', 
    "default-src 'none'; " +
    "script-src 'self'; " +
    "style-src 'self'; " +
    "img-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'"
  );
  
  // Additional API security headers
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// CORS headers with security considerations
export function getSecureCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : 'https://ma-malnukananga.sch.id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin'
  };
}

// Rate limiting headers
export function addRateLimitHeaders(response: Response, limit: number, remaining: number, reset: number): Response {
  const headers = new Headers(response.headers);
  
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', reset.toString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Security validation middleware
export function validateSecureRequest(request: Request): { valid: boolean; error?: string } {
  const url = new URL(request.url);
  
  // Validate protocol
  if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
    return { valid: false, error: 'HTTPS required in production' };
  }
  
  // Validate method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
  if (!allowedMethods.includes(request.method)) {
    return { valid: false, error: 'Method not allowed' };
  }
  
  // Validate content length (prevent DoS)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return { valid: false, error: 'Request too large' };
  }
  
  // Validate user agent (prevent basic bots)
  const userAgent = request.headers.get('user-agent');
  if (!userAgent || userAgent.length < 10) {
    return { valid: false, error: 'Invalid user agent' };
  }
  
  return { valid: true };
}