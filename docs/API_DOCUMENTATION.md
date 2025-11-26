# 📚 API Documentation - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga API provides core endpoints for authentication and AI chat functionality. The API is built on Cloudflare Workers with serverless architecture.

## 🏗️ Architecture

- **Base URL**: `https://your-worker-url.workers.dev` (Deployed worker URL)
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: JWT Token (Magic Link System) with HMAC-SHA256 signing
- **Rate Limiting**: 5 requests per 15 minutes per IP (authentication), unlimited for chat APIs
- **CORS**: Enabled for specific origins (localhost:3000, localhost:5173, ma-malnukananga.sch.id)
- **Timeout**: 10 seconds per request
- **Security**: IP-based rate limiting, secure token generation with Web Crypto API
- **Implementation Status**: 8 endpoints implemented (32% of documented features)

### Environment Variables
```typescript
// Required Environment Variables (Cloudflare Workers Secrets)
SECRET_KEY=your_jwt_secret_key            # HMAC secret key for JWT signing (min 32 chars)
JWT_SECRET=your_jwt_secret_key            # Alternative JWT secret key
NODE_ENV=production                       # Environment mode

// Optional Environment Variables
VITE_ENABLE_PWA=true                     # Enable PWA features
VITE_ENABLE_AI_CHAT=true                  # Enable AI chat functionality
VITE_ENABLE_ANALYTICS=false               # Enable analytics tracking
VITE_WORKER_URL=https://your-worker-url.workers.dev  # Worker URL override

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
  }
}
```

## 🚨 Known Limitations

### Current System Limitations
1. **Static Data Only**: Student, teacher, and parent data use static TypeScript files
2. **No Database Integration**: D1 database exists but not connected to APIs
**Technical Details:**
For API support and questions:
- **Documentation Issues**: Create GitHub Issue in repository
- **Implementation Questions**: Review worker.js source code
- **Feature Requests**: Submit via GitHub Issues with "enhancement" label

---

*API Documentation Version: 1.3.0*  
*Last Updated: November 23, 2025*  
*Implementation Status: 8/25 endpoints implemented (32%)*  
*Backend: Cloudflare Workers with Vectorize*  
*Next Priority: Student Data APIs*
