// Missing security functions for worker.js
// Implements authentication and CSRF protection

// Security object with validation functions
const security = {
  validateInput(input, type) {
    if (!input || typeof input !== 'string') {
      return false;
    }
    
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) && input.length <= 254;
      case 'general':
        return input.length > 0 && input.length <= 1000;
      default:
        return false;
    }
  },
  
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .substring(0, 1000);
  }
};

// Authentication function
function isAuthenticated(request, securityLogger, endpoint) {
  try {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      securityLogger?.logUnauthorizedAccess(
        getClientIP(request), 
        endpoint, 
        false
      );
      return false;
    }
    
    // Extract auth session cookie
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    
    const token = cookies['__Host-auth_session'] || cookies['auth_session'];
    
    if (!token) {
      securityLogger?.logUnauthorizedAccess(
        getClientIP(request), 
        endpoint, 
        false
      );
      return false;
    }
    
    // Verify token (this would use env.SECRET_KEY in real implementation)
    // For now, just check token format
    const parts = token.split('.');
    if (parts.length !== 3) {
      securityLogger?.logUnauthorizedAccess(
        getClientIP(request), 
        endpoint, 
        false
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

// CSRF Token validation function
function validateCSRFToken(request, securityLogger, endpoint) {
  try {
    const cookieHeader = request.headers.get('Cookie');
    const csrfHeader = request.headers.get('X-CSRF-Token');
    
    if (!cookieHeader || !csrfHeader) {
      securityLogger?.logCSRFViolation(getClientIP(request), endpoint);
      return false;
    }
    
    // Extract CSRF token from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    
    const cookieCsrfToken = cookies['csrf_token'];
    
    if (!cookieCsrfToken || cookieCsrfToken !== csrfHeader) {
      securityLogger?.logCSRFViolation(getClientIP(request), endpoint);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

// CSRF Token generation function
function generateCSRFToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Export for use in worker.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    security,
    isAuthenticated,
    validateCSRFToken,
    generateCSRFToken
  };
}