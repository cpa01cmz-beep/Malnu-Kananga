# Security Configuration for MA Malnu Kananga

## Rate Limiting Configuration
- Default: 100 requests/minute
- Authentication: 10 requests/minute  
- AI Chat: 50 requests/minute
- File Upload: 5 requests/minute

## Input Validation Rules
- Email: RFC 5322 compliant, max 254 characters
- String: Max 10,000 characters, XSS protection
- Messages: 1-5,000 characters, HTML stripped
- IDs: Alphanumeric with dash/underscore, max 50 characters

## Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restricted permissions
- Strict-Transport-Security: 1 year
- Content-Security-Policy: Strict whitelist
- Cross-Origin policies: Same-origin only

## Geographic Restrictions
- Default: Indonesia only (ID)
- Configurable via ALLOWED_COUNTRIES env var

## Bot Detection
- Blocks common bot patterns for sensitive endpoints
- Allows legitimate crawlers for public content

## Request Size Limits
- Default: 10MB
- Configurable per endpoint

## IP Blocking
- Manual IP blocking via BLOCKED_IPS env var
- Automatic blocking for abusive behavior

## Monitoring
- Rate limit violations logged
- Suspicious activity tracking
- Geographic anomaly detection

## Environment Variables
```
BLOCKED_IPS=ip1,ip2,ip3
ALLOWED_COUNTRIES=ID,SG,MY
SECURITY_LEVEL=high|medium|low
ENABLE_GEO_BLOCKING=true|false
```