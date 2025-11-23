// CSRF Protection Middleware
// Implements Double Submit Cookie pattern for CSRF protection

// Generate cryptographically secure random string
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return generateRandomString(32);
}

// Validate CSRF token from request
export function validateCSRFToken(request: Request): boolean {
  const cookieToken = getCSRFTokenFromCookie(request);
  const headerToken = getCSRFTokenFromHeader(request);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(cookieToken, headerToken);
}

// Get CSRF token from cookie
function getCSRFTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const csrfCookie = cookies.find(cookie => cookie.startsWith('csrf_token='));
  
  return csrfCookie ? csrfCookie.substring('csrf_token='.length) : null;
}

// Get CSRF token from header
function getCSRFTokenFromHeader(request: Request): string | null {
  return request.headers.get('X-CSRF-Token');
}

// Constant-time comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Set CSRF token cookie
export function setCSRFTokenCookie(response: Response, token: string): Response {
  const cookieValue = `csrf_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`;
  
  response.headers.set('Set-Cookie', cookieValue);
  response.headers.set('X-CSRF-Token', token);
  
  return response;
}

// Middleware to protect routes from CSRF attacks
export function csrfProtection(request: Request): { valid: boolean; error?: string } {
  // Skip CSRF validation for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(request.method)) {
    return { valid: true };
  }
  
  // Validate CSRF token for state-changing methods
  if (!validateCSRFToken(request)) {
    return {
      valid: false,
      error: 'CSRF token validation failed. Please refresh the page and try again.'
    };
  }
  
  return { valid: true };
}

// Check if request needs CSRF protection
export function needsCSRFProtection(request: Request): boolean {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const protectedPaths = ['/api/', '/edit', '/delete', '/update', '/create'];
  
  // Skip for safe methods
  if (safeMethods.includes(request.method)) {
    return false;
  }
  
  // Check if path matches protected patterns
  const url = new URL(request.url);
  return protectedPaths.some(path => url.pathname.startsWith(path));
}