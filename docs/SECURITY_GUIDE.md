# 🔐 Security Documentation - MA Malnu Kananga

## 🌟 Overview

Dokumentasi ini menjelaskan implementasi keamanan sistem MA Malnu Kananga, mencakup arsitektur keamanan, mekanisme autentikasi, enkripsi data, dan praktik terbaik keamanan yang diterapkan.

## 🏗️ Security Architecture

### Multi-Layer Security Model

#### Layer 1: Network Security
- **Cloudflare DDoS Protection**: Automatic mitigation of DDoS attacks
- **Web Application Firewall (WAF)**: Protection against common web vulnerabilities
- **CDN Security**: Global edge network with built-in security features
- **SSL/TLS Encryption**: End-to-end encryption for all communications

#### Layer 2: Application Security
- **Authentication System**: Magic link authentication with JWT tokens
- **Session Management**: Secure session handling with expiration
- **Input Validation**: Comprehensive input sanitization and validation
- **Rate Limiting**: IP-based rate limiting to prevent abuse
- **CSRF Protection**: Cross-Site Request Forgery protection with double-submit cookies
- **Security Headers**: Content Security Policy (CSP) and security headers implementation
- **Environment Validation**: Robust environment variable validation system

#### Layer 3: Data Security
- **Encryption at Rest**: Data encrypted in Cloudflare D1 database
- **Encryption in Transit**: HTTPS/TLS for all API communications
- **API Key Security**: Secure storage and rotation of API keys
- **Data Minimization**: Collect only necessary user data

#### Layer 4: Infrastructure Security
- **Serverless Architecture**: Reduced attack surface with Cloudflare Workers
- **Secrets Management**: Secure environment variable handling
- **Access Control**: Role-based access control (RBAC)
- **Audit Logging**: Comprehensive logging of security events

## 🔐 Authentication & Authorization

### Magic Link Authentication System

#### Flow Overview
1. **User Request**: User enters email address
2. **Token Generation**: System generates secure JWT token
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

### Rate Limiting Implementation

#### Authentication Endpoints
- **Endpoint**: `/request-login-link`
- **Limit**: 5 requests per 15 minutes per IP
- **Block Duration**: 30 minutes on limit exceeded
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

#### Implementation Details
```javascript
// CSRF Middleware Implementation
const csrfProtection = {
  generateToken: () => crypto.randomUUID(),
  validateToken: (requestToken, cookieToken) => requestToken === cookieToken,
  setCookie: (token) => `csrf_token=${token}; Secure; HttpOnly; SameSite=Strict`
}
```

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

#### Environment Validation
- **SECRET_KEY Validation**: Mandatory 32+ character secret key
- **API Key Validation**: Validates Google Gemini API key format
- **Environment Checks**: Ensures production environment has proper security settings
- **Runtime Validation**: Continuous validation of critical security parameters

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

## 📚 Security Resources

### Documentation
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/security/)
- [JWT Best Practices](https://auth0.com/blog/jwt-best-practices/)
- [OWASP Security Guidelines](https://owasp.org/)

### Tools & Services
- **Cloudflare Security Center**: Built-in security monitoring
- **Google Gemini API Security**: AI service security guidelines
- **MailChannels API**: Secure email delivery service

---

**Security Documentation Version: 1.2.0**  
**Last Updated: November 23, 2024**  
**Maintained by: MA Malnu Kananga Security Team**  
**Classification: Internal Use Only**

---

*This document contains sensitive security information and should be handled according to organizational security policies.*