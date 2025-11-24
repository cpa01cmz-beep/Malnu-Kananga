# 📚 API Documentation - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga API provides core endpoints for authentication, AI chat functionality, and system monitoring. The API is built on Cloudflare Workers with serverless architecture and focuses on essential functionality currently implemented.

---

**API Documentation Version: 1.4.0**  
**Last Updated: November 24, 2024**  
**Implementation Status: Production Ready (Core Features)**

## ⚠️ Implementation Status

### Current Implementation Rate: **100%** (9/9 endpoints documented and working)

#### ✅ **Fully Implemented Endpoints (9 endpoints)**
- **Authentication API**: Magic link system with JWT tokens and security
- **AI Chat API**: RAG system with vector database integration
- **Student Support AI**: Enhanced AI assistance with risk assessment
- **Support Monitoring**: Proactive student monitoring system
- **Health Check**: Comprehensive system status monitoring
- **Vector Database**: Document seeding and retrieval system
- **Signature API**: HMAC signature generation and verification
- **Security Features**: Rate limiting, CSRF protection, IP blocking

#### 🚧 **Future Endpoints (Not Yet Implemented)**
- **Student Academic APIs**: Grades, schedule, attendance records
- **Teacher Management APIs**: Class management, grade input
- **Parent Portal APIs**: Child monitoring, communication
- **Content Management APIs**: Dynamic content and announcements
- **Analytics APIs**: Performance metrics and reporting

#### 📝 **Current Architecture**
1. **Phase 1** (Complete): Authentication, AI chat, and monitoring
2. **Phase 2** (Planned): Student and teacher academic APIs
3. **Phase 3** (Future): Advanced analytics and content management

> **Note**: This documentation reflects ONLY currently implemented endpoints. Frontend uses static/demo data for features not yet implemented.

## 🏗️ Architecture

### Base Configuration
- **Base URL**: Worker deployment URL (configured in environment)
- **API Version**: Current implementation
- **Content-Type**: `application/json`
- **Authentication**: JWT Token (Magic Link System) with HMAC-SHA256 signing
- **Rate Limiting**: 3 requests per minute for login, 100 requests per 15 minutes for general APIs
- **CORS**: Enabled for all origins (`Access-Control-Allow-Origin: *`)
- **Timeout**: 10 seconds per request
- **Security**: IP-based rate limiting, secure token generation with Web Crypto API
- **CSRF Protection**: Double-submit cookie pattern for state-changing requests
- **Security Logging**: Comprehensive security event logging with KV storage
- **Status**: Production Ready (Core Features Implemented)

### Environment Variables
```typescript
// Required Environment Variables (Cloudflare Workers Secrets)
SECRET_KEY=your_jwt_secret_key            # HMAC secret key for JWT signing (min 32 chars)
JWT_SECRET=your_jwt_secret_key            # Alternative JWT secret key
NODE_ENV=production                       # Environment mode

// Optional Environment Variables
RATE_LIMIT_WINDOW_MS=900000               # 15 minutes in milliseconds (default)
RATE_LIMIT_MAX_REQUESTS=100               # Max requests per window (default)

// Cloudflare Workers Bindings (required)
AI=@cf/baai/bge-base-en-v1.5              # AI model for embeddings
VECTORIZE_INDEX=malnu-kananga-index       # Vector database index
DB=malnu-kananga-db                       # D1 database binding

// Optional KV Bindings for security logging
SECURITY_LOGS_KV=security_logs            # KV store for security audit logs
RATE_LIMIT_KV=rate_limits                 # KV store for distributed rate limiting
```

### Security Configuration
- **JWT Secret**: Minimum 32 characters, cannot use default value
- **Rate Limiting**: Distributed using KV store, fallback to memory
- **CSRF Tokens**: HTTP-only cookies with 1-hour expiry
- **Authentication Cookies**: __Host prefix, 15-minute expiry, partitioned
- **Security Events**: Logged with severity levels (CRITICAL, HIGH, MEDIUM, LOW)

## 🔐 Authentication API

### Magic Link Authentication

#### Request Login Link
```http
POST /request-login-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:**
```json
{
  "success": true,
  "message": "Link login telah dikirim."
}
```

**Error Response:**
```json
{
  "message": "Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit."
}
```

**Security Features:**
- **Rate Limiting**: 3 requests per minute per IP address
- **Email Validation**: Input sanitization and format validation
- **Allowed Emails**: Only pre-registered emails can authenticate
- **Email Delivery**: Uses MailChannels API for magic link delivery
- **Security Logging**: All attempts logged with IP and timestamp

**Allowed Email Addresses:**
- admin@ma-malnukananga.sch.id
- guru@ma-malnukananga.sch.id
- siswa@ma-malnukananga.sch.id
- parent@ma-malnukananga.sch.id
- ayah@ma-malnukananga.sch.id
- ibu@ma-malnukananga.sch.id

#### Verify Login Token
```http
GET /verify-login?token={jwt_token}
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:** HTTP 302 Redirect with cookies set
- Sets `__Host-auth_session` cookie (15-minute expiry)
- Sets `csrf_token` cookie (1-hour expiry)
- Redirects to application origin

**Error Response:**
```html
Link login sudah kedaluwarsa atau tidak valid. Silakan minta link baru.
```

**Token Security:**
- JWT tokens signed with HMAC-SHA256 using Web Crypto API
- 15-minute expiry with jti (JWT ID) for tracking
- Secure cookies with __Host prefix (HTTPS only)
- Automatic CSRF token generation and rotation

## 🤖 AI Chat API

### Chat with AI Assistant
```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-CSRF-Token: {csrf_token}

{
  "message": "Apa saja program unggulan sekolah?"
}
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:**
```json
{
  "context": "Profil Sekolah: Madrasah Aliyah MALNU Kananga adalah lembaga pendidikan menengah atas swasta di bawah Kementerian Agama. Didirikan pada tahun 2000 di Pandeglang, Banten.\n\n---\n\nVisi Sekolah: Visi MA Malnu Kananga adalah melahirkan peserta didik berakhlak mulia, unggul secara akademis, dan berjiwa wirausaha."
}
```

**Technical Details:**
- **Authentication Required**: Yes (JWT + CSRF token)
- **Vector Similarity**: 0.75 threshold for context relevance
- **Embedding Model**: @cf/baai/bge-base-en-v1.5 (768 dimensions)
- **Top K Results**: 3 most relevant documents
- **Language**: Indonesian (Bahasa Indonesia)
- **Document Count**: 10 school information documents
- **Error Handling**: Returns empty context if no relevant documents found

### Student Support AI
```http
POST /api/student-support
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-CSRF-Token: {csrf_token}

{
  "studentId": "12345",
  "message": "Saya kesulitan dengan pelajaran matematika",
  "category": "academic",
  "context": {
    "grade": "XII IPA 1",
    "recent_performance": "declining"
  }
}
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:**
```json
{
  "response": "Saya memahami kesulitan Anda dengan matematika. Berikut beberapa saran yang dapat membantu Anda...",
  "category": "academic_support",
  "contextUsed": true,
  "confidence": 0.82
}
```

**Technical Details:**
- **Authentication Required**: Yes (JWT + CSRF token)
- **AI Model**: @cf/google/gemma-7b-it-lora
- **Similarity Threshold**: 0.7 (lower for support queries)
- **Top K Results**: 5 documents for comprehensive support
- **Max Tokens**: 500 for AI responses
- **Temperature**: 0.7 for balanced creativity
- **Response Categorization**: Automatic categorization based on content

### Support Monitoring AI
```http
POST /api/support-monitoring
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-CSRF-Token: {csrf_token}

{
  "studentMetrics": {
    "gpa": 2.8,
    "attendance": 85,
    "engagement_score": 60,
    "recent_grades": [75, 70, 65]
  }
}
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:**
```json
{
  "riskAssessment": {
    "riskLevel": "medium",
    "trend": "declining",
    "riskFactors": ["decreasing_grades", "low_engagement"]
  },
  "proactiveResources": [
    {
      "content": "Program Unggulan Tahfidz Al-Qur'an...",
      "relevance": 0.75,
      "type": "resource"
    }
  ],
  "recommendations": ["teacher_consultation", "parent_notification"]
}
```

**Technical Details:**
- **Authentication Required**: Yes (JWT + CSRF token)
- **Risk Analysis**: Multi-factor risk assessment algorithm
- **Resource Matching**: 0.6 similarity threshold for resources
- **Proactive Monitoring**: Automated risk identification
- **Recommendation Engine**: Context-aware suggestions

### Seed Vector Database
```http
GET /seed
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:**
```
Successfully seeded 10 documents.
```

**Technical Details:**
- **Authentication Required**: No (admin endpoint)
- **Batch Processing**: 100 documents per batch
- **Document Sources**: Hardcoded in worker.js
- **Document Categories**: School profile, programs, PPDB, location, contact
- **Embedding Model**: @cf/baai/bge-base-en-v1.5
- **Vector Index**: Cloudflare Vectorize
- **One-time Operation**: Run once after deployment

### Health Check
```http
GET /health
```

**Implementation Status:** ✅ **Fully Implemented**

**Response (Healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "services": {
    "ai": "operational",
    "database": "operational",
    "vectorize": "operational"
  },
  "version": "1.2.0",
  "environment": "production"
}
```

**Response (Degraded):**
```json
{
  "status": "degraded",
  "timestamp": "2025-11-24T10:30:00.000Z",
  "services": {
    "ai": "degraded",
    "database": "operational",
    "vectorize": "operational"
  },
  "version": "1.2.0",
  "environment": "production"
}
```

**Technical Details:**
- **Authentication Required**: No (public endpoint)
- **Service Tests**: Active connectivity checks for all services
- **Status Codes**: 200 for healthy, 503 for degraded/unhealthy
- **Version Tracking**: Current worker version
- **Environment Detection**: Development/production mode

## 🔐 Signature API

### Generate HMAC Signature
```http
POST /generate-signature
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-CSRF-Token: {csrf_token}

{
  "data": "string_to_sign"
}
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:**
```json
{
  "signature": "a1b2c3d4e5f6..."
}
```

**Error Response:**
```json
{
  "message": "Server configuration error."
}
```

**Technical Details:**
- **Authentication Required**: Yes (JWT + CSRF token)
- **Algorithm**: HMAC-SHA256
- **Secret Key**: Must be 32+ characters, cannot use default value
- **Input Validation**: Data must be non-empty string
- **Security**: Uses Web Crypto API for secure signature generation

### Verify HMAC Signature
```http
POST /verify-signature
Content-Type: application/json
Authorization: Bearer {jwt_token}
X-CSRF-Token: {csrf_token}

{
  "data": "string_to_verify",
  "signature": "a1b2c3d4e5f6..."
}
```

**Implementation Status:** ✅ **Fully Implemented**

**Response:**
```json
{
  "isValid": true
}
```

**Error Response:**
```json
{
  "message": "Server configuration error."
}
```

**Technical Details:**
- **Authentication Required**: Yes (JWT + CSRF token)
- **Algorithm**: HMAC-SHA256 verification
- **Secret Key**: Same key used for generation
- **Signature Format**: Hexadecimal string
- **Security**: Constant-time comparison to prevent timing attacks

## 🚫 Not Implemented Endpoints

The following endpoints are **NOT YET IMPLEMENTED** in the current worker.js:

### Student Data APIs
- `GET /api/student/{student_id}` - Student profile and academic data
- `GET /api/student/{student_id}/grades` - Student grades and GPA
- `GET /api/student/{student_id}/schedule` - Class schedule
- `GET /api/student/{student_id}/attendance` - Attendance records

### Teacher Management APIs
- `GET /api/teacher/{teacher_id}/classes` - Teacher class assignments
- `POST /api/teacher/{teacher_id}/grades` - Grade submission
- `POST /api/teacher/{teacher_id}/attendance` - Attendance submission

### Parent Portal APIs
- `GET /api/parent/{parent_id}/children` - Parent's children list
- `GET /api/parent/{parent_id}/child/{child_id}/report` - Child academic report

### Content Management APIs
- `GET /api/content/featured-programs` - Dynamic featured programs
- `GET /api/content/news` - Dynamic news content
- `GET /api/content/announcements` - School announcements

### System APIs
- `POST /refresh-token` - Token refresh
- `POST /logout` - User logout
- `GET /api/analytics/dashboard` - Analytics dashboard
- `POST /api/messaging/send` - Messaging system
- `GET /api/messaging/inbox` - Message inbox
- `POST /api/webhooks/subscribe` - Webhook subscriptions

**Current Alternative**: Frontend uses static/demo data for all unimplemented endpoints.

## 🔧 Error Handling

### Standard Error Response
```json
{
  "message": "Terjadi kesalahan pada server."
}
```

### Common Error Responses by Endpoint

#### Authentication Errors
- **Rate Limit Exceeded** (429): `"Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit."`
- **Invalid Email** (400): `"Format email tidak valid."`
- **Unauthorized Email** (403): `"Email tidak terdaftar dalam sistem."`
- **Token Invalid** (400): `"Token tidak valid atau hilang."`
- **Token Expired** (400): `"Link login sudah kedaluwarsa atau tidak valid."`

#### API Errors
- **Authentication Required** (401): `"Autentikasi diperlukan."`
- **CSRF Invalid** (403): `"CSRF token tidak valid."`
- **Server Configuration** (500): `"Server configuration error."`
- **General Error** (500): `"Terjadi kesalahan pada server."`

## 🚀 Rate Limiting

### Rate Limiting Implementation
- **Login Endpoint**: 3 requests per minute per IP
- **General APIs**: 100 requests per 15 minutes per IP
- **Distributed Storage**: Uses KV store when available, fallback to memory
- **Block Duration**: 30 minutes for abusive clients
- **IP Detection**: CF-Connecting-IP header, X-Forwarded-IP fallback

### Security Event Logging
All security events are logged with severity levels:
- **CRITICAL**: AUTH_BYPASS_ATTEMPT, CSRF_TOKEN_INVALID, RATE_LIMIT_HARD_BLOCK
- **HIGH**: RATE_LIMIT_EXCEEDED, INVALID_TOKEN, UNAUTHORIZED_ACCESS
- **MEDIUM**: SUSPICIOUS_INPUT, FAILED_AUTHENTICATION
- **LOW**: Informational events

## 🧪 Testing

### Test Authentication Flow
```bash
# 1. Request magic link (using allowed email)
curl -X POST https://your-worker.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ma-malnukananga.sch.id"}'

# 2. Seed vector database (one-time setup)
curl -X GET https://your-worker.workers.dev/seed

# 3. Test AI chat (requires authentication cookie)
curl -X POST https://your-worker.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-auth_session=YOUR_JWT_TOKEN" \
  -d '{"message": "Apa saja program unggulan sekolah?"}'
```

### Test Health Check
```bash
curl -X GET https://your-worker.workers.dev/health
```

### Test Signature API
```bash
# Generate signature
curl -X POST https://your-worker.workers.dev/generate-signature \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-auth_session=YOUR_JWT_TOKEN" \
  -d '{"data": "test string"}'

# Verify signature
curl -X POST https://your-worker.workers.dev/verify-signature \
  -H "Content-Type: application/json" \
  -H "Cookie: __Host-auth_session=YOUR_JWT_TOKEN" \
  -d '{"data": "test string", "signature": "SIGNATURE_FROM_PREVIOUS_CALL"}'
```

## 📊 Implementation Summary

### ✅ Fully Implemented Endpoints (9 endpoints)

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/request-login-link` | POST | No | Magic link generation with rate limiting |
| `/verify-login` | GET | No | JWT token verification and cookie setting |
| `/api/chat` | POST | Yes | RAG chat with vector database |
| `/api/student-support` | POST | Yes | Enhanced AI student support |
| `/api/support-monitoring` | POST | Yes | Proactive student monitoring |
| `/seed` | GET | No | Vector database seeding |
| `/health` | GET | No | System health check |
| `/generate-signature` | POST | Yes | HMAC signature generation |
| `/verify-signature` | POST | Yes | HMAC signature verification |

### 🔧 Security Features Implemented

| Feature | Implementation |
|---------|----------------|
| **Rate Limiting** | Distributed KV store with memory fallback |
| **CSRF Protection** | Double-submit cookie pattern |
| **JWT Security** | HMAC-SHA256 with Web Crypto API |
| **Input Validation** | Email sanitization and format validation |
| **Security Logging** | Comprehensive event logging with severity levels |
| **Secure Cookies** | __Host prefix, HTTP-only, partitioned |
| **IP Blocking** | Automatic blocking for abusive clients |

### 📈 System Architecture

| Component | Technology | Status |
|-----------|------------|--------|
| **Authentication** | JWT + Magic Links | ✅ Operational |
| **AI Chat** | Cloudflare AI + Vectorize | ✅ Operational |
| **Vector Database** | Cloudflare Vectorize | ✅ Operational |
| **Database** | Cloudflare D1 | ✅ Operational |
| **Email Service** | MailChannels API | ✅ Operational |
| **Security Logging** | Cloudflare KV | ✅ Operational (if configured) |

### 🚫 Future Development Priorities

| Priority | Feature | Description |
|----------|---------|-------------|
| **HIGH** | Student Data APIs | Academic records, grades, attendance |
| **HIGH** | Content Management | Dynamic news and announcements |
| **MEDIUM** | Teacher APIs | Class management and grade input |
| **MEDIUM** | Parent Portal | Child monitoring and reports |
| **LOW** | Analytics Dashboard | System metrics and reporting |

---

## 📞 Support

For API support and questions:
- **Documentation**: Available in repository docs/ folder
- **Source Code**: worker.js contains all endpoint implementations
- **Environment Setup**: See AGENTS.md for critical configuration

---

## 📊 Implementation Status

| Status | Description | Count |
|--------|-------------|-------|
| ✅ **Fully Implemented** | Endpoint working in production | 9 endpoints |
| ❌ **Not Implemented** | Features for future development | 15+ endpoints |
| 📝 **Static Data** | Frontend uses demo data | Unimplemented features |

### 🎯 Current System Capabilities

**✅ Working Features:**
- Magic link authentication with security
- AI chat with RAG vector search
- Student support AI with risk assessment
- System health monitoring
- HMAC signature generation/verification
- Comprehensive security logging

**🚧 Planned Features:**
- Student academic data management
- Teacher grade and attendance input
- Parent portal and monitoring
- Dynamic content management
- Analytics and reporting

---

*API Documentation Version: 1.4.0*  
*Last Updated: November 24, 2025*  
*Implementation Rate: 100% (9/9 documented endpoints)*  
*Backend: Cloudflare Workers with D1, Vectorize & AI*  
*Status: Production Ready (Core Features)*