# API Documentation

**Created**: 2026-01-05  
**Last Updated**: 2026-01-05  
**Version**: 1.0.0  
**Status**: Active

## Overview

This document provides comprehensive API documentation for the MA Malnu Kananga web application. The application uses a hybrid architecture with both frontend (React) and backend (Cloudflare Workers) APIs.

## Table of Contents

- [Authentication API](#authentication-api)
- [Student Services API](#student-services-api)
- [AI Services API](#ai-services-api)
- [File Management API](#file-management-api)
- [Admin Management API](#admin-management-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Security](#security)

---

**Related Documentation**: See [BLUEPRINT.md](./BLUEPRINT.md) for complete system architecture

---

## Authentication API

### Login User
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**Response:**
```typescript
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "admin|teacher|student|staff|osis"
  },
  "token": "string"
}
```

### Logout User
```typescript
POST /api/auth/logout
Authorization: Bearer <token>
```

### Verify Token
```typescript
GET /api/auth/verify
Authorization: Bearer <token>
```

---

## Student Services API

### Get Student Profile
```typescript
GET /api/student/profile
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "class": "string",
    "grades": Grade[],
    "attendance": AttendanceRecord[],
    "schedule": ScheduleItem[]
  }
}
```

### Update Student Profile
```typescript
PUT /api/student/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "phone": "string"
}
```

### Get Academic Grades
```typescript
GET /api/student/grades?semester=1
Authorization: Bearer <token>
```

### Get Attendance Records
```typescript
GET /api/student/attendance?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

---

## AI Services API

### Get AI Response
```typescript
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "string",
  "context": "string",
  "conversationHistory": Message[]
}
```

**Response:**
```typescript
{
  "success": true,
  "response": "string",
  "timestamp": "string",
  "model": "gemini-1.5-flash"
}
```

### Get AI Response Stream
```typescript
POST /api/ai/chat/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "string",
  "context": "string"
}
```

**Response:** Server-Sent Events (SSE) stream

### Analyze Class Performance
```typescript
POST /api/ai/analyze-performance
Authorization: Bearer <token>
Content-Type: application/json

{
  "classId": "string",
  "subject": "string",
  "timeframe": "semester|year"
}
```

---

## File Management API

### Upload File
```typescript
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": File,
  "type": "material|assignment|document",
  "description": "string"
}
```

**Response:**
```typescript
{
  "success": true,
  "fileId": "string",
  "url": "string",
  "size": "number"
}
```

### Get File List
```typescript
GET /api/files?type=material&page=1&limit=20
Authorization: Bearer <token>
```

### Delete File
```typescript
DELETE /api/files/:fileId
Authorization: Bearer <token>
```

---

## Admin Management API

### Get Users List
```typescript
GET /api/admin/users?role=student&page=1&limit=20
Authorization: Bearer <token>
```

### Create User
```typescript
POST /api/admin/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "role": "teacher|student|staff|osis",
  "class": "string" // for students
}
```

### Update User
```typescript
PUT /api/admin/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "role": "string"
}
```

### Delete User
```typescript
DELETE /api/admin/users/:userId
Authorization: Bearer <token>
```

---

## Error Handling

### Standard Error Response
```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  }
}
```

### Common Error Codes
- `AUTHENTICATION_REQUIRED`: User needs to login
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request data is invalid
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server-side error

---

## Rate Limiting

### Default Limits
- **Authenticated users**: 100 requests/minute
- **Unauthenticated users**: 20 requests/minute
- **AI endpoints**: 30 requests/minute per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## Security

### Authentication
- JWT tokens with 24-hour expiration
- Token refresh mechanism
- Secure cookie storage for web clients

### Authorization
- Role-based access control (RBAC)
- Permission checks on all protected endpoints
- Audit logging for admin actions

### Data Protection
- HTTPS enforcement in production
- Input validation and sanitization
- SQL injection prevention
- XSS protection

---

## Code Examples

### JavaScript/TypeScript Client
```typescript
import { apiClient } from './services/apiService';

// Login example
const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// AI chat example
const chatWithAI = async (message: string) => {
  try {
    const response = await apiClient.post('/ai/chat', {
      message,
      context: 'student_portal'
    });
    return response.data.response;
  } catch (error) {
    console.error('AI chat failed:', error);
  }
};
```

### cURL Examples
```bash
# Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get student profile
curl -X GET https://your-domain.com/api/student/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload file
curl -X POST https://your-domain.com/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "type=material" \
  -F "description=Study material"
```

---

## Testing

### API Testing with Postman
Import the provided Postman collection for easy API testing:
- Contains all endpoints with example requests
- Includes environment variables for base URL and authentication
- Pre-configured test scripts for validation

### Automated Testing
```typescript
// Example of API test using Jest
describe('Authentication API', () => {
  test('should login with valid credentials', async () => {
    const response = await apiClient.post('/auth/login', {
      email: 'test@example.com',
      password: 'validPassword'
    });
    
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.token).toBeDefined();
  });
});
```

---

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure API base URL is correctly configured
   - Check that your domain is in the allowed origins list

2. **Authentication Failures**
   - Verify JWT token is valid and not expired
   - Check that Authorization header is properly formatted

3. **File Upload Failures**
   - Verify file size doesn't exceed limits (10MB)
   - Ensure file types are allowed (PDF, DOC, DOCX, JPG, PNG)

4. **AI Service Errors**
   - Check API quota limits
   - Verify Gemini API key is configured
   - Review content policy restrictions

### Debug Mode
Enable debug logging by setting environment variable:
```bash
VITE_LOG_LEVEL=DEBUG
```

---

## Changelog

### v1.0.0 (2026-01-05)
- Initial API documentation
- Comprehensive endpoint coverage
- Security guidelines
- Code examples added

---

**Related Documentation:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Development guidelines
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution process