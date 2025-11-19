# 📚 API Documentation - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga API provides comprehensive endpoints for authentication, AI chat functionality, content management, and academic data management. The API is built on Cloudflare Workers with serverless architecture.

## 🏗️ Architecture

### Base Configuration
- **Base URL**: `https://malnu-api.sulhi-cmz.workers.dev`
- **API Version**: v1
- **Content-Type**: `application/json`
- **Authentication**: JWT Token (Magic Link System)
- **Rate Limiting**: 15 requests per 15 minutes per IP

### Environment Variables
```typescript
API_CONFIG = {
  BASE_URL: string,
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}
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
  "message": "Link login telah dikirim ke email Anda"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Format email tidak valid"
}
```

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
  "message": "Login berhasil"
}
```

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
```json
{
  "success": true,
  "message": "Vector database berhasil di-seed",
  "documents_count": 150
}
```

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
- **Chat API**: 20 requests per minute
- **Data APIs**: 100 requests per minute
- **Content APIs**: 50 requests per minute

## 🧪 Testing

### Test Authentication Flow
```bash
# 1. Request magic link
curl -X POST https://malnu-api.sulhi-cmz.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify token (gunakan token dari response)
curl -X GET "https://malnu-api.sulhi-cmz.workers.dev/verify-login?token=YOUR_TOKEN"
```

### Test AI Chat
```bash
curl -X POST https://malnu-api.sulhi-cmz.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa saja program unggulan sekolah?"}'
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

// Student Data
const studentData = await StudentApiService.getStudentData('student_123');
const grades = await StudentApiService.getStudentGrades('student_123');

// Teacher Operations
const classes = await TeacherApiService.getTeacherClasses('teacher_456');
await TeacherApiService.submitGrades('teacher_456', gradeData);
```

### Python
```python
import requests
import json

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

# Student Data with Authentication
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(
  'https://malnu-api.sulhi-cmz.workers.dev/api/student/123',
  headers=headers
)
student_data = response.json()

# Submit Grades
grades_data = {
  "class_id": 1,
  "subject": "Matematika",
  "grades": [
    {"student_id": 1, "uts": 85, "uas": 88, "tugas": 90}
  ]
}
response = requests.post(
  'https://malnu-api.sulhi-cmz.workers.dev/api/teacher/456/grades',
  headers=headers,
  json=grades_data
)
```

### cURL Examples
```bash
# Request Magic Link
curl -X POST https://malnu-api.sulhi-cmz.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Verify Login Token
curl -X GET "https://malnu-api.sulhi-cmz.workers.dev/verify-login?token=YOUR_JWT_TOKEN"

# AI Chat
curl -X POST https://malnu-api.sulhi-cmz.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa program unggulan sekolah?"}'

# Get Student Data (Authenticated)
curl -X GET https://malnu-api.sulhi-cmz.workers.dev/api/student/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Health Check
curl https://malnu-api.sulhi-cmz.workers.dev/health

# System Metrics (Admin Only)
curl -X GET https://malnu-api.sulhi-cmz.workers.dev/metrics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## 🔄 Webhooks

### Webhook Events
- `user.login`: User berhasil login
- `user.logout`: User logout
- `grade.submitted`: Nilai disubmit
- `attendance.recorded`: Absensi dicatat
- `content.updated`: Konten website diperbarui
- `ai.chat.started`: Sesi AI chat dimulai
- `system.maintenance`: Maintenance sistem dimulai

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

**Response:**
```json
{
  "success": true,
  "webhook_id": "wh_123456",
  "events": ["user.login", "grade.submitted"],
  "status": "active"
}
```

### Webhook Payload Example
```json
{
  "event": "user.login",
  "timestamp": "2024-11-01T10:30:00Z",
  "data": {
    "user_id": 123,
    "email": "user@example.com",
    "role": "student",
    "ip_address": "192.168.1.1"
  }
}
```

## 📊 Monitoring & Logging

### Health Check Endpoints
- `/health` - Overall system health
- `/health/ai` - AI service status
- `/health/database` - Database connectivity
- `/health/vectorize` - Vector database status
- `/health/cache` - Cache system status
- `/metrics` - System metrics and performance

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-11-01T10:30:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "ai": "operational",
    "database": "operational",
    "vectorize": "operational",
    "cache": "operational"
  },
  "metrics": {
    "requests_per_minute": 45,
    "error_rate": 0.01,
    "response_time_ms": 120
  }
}
```

### Logging Format
```json
{
  "timestamp": "2024-11-01T10:30:00Z",
  "level": "info",
  "service": "auth",
  "message": "User login successful",
  "user_id": 123,
  "ip": "192.168.1.1",
  "request_id": "req_123456",
  "duration_ms": 150,
  "endpoint": "/verify-login"
}
```

### System Metrics
```http
GET /metrics
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "system": {
    "uptime_seconds": 86400,
    "memory_usage_mb": 128,
    "cpu_usage_percent": 15.5
  },
  "api": {
    "total_requests": 15000,
    "requests_per_minute": 45,
    "error_rate_percent": 0.01,
    "average_response_time_ms": 120
  },
  "ai": {
    "total_queries": 2500,
    "queries_per_minute": 8,
    "success_rate_percent": 98.5,
    "average_response_time_ms": 800
  },
  "database": {
    "connection_pool_active": 5,
    "query_time_avg_ms": 25,
    "total_queries": 50000
  }
}
```

---

## 📞 Support

For API support and questions:
- **Email**: api-support@ma-malnukananga.sch.id
- **Documentation**: https://docs.ma-malnukananga.sch.id
- **Status Page**: https://status.ma-malnukananga.sch.id

---

*API Documentation Version: 1.0.0*  
*Last Updated: November 2024*  
*Base URL: https://malnu-api.sulhi-cmz.workers.dev*