# 🔒 Security Testing Guide - MA Malnu Kananga

## 🌟 Overview

This guide provides comprehensive security testing procedures for the MA Malnu Kananga system, including automated tests, manual testing procedures, and security validation checkpoints.

---

**Security Testing Guide Version: 1.3.1**  
**Last Updated: November 25, 2025**  
**Testing Framework: Jest + Custom Security Tests**

---

## 🧪 Automated Security Tests

### 1. Authentication Security Tests

#### JWT Token Security Tests
```javascript
// tests/security/auth.test.js
describe('Authentication Security', () => {
  test('should reject malformed JWT tokens', async () => {
    const malformedTokens = [
      'invalid.token',
      'header.payload',
      'too.many.parts.here',
      '',
      null,
      undefined
    ];
    
    for (const token of malformedTokens) {
      const result = await verifyAndDecodeToken(token);
      expect(result).toBeNull();
    }
  });

  test('should reject expired JWT tokens', async () => {
    const expiredToken = generateExpiredToken();
    const result = await verifyAndDecodeToken(expiredToken);
    expect(result).toBeNull();
  });

  test('should validate JWT token structure', async () => {
    const validToken = await generateSecureToken('test@example.com');
    const parts = validToken.split('.');
    
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBeDefined(); // header
    expect(parts[1]).toBeDefined(); // payload
    expect(parts[2]).toBeDefined(); // signature
  });
});
```

#### Magic Link Authentication Tests
```javascript
describe('Magic Link Authentication', () => {
  test('should enforce rate limiting on login requests', async () => {
    const email = 'test@example.com';
    
    // First request should succeed
    const response1 = await requestLoginLink(email);
    expect(response1.success).toBe(true);
    
    // Multiple rapid requests should be rate limited
    for (let i = 0; i < 6; i++) {
      const response = await requestLoginLink(email);
    }
    
    const rateLimitedResponse = await requestLoginLink(email);
    expect(rateLimitedResponse.success).toBe(false);
    expect(rateLimitedResponse.message).toContain('Terlalu banyak percobaan');
  });

  test('should validate email format', async () => {
    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user..name@domain.com',
      '',
      null,
      undefined
    ];
    
    for (const email of invalidEmails) {
      const response = await requestLoginLink(email);
      expect(response.success).toBe(false);
      expect(response.message).toContain('Format email tidak valid');
    }
  });
});
```

### 2. Input Validation Security Tests

#### XSS Prevention Tests
```javascript
describe('XSS Prevention', () => {
  test('should block script injection attempts', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">',
      '"><script>alert(1)</script>',
      "'><script>alert(1)</script>",
      '<iframe src="javascript:alert(1)">',
      '<body onload="alert(1)">'
    ];
    
    for (const payload of xssPayloads) {
      const isValid = validateInput(payload, 'string');
      expect(isValid).toBe(false);
    }
  });

  test('should sanitize HTML content', () => {
    const htmlContent = '<p>Hello <b>world</b></p><script>alert(1)</script>';
    const sanitized = sanitizeInput(htmlContent, 'message');
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });
});
```

#### SQL Injection Prevention Tests
```javascript
describe('SQL Injection Prevention', () => {
  test('should block SQL injection attempts', () => {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; SELECT * FROM users; --",
      "' UNION SELECT password FROM users --",
      "'; INSERT INTO users VALUES('hacker'); --",
      "' OR 1=1 --",
      "admin'--",
      "' OR 'x'='x"
    ];
    
    for (const payload of sqlPayloads) {
      const sanitized = sanitizeSqlInput(payload);
      expect(sanitized).not.toContain("DROP TABLE");
      expect(sanitized).not.toContain("SELECT *");
      expect(sanitized).not.toContain("UNION SELECT");
    }
  });
});
```

### 3. CSRF Protection Tests

```javascript
describe('CSRF Protection', () => {
  test('should validate CSRF tokens', () => {
    const token = generateCSRFToken();
    
    // Valid token should pass
    const mockRequest = createMockRequest(token, token);
    const isValid = validateCSRFToken(mockRequest);
    expect(isValid).toBe(true);
    
    // Invalid token should fail
    const mockRequestInvalid = createMockRequest(token, 'invalid-token');
    const isInvalid = validateCSRFToken(mockRequestInvalid);
    expect(isInvalid).toBe(false);
  });

  test('should skip CSRF validation for safe methods', () => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    
    for (const method of safeMethods) {
      const mockRequest = createMockRequest(method);
      const protection = csrfProtection(mockRequest);
      expect(protection.valid).toBe(true);
    }
  });

  test('should require CSRF validation for unsafe methods', () => {
    const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of unsafeMethods) {
      const mockRequest = createMockRequest(method);
      const protection = csrfProtection(mockRequest);
      expect(protection.valid).toBe(false);
      expect(protection.error).toBeDefined();
    }
  });
});
```

### 4. Rate Limiting Tests

```javascript
describe('Rate Limiting', () => {
  test('should enforce rate limits by endpoint', () => {
    const rateLimitStore = new Map();
    const clientId = 'test-client-123';
    
    // First 100 requests should pass
    for (let i = 0; i < 100; i++) {
      const isExceeded = isRateLimitExceeded(clientId, 100, 60000, 'api');
      expect(isExceeded).toBe(false);
    }
    
    // 101st request should be blocked
    const isExceeded = isRateLimitExceeded(clientId, 100, 60000, 'api');
    expect(isExceeded).toBe(true);
  });

  test('should implement progressive blocking', () => {
    const clientId = 'abusive-client-456';
    
    // Exceed double the limit should trigger hard block
    for (let i = 0; i < 201; i++) {
      isRateLimitExceeded(clientId, 100, 60000, 'api');
    }
    
    const isHardBlocked = isRateLimitExceeded(clientId, 100, 60000, 'api');
    expect(isHardBlocked).toBe(true);
  });
});
```

---

## 🔍 Manual Security Testing Procedures

### 1. Authentication Flow Testing

#### Magic Link Flow Test
```bash
# Test Case 1: Valid Email Request
curl -X POST https://api.example.com/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Expected: 200 OK with success message
# Verify: Email sent with magic link

# Test Case 2: Invalid Email
curl -X POST https://api.example.com/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email"}'

# Expected: 400 Bad Request with validation error

# Test Case 3: Rate Limiting
for i in {1..6}; do
  curl -X POST https://api.example.com/request-login-link \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com"}'
done

# Expected: 5th request should trigger rate limit
```

#### Token Verification Test
```bash
# Test Case 1: Valid Token
curl -X GET "https://api.example.com/verify-login?token=VALID_JWT_TOKEN"

# Expected: 302 Redirect to dashboard

# Test Case 2: Invalid Token
curl -X GET "https://api.example.com/verify-login?token=INVALID_TOKEN"

# Expected: 401 Unauthorized

# Test Case 3: Expired Token
curl -X GET "https://api.example.com/verify-login?token=EXPIRED_TOKEN"

# Expected: 401 Unauthorized
```

### 2. Input Validation Testing

#### XSS Payload Testing
```bash
# Test various XSS payloads
curl -X POST https://api.example.com/api/chat \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: valid-token" \
  -d '{"message": "<script>alert(\"xss\")</script>"}'

# Expected: 400 Bad Request or sanitized input
```

#### SQL Injection Testing
```bash
# Test SQL injection payloads
curl -X POST https://api.example.com/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "'\'' OR 1=1 --"}'

# Expected: 400 Bad Request or sanitized query
```

### 3. Security Headers Testing

```bash
# Test security headers
curl -I https://api.example.com/

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: default-src 'self'...
```

---

## 🛠️ Security Testing Tools

### 1. Automated Scanning Tools

#### OWASP ZAP Configuration
```bash
# Install OWASP ZAP
docker pull owasp/zap2docker-stable

# Run security scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.example.com \
  -J security-report.json

# Generate HTML report
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.example.com \
  -J security-report.html
```

#### Nuclei Vulnerability Scanner
```bash
# Install Nuclei
go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest

# Run security scan
nuclei -target https://api.example.com \
  -templates /path/to/nuclei-templates \
  -output nuclei-report.txt

# Run specific security tests
nuclei -target https://api.example.com \
  -templates jwt/ \
  -templates xss/ \
  -templates sql-injection/
```

### 2. Dependency Security Scanning

#### Snyk Configuration
```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth

# Scan for vulnerabilities
snyk test

# Monitor for new vulnerabilities
snyk monitor

# Generate security report
snyk test --json > snyk-report.json
```

#### npm Audit
```bash
# Run npm audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Generate audit report
npm audit --json > npm-audit.json
```

---

## 📊 Security Testing Metrics

### 1. Test Coverage Metrics

```javascript
// Security test coverage calculation
const securityTestCoverage = {
  authentication: {
    totalTests: 15,
    passedTests: 15,
    coverage: '100%'
  },
  inputValidation: {
    totalTests: 25,
    passedTests: 24,
    coverage: '96%'
  },
  csrfProtection: {
    totalTests: 10,
    passedTests: 10,
    coverage: '100%'
  },
  rateLimiting: {
    totalTests: 8,
    passedTests: 8,
    coverage: '100%'
  },
  securityHeaders: {
    totalTests: 12,
    passedTests: 11,
    coverage: '92%'
  }
};
```

### 2. Vulnerability Metrics

```javascript
// Vulnerability tracking
const vulnerabilityMetrics = {
  critical: 0,
  high: 0,
  medium: 2,
  low: 5,
  totalVulnerabilities: 7,
  remediationTime: {
    critical: '0 hours',
    high: '0 hours',
    medium: '48 hours',
    low: '7 days'
  }
};
```

---

## 🚨 Security Testing Checklist

### Pre-Deployment Security Testing

#### Authentication Security
- [ ] JWT token validation tests pass
- [ ] Magic link flow tests pass
- [ ] Rate limiting tests pass
- [ ] Session management tests pass
- [ ] CSRF protection tests pass

#### Input Validation Security
- [ ] XSS prevention tests pass
- [ ] SQL injection tests pass
- [ ] Input sanitization tests pass
- [ ] File upload security tests pass
- [ ] API parameter validation tests pass

#### Infrastructure Security
- [ ] Security headers validation passes
- [ ] TLS configuration validation passes
- [ ] CORS configuration tests pass
- [ ] Geographic filtering tests pass
- [ ] IP blocking tests pass

#### Code Security
- [ ] Dependency vulnerability scan passes
- [ ] Static code analysis passes
- [ ] Secrets detection scan passes
- [ ] Code quality checks pass
- [ ] Security pattern validation passes

### Ongoing Security Testing

#### Daily Automated Tests
- [ ] Security smoke tests pass
- [ ] Authentication health checks pass
- [ ] Rate limiting validation passes
- [ ] Security headers validation passes
- [ ] Basic vulnerability scan passes

#### Weekly Comprehensive Tests
- [ ] Full security test suite passes
- [ ] Dependency vulnerability scan passes
- [ ] OWASP ZAP baseline scan passes
- [ ] Penetration testing (automated) passes
- [ ] Security configuration validation passes

#### Monthly Deep-Dive Tests
- [ ] Manual penetration testing
- [ ] Security architecture review
- [ ] Threat modeling assessment
- [ ] Compliance validation
- [ ] Security incident response testing

---

## 🔧 Security Testing CI/CD Integration

### GitHub Actions Security Testing

```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run security tests
      run: npm run test:security
    
    - name: Run dependency audit
      run: npm audit --audit-level moderate
    
    - name: Run Snyk security scan
      run: npx snyk test --severity-threshold=high
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    - name: Run OWASP ZAP scan
      run: |
        docker run -t owasp/zap2docker-stable zap-baseline.py \
          -t ${{ secrets.API_URL }} \
          -J zap-report.json
    
    - name: Upload security reports
      uses: actions/upload-artifact@v3
      with:
        name: security-reports
        path: |
          zap-report.json
          snyk-report.json
          npm-audit.json
```

### NPM Scripts for Security Testing

```json
{
  "scripts": {
    "test:security": "jest --testPathPattern=security",
    "test:security:watch": "jest --testPathPattern=security --watch",
    "test:security:coverage": "jest --testPathPattern=security --coverage",
    "audit:security": "npm audit --audit-level moderate",
    "scan:dependencies": "npx snyk test",
    "scan:secrets": "npx trufflehog .",
    "test:headers": "npx security-headers check https://api.example.com",
    "test:xss": "npx XSS-Check test https://api.example.com"
  }
}
```

---

## 📈 Security Testing Reports

### Daily Security Report
```javascript
// Daily security test results
const dailySecurityReport = {
  date: '2025-11-25',
  totalTests: 70,
  passedTests: 68,
  failedTests: 2,
  coverage: '97%',
  vulnerabilities: {
    critical: 0,
    high: 0,
    medium: 1,
    low: 1
  },
  recommendations: [
    'Fix medium vulnerability in dependency X',
    'Update security header configuration'
  ]
};
```

### Weekly Security Summary
```javascript
// Weekly security testing summary
const weeklySecuritySummary = {
  week: '2025-W47',
  totalTestsRun: 490,
  passRate: '98.5%',
  vulnerabilitiesFound: 3,
  vulnerabilitiesFixed: 5,
  securityScore: 8.5,
  trends: {
    passRate: '↑ 0.5%',
    vulnerabilities: '↓ 2',
    securityScore: '↑ 0.2'
  }
};
```

---

## 🎯 Security Testing Best Practices

### 1. Test Design Principles
- **Comprehensive Coverage**: Test all security-critical components
- **Realistic Scenarios**: Use real-world attack patterns
- **Automated Execution**: Integrate tests into CI/CD pipeline
- **Regular Updates**: Keep tests updated with new threats
- **Clear Reporting**: Generate actionable security reports

### 2. Test Data Management
- **Sanitized Data**: Use non-sensitive test data
- **Isolated Environment**: Test in dedicated security environment
- **Data Privacy**: Protect user privacy in testing
- **Compliance**: Ensure testing complies with regulations

### 3. Test Maintenance
- **Regular Reviews**: Review and update test cases
- **Version Control**: Track test changes in version control
- **Documentation**: Maintain clear test documentation
- **Training**: Keep team trained on security testing

---

**Security Testing Guide - MA Malnu Kananga**

*Comprehensive security testing procedures and best practices*

---

**Guide Version: 1.3.1**  
**Last Updated: November 25, 2025**  
**Next Review: February 25, 2026**  
**Security Team: MA Malnu Kananga**