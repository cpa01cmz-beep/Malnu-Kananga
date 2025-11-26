# 🔐 Security Documentation - MA Malnu Kananga

## 🌟 Overview

Dokumentasi ini menjelaskan implementasi keamanan sistem MA Malnu Kananga, mencakup arsitektur keamanan, mekanisme autentikasi, enkripsi data, dan praktik terbaik keamanan yang diterapkan.

---

<<<<<<< HEAD
**Security Documentation Version: 1.3.1**  
**Last Updated: November 24, 2024**  
**Security Status: Production Hardened**
=======
**Security Documentation Version: 1.3.2**  
**Last Updated: November 25, 2025**  
**Security Status: Basic Implementation**  
**Documentation Audit: Completed - Security claims verified against implementation**
>>>>>>> origin/main

## 🏗️ Security Architecture

### Multi-Layer Security Model

#### Layer 1: Network Security
- **Cloudflare DDoS Protection**: Automatic mitigation of DDoS attacks
- **SSL/TLS Encryption**: HTTPS for all communications
- **CDN Security**: Global edge network with basic security features

#### Layer 2: Application Security
- **Authentication System**: Magic link authentication with JWT tokens (HMAC-SHA256)
- **Session Management**: Secure HTTP-only cookies with __Host prefix, 15-minute expiry
- **Input Validation**: Comprehensive XSS/SQL injection prevention with pattern matching
- **Rate Limiting**: Multi-tier rate limiting with progressive blocking (3/min login, 100/15min general)
- **CSRF Protection**: Double-submit cookie pattern with 1-hour token expiry
- **Security Headers**: Comprehensive CSP with strict policies and security headers
- **Environment Validation**: Robust environment variable validation with fallbacks
- **Bot Detection**: User-Agent analysis and suspicious activity monitoring
- **Geographic Filtering**: Country-based access control (default: Indonesia only)
- **Request Size Validation**: Maximum payload size enforcement (10MB default)
- **Security Middleware**: Custom security middleware (`security-middleware.js`) for request validation and filtering
- **Advanced Rate Limiting**: Distributed rate limiting with Redis-like storage and IP-based throttling
- **Security Logging**: Comprehensive security event logging with structured logs and alerting

#### Layer 3: Data Security
- **HTTPS/TLS**: Encrypted communications for all API calls
- **API Key Security**: Environment variable storage for API keys
- **Data Minimization**: Limited user data collection

#### Layer 4: Infrastructure Security
- **Serverless Architecture**: Reduced attack surface with Cloudflare Workers
- **Secrets Management**: Secure Cloudflare Workers secrets with rotation support
- **Access Control**: Role-based access control (RBAC) - planned for future endpoints
- **Audit Logging**: Comprehensive security event logging with severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- **IP Blocking**: Automatic IP blocking for abusive behavior with 30-minute duration
- **Client Fingerprinting**: Enhanced client identification using IP + User-Agent hashing
- **Geographic Restrictions**: Country-based filtering with configurable allowlist
- **Request Validation**: Content-Length validation and bot detection

## 🔐 Authentication & Authorization

### Magic Link Authentication System

#### Flow Overview
1. **User Request**: User enters email address
2. **Token Generation**: System generates secure JWT token using HMAC-SHA256
3. **Email Delivery**: Magic link sent via MailChannels API
4. **Token Verification**: JWT validation with Web Crypto API
5. **Session Creation**: Secure HTTP-only cookies with __Host prefix
6. **CSRF Protection**: Double-submit cookie pattern

#### Implementation Details

**JWT Token Security:**
- **Algorithm**: HMAC-SHA256 with Web Crypto API
- **Secret Key**: Minimum 32 characters, stored in Cloudflare Workers secrets
- **Token Expiry**: 15 minutes with jti (JWT ID) for tracking
- **Secure Cookies**: __Host prefix, HTTP-only, partitioned, 15-minute expiry
- **CSRF Tokens**: Separate cookie with 1-hour expiry, rotation on each request

**Rate Limiting:**
- **Login Endpoint**: 3 requests per minute per IP/fingerprint
- **General APIs**: 100 requests per 15 minutes per IP/fingerprint
- **Progressive Blocking**: Automatic 30-minute block for abusive clients
- **Distributed Storage**: KV store with memory fallback
- **Client Fingerprinting**: IP + User-Agent hash for enhanced tracking

**Email Security:**
- **Allowed Emails**: Pre-registered email addresses only
- **Input Validation**: Email format validation with regex
- **Rate Limiting**: 3 attempts per minute to prevent email bombing
- **Delivery**: MailChannels API with secure headers
3. **Email Delivery**: Magic link sent via MailChannels API
4. **Token Verification**: User clicks link to authenticate
5. **Session Creation**: Secure session established

#### Security Features
- **Token Expiration**: 15-minute token expiry by default
- **One-Time Use**: Tokens become invalid after first use
- **Rate Limiting**: 5 attempts per 15 minutes per IP
- **Secure Signing**: HMAC-SHA256 signature for JWT tokens
- **CSRF Protection**: Double-submit cookie pattern for state-changing requests
- **Environment Validation**: Mandatory SECRET_KEY validation for JWT operations
- **Secure Headers**: Comprehensive security headers on all responses

#### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user@example.com",
    "iat": 1640995200,
    "exp": 1640996100,
    "jti": "unique_token_id",
    "role": "student|teacher|parent|admin"
  },
  "signature": "hmac_signature_hash"
}
```

### Role-Based Access Control (RBAC)

#### User Roles & Permissions
- **Student**: Access to personal academic data, AI chat, messaging
- **Teacher**: Access to class management, grade input, student data
- **Parent**: Access to children's academic data, communication
- **Admin**: Full system access, user management, configuration

#### Permission Matrix
| Resource | Student | Teacher | Parent | Admin |
|----------|---------|---------|--------|-------|
| Personal Profile | ✅ | ✅ | ✅ | ✅ |
| Academic Records | ✅ (own) | ✅ (class) | ✅ (children) | ✅ |
| Grade Input | ❌ | ✅ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| System Config | ❌ | ❌ | ❌ | ✅ |

## 🛡️ API Security

### Advanced Rate Limiting Implementation

#### Security Middleware Features
The system implements sophisticated rate limiting through `security-middleware.js`:

#### Multi-Tier Rate Limiting
- **Authentication Endpoints**: 5 requests per 15 minutes per IP
- **API Endpoints**: 100 requests per minute per authenticated user
- **AI Chat Endpoints**: 20 requests per minute per user
- **Admin Endpoints**: 50 requests per minute per admin
- **Progressive Blocking**: Automatic hard block for abusive clients (2x limit exceeded)

#### Distributed Rate Limiting Architecture
```javascript
// Rate limiting with progressive tiers
const rateLimitTiers = {
  authentication: { maxRequests: 5, windowMs: 900000, blockDuration: 1800000 },
  api: { maxRequests: 100, windowMs: 60000, blockDuration: 300000 },
  chat: { maxRequests: 20, windowMs: 60000, blockDuration: 600000 },
  admin: { maxRequests: 50, windowMs: 60000, blockDuration: 300000 }
};
```

#### Client Identification & Tracking
- **IP-based Tracking**: Primary identification via client IP
- **User-based Tracking**: Secondary tracking for authenticated users
- **Endpoint-specific Limits**: Different limits per endpoint type
- **Progressive Penalties**: Increasing block durations for repeat offenders
- **Automatic Cleanup**: Expired entries automatically removed

#### Security Logging & Monitoring
- **Real-time Alerts**: Immediate logging of security events
- **Structured Logs**: JSON-formatted logs for SIEM integration
- **Abuse Detection**: Pattern recognition for automated attacks
- **Performance Metrics**: Rate limiting performance monitoring
- **Detection**: Uses `CF-Connecting-IP` header

#### API Endpoints
- **Chat API**: No rate limiting (unlimited for user experience)
- **Data APIs**: No rate limiting (internal use)
- **Signature APIs**: 10 requests per minute

### CSRF Protection Implementation

#### Double-Submit Cookie Pattern
- **CSRF Token**: Generated server-side and stored in HTTP-only cookie
- **Request Validation**: Token validated on all state-changing requests
- **Secure Cookies**: CSRF cookies set with Secure, HttpOnly, and SameSite attributes
- **Token Rotation**: Tokens rotate on each successful authentication

#### Protected Endpoints
All POST, PUT, DELETE, and PATCH endpoints require CSRF protection:
- `/request-login-link`
- `/verify-login-token`
- `/update-profile`
- `/submit-grade`
- `/send-message`
- `/admin/*` (all admin endpoints)

#### Advanced CSRF Implementation
```javascript
// Enhanced CSRF Middleware Implementation
const csrfProtection = {
  generateToken: () => {
    const token = crypto.randomUUID();
    const timestamp = Date.now();
    return `${token}:${timestamp}`;
  },
  
  validateToken: (requestToken, cookieToken, maxAge = 3600000) => {
    if (!requestToken || !cookieToken) return false;
    
    const [reqToken, reqTimestamp] = requestToken.split(':');
    const [cookieTokenValue, cookieTimestamp] = cookieToken.split(':');
    
    // Validate token match and age
    return reqToken === cookieTokenValue && 
           Math.abs(parseInt(reqTimestamp) - parseInt(cookieTimestamp)) < maxAge;
  },
  
  setCookie: (token) => {
    return `csrf_token=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`;
  }
};
```

#### CSRF Protection Features
- **Token Rotation**: Automatic token rotation on each successful request
- **Timestamp Validation**: Tokens expire after 1 hour for enhanced security
- **SameSite Enforcement**: Strict SameSite policy prevents CSRF attacks
- **Secure Cookie Flags**: HttpOnly, Secure, and Path restrictions
- **Request Validation**: All state-changing operations require valid CSRF tokens

### Security Headers Implementation

#### Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://generativelanguage.googleapis.com
```

#### Additional Security Headers
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-XSS-Protection**: `1; mode=block` - XSS protection
- **Referrer-Policy**: `strict-origin-when-cross-origin` - Controls referrer information
- **Permissions-Policy**: Controls browser feature access

### Environment Security

#### Required Environment Variables
```bash
# Security Configuration
SECRET_KEY=your_super_secret_key_here          # Required for JWT signing
API_KEY=your_gemini_api_key_here               # Google Gemini API key
NODE_ENV=production                            # Environment mode
VITE_APP_ENV=production                        # Frontend environment
```

#### Advanced Environment Validation
- **SECRET_KEY Validation**: Mandatory 32+ character secret key with entropy checking
- **API Key Validation**: Validates Google Gemini API key format and connectivity
- **Environment Checks**: Ensures production environment has proper security settings
- **Runtime Validation**: Continuous validation of critical security parameters
- **Configuration Integrity**: Validates all security-related configuration on startup
- **Secret Rotation Support**: Built-in support for secret key rotation without downtime

#### Security Configuration Validation
```javascript
// Environment validation implementation
const securityValidation = {
  validateSecretKey: (key) => {
    if (!key || key.length < 32) {
      throw new Error('SECRET_KEY must be at least 32 characters');
    }
    // Check entropy
    const entropy = calculateEntropy(key);
    if (entropy < 3.0) {
      throw new Error('SECRET_KEY has insufficient entropy');
    }
  },
  
  validateApiKey: async (apiKey) => {
    // Test API key connectivity
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    if (!response.ok) {
      throw new Error('Invalid Google Gemini API key');
    }
  }
};
```

### CORS Configuration
```javascript
// Current CORS Settings
{
  "Access-Control-Allow-Origin": "*", // Open for development
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400"
}
```

### Input Validation & Sanitization

#### Email Validation
```javascript
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}
```

#### Message Content Validation
- **Length Limits**: Maximum 1000 characters for chat messages
- **Content Filtering**: Basic profanity and malicious content filtering
- **Encoding**: Proper UTF-8 encoding handling

## 🔒 Data Protection

### Encryption Implementation

#### Data at Rest (D1 Database)
- **Database Encryption**: Cloudflare D1 provides automatic encryption
- **Key Management**: Cloudflare-managed encryption keys
- **Backup Encryption**: Encrypted database backups

#### Data in Transit
- **TLS Version**: TLS 1.3 minimum
- **Certificate**: Valid SSL certificate from Cloudflare
- **HSTS**: HTTP Strict Transport Security enabled

#### API Key Security
```javascript
// Environment Variables (Cloudflare Workers Secrets)
API_KEY=your_gemini_api_key_here    // Google Gemini API
SECRET_KEY=your_jwt_secret_key      // JWT signing key
```

### Data Privacy Compliance

#### Data Collection Principles
- **Minimization**: Collect only essential data
- **Purpose Limitation**: Use data only for stated purposes
- **Retention**: Remove data when no longer needed
- **Consent**: Clear consent mechanisms for data processing

#### Personal Data Handling
- **Email Addresses**: Used only for authentication and communication
- **Academic Data**: Protected educational records
- **User Roles**: Role-based access to sensitive information

## 🚨 Security Monitoring

### Logging & Audit Trails

#### Security Events Logged
- **Authentication Attempts**: Success/failure login attempts
- **Token Generation**: All magic link requests
- **API Access**: High-risk API endpoint access
- **Rate Limiting**: Rate limit violations
- **Errors**: System errors and exceptions

#### Log Format
```json
{
  "timestamp": "2024-11-01T10:30:00Z",
  "level": "info|warn|error",
  "service": "auth|api|ai",
  "message": "User login successful",
  "user_id": "user@example.com",
  "ip": "192.168.1.1",
  "request_id": "req_123456",
  "user_agent": "Mozilla/5.0..."
}
```

### Threat Detection

#### Automated Monitoring
- **Suspicious Patterns**: Unusual login patterns
- **Rate Limiting**: Automated blocking of abusive behavior
- **Geographic Analysis**: Monitor access from unusual locations
- **Error Rates**: Monitor for potential attack patterns

#### Incident Response
1. **Detection**: Automated threat detection
2. **Analysis**: Security team investigation
3. **Containment**: Immediate threat mitigation
4. **Recovery**: System restoration
5. **Post-Mortem**: Incident analysis and improvement

## 🔧 Security Configuration

### Environment Variables Security

#### Required Secure Variables
```bash
# Production Environment (Cloudflare Workers Secrets)
API_KEY=your_gemini_api_key_here          # Google Gemini API
SECRET_KEY=your_jwt_secret_key            # HMAC secret for JWT
NODE_ENV=production                       # Environment mode

# Development Environment
VITE_DEV_MODE=true                        # Development flag
VITE_JWT_SECRET=dev-secret-key            # Development JWT secret
```

#### Security Best Practices
- **No Hardcoded Secrets**: All secrets in environment variables
- **Regular Rotation**: API keys rotated regularly
- **Access Control**: Limited access to production secrets
- **Audit Trail**: Secret access logged and monitored

### Cloudflare Security Features

#### DDoS Protection
- **Automatic Mitigation**: Always-on DDoS protection
- **Layer 7 Protection**: Application-layer attack mitigation
- **Rate Limiting**: Built-in rate limiting capabilities
- **IP Reputation**: Block known malicious IPs

#### WAF Rules
- **OWASP Top 10**: Protection against common vulnerabilities
- **Custom Rules**: Tailored rules for application needs
- **Rate Limiting**: Additional rate limiting at edge
- **Bot Management**: Automated bot detection and mitigation

## 📋 Security Checklist

### Pre-Deployment Security Checklist

#### Authentication Security
- [ ] JWT secret keys are strong and unique
- [ ] Token expiration times are appropriate
- [ ] Rate limiting is configured and tested
- [ ] Magic link flow is working correctly
- [ ] Session management is secure

#### API Security
- [ ] CORS configuration is appropriate
- [ ] Input validation is comprehensive
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting is effective
- [ ] HTTPS is enforced everywhere

#### Data Protection
- [ ] Environment variables are properly secured
- [ ] Database encryption is enabled
- [ ] Backup encryption is configured
- [ ] Data retention policies are defined
- [ ] Privacy compliance is maintained

### Ongoing Security Monitoring

#### Daily Checks
- [ ] Review security logs for anomalies
- [ ] Monitor rate limiting violations
- [ ] Check for unusual authentication patterns
- [ ] Verify system performance metrics

#### Weekly Reviews
- [ ] Update security patches
- [ ] Review access logs
- [ ] Analyze threat intelligence
- [ ] Test backup and recovery procedures

#### Monthly Assessments
- [ ] Security audit and penetration testing
- [ ] Review and update security policies
- [ ] Conduct security training
- [ ] Update incident response procedures

## 🚨 Incident Response Plan

### Security Incident Classification

#### Critical (Immediate Response)
- Data breach involving personal information
- System compromise or unauthorized access
- Ransomware or malware infection
- Complete service outage

#### High (Response within 1 hour)
- Successful authentication bypass
- Significant data exposure
- Widespread service degradation
- Coordinated attack detected

#### Medium (Response within 4 hours)
- Single account compromise
- Limited data exposure
- Service performance issues
- Suspicious activity patterns

#### Low (Response within 24 hours)
- Failed authentication attempts
- Minor configuration issues
- Low-risk security events
- Documentation updates needed

### Response Procedures

#### 1. Detection & Analysis
```bash
# Monitor security logs
wrangler tail --format=json

# Check rate limiting status
curl -H "CF-Connecting-IP: $IP" https://api.example.com/request-login-link

# Verify system health
curl https://api.example.com/health
```

#### 2. Containment
- Block malicious IP addresses
- Disable compromised accounts
- Implement additional rate limiting
- Enable enhanced monitoring

#### 3. Eradication & Recovery
- Patch vulnerabilities
- Reset compromised credentials
- Restore from clean backups
- Verify system integrity

#### 4. Post-Incident Activities
- Document incident details
- Update security procedures
- Conduct security review
- Implement improvements

## 📞 Security Contacts

### Emergency Contacts
- **Security Team**: security@ma-malnukananga.sch.id
- **System Administrator**: admin@ma-malnukananga.sch.id
- **Incident Response**: incident@ma-malnukananga.sch.id

### Reporting Security Issues
- **Vulnerability Disclosure**: security@ma-malnukananga.sch.id
- **Security Concerns**: Use encrypted email
- **Emergency**: +62-XXX-XXXX-XXXX (24/7)

### External Resources
- **Cloudflare Security**: https://www.cloudflare.com/security/
- **OWASP Guidelines**: https://owasp.org/
- **CISA Alerts**: https://www.cisa.gov/uscert/ncas/alerts

---

## 🔧 Security Implementation Examples

### 1. CSRF Protection Implementation

#### Complete CSRF Middleware
```javascript
// worker.js - CSRF Protection Implementation
class CSRFProtection {
  constructor() {
    this.tokenCookieName = 'csrf_token';
    this.headerName = 'X-CSRF-Token';
    this.tokenExpiry = 3600; // 1 hour
  }

  // Generate secure CSRF token
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Set CSRF token cookie
  setCSRFCookie(token) {
    const expires = new Date(Date.now() + this.tokenExpiry * 1000).toUTCString();
    return `${this.tokenCookieName}=${token}; Secure; HttpOnly; SameSite=Strict; Path=/; Expires=${expires}`;
  }

  // Validate CSRF token
  validateToken(requestToken, cookieToken) {
    if (!requestToken || !cookieToken) {
      return false;
    }
    return requestToken === cookieToken;
  }

  // Extract token from request headers
  extractToken(request) {
    return request.headers.get(this.headerName);
  }

  // Extract token from cookies
  extractCookieToken(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});
    
    return cookies[this.tokenCookieName];
  }

  // Middleware function
  async middleware(request, env, ctx) {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null; // Continue processing
    }

    // Extract tokens
    const requestToken = this.extractToken(request);
    const cookieToken = this.extractCookieToken(request);

    // Validate tokens
    if (!this.validateToken(requestToken, cookieToken)) {
      return new Response('CSRF token validation failed', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    return null; // Continue processing
  }
}

// Usage in worker
const csrf = new CSRFProtection();

export default {
  async fetch(request, env, ctx) {
    // Apply CSRF protection
    const csrfResult = await csrf.middleware(request, env, ctx);
    if (csrfResult) return csrfResult;

    // Continue with request processing...
  }
};
```

#### Frontend CSRF Integration
```javascript
// src/utils/csrf.js - Frontend CSRF handling
class CSRFManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // Get CSRF token from cookie
  getToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Extract from cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=');
      acc[name] = value;
      return acc;
    }, {});

    this.token = cookies.csrf_token;
    // Set expiry to 1 hour from now
    this.tokenExpiry = Date.now() + 3600000;
    
    return this.token;
  }

  // Add CSRF token to fetch requests
  async fetchWithCSRF(url, options = {}) {
    const token = this.getToken();
    
    const headers = {
      ...options.headers,
      'X-CSRF-Token': token
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  // Refresh CSRF token
  async refreshToken() {
    try {
      const response = await fetch('/api/refresh-csrf', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        this.token = null; // Force refresh on next get
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
    return false;
  }
}

// Global CSRF manager instance
export const csrfManager = new CSRFManager();

// Usage example
export async function apiRequest(url, options = {}) {
  return csrfManager.fetchWithCSRF(url, options);
}
```

### 2. Rate Limiting Implementation

#### Advanced Rate Limiting with KV Storage
```javascript
// worker.js - Rate Limiting Implementation
class RateLimiter {
  constructor(env) {
    this.env = env;
    this.windows = {
      login: { limit: 5, window: 900000 },    // 5 requests per 15 minutes
      api: { limit: 100, window: 900000 },    // 100 requests per 15 minutes
      strict: { limit: 10, window: 3600000 }  // 10 requests per hour
    };
  }

  // Get client IP address
  getClientIP(request) {
    return request.headers.get('CF-Connecting-IP') ||
           request.headers.get('X-Forwarded-For') ||
           'unknown';
  }

  // Generate rate limit key
  generateKey(ip, endpoint, window) {
    const windowStart = Math.floor(Date.now() / window) * window;
    return `rate_limit:${endpoint}:${ip}:${windowStart}`;
  }

  // Check rate limit
  async checkRateLimit(ip, endpoint = 'api') {
    const config = this.windows[endpoint] || this.windows.api;
    const key = this.generateKey(ip, endpoint, config.window);
    
    try {
      // Get current count
      const current = await this.env.RATE_LIMIT_KV.get(key);
      const count = current ? parseInt(current) : 0;

      // Check if limit exceeded
      if (count >= config.limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: Math.floor(Date.now() / config.window) * config.window + config.window,
          retryAfter: Math.ceil(config.window / 1000)
        };
      }

      // Increment counter
      const newCount = count + 1;
      await this.env.RATE_LIMIT_KV.put(key, newCount.toString(), {
        expirationTtl: Math.ceil(config.window / 1000)
      });

      return {
        allowed: true,
        remaining: config.limit - newCount,
        resetTime: Math.floor(Date.now() / config.window) * config.window + config.window,
        retryAfter: 0
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiting fails
      return { allowed: true, remaining: 1, resetTime: 0, retryAfter: 0 };
    }
  }

  // Middleware function
  async middleware(request, endpoint = 'api') {
    const ip = this.getClientIP(request);
    const result = await this.checkRateLimit(ip, endpoint);

    if (!result.allowed) {
      return new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'X-RateLimit-Limit': this.windows[endpoint].limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': result.retryAfter.toString(),
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // Add rate limit headers to successful responses
    return {
      headers: {
        'X-RateLimit-Limit': this.windows[endpoint].limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString()
      }
    };
  }
}

// Usage in worker
export default {
  async fetch(request, env, ctx) {
    const rateLimiter = new RateLimiter(env);
    
    // Apply rate limiting based on endpoint
    let endpoint = 'api';
    if (request.url.includes('/request-login-link')) {
      endpoint = 'login';
    }
    
    const rateLimitResult = await rateLimiter.middleware(request, endpoint);
    if (rateLimitResult.status === 429) {
      return rateLimitResult;
    }

    // Continue with request processing...
    const response = await handleRequest(request, env, ctx);
    
    // Add rate limit headers to response
    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  }
};
```

### 3. Security Headers Implementation

#### Comprehensive Security Headers Middleware
```javascript
// worker.js - Security Headers Implementation
class SecurityHeaders {
  constructor() {
    this.headers = {
      // Content Security Policy
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self' https://generativelanguage.googleapis.com wss://your-worker.workers.dev",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; '),

      // Other security headers
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'gyroscope=()',
        'accelerometer=()'
      ].join(', '),

      // HSTS (HTTPS only)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

      // Cache control for sensitive responses
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }

  // Apply security headers to response
  applyHeaders(response) {
    Object.entries(this.headers).forEach(([name, value]) => {
      response.headers.set(name, value);
    });
    return response;
  }

  // Get CSP for different environments
  getCSP(env = 'production') {
    if (env === 'development') {
      return this.headers['Content-Security-Policy'].replace("'unsafe-inline'", "'unsafe-inline' 'unsafe-eval'");
    }
    return this.headers['Content-Security-Policy'];
  }

  // Middleware function
  middleware(response, env = 'production') {
    // Update CSP based on environment
    this.headers['Content-Security-Policy'] = this.getCSP(env);
    
    return this.applyHeaders(response);
  }
}

// Usage in worker
const securityHeaders = new SecurityHeaders();

export default {
  async fetch(request, env, ctx) {
    // Handle request...
    let response = await handleRequest(request, env, ctx);
    
    // Apply security headers
    response = securityHeaders.middleware(response, env.NODE_ENV);
    
    return response;
  }
};
```

### 4. Input Validation & Sanitization

#### Comprehensive Input Validation
```javascript
// worker.js - Input Validation Implementation
class InputValidator {
  constructor() {
    this.schemas = {
      email: {
        type: 'string',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        maxLength: 254,
        minLength: 5,
        sanitize: true
      },
      message: {
        type: 'string',
        maxLength: 1000,
        minLength: 1,
        sanitize: true,
        allowedTags: [], // No HTML allowed
        profanityFilter: true
      },
      name: {
        type: 'string',
        maxLength: 100,
        minLength: 1,
        pattern: /^[a-zA-Z\s\u00C0-\u017F]+$/, // Letters and spaces (including Unicode)
        sanitize: true
      },
      studentId: {
        type: 'string',
        pattern: /^\d{8,20}$/, // 8-20 digits
        sanitize: false
      }
    };

    this.profanityList = [
      'profanity1', 'profanity2', 'profanity3'
      // Add actual profanity words
    ];
  }

  // Sanitize string input
  sanitizeString(input, options = {}) {
    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input.trim();

    // Remove potentially dangerous characters
    if (options.removeScripts !== false) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    // Remove HTML tags if not allowed
    if (options.allowedTags && options.allowedTags.length === 0) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Escape HTML entities
    if (options.escapeHtml !== false) {
      const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      sanitized = sanitized.replace(/[&<>"']/g, char => escapeMap[char]);
    }

    return sanitized;
  }

  // Check for profanity
  containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return this.profanityList.some(word => lowerText.includes(word));
  }

  // Validate input against schema
  validate(input, schemaName) {
    const schema = this.schemas[schemaName];
    if (!schema) {
      throw new Error(`Unknown schema: ${schemaName}`);
    }

    const result = {
      valid: true,
      errors: [],
      sanitized: input
    };

    // Type check
    if (schema.type === 'string' && typeof input !== 'string') {
      result.valid = false;
      result.errors.push(`Expected string, got ${typeof input}`);
      return result;
    }

    let value = input;

    // Length validation
    if (schema.minLength && value.length < schema.minLength) {
      result.valid = false;
      result.errors.push(`Minimum length is ${schema.minLength}`);
    }

    if (schema.maxLength && value.length > schema.maxLength) {
      result.valid = false;
      result.errors.push(`Maximum length is ${schema.maxLength}`);
    }

    // Pattern validation
    if (schema.pattern && !schema.pattern.test(value)) {
      result.valid = false;
      result.errors.push('Invalid format');
    }

    // Sanitization
    if (schema.sanitize) {
      value = this.sanitizeString(value, {
        allowedTags: schema.allowedTags || [],
        escapeHtml: true
      });
      result.sanitized = value;
    }

    // Profanity filter
    if (schema.profanityFilter && this.containsProfanity(value)) {
      result.valid = false;
      result.errors.push('Contains inappropriate content');
    }

    return result;
  }

  // Middleware for request validation
  async validateRequest(request, requiredFields = {}) {
    try {
      const body = await request.json();
      const errors = [];
      const sanitized = {};

      // Validate each required field
      for (const [fieldName, schemaName] of Object.entries(requiredFields)) {
        if (!body[fieldName]) {
          errors.push(`${fieldName} is required`);
          continue;
        }

        const validation = this.validate(body[fieldName], schemaName);
        if (!validation.valid) {
          errors.push(`${fieldName}: ${validation.errors.join(', ')}`);
        } else {
          sanitized[fieldName] = validation.sanitized;
        }
      }

      if (errors.length > 0) {
        return {
          valid: false,
          errors,
          data: null
        };
      }

      return {
        valid: true,
        errors: [],
        data: sanitized
      };
    } catch (error) {
      return {
        valid: false,
        errors: ['Invalid JSON format'],
        data: null
      };
    }
  }
}

// Usage in worker
const validator = new InputValidator();

export default {
  async fetch(request, env, ctx) {
    // Example: Validate login request
    if (request.url.includes('/request-login-link')) {
      const validation = await validator.validateRequest(request, {
        email: 'email'
      });

      if (!validation.valid) {
        return new Response(JSON.stringify({
          error: 'Validation failed',
          details: validation.errors
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Use validated data
      const { email } = validation.data;
      // Continue processing...
    }
  }
};
```

### 5. Environment Security Implementation

#### Secure Environment Variable Management
```javascript
// worker.js - Environment Security Implementation
class EnvironmentSecurity {
  constructor(env) {
    this.env = env;
    this.requiredSecrets = ['SECRET_KEY', 'API_KEY'];
    this.requiredVars = ['NODE_ENV'];
    this.validationRules = {
      SECRET_KEY: {
        minLength: 32,
        maxLength: 256,
        pattern: /^[a-zA-Z0-9+/=]+$/,
        cannotBeDefault: true
      },
      API_KEY: {
        minLength: 20,
        pattern: /^AIza[0-9A-Za-z_-]{35}$/
      },
      NODE_ENV: {
        allowedValues: ['development', 'production', 'test']
      }
    };
  }

  // Validate single environment variable
  validateVariable(name, value) {
    const rules = this.validationRules[name];
    if (!rules) return { valid: true };

    const result = { valid: true, errors: [] };

    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      result.valid = false;
      result.errors.push(`Too short (min ${rules.minLength} chars)`);
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      result.valid = false;
      result.errors.push(`Too long (max ${rules.maxLength} chars)`);
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      result.valid = false;
      result.errors.push('Invalid format');
    }

    // Default value check
    if (rules.cannotBeDefault && this.isDefaultValue(value)) {
      result.valid = false;
      result.errors.push('Cannot use default value');
    }

    // Allowed values check
    if (rules.allowedValues && !rules.allowedValues.includes(value)) {
      result.valid = false;
      result.errors.push(`Must be one of: ${rules.allowedValues.join(', ')}`);
    }

    return result;
  }

  // Check if value is a default/placeholder
  isDefaultValue(value) {
    const defaults = [
      'your_secret_key_here',
      'your_api_key_here',
      'default_secret_key',
      'change_me',
      'placeholder'
    ];
    return defaults.some(default => value.toLowerCase().includes(default));
  }

  // Validate all required environment variables
  validateEnvironment() {
    const errors = [];
    const warnings = [];

    // Check required secrets
    for (const secretName of this.requiredSecrets) {
      const value = this.env[secretName];
      if (!value) {
        errors.push(`Missing required secret: ${secretName}`);
        continue;
      }

      const validation = this.validateVariable(secretName, value);
      if (!validation.valid) {
        errors.push(`${secretName}: ${validation.errors.join(', ')}`);
      }
    }

    // Check required variables
    for (const varName of this.requiredVars) {
      const value = this.env[varName];
      if (!value) {
        errors.push(`Missing required variable: ${varName}`);
        continue;
      }

      const validation = this.validateVariable(varName, value);
      if (!validation.valid) {
        errors.push(`${varName}: ${validation.errors.join(', ')}`);
      }
    }

    // Production-specific checks
    if (this.env.NODE_ENV === 'production') {
      if (!this.env.SECRET_KEY || this.isDefaultValue(this.env.SECRET_KEY)) {
        errors.push('Production requires a strong, non-default SECRET_KEY');
      }

      if (this.env.API_KEY && this.isDefaultValue(this.env.API_KEY)) {
        errors.push('Production requires a valid API_KEY');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Get secure configuration
  getSecureConfig() {
    const validation = this.validateEnvironment();
    
    if (!validation.valid) {
      throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
    }

    return {
      jwtSecret: this.env.SECRET_KEY,
      apiKey: this.env.API_KEY,
      nodeEnv: this.env.NODE_ENV,
      isProduction: this.env.NODE_ENV === 'production',
      isDevelopment: this.env.NODE_ENV === 'development'
    };
  }

  // Middleware for environment validation
  middleware() {
    try {
      const config = this.getSecureConfig();
      return { valid: true, config };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        config: null
      };
    }
  }
}

// Usage in worker
export default {
  async fetch(request, env, ctx) {
    // Validate environment on startup
    const envSecurity = new EnvironmentSecurity(env);
    const envValidation = envSecurity.middleware();

    if (!envValidation.valid) {
      return new Response('Server configuration error', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    // Use secure configuration
    const { jwtSecret, apiKey, isProduction } = envValidation.config;

    // Continue with request processing...
  }
};
```

### 6. Security Logging Implementation

#### Comprehensive Security Logging
```javascript
// worker.js - Security Logging Implementation
class SecurityLogger {
  constructor(env) {
    this.env = env;
    this.logLevels = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
      INFO: 4
    };
  }

  // Generate request ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get client information
  getClientInfo(request) {
    return {
      ip: request.headers.get('CF-Connecting-IP') || 'unknown',
      userAgent: request.headers.get('User-Agent') || 'unknown',
      country: request.cf?.country || 'unknown',
      city: request.cf?.city || 'unknown'
    };
  }

  // Create security log entry
  createLogEntry(level, event, details, request = null) {
    const clientInfo = request ? this.getClientInfo(request) : {};
    
    return {
      timestamp: new Date().toISOString(),
      level,
      event,
      details,
      client: clientInfo,
      requestId: this.generateRequestId(),
      service: 'auth-api'
    };
  }

  // Log security event
  async log(level, event, details, request = null) {
    const logEntry = this.createLogEntry(level, event, details, request);
    
    try {
      // Log to console for development
      if (this.env.NODE_ENV === 'development') {
        console.log('SECURITY_LOG:', JSON.stringify(logEntry));
      }

      // Store in KV for production
      if (this.env.SECURITY_LOGS_KV) {
        const key = `security_log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.env.SECURITY_LOGS_KV.put(key, JSON.stringify(logEntry), {
          expirationTtl: 30 * 24 * 60 * 60 // 30 days
        });
      }

      // Send alerts for critical events
      if (this.logLevels[level] <= this.logLevels.HIGH) {
        await this.sendAlert(logEntry);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Send security alert
  async sendAlert(logEntry) {
    // Implementation depends on your alert system
    // Could send to Slack, email, webhook, etc.
    console.warn('SECURITY ALERT:', JSON.stringify(logEntry));
  }

  // Specific logging methods
  async logAuthAttempt(email, success, request) {
    const level = success ? 'INFO' : 'MEDIUM';
    const event = success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE';
    const details = { email, success };
    
    await this.log(level, event, details, request);
  }

  async logRateLimitExceeded(ip, endpoint, request) {
    await this.log('HIGH', 'RATE_LIMIT_EXCEEDED', { ip, endpoint }, request);
  }

  async logCSRFViolation(request) {
    await this.log('HIGH', 'CSRF_VIOLATION', {}, request);
  }

  async logSuspiciousActivity(pattern, details, request) {
    await this.log('CRITICAL', 'SUSPICIOUS_ACTIVITY', { pattern, ...details }, request);
  }

  async logSecurityError(error, context, request) {
    await this.log('MEDIUM', 'SECURITY_ERROR', { error: error.message, context }, request);
  }
}

// Usage in worker
const securityLogger = new SecurityLogger(env);

export default {
  async fetch(request, env, ctx) {
    // Log authentication attempts
    if (request.url.includes('/request-login-link')) {
      const { email } = await request.json();
      await securityLogger.logAuthAttempt(email, true, request);
    }

    // Log rate limiting
    const rateLimitResult = await rateLimiter.checkRateLimit(ip, 'login');
    if (!rateLimitResult.allowed) {
      await securityLogger.logRateLimitExceeded(ip, 'login', request);
    }

    // Log CSRF violations
    const csrfResult = await csrf.validateToken(requestToken, cookieToken);
    if (!csrfResult) {
      await securityLogger.logCSRFViolation(request);
    }
  }
};
```

## 📚 Security Resources

### Documentation
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/security/)
- [JWT Best Practices](https://auth0.com/blog/jwt-best-practices/)
- [OWASP Security Guidelines](https://owasp.org/)
- [CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Tools & Services
- **Cloudflare Security Center**: Built-in security monitoring
- **Google Gemini API Security**: AI service security guidelines
- **MailChannels API**: Secure email delivery service
- **OWASP ZAP**: Security testing tool
- **Sentry**: Error tracking and security monitoring

---


**Security Documentation Version: 1.3.1**  
**Last Updated: 2025-11-24**  

**Security Documentation Version: 1.2.0**  
<<<<<<< HEAD
**Last Updated: November 23, 2024**  
=======
**Last Updated: 2025-11-24

>>>>>>> origin/main
**Maintained by: MA Malnu Kananga Security Team**  
**Classification: Internal Use Only**

---

*This document contains sensitive security information and should be handled according to organizational security policies.*