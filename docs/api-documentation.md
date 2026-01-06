# API Reference

**Created**: 2026-01-05
**Last Updated**: 2026-01-06
**Version**: 2.1.0
**Status**: Active

## Overview

This document provides comprehensive API reference for the MA Malnu Kananga web application. The application uses Cloudflare Workers as the backend with JWT-based authentication.

**For deployment and setup instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).**

## Architecture

### Components

1. **Frontend** (React + Vite)
   - Runs on Cloudflare Pages or any static hosting
   - Uses `apiService.ts` for backend communication
   - Stores JWT tokens in localStorage for authentication

2. **Backend** (Cloudflare Worker)
   - Handles API requests and business logic
   - Implements JWT-based authentication with refresh tokens
   - Serves as the API gateway for the frontend

3. **Database** (Cloudflare D1)
   - SQLite-based serverless database
   - Stores all application data
   - Managed via SQL queries in the Worker

### Authentication Flow

1. User logs in → Frontend sends credentials to `/api/auth/login`
2. Backend validates credentials → Returns JWT tokens (access + refresh)
3. Frontend stores tokens → Access token (15min), Refresh token (7 days)
4. All API requests include access token in Authorization header
5. When access token expires → Frontend uses refresh token to get new access token
6. When refresh token expires → User must login again

## Table of Contents

- [Authentication API](#authentication-api)
- [Users API](#users-api)
- [PPDB Registrants API](#ppdb-registrants-api)
- [Inventory API](#inventory-api)
- [School Events API](#school-events-api)
- [AI Services API](#ai-services-api)
- [File Management API](#file-management-api)
- [Error Handling](#error-handling)
- [Security Best Practices](#security-best-practices)

---

**Related Documentation**:
- [BLUEPRINT.md](./BLUEPRINT.md) - System architecture overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment and setup
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Development guidelines
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution process

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

## Users API

### Get All Users
```typescript
GET /api/users
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  "success": true,
  "data": User[]
}
```

### Get User by ID
```typescript
GET /api/users/:id
Authorization: Bearer <token>
```

### Create User
```typescript
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "role": "teacher|student|staff|osis",
  "status": "active"
}
```

### Update User
```typescript
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "status": "active"
}
```

### Delete User
```typescript
DELETE /api/users/:id
Authorization: Bearer <token>
```

---

## PPDB Registrants API

### Get All Registrants
```typescript
GET /api/ppdb_registrants
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  "success": true,
  "data": PPDBRegistrant[]
}
```

### Create Registration
```typescript
POST /api/ppdb_registrants
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "string",
  "nisn": "string",
  "originSchool": "string",
  "parentName": "string",
  "phoneNumber": "string",
  "email": "string",
  "address": "string"
}
```

### Update Status
```typescript
PUT /api/ppdb_registrants/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved|rejected|pending",
  "notes": "string"
}
```

### Delete Registrant
```typescript
DELETE /api/ppdb_registrants/:id
Authorization: Bearer <token>
```

---

## Inventory API

### Get All Items
```typescript
GET /api/inventory
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  "success": true,
  "data": InventoryItem[]
}
```

### Create Item
```typescript
POST /api/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemName": "string",
  "category": "string",
  "quantity": number,
  "condition": "Baik|Rusak|Perlu Perbaikan",
  "location": "string"
}
```

### Update Item
```typescript
PUT /api/inventory/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": number,
  "condition": "string"
}
```

### Delete Item
```typescript
DELETE /api/inventory/:id
Authorization: Bearer <token>
```

---

## School Events API

### Get All Events
```typescript
GET /api/school_events
Authorization: Bearer <token>
```

**Response:**
```typescript
{
  "success": true,
  "data": SchoolEvent[]
}
```

### Create Event
```typescript
POST /api/school_events
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventName": "string",
  "description": "string",
  "date": "ISO date string",
  "location": "string",
  "status": "Upcoming|Ongoing|Done",
  "organizer": "string"
}
```

### Update Event
```typescript
PUT /api/school_events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Ongoing"
}
```

### Delete Event
```typescript
DELETE /api/school_events/:id
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

## Security Best Practices

### Authentication
- JWT tokens with 15min access token, 7-day refresh token expiration
- Automatic token refresh when access token expires
- Token invalidation on logout

### Authorization
- Role-based access control (RBAC) with extra roles (staff, osis)
- Permission checks on all protected endpoints
- Audit logging for admin actions

### Data Protection
- HTTPS enforcement in production
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection via React's built-in escaping

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

### v2.0.0 (2026-01-06)
- Added Users API (comprehensive CRUD operations)
- Added PPDB Registrants API
- Added Inventory API
- Added School Events API
- Removed duplicate Admin Management API (now part of Users API)
- Updated architecture section
- Updated security best practices to reflect JWT refresh mechanism

### v1.0.0 (2026-01-05)
- Initial API documentation
- Core endpoints covered
- Security guidelines
- Code examples added

---

**Related Documentation:**
- [BLUEPRINT.md](./BLUEPRINT.md) - System architecture overview
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deployment and setup
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) - Development guidelines
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution process