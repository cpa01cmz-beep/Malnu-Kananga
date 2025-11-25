# ☁️ Cloudflare Worker Backend Documentation - MA Malnu Kananga

## 🌟 Overview

The MA Malnu Kananga system uses Cloudflare Workers as its serverless backend, providing authentication, AI chat functionality, and API services. This documentation covers the complete backend architecture, deployment, and maintenance procedures.

---

**Cloudflare Worker Documentation Version: 1.0.0**  
**Last Updated: November 25, 2025**  
**Implementation Status: Production Ready**  
**Documentation Audit: Completed - Aligned with AGENTS.md requirements**

---

## 🏗️ Architecture Overview

### Serverless Backend Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│  Cloudflare     │◄──►│  External       │
│   (React App)   │    │  Worker         │    │  Services       │
│                 │    │  (worker.js)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼────┐
            │   D1      │ │Vector │ │  KV    │
            │ Database  │ │Database│ │Storage │
            │ (SQLite)  │ │(AI RAG)│ │(Logs)  │
            └───────────┘ └───────┘ └────────┘
```

### Key Features

- **Authentication**: Magic link system with JWT tokens
- **AI Chat**: RAG system with vector database
- **Security**: Rate limiting, CSRF protection, IP blocking
- **Monitoring**: Health checks and comprehensive logging
- **Scalability**: Global edge distribution

---

## 📁 Worker Structure

### Core Files

```
worker.js                    # Main worker entry point
├── SecurityMiddleware.js    # Security and rate limiting
├── Authentication          # Magic link and JWT handling
├── AI & RAG System         # Vector search and AI responses
├── Database Operations     # D1 database queries
├── API Endpoints           # All REST API implementations
└── Error Handling          # Comprehensive error management
```

### Dependencies

```javascript
// Cloudflare Workers bindings
env.AI = @cf/baai/bge-base-en-v1.5              # AI embeddings
env.VECTORIZE_INDEX = "malnu-kananga-index"     # Vector database
env.DB = "malnu-kananga-db"                     # D1 database
env.SECURITY_LOGS_KV = "security_logs"          # Audit logs (optional)
env.RATE_LIMIT_KV = "rate_limits"               # Distributed rate limiting
```

---

## 🔐 Authentication System

### Magic Link Flow

1. **Request Login Link**
   ```http
   POST /request-login-link
   {
     "email": "user@example.com"
   }
   ```

2. **Email Delivery**
   - Uses MailChannels API (built into Cloudflare Workers)
   - Generates JWT token with 15-minute expiry
   - Includes security logging and rate limiting

3. **Token Verification**
   ```http
   GET /verify-login?token={jwt_token}
   ```
   - Validates JWT signature
   - Sets secure authentication cookies
   - Redirects to application

### Security Features

- **Rate Limiting**: 3 requests per minute per IP
- **Email Validation**: Format and domain checking
- **Allowed Emails**: Pre-registered email addresses only
- **Secure Cookies**: __Host prefix, HTTP-only, 15-minute expiry
- **CSRF Protection**: Double-submit cookie pattern

---

## 🤖 AI Chat Implementation

### RAG System Architecture

```javascript
// Main chat endpoint implementation
app.post('/api/chat', async (request, env) => {
  // 1. Authenticate user (JWT + CSRF)
  // 2. Generate query embedding
  // 3. Search vector database (similarity ≥ 0.75)
  // 4. Retrieve top 3 relevant documents
  // 5. Send context to Google Gemini AI
  // 6. Return Indonesian response
});
```

### Vector Database Operations

```javascript
// Vector search implementation
const queryVector = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
  text: userMessage
});

const results = await env.VECTORIZE_INDEX.query(queryVector.data[0], {
  topK: 3,
  namespace: "school-docs",
  includeMetadata: true
});

// Filter by similarity threshold
const relevantDocs = results.matches.filter(match => match.score >= 0.75);
```

### Student Support AI

Enhanced AI system with risk assessment:

```javascript
app.post('/api/student-support', async (request, env) => {
  // Categorize student issues (academic, technical, personal)
  // Provide targeted support resources
  // Generate risk assessment if needed
  // Offer proactive recommendations
});
```

---

## 🛡️ Security Implementation

### Multi-Layer Security

1. **Input Validation**
   ```javascript
   // Email sanitization
   const sanitizedEmail = email.toLowerCase().trim();
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   ```

2. **Rate Limiting**
   ```javascript
   // Distributed rate limiting with KV
   const rateLimitKey = `rate_limit:${ip}:${endpoint}`;
   const currentRequests = await env.RATE_LIMIT_KV.get(rateLimitKey);
   ```

3. **CSRF Protection**
   ```javascript
   // Double-submit cookie pattern
   const csrfToken = generateSecureToken();
   response.headers.set('Set-Cookie', `csrf_token=${csrfToken}; HttpOnly; Secure`);
   ```

4. **Security Logging**
   ```javascript
   // Comprehensive security event logging
   await securityLogger.logSecurityEvent('AUTHENTICATION_ATTEMPT', {
     email, success, ip, userAgent
   });
   ```

### Security Event Categories

- **CRITICAL**: AUTH_BYPASS_ATTEMPT, CSRF_TOKEN_INVALID
- **HIGH**: RATE_LIMIT_EXCEEDED, INVALID_TOKEN
- **MEDIUM**: SUSPICIOUS_INPUT, FAILED_AUTHENTICATION
- **LOW**: Informational events

---

## 📊 Database Integration

### D1 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL, -- 'student', 'teacher', 'parent', 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Sessions table for audit trail
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  token_jti TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  ip_address TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Database Operations

```javascript
// Example database query in worker
const user = await env.DB.prepare(
  'SELECT * FROM users WHERE email = ?'
).bind(email).first();

// Session logging
await env.DB.prepare(
  'INSERT INTO sessions (user_id, token_jti, expires_at, ip_address) VALUES (?, ?, ?, ?)'
).bind(userId, jti, expiresAt, ip).run();
```

---

## 🚀 Deployment Configuration

### wrangler.toml Setup

```toml
name = "ma-malnu-kananga-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

[env.production]
vars = { NODE_ENV = "production" }

# AI Model Binding
[[env.production.ai]]
binding = "AI"

# Vector Database Binding
[[env.production.vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

# D1 Database Binding
[[env.production.d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your-database-id"

# KV Storage Bindings
[[env.production.kv_namespaces]]
binding = "SECURITY_LOGS_KV"
id = "your-kv-namespace-id"

[[env.production.kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-rate-limit-kv-id"
```

### Environment Variables

```bash
# Required Secrets (set via wrangler)
wrangler secret put SECRET_KEY
wrangler secret put JWT_SECRET
wrangler secret put API_KEY  # Google Gemini API Key

# Optional Configuration
wrangler secret put RATE_LIMIT_WINDOW_MS  # Default: 900000 (15 minutes)
wrangler secret put RATE_LIMIT_MAX_REQUESTS  # Default: 100
```

---

## 🔧 API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/request-login-link` | POST | No | Generate magic link |
| `/verify-login` | GET | No | Verify JWT token |
| `/generate-signature` | POST | Yes | Generate HMAC signature |
| `/verify-signature` | POST | Yes | Verify HMAC signature |

### AI Chat Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat` | POST | Yes | RAG AI chat |
| `/api/student-support` | POST | Yes | Enhanced student support |
| `/api/support-monitoring` | POST | Yes | Proactive monitoring |
| `/seed` | GET | No | Seed vector database |

### System Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | System health check |

---

## 📈 Performance Optimization

### Edge Computing Benefits

- **Global Distribution**: Automatic deployment to 200+ edge locations
- **Low Latency**: < 100ms response times worldwide
- **Auto-scaling**: Handles traffic spikes automatically
- **Cost Efficiency**: Pay-per-request pricing model

### Caching Strategy

```javascript
// Response caching for static content
const cacheKey = `cache:${request.url}`;
const cached = await env.CACHE.get(cacheKey);

if (cached) {
  return new Response(cached, {
    headers: { 'X-Cache': 'HIT' }
  });
}

// Cache successful responses
if (response.status === 200) {
  ctx.waitUntil(env.CACHE.put(cacheKey, response.clone().body, {
    expirationTtl: 300 // 5 minutes
  }));
}
```

---

## 🔍 Monitoring & Logging

### Health Check Implementation

```javascript
app.get('/health', async (request, env) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ai: await checkAIService(env),
      database: await checkDatabase(env),
      vectorize: await checkVectorize(env)
    },
    version: '1.2.0',
    environment: env.NODE_ENV || 'development'
  };
  
  return Response.json(health);
});
```

### Log Management

```javascript
// Structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  endpoint: request.url,
  method: request.method,
  ip: request.cf.connectingIP,
  userAgent: request.headers.get('User-Agent'),
  responseTime: Date.now() - startTime
}));
```

---

## 🛠️ Development Workflow

### Local Development

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Start local development
wrangler dev

# Test with local environment
curl http://localhost:8787/health
```

### Testing Procedures

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Load testing
npm run test:load

# Security testing
npm run test:security
```

### Deployment Pipeline

```bash
# Deploy to production
wrangler deploy --env production

# Seed vector database (one-time)
curl https://your-worker.workers.dev/seed

# Verify deployment
curl https://your-worker.workers.dev/health
```

---

## 🚨 Troubleshooting

### Common Issues

#### Worker Deployment Fails
```bash
# Check permissions
wrangler whoami

# Verify API token permissions
# Account: Workers Scripts: Edit
# Zone: Workers Routes: Edit
# User: User Details: Read
```

#### AI Binding Not Found
```bash
# Check AI model availability
wrangler ai list

# Verify wrangler.toml configuration
grep -A 5 "\[\[env.production.ai\]\]" wrangler.toml
```

#### Vector Database Issues
```bash
# List vector indexes
wrangler vectorize list

# Check index configuration
wrangler vectorize describe malnu-kananga-index
```

#### Database Connection Problems
```bash
# Verify D1 database
wrangler d1 list

# Test database connection
wrangler d1 execute malnu-kananga-db --command "SELECT 1"
```

### Debug Commands

```bash
# View worker logs
wrangler tail

# Test specific endpoint
curl -X POST https://your-worker.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "test"}'

# Check rate limiting status
wrangler kv key list --namespace-id=your-rate-limit-kv-id
```

---

## 📋 Maintenance Checklist

### Daily Tasks
- [ ] Monitor error rates in Cloudflare dashboard
- [ ] Check security logs for suspicious activity
- [ ] Verify AI service availability

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Update knowledge base if needed
- [ ] Check rate limiting effectiveness

### Monthly Tasks
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] Documentation updates

### Quarterly Tasks
- [ ] Major system updates
- [ ] Architecture review
- [ ] Capacity planning

---

## 🔒 Security Best Practices

### Regular Security Reviews

1. **Secret Management**
   - Rotate API keys quarterly
   - Use strong, unique secrets
   - Monitor for secret exposure

2. **Access Control**
   - Principle of least privilege
   - Regular permission audits
   - Multi-factor authentication

3. **Monitoring**
   - Real-time security alerts
   - Anomaly detection
   - Incident response procedures

---

## 📞 Support & Resources

### Documentation
- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Vectorize Documentation**: https://developers.cloudflare.com/vectorize/
- **D1 Database Guide**: https://developers.cloudflare.com/d1/

### Community Support
- **Cloudflare Community**: https://community.cloudflare.com/
- **GitHub Issues**: Project repository issues
- **Developer Discord**: Cloudflare developer community

---

**Cloudflare Worker Documentation Version: 1.0.0**  
**Last Updated: November 25, 2025**  
**Next Review: February 25, 2026**  
**Maintainer: MA Malnu Kananga Development Team**