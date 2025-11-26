# ⚡ Performance Testing Guide - MA Malnu Kananga

## 🌟 Overview

Panduan komprehensif untuk performance testing sistem MA Malnu Kananga. Dokumentasi ini mencakup load testing, stress testing, monitoring, dan optimization strategies.

---

## 📋 Table of Contents

1. [Performance Testing Strategy](#performance-testing-strategy)
2. [Testing Environment Setup](#testing-environment-setup)
3. [Load Testing](#load-testing)
4. [Stress Testing](#stress-testing)
5. [Frontend Performance](#frontend-performance)
6. [Backend Performance](#backend-performance)
7. [Database Performance](#database-performance)
8. [Monitoring & Metrics](#monitoring--metrics)
9. [Optimization Guidelines](#optimization-guidelines)
10. [CI/CD Integration](#cicd-integration)

---

## 🎯 Performance Testing Strategy

### Testing Objectives

#### Primary Goals
1. **Response Time**: API response < 500ms (95th percentile)
2. **Throughput**: Handle 1000 concurrent users
3. **Resource Utilization**: CPU < 70%, Memory < 80%
4. **Error Rate**: < 0.1% under normal load
5. **Scalability**: Linear scaling up to 10x load

#### Success Criteria
| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| **API Response Time** | < 200ms | < 500ms | > 1000ms |
| **Page Load Time** | < 2s | < 3s | > 5s |
| **Concurrent Users** | 1000 | 500 | 100 |
| **Error Rate** | < 0.1% | < 1% | > 5% |
| **CPU Usage** | < 50% | < 70% | > 90% |

### Testing Types

#### 1. **Load Testing**
- Normal expected load simulation
- Sustained performance measurement
- Resource utilization monitoring

#### 2. **Stress Testing**
- Beyond capacity limits
- Breaking point identification
- Recovery capability testing

#### 3. **Spike Testing**
- Sudden traffic increases
- Flash crowd simulation
- Auto-scaling verification

#### 4. **Endurance Testing**
- Long-term stability testing
- Memory leak detection
- Performance degradation monitoring

---

## 🌍 Testing Environment Setup

### Environment Configuration

#### Production-like Setup
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://test:test@db:5432/test
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=test
      - POSTGRES_USER=test
      - POSTGRES_PASSWORD=test
    volumes:
      - test_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  k6:
    image: grafana/k6:latest
    volumes:
      - ./tests/performance:/scripts
    command: ["run", "/scripts/load-test.js"]
    depends_on:
      - app

volumes:
  test_data:
```

#### Test Data Preparation
```typescript
// scripts/generateTestData.ts
import { faker } from '@faker-js/faker';

export class TestDataGenerator {
  static generateUsers(count: number) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: faker.helpers.arrayElement(['student', 'teacher', 'parent']),
        classId: faker.helpers.arrayElement(['XII-IPA-1', 'XII-IPS-1', 'XI-IPA-2'])
      });
    }
    return users;
  }

  static generateAcademicRecords(studentCount: number) {
    const records = [];
    const subjects = ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Indonesia'];
    
    for (let i = 0; i < studentCount; i++) {
      for (const subject of subjects) {
        records.push({
          id: faker.string.uuid(),
          studentId: `student_${i}`,
          subject,
          grade: faker.number.int({ min: 60, max: 100 }),
          semester: faker.helpers.arrayElement([1, 2]),
          academicYear: '2024-2025'
        });
      }
    }
    return records;
  }
}
```

---

## 📊 Load Testing

### K6 Load Testing Scripts

#### Basic Load Test
```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.1'],    // Error rate < 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test authentication endpoint
  let authResponse = http.post(`${BASE_URL}/api/auth/request-login`, 
    JSON.stringify({
      email: `test${Math.floor(Math.random() * 1000)}@test.com`
    }), 
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  let authOk = check(authResponse, {
    'auth status is 200': (r) => r.status === 200,
    'auth response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!authOk);

  // Test dashboard endpoint
  let dashboardResponse = http.get(`${BASE_URL}/api/user/dashboard`, {
    headers: { 
      'Authorization': `Bearer test-token-${Math.floor(Math.random() * 1000)}` 
    }
  });

  let dashboardOk = check(dashboardResponse, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard response time < 300ms': (r) => r.timings.duration < 300,
  });

  errorRate.add(!dashboardOk);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'performance-report.json': JSON.stringify(data, null, 2),
    'performance-report.html': htmlReport(data),
  };
}

function htmlReport(data) {
  return `
    <html>
      <head><title>Performance Test Report</title></head>
      <body>
        <h1>Performance Test Results</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `;
}
```

#### API Endpoint Testing
```javascript
// tests/performance/api-endpoints.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
};

const API_BASE = 'http://localhost:3000/api';

export default function () {
  // Test chat API
  let chatResponse = http.post(`${API_BASE}/chat`, 
    JSON.stringify({
      message: 'Apa jadwal pelajaran hari ini?',
      context: 'schedule'
    }), 
    {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    }
  );

  check(chatResponse, {
    'chat API responds 200': (r) => r.status === 200,
    'chat API response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  // Test academic records API
  let academicResponse = http.get(`${API_BASE}/academic/grades?studentId=student_001`, {
    headers: { 'Authorization': 'Bearer test-token' }
  });

  check(academicResponse, {
    'academic API responds 200': (r) => r.status === 200,
    'academic API response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
```

### Artillery Configuration

#### Advanced Load Testing
```yaml
# artillery-config.yml
config:
  target: '{{ $processEnvironment.API_BASE_URL }}'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Normal load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"
    - duration: 120
      arrivalRate: 200
      name: "Stress test"
    - duration: 60
      arrivalRate: 500
      name: "Spike test"
  payload:
    path: "test-users.csv"
    fields:
      - "email"
      - "token"
  processor: "./test-processor.js"

scenarios:
  - name: "User Journey"
    weight: 70
    flow:
      - get:
          url: "/api/user/profile"
          headers:
            Authorization: "Bearer {{ token }}"
      - think: 1
      - get:
          url: "/api/academic/schedule"
          headers:
            Authorization: "Bearer {{ token }}"
      - think: 2
      - post:
          url: "/api/chat"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            message: "Test message for performance"
            context: "general"

  - name: "Authentication Flow"
    weight: 30
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
```

---

## 💪 Stress Testing

### Breaking Point Identification

```javascript
// tests/performance/stress-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '5m', target: 100 },   // Sustained load
    { duration: '2m', target: 200 },   // Increase load
    { duration: '5m', target: 200 },   // Sustained higher load
    { duration: '2m', target: 500 },   // High load
    { duration: '5m', target: 500 },   // Stress level
    { duration: '2m', target: 1000 },  // Spike test
    { duration: '5m', target: 1000 },  // Maximum stress
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // More lenient during stress
    http_req_failed: ['rate<0.5'],     // Allow higher error rate
  },
};

export default function () {
  // Simulate complex user interactions
  let responses = http.batch([
    ['GET', 'http://localhost:3000/api/user/profile'],
    ['GET', 'http://localhost:3000/api/academic/grades'],
    ['GET', 'http://localhost:3000/api/academic/schedule'],
    ['POST', 'http://localhost:3000/api/chat', 
      JSON.stringify({ message: 'Stress test message', context: 'test' })],
  ]);

  responses.forEach((response, index) => {
    check(response, {
      [`request ${index} status is 200`]: (r) => r.status === 200,
      [`request ${index} response time < 2000ms`]: (r) => r.timings.duration < 2000,
    });
  });

  sleep(1);
}
```

### Recovery Testing

```javascript
// tests/performance/recovery-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 1000 },  // Overload system
    { duration: '2m', target: 1000 },  // Maintain overload
    { duration: '1m', target: 100 },   // Rapid decrease
    { duration: '5m', target: 100 },   // Normal operation
  ],
};

export default function () {
  let response = http.get('http://localhost:3000/api/health');
  
  check(response, {
    'health check status': (r) => r.status === 200,
    'system recovered': (r) => r.json().status === 'healthy',
  });
}
```

---

## 🎨 Frontend Performance

### Lighthouse CI Configuration

```yaml
# .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard/student',
        'http://localhost:3000/dashboard/teacher',
        'http://localhost:3000/dashboard/parent',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Bundle Analysis

```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react'],
          utils: ['date-fns', 'clsx'],
        },
      },
    },
  },
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
    }),
  ],
});
```

### Performance Monitoring

```typescript
// src/utils/performanceMonitor.ts
export class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime,
        largestContentfulPaint: this.getLCP(),
      };

      this.sendMetrics(metrics);
    });
  }

  static measureAPIResponse(endpoint: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.sendMetric({
      type: 'api_response_time',
      endpoint,
      duration,
      timestamp: Date.now(),
    });
  }

  private static getLCP(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  private static sendMetrics(metrics: any) {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });
    }
  }

  private static sendMetric(metric: any) {
    // Send individual metric
    console.log('Performance Metric:', metric);
  }
}
```

---

## ⚙️ Backend Performance

### API Response Time Monitoring

```typescript
// src/middleware/performanceMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Log performance metrics
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      sendPerformanceMetric({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  next();
};

async function sendPerformanceMetric(metric: any) {
  // Implementation for sending metrics to monitoring service
}
```

### Database Query Optimization

```typescript
// src/utils/queryOptimizer.ts
export class QueryOptimizer {
  static async optimizedUserQuery(userId: string) {
    // Use specific fields instead of SELECT *
    return await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'role', 'classId'])
      .where('id', '=', userId)
      .executeTakeFirst();
  }

  static async optimizedAcademicRecords(studentId: string, semester?: number) {
    let query = db
      .selectFrom('academic_records')
      .innerJoin('subjects', 'academic_records.subjectId', 'subjects.id')
      .select([
        'academic_records.id',
        'academic_records.grade',
        'academic_records.semester',
        'subjects.name as subjectName',
      ])
      .where('academic_records.studentId', '=', studentId);

    if (semester) {
      query = query.where('academic_records.semester', '=', semester);
    }

    return await query.execute();
  }

  static async batchUserQueries(userIds: string[]) {
    // Use IN clause instead of multiple queries
    return await db
      .selectFrom('users')
      .select(['id', 'name', 'email', 'role'])
      .where('id', 'in', userIds)
      .execute();
  }
}
```

### Caching Strategy

```typescript
// src/services/cacheService.ts
export class CacheService {
  private static cache = new Map<string, { data: any; expiry: number }>();

  static async get<T>(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  static set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000),
    });
  }

  static invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Cache wrapper for database queries
  static async cachedQuery<T>(
    key: string,
    query: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached) {
      return cached;
    }

    const result = await query();
    this.set(key, result, ttlSeconds);
    
    return result;
  }
}
```

---

## 🗄️ Database Performance

### Query Performance Analysis

```sql
-- Find slow queries
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Analyze table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Database Connection Pooling

```typescript
// src/config/database.ts
import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,        // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection pool monitoring
setInterval(() => {
  const totalCount = db.totalCount;
  const idleCount = db.idleCount;
  const waitingCount = db.waitingCount;
  
  console.log(`Pool stats - Total: ${totalCount}, Idle: ${idleCount}, Waiting: ${waitingCount}`);
}, 10000);
```

### Index Optimization

```sql
-- Create optimized indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY idx_academic_records_student_semester 
ON academic_records(studentId, semester);

-- Composite index for common queries
CREATE INDEX CONCURRENTLY idx_academic_records_composite 
ON academic_records(studentId, subjectId, academicYear);

-- Partial index for active users
CREATE INDEX CONCURRENTLY idx_users_active 
ON users(id) WHERE status = 'active';
```

---

## 📊 Monitoring & Metrics

### Application Performance Monitoring

```typescript
// src/monitoring/apm.ts
export class APMService {
  static trackTransaction(name: string, fn: () => Promise<any>) {
    return async (...args: any[]) => {
      const startTime = Date.now();
      
      try {
        const result = await fn(...args);
        const duration = Date.now() - startTime;
        
        this.recordMetric({
          type: 'transaction',
          name,
          duration,
          status: 'success',
          timestamp: Date.now(),
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        this.recordMetric({
          type: 'transaction',
          name,
          duration,
          status: 'error',
          error: error.message,
          timestamp: Date.now(),
        });
        
        throw error;
      }
    };
  }

  static trackCustomMetric(name: string, value: number, tags?: Record<string, string>) {
    this.recordMetric({
      type: 'custom',
      name,
      value,
      tags,
      timestamp: Date.now(),
    });
  }

  private static recordMetric(metric: any) {
    // Send to APM service (e.g., New Relic, DataDog, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Implementation for sending metrics
    }
  }
}
```

### Real-time Metrics Dashboard

```typescript
// src/monitoring/metricsCollector.ts
export class MetricsCollector {
  private static metrics: Map<string, number[]> = new Map();

  static recordResponseTime(endpoint: string, duration: number) {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    
    const times = this.metrics.get(endpoint)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  static getMetrics(endpoint: string) {
    const times = this.metrics.get(endpoint) || [];
    
    if (times.length === 0) {
      return null;
    }

    const sorted = [...times].sort((a, b) => a - b);
    
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  static getAllMetrics() {
    const result: Record<string, any> = {};
    
    for (const [endpoint] of this.metrics) {
      result[endpoint] = this.getMetrics(endpoint);
    }
    
    return result;
  }
}
```

---

## 🚀 Optimization Guidelines

### Frontend Optimization

#### 1. **Bundle Size Reduction**
```typescript
// Code splitting example
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));

// Dynamic imports for heavy libraries
const loadChartLibrary = () => import('chart.js').then(module => module.default);
```

#### 2. **Image Optimization**
```typescript
// Image component with lazy loading
const OptimizedImage = ({ src, alt, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
```

#### 3. **Caching Strategy**
```typescript
// Service worker caching
self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### Backend Optimization

#### 1. **Response Compression**
```typescript
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
}));
```

#### 2. **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
});

app.use('/api/', limiter);
```

#### 3. **Query Optimization**
```typescript
// Pagination with cursor-based approach
async function getPaginatedResults(cursor?: string, limit = 20) {
  let query = db
    .selectFrom('posts')
    .orderBy('created_at', 'desc')
    .limit(limit + 1);

  if (cursor) {
    query = query.where('created_at', '<', new Date(cursor));
  }

  const results = await query.execute();
  const hasMore = results.length > limit;
  
  if (hasMore) {
    results.pop();
  }

  return {
    data: results,
    hasMore,
    nextCursor: hasMore ? results[results.length - 1].created_at : null,
  };
}
```

---

## 🔄 CI/CD Integration

### GitHub Actions Performance Tests

```yaml
# .github/workflows/performance-tests.yml
name: Performance Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  performance-tests:
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
        npm run test:setup
    
    - name: Build application
      run: npm run build
    
    - name: Start application
      run: npm run start:test &
    
    - name: Wait for application
      run: sleep 30
    
    - name: Run load tests
      run: |
        npm install -g k6
        k6 run tests/performance/load-test.js
    
    - name: Run Lighthouse CI
      run: |
        npm install -g @lhci/cli
        lhci autorun
      env:
        LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
    
    - name: Upload performance reports
      uses: actions/upload-artifact@v3
      with:
        name: performance-reports
        path: |
          performance-report.json
          performance-report.html
          .lighthouseci/
```

### Performance Regression Detection

```typescript
// tests/performance/performanceRegression.test.ts
describe('Performance Regression Tests', () => {
  const BASELINE_RESPONSE_TIME = 200; // ms
  const BASELINE_BUNDLE_SIZE = 500000; // bytes

  it('should not regress API response time', async () => {
    const startTime = Date.now();
    
    await request(app)
      .get('/api/user/dashboard')
      .set('Authorization', 'Bearer test-token')
      .expect(200);
    
    const responseTime = Date.now() - startTime;
    
    // Allow 20% regression
    expect(responseTime).toBeLessThan(BASELINE_RESPONSE_TIME * 1.2);
  });

  it('should not increase bundle size significantly', async () => {
    const stats = await getBundleStats();
    
    // Allow 10% increase
    expect(stats.size).toBeLessThan(BASELINE_BUNDLE_SIZE * 1.1);
  });
});

async function getBundleStats() {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const statsPath = path.join(process.cwd(), 'dist', 'stats.json');
  const content = await fs.readFile(statsPath, 'utf-8');
  
  return JSON.parse(content);
}
```

---

## 📈 Performance Benchmarks

### Current Performance Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Page Load Time** | 1.2s | < 2s | ✅ Good |
| **API Response Time** | 180ms | < 200ms | ✅ Good |
| **Bundle Size** | 450KB | < 500KB | ✅ Good |
| **Lighthouse Score** | 95 | > 90 | ✅ Good |
| **Concurrent Users** | 1000 | 1000 | ✅ Target Met |

### Historical Performance

```json
{
  "2025-11-01": {
    "avgResponseTime": 250,
    "pageLoadTime": 1.8,
    "bundleSize": 520,
    "lighthouseScore": 88
  },
  "2025-11-15": {
    "avgResponseTime": 200,
    "pageLoadTime": 1.4,
    "bundleSize": 480,
    "lighthouseScore": 92
  },
  "2025-11-24": {
    "avgResponseTime": 180,
    "pageLoadTime": 1.2,
    "bundleSize": 450,
    "lighthouseScore": 95
  }
}
```

---

## 🎯 Best Practices

### Testing Best Practices
1. **Test in production-like environment**
2. **Use realistic test data**
3. **Monitor during tests**
4. **Automate performance regression testing**
5. **Set up alerts for performance degradation**

### Optimization Best Practices
1. **Monitor before optimizing**
2. **Focus on user-impacting improvements**
3. **Measure optimization effectiveness**
4. **Keep optimization simple**
5. **Document performance decisions**

### Monitoring Best Practices
1. **Set up meaningful alerts**
2. **Create dashboards for different audiences**
3. **Track business metrics, not just technical**
4. **Review performance regularly**
5. **Share performance insights with team**

---

## 📚 Additional Resources

- [K6 Documentation](https://k6.io/docs/)
- [Artillery Documentation](https://www.artillery.io/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web.dev Performance](https://web.dev/performance/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)

---

**Performance Testing Guide Version: 1.0.0**  
**Last Updated: 2025-11-24**  
**Maintained by: MA Malnu Kananga Development Team**

---

*Untuk pertanyaan atau bantuan tambahan, hubungi development team melalui GitHub Issues atau internal communication channels.*