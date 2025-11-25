# 🧪 API Testing Guide - MA Malnu Kananga

## 🌟 Overview

Panduan komprehensif untuk testing API endpoints MA Malnu Kananga. Dokumentasi ini mencakup manual testing dengan Postman, automated testing dengan Jest, dan performance testing procedures.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Manual Testing with Postman](#manual-testing-with-postman)
4. [Automated Testing](#automated-testing)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)
7. [Test Data Management](#test-data-management)
8. [CI/CD Integration](#cicd-integration)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Tools
- **Node.js** 18+ untuk automated testing
- **Postman** untuk manual testing
- **Git** untuk version control
- **Cloudflare Account** untuk worker testing

### Required Knowledge
- REST API concepts
- HTTP methods dan status codes
- JavaScript/TypeScript basics
- Authentication concepts (Magic Link)

---

## 🌍 Environment Setup

### Test Environment Configuration

```bash
# Clone repository
git clone https://github.com/sulhi/ma-malnu-kananga.git
cd ma-malnu-kananga

# Install dependencies
npm install

# Setup test environment
cp .env.example .env.test
```

### Environment Variables for Testing

```bash
# .env.test
NODE_ENV=test
VITE_APP_ENV=test
API_KEY=your_test_gemini_api_key
WORKER_URL=https://malnu-kananga-test.your-subdomain.workers.dev
```

### Test Database Setup

```bash
# Create test database
wrangler d1 create malnu-kananga-test-db

# Seed test data
npm run test:seed
```

---

## 📮 Manual Testing with Postman

### Postman Collection Setup

1. **Import Collection**
   - Download `MA-Malnu-Kananga-API.postman_collection.json`
   - Import ke Postman
   - Configure environment variables

2. **Environment Variables**

```json
{
  "name": "MA Malnu Kananga - Test",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://malnu-kananga-test.workers.dev",
      "enabled": true
    },
    {
      "key": "apiKey",
      "value": "{{your_test_api_key}}",
      "enabled": true
    },
    {
      "key": "authToken",
      "value": "",
      "enabled": true
    }
  ]
}
```

### API Endpoints Test Cases

#### 🔐 Authentication Endpoints

```http
### Request Magic Link
POST {{baseUrl}}/api/auth/request-login
Content-Type: application/json

{
  "email": "test.siswa@malnukananga.sch.id"
}

### Verify Magic Link
GET {{baseUrl}}/api/auth/verify?token={{authToken}}

### Logout
POST {{baseUrl}}/api/auth/logout
Authorization: Bearer {{authToken}}
```

#### 🤖 AI Chat Endpoints

```http
### Send Chat Message
POST {{baseUrl}}/api/chat
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "message": "Apa saja program unggulan di MA Malnu Kananga?",
  "context": "academic_programs"
}

### Get Chat History
GET {{baseUrl}}/api/chat/history
Authorization: Bearer {{authToken}}
```

#### 📚 Academic Endpoints

```http
### Get Student Grades
GET {{baseUrl}}/api/academic/grades?studentId={{studentId}}
Authorization: Bearer {{authToken}}

### Submit Assignment
POST {{baseUrl}}/api/academic/assignments
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "assignmentId": "assign_001",
  "studentId": "student_001",
  "content": "Jawaban tugas...",
  "attachments": ["file1.pdf"]
}
```

### Postman Test Scripts

```javascript
// Tests tab in Postman
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has data", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
});

pm.test("Response time < 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// Save auth token for subsequent requests
if (pm.response.code === 200 && pm.response.json().token) {
    pm.environment.set("authToken", pm.response.json().token);
}
```

---

## 🤖 Automated Testing

### Jest Test Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### API Test Examples

```typescript
// src/__tests__/api/auth.test.ts
import request from 'supertest';
import { Worker } from '../worker';

describe('Authentication API', () => {
  let worker: Worker;

  beforeAll(async () => {
    worker = new Worker();
  });

  describe('POST /api/auth/request-login', () => {
    it('should send magic link for valid email', async () => {
      const response = await request(worker)
        .post('/api/auth/request-login')
        .send({
          email: 'test.siswa@malnukananga.sch.id'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid email format', async () => {
      const response = await request(worker)
        .post('/api/auth/request-login')
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token', async () => {
      // First request magic link
      const loginResponse = await request(worker)
        .post('/api/auth/request-login')
        .send({
          email: 'test.siswa@malnukananga.sch.id'
        });

      // Then verify token (mock implementation)
      const response = await request(worker)
        .get('/api/auth/verify')
        .query({ token: 'valid-test-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
    });
  });
});
```

### Integration Tests

```typescript
// src/__tests__/integration/chat.test.ts
import request from 'supertest';
import { Worker } from '../worker';

describe('Chat Integration Tests', () => {
  let worker: Worker;
  let authToken: string;

  beforeAll(async () => {
    worker = new Worker();
    // Setup authenticated user
    const authResponse = await request(worker)
      .post('/api/auth/request-login')
      .send({ email: 'test.siswa@malnukananga.sch.id' });
    
    authToken = authResponse.body.token;
  });

  it('should handle complete chat flow', async () => {
    // Send message
    const chatResponse = await request(worker)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: 'Apa jadwal pelajaran hari ini?',
        context: 'schedule'
      });

    expect(chatResponse.status).toBe(200);
    expect(chatResponse.body).toHaveProperty('response');
    expect(chatResponse.body).toHaveProperty('context');

    // Get chat history
    const historyResponse = await request(worker)
      .get('/api/chat/history')
      .set('Authorization', `Bearer ${authToken}`);

    expect(historyResponse.status).toBe(200);
    expect(Array.isArray(historyResponse.body.conversations)).toBe(true);
  });
});
```

### Test Utilities

```typescript
// src/__tests__/utils/testHelpers.ts
export const createTestUser = async (role: 'student' | 'teacher' | 'parent') => {
  const testUser = {
    email: `test.${role}@malnukananga.sch.id`,
    name: `Test ${role}`,
    role,
    classId: role === 'student' ? 'XII-IPA-1' : null
  };
  
  return testUser;
};

export const generateTestToken = (user: any) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const cleanupTestData = async () => {
  // Clean up test database
  await db.delete().from('test_users');
  await db.delete().from('test_conversations');
};
```

---

## ⚡ Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: '{{ $processEnvironment.BASE_URL }}'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Load test"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"
  payload:
    path: "test-data.csv"
    fields:
      - "email"
      - "message"

scenarios:
  - name: "Authentication Flow"
    weight: 40
    flow:
      - post:
          url: "/api/auth/request-login"
          json:
            email: "{{ email }}"
      - think: 2
      - get:
          url: "/api/auth/verify"
          qs:
            token: "test-token"

  - name: "Chat API"
    weight: 60
    flow:
      - post:
          url: "/api/chat"
          headers:
            Authorization: "Bearer test-token"
          json:
            message: "{{ message }}"
            context: "general"
```

### Performance Benchmarks

```typescript
// src/__tests__/performance/benchmarks.test.ts
import { performance } from 'perf_hooks';

describe('Performance Benchmarks', () => {
  it('API response time < 500ms', async () => {
    const start = performance.now();
    
    const response = await request(worker)
      .get('/api/academic/schedule')
      .set('Authorization', `Bearer ${authToken}`);
    
    const end = performance.now();
    const responseTime = end - start;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(500);
  });

  it('Chat API response time < 2000ms', async () => {
    const start = performance.now();
    
    const response = await request(worker)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: 'Test message for performance',
        context: 'test'
      });
    
    const end = performance.now();
    const responseTime = end - start;
    
    expect(response.status).toBe(200);
    expect(responseTime).toBeLessThan(2000);
  });
});
```

---

## 🔒 Security Testing

### Authentication Security Tests

```typescript
// src/__tests__/security/auth.test.ts
describe('Authentication Security', () => {
  it('should reject requests without auth token', async () => {
    const response = await request(worker)
      .get('/api/academic/grades');
    
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should reject invalid auth tokens', async () => {
    const response = await request(worker)
      .get('/api/academic/grades')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
  });

  it('should implement rate limiting', async () => {
    const requests = Array(100).fill(null).map(() =>
      request(worker).post('/api/auth/request-login')
        .send({ email: 'test@example.com' })
    );
    
    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });
});
```

### Input Validation Tests

```typescript
// src/__tests__/security/validation.test.ts
describe('Input Validation', () => {
  it('should sanitize XSS attempts', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    
    const response = await request(worker)
      .post('/api/chat')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        message: xssPayload,
        context: 'test'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.response).not.toContain('<script>');
  });

  it('should validate email format', async () => {
    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user..name@domain.com'
    ];
    
    for (const email of invalidEmails) {
      const response = await request(worker)
        .post('/api/auth/request-login')
        .send({ email });
      
      expect(response.status).toBe(400);
    }
  });
});
```

---

## 📊 Test Data Management

### Test Data Factory

```typescript
// src/__tests__/factories/userFactory.ts
import { faker } from '@faker-js/faker';

export class UserFactory {
  static createStudent(overrides = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName: 'student' }),
      name: faker.person.fullName(),
      role: 'student',
      classId: faker.helpers.arrayElement(['XII-IPA-1', 'XII-IPS-1', 'XI-IPA-2']),
      nis: faker.string.numeric(10),
      ...overrides
    };
  }

  static createTeacher(overrides = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email({ firstName: 'teacher' }),
      name: faker.person.fullName(),
      role: 'teacher',
      subjects: faker.helpers.arrayElements(['Matematika', 'Fisika', 'Kimia']),
      nip: faker.string.numeric(18),
      ...overrides
    };
  }
}
```

### Database Seeding

```typescript
// src/__tests__/seeds/testData.ts
import { UserFactory } from '../factories/userFactory';

export const seedTestData = async () => {
  // Create test users
  const testStudent = UserFactory.createStudent({
    email: 'test.siswa@malnukananga.sch.id'
  });
  
  const testTeacher = UserFactory.createTeacher({
    email: 'test.guru@malnukananga.sch.id'
  });

  // Insert to test database
  await db.insertInto('users').values([testStudent, testTeacher]).execute();
  
  // Create test academic data
  await seedAcademicData();
};

export const clearTestData = async () => {
  await db.deleteFrom('users').where('email', 'like', 'test.%').execute();
  await db.deleteFrom('academic_records').where('studentId', 'like', 'test-%').execute();
};
```

---

## 🔄 CI/CD Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/api-tests.yml
name: API Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Setup test environment
      run: |
        cp .env.example .env.test
        echo "NODE_ENV=test" >> .env.test
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run API tests
      run: npm run test:api
    
    - name: Run performance tests
      run: npm run test:performance
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Test Scripts in package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:api": "jest --testPathPattern=api",
    "test:performance": "jest --testPathPattern=performance",
    "test:security": "jest --testPathPattern=security",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:seed": "tsx src/__tests__/seeds/testData.ts",
    "test:clean": "tsx src/__tests__/utils/cleanup.ts"
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Failures
```bash
# Check environment variables
echo $API_KEY
echo $JWT_SECRET

# Verify worker deployment
curl https://your-worker.workers.dev/health
```

#### 2. Database Connection Issues
```bash
# Check D1 database status
wrangler d1 list

# Test database connection
wrangler d1 execute malnu-kananga-test-db --command "SELECT 1"
```

#### 3. Test Timeouts
```javascript
// Increase timeout in jest.config.js
module.exports = {
  testTimeout: 30000, // 30 seconds
  // ... other config
};
```

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG = 'api:*';

// Add debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
```

---

## 📈 Test Reports

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View detailed coverage
open coverage/lcov-report/index.html
```

### Performance Reports

```bash
# Run Artillery performance test
artillery run artillery-config.yml

# Generate HTML report
artillery report --output report.html artillery-results.json
```

---

## 🎯 Best Practices

### Test Organization
- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test API endpoints with database
- **E2E Tests**: Test complete user flows
- **Performance Tests**: Test load and stress scenarios

### Test Data Management
- Use factories for consistent test data
- Clean up test data after each test
- Use separate test database
- Mock external dependencies

### CI/CD Integration
- Run tests on every push/PR
- Fail fast on test failures
- Generate coverage reports
- Monitor test performance

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Artillery Documentation](https://www.artillery.io/docs)
- [Postman Documentation](https://learning.postman.com/docs/)

---

**API Testing Guide Version: 1.0.0**  
**Last Updated: 2025-11-24
**Maintained by: MA Malnu Kananga Development Team**

---

*Untuk pertanyaan atau bantuan tambahan, hubungi development team melalui GitHub Issues atau internal communication channels.*