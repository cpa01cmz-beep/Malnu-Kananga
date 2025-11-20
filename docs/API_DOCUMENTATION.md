# 📚 API Documentation - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga API provides comprehensive endpoints for authentication, AI chat functionality, content management, and academic data management. The API is built on Cloudflare Workers with serverless architecture.

## 🏗️ Architecture

### Base Configuration
- **Base URL**: `https://malnu-api.sulhi-cmz.workers.dev` (Note: URL may vary based on deployment)
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: JWT Token (Magic Link System) with HMAC-SHA256 signing
- **Rate Limiting**: 5 requests per 15 minutes per IP (authentication), unlimited for chat and data APIs
- **CORS**: Enabled for all origins (`Access-Control-Allow-Origin: *`)
- **Timeout**: 10 seconds per request
- **Retry Policy**: 3 attempts with exponential backoff
- **Security**: IP-based rate limiting, secure token generation with Web Crypto API
- **Status**: Production Ready (Check actual deployment URL in environment)

### Environment Variables
```typescript
API_CONFIG = {
  BASE_URL: string,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// Required Environment Variables (Cloudflare Workers Secrets)
API_KEY=your_gemini_api_key_here          # Google Gemini AI API key
SECRET_KEY=your_jwt_secret_key            # HMAC secret key for JWT signing
NODE_ENV=production                       # Environment mode

// Optional Environment Variables
VITE_ENABLE_PWA=true                     # Enable PWA features
VITE_ENABLE_AI_CHAT=true                  # Enable AI chat functionality
VITE_ENABLE_ANALYTICS=false               # Enable analytics tracking
VITE_WORKER_URL=https://malnu-api.sulhi-cmz.workers.dev  # Worker URL override

// Development Environment Variables
VITE_DEV_MODE=true                        # Development mode flag
VITE_JWT_SECRET=dev-secret-key            # Development JWT secret (use only in dev)

// Rate Limiting Configuration (built-in)
RATE_LIMIT_WINDOW_MS=900000               # 15 minutes in milliseconds
RATE_LIMIT_MAX_ATTEMPTS=5                 # Max attempts per window
RATE_LIMIT_BLOCK_DURATION=1800000         # 30 minutes block duration

// Cloudflare Workers Bindings (auto-configured)
AI=@cf/baai/bge-base-en-v1.5              # AI model for embeddings
VECTORIZE_INDEX=malnu-kananga-index       # Vector database index
DB=malnu-kananga-db                       # D1 database binding
```

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

**Response:**
```json
{
  "success": true,
  "message": "Link login telah dikirim ke email Anda",
  "expires_in": 900
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Terlalu banyak percobaan login. Silakan coba lagi dalam 30 menit.",
    "retry_after": 1800
  }
}
```

**Rate Limiting:**
- Maximum 5 requests per 15 minutes per IP address
- Automatic 30-minute block on limit exceeded
- Uses Cloudflare CF-Connecting-IP header for IP detection

#### Verify Login Token
```http
GET /verify-login?token={jwt_token}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "student|teacher|parent|admin",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "is_active": true
  },
  "token": {
    "expires_at": "2024-01-01T00:15:00Z",
    "type": "magic_link"
  },
  "message": "Login berhasil"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token telah kedaluwarsa. Silakan request link login baru."
  }
}
```

**Token Security:**
- JWT tokens signed with HMAC-SHA256
- 15-minute expiry by default
- Includes jti (JWT ID) for token tracking
- Uses Web Crypto API for secure signature generation

#### Token Refresh
```http
POST /refresh-token
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token",
  "message": "Token berhasil di-refresh"
}
```

#### Logout
```http
POST /logout
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

## 🤖 AI Chat API

### Chat with AI Assistant
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Apa saja program unggulan sekolah?"
}
```

**Response (Streaming):**
```json
{
  "context": "Konten relevan dari vector database...",
  "response": "Jawaban AI dalam bahasa Indonesia..."
}
```

### Seed Vector Database
```http
GET /seed
```

**Response:**
```
Successfully seeded 50 documents.
```

**Description:**
- Seeds the vector database with school information documents
- Uses Cloudflare AI embeddings model (@cf/baai/bge-base-en-v1.5)
- Inserts documents in batches of 100 for optimal performance
- Must be run once after worker deployment
- Documents include: school programs, PPDB info, location, contact details

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "ai": "operational",
    "database": "operational",
    "vectorize": "operational"
  }
}
```

**Note**: This endpoint is referenced in documentation but may not be implemented in current worker.js. Use direct endpoint testing for health verification.

## 📊 Student API

### Get Student Data
```http
GET /api/student/{student_id}
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "id": 1,
  "name": "Ahmad Fauzi Rahman",
  "email": "student@example.com",
  "class": "XII IPA 1",
  "gpa": 3.8,
  "attendance": 95,
  "grades": [
    {
      "subject": "Matematika",
      "score": 85,
      "grade": "B+"
    }
  ],
  "schedule": [
    {
      "day": "Senin",
      "time": "07:00-08:30",
      "subject": "Matematika",
      "teacher": "Dr. Siti Nurhaliza",
      "room": "Lab Komputer"
    }
  ]
}
```

### Get Student Grades
```http
GET /api/student/{student_id}/grades
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "semester": "Ganjil 2024/2025",
  "gpa": 3.8,
  "subjects": [
    {
      "name": "Matematika",
      "uts": 85,
      "uas": 88,
      "tugas": 90,
      "kehadiran": 95,
      "final_grade": 87,
      "letter_grade": "B+"
    }
  ]
}
```

### Get Student Schedule
```http
GET /api/student/{student_id}/schedule
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "schedule": [
    {
      "day": "Senin",
      "classes": [
        {
          "time": "07:00-08:30",
          "subject": "Matematika",
          "teacher": "Dr. Siti Nurhaliza, M.Pd.",
          "room": "Ruang 301",
          "type": "Regular"
        }
      ]
    }
  ]
}
```

### Get Student Attendance
```http
GET /api/student/{student_id}/attendance
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "month": "November 2024",
  "statistics": {
    "total_days": 22,
    "present": 21,
    "sick": 1,
    "absent": 0,
    "permission": 0,
    "percentage": 95.5
  },
  "details": [
    {
      "date": "2024-11-01",
      "status": "present",
      "subject": "Matematika"
    }
  ]
}
```

## 👨‍🏫 Teacher API

### Get Teacher Classes
```http
GET /api/teacher/{teacher_id}/classes
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "teacher": {
    "id": 2,
    "name": "Dr. Siti Nurhaliza, M.Pd.",
    "email": "teacher@example.com"
  },
  "classes": [
    {
      "id": 1,
      "name": "XII IPA 1",
      "subject": "Matematika",
      "students_count": 32,
      "schedule": "Senin, 07:00-08:30"
    }
  ]
}
```

### Input Student Grades
```http
POST /api/teacher/{teacher_id}/grades
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "class_id": 1,
  "subject": "Matematika",
  "grades": [
    {
      "student_id": 1,
      "uts": 85,
      "uas": 88,
      "tugas": 90,
      "kehadiran": 95
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nilai berhasil disimpan",
  "processed": 32
}
```

### Submit Attendance
```http
POST /api/teacher/{teacher_id}/attendance
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "class_id": 1,
  "date": "2024-11-01",
  "attendance": [
    {
      "student_id": 1,
      "status": "present"
    },
    {
      "student_id": 2,
      "status": "sick",
      "note": "Demam"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Absensi berhasil disimpan",
  "processed": 32
}
```

## 👨‍👩‍👧‍👦 Parent API

### Get Parent Children
```http
GET /api/parent/{parent_id}/children
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "parent": {
    "id": 4,
    "name": "Bapak Ahmad Rahman",
    "email": "parent@example.com"
  },
  "children": [
    {
      "id": 3,
      "name": "Ahmad Fauzi Rahman",
      "class": "XII IPA 1",
      "gpa": 3.8,
      "attendance_percentage": 95.5
    }
  ]
}
```

### Get Child Academic Report
```http
GET /api/parent/{parent_id}/child/{child_id}/report
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "student": {
    "name": "Ahmad Fauzi Rahman",
    "class": "XII IPA 1"
  },
  "academic_summary": {
    "gpa": 3.8,
    "attendance": 95.5,
    "rank": 5
  },
  "subjects": [
    {
      "name": "Matematika",
      "grade": "B+",
      "score": 87,
      "teacher": "Dr. Siti Nurhaliza, M.Pd."
    }
  ],
  "announcements": [
    {
      "title": "Ujian Semester Ganjil",
      "date": "2024-12-01",
      "description": "Ujian akan dimulai tanggal 1 Desember 2024"
    }
  ]
}
```

## 📰 Content API

### Get Featured Programs
```http
GET /api/content/featured-programs
```

**Response:**
```json
{
  "programs": [
    {
      "id": 1,
      "title": "Program Unggulan Sains",
      "description": "Program intensif untuk persiapan olimpiade sains",
      "image": "https://images.unsplash.com/photo-...",
      "category": "Akademik",
      "requirements": ["Nilai matematika > 80", "Passing grade IPA"],
      "benefits": ["Bimbingan khusus", "Modul eksklusif"],
      "contact": "guru@example.com"
    }
  ]
}
```

### Get News
```http
GET /api/content/news
```

**Response:**
```json
{
  "news": [
    {
      "id": 1,
      "title": "Prestasi Gemilang di Olimpiade Sains",
      "excerpt": "Siswa MA Malnu Kananga meraih medali emas...",
      "content": "Konten lengkap berita...",
      "image": "https://images.unsplash.com/photo-...",
      "date": "2024-11-01",
      "author": "Admin",
      "category": "Prestasi"
    }
  ]
}
```

### Get Announcements
```http
GET /api/content/announcements
```

**Response:**
```json
{
  "announcements": [
    {
      "id": 1,
      "title": "Libur Semester Ganjil",
      "content": "Libur semester ganjil akan dimulai tanggal...",
      "date": "2024-11-01",
      "priority": "high",
      "target_audience": ["all"]
    }
  ]
}
```

## 💬 Messaging API

### Send Message
```http
POST /api/messaging/send
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "recipient_id": 2,
  "subject": "Tentang Nilai Anak",
  "message": "Saya ingin berkonsultasi tentang nilai anak saya...",
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pesan berhasil dikirim",
  "message_id": "msg_123456"
}
```

### Get Messages
```http
GET /api/messaging/inbox
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123456",
      "sender": {
        "id": 2,
        "name": "Dr. Siti Nurhaliza, M.Pd.",
        "role": "teacher"
      },
      "subject": "Tentang Nilai Anak",
      "message": "Assalamualaikum, saya ingin informasikan...",
      "date": "2024-11-01T10:30:00Z",
      "priority": "normal",
      "read": false
    }
  ]
}
```

## 📈 Analytics API

### Get Dashboard Stats
```http
GET /api/analytics/dashboard
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "overview": {
    "total_students": 450,
    "total_teachers": 35,
    "total_parents": 380,
    "average_gpa": 3.6,
    "attendance_rate": 94.5
  },
  "recent_activities": [
    {
      "type": "grade_input",
      "description": "Nilai UTS Matematika XII IPA 1",
      "timestamp": "2024-11-01T09:00:00Z"
    }
  ]
}
```

## 🔧 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Format email tidak valid",
    "details": {
      "field": "email",
      "expected": "valid email format"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED` (401): Token tidak valid atau kedaluwarsa
- `PERMISSION_DENIED` (403): Tidak memiliki akses ke resource
- `RESOURCE_NOT_FOUND` (404): Resource tidak ditemukan
- `VALIDATION_ERROR` (400): Input tidak valid
- `RATE_LIMIT_EXCEEDED` (429): Terlalu banyak request
- `INTERNAL_ERROR` (500): Error server internal

## 🚀 Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limits by Endpoint
- **Authentication**: 5 requests per 15 minutes
- **Chat API**: No rate limiting (unlimited)
- **Data APIs**: No rate limiting (unlimited)
- **Content APIs**: No rate limiting (unlimited)
- **Seed Endpoint**: No rate limiting (admin use only)
- **Signature APIs**: 10 requests per minute

## 🧪 Testing

### Test Authentication Flow
```bash
# 1. Request magic link
curl -X POST https://malnu-api.sulhi-cmz.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify token (gunakan token dari email)
curl -X GET "https://malnu-api.sulhi-cmz.workers.dev/verify-login?token=YOUR_TOKEN"
```

### Test AI Chat
```bash
curl -X POST https://malnu-api.sulhi-cmz.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa saja program unggulan sekolah?"}'
```

### Test Vector Database Seeding
```bash
# Seed vector database (run once after deployment)
curl -X GET https://malnu-api.sulhi-cmz.workers.dev/seed
```

## 📝 SDK Examples

### JavaScript/TypeScript
```typescript
import { AuthService, GeminiService } from './services';

// Authentication
const authResult = await AuthService.requestLoginLink('user@example.com');
const verifyResult = await AuthService.verifyLoginToken(token);

// AI Chat
const aiStream = GeminiService.getAIResponseStream('Hello!', []);
for await (const chunk of aiStream) {
  console.log(chunk);
}
```

### Python
```python
import requests

# Authentication
response = requests.post(
  'https://malnu-api.sulhi-cmz.workers.dev/request-login-link',
  json={'email': 'user@example.com'}
)

# AI Chat
response = requests.post(
  'https://malnu-api.sulhi-cmz.workers.dev/api/chat',
  json={'message': 'Apa saja program unggulan sekolah?'}
)
```

## 🔐 Signature API

### Generate HMAC Signature
```http
POST /generate-signature
Content-Type: application/json

{
  "data": "string_to_sign"
}
```

**Response:**
```json
{
  "signature": "hmac_signature_hash"
}
```

### Verify HMAC Signature
```http
POST /verify-signature
Content-Type: application/json

{
  "data": "string_to_verify",
  "signature": "hmac_signature_hash"
}
```

**Response:**
```json
{
  "isValid": true
}
```

## 🔄 Webhooks

### Webhook Events
- `user.login`: User berhasil login
- `user.logout`: User logout
- `grade.submitted`: Nilai disubmit
- `attendance.recorded`: Absensi dicatat

### Webhook Configuration
```http
POST /api/webhooks/subscribe
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["user.login", "grade.submitted"],
  "secret": "webhook_secret"
}
```

## 📊 Monitoring & Logging

### Available Endpoints
- `/request-login-link` - Request magic link authentication
- `/verify-login` - Verify JWT token from magic link
- `/refresh-token` - Refresh authentication token
- `/logout` - User logout
- `/api/chat` - AI chat with RAG system
- `/seed` - Seed vector database with school data
- `/generate-signature` - Generate HMAC signature
- `/verify-signature` - Verify HMAC signature

### Health Check Endpoints
- `/health` - Overall system health (planned, not yet implemented)
- Direct endpoint testing recommended for current health verification

### Logging Format
```json
{
  "timestamp": "2024-11-01T10:30:00Z",
  "level": "info",
  "service": "auth",
  "message": "User login successful",
  "user_id": 123,
  "ip": "192.168.1.1",
  "request_id": "req_123456"
}
```

---

## 📞 Support

For API support and questions:
- **Email**: api-support@ma-malnukananga.sch.id
- **Documentation**: https://docs.ma-malnukananga.sch.id
- **Status Page**: https://status.ma-malnukananga.sch.id

---

*API Documentation Version: 1.1.0*  
*Last Updated: November 20, 2024*  
*Base URL: https://malnu-api.sulhi-cmz.workers.dev*