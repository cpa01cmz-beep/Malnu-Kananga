# Troubleshooting Guide

**Created**: 2026-01-05  
**Last Updated**: 2026-01-05  
**Version**: 1.0.0  
**Status**: Active  

## Overview

This guide provides solutions to common issues encountered while developing, deploying, or using the MA Malnu Kananga web application.

## Table of Contents

- [Development Issues](#development-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [Application Runtime Issues](#application-runtime-issues)
- [Performance Issues](#performance-issues)
- [Security Issues](#security-issues)
- [AI Service Issues](#ai-service-issues)
- [Database Issues](#database-issues)

---

## Development Issues

### npm install fails
**Problem**: Package installation errors or dependency conflicts

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install dependencies
npm install
```

**Prevention**:
- Use the latest stable Node.js version (18.x or later)
- Run `npm audit fix` regularly
- Keep package.json dependencies updated

### TypeScript compilation errors
**Problem**: Type errors or missing type definitions

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Install missing types
npm install --save-dev @types/node @types/react @types/react-dom

# Clear TypeScript cache
npx tsc --build --clean
```

**Common Fixes**:
- Add proper type definitions for custom modules
- Use `unknown` instead of `any` for better type safety
- Enable strict mode in tsconfig.json

### Environment variable issues
**Problem**: Missing or incorrect environment variables

**Solution**:
```bash
# Create .env file from example
cp .env.example .env

# Verify required variables:
# VITE_GEMINI_API_KEY
# VITE_LOG_LEVEL
# VITE_API_BASE_URL
```

### ESLint errors
**Problem**: Code style violations

**Solution**:
```bash
# Auto-fix most issues
npm run lint -- --fix

# Check for specific rules
npx eslint . --ext .ts,.tsx --rule 'no-console: error'
```

---

## Build & Deployment Issues

### Build fails with "vite: not found"
**Problem**: Vite not installed or not in PATH

**Solution**:
```bash
# Install local dependencies
npm install

# Use npx to run local vite
npx vite build
```

### Build memory issues
**Problem**: Build process runs out of memory

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Cloudflare Workers deployment fails
**Problem**: Worker deployment errors

**Solution**:
```bash
# Check Wrangler configuration
npx wrangler whoami

# Validate worker configuration
npx wrangler validate

# Deploy with verbose output
npx wrangler deploy --verbose
```

**Common Causes**:
- Missing environment variables in Workers
- Incorrect D1 database bindings
- Vectorize index not created

### Database connection issues
**Problem**: Cannot connect to D1 database

**Solution**:
```bash
# Test database connection
npx wrangler d1 execute malnu-kananga-db --command "SELECT 1"

# Create database if missing
npx wrangler d1 create malnu-kananga-db

# Check bindings in wrangler.toml
```

---

## Application Runtime Issues

### Application won't load
**Problem**: Blank page or loading errors

**Solution**:
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check network requests in DevTools
4. Clear browser cache and localStorage

**Common Fixes**:
```javascript
// Clear localStorage
localStorage.clear();

// Clear service worker cache
if ('caches' in window) {
  caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
  });
}
```

### Authentication issues
**Problem**: Login failures or token errors

**Solution**:
```typescript
// Check token validity
const token = localStorage.getItem('authToken');
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token expires:', new Date(payload.exp * 1000));
  } catch (e) {
    console.error('Invalid token format');
  }
}
```

**Debug Steps**:
1. Verify API endpoint connectivity
2. Check JWT token format and expiration
3. Review authentication flow in authService.ts

### File upload failures
**Problem**: Files won't upload or show errors

**Solution**:
```typescript
// Check file size and type
const uploadFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  
  if (file.size > maxSize) {
    alert('File too large. Maximum size is 10MB.');
    return;
  }
  
  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Only PDF, JPG, and PNG allowed.');
    return;
  }
};
```

---

## Performance Issues

### Slow initial load
**Problem**: Application takes too long to load

**Solution**:
```typescript
// Implement code splitting
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const StudentPortal = lazy(() => import('./components/StudentPortal'));

// Use React.Suspense for loading states
<Suspense fallback={<div>Loading...</div>}>
  <AdminDashboard />
</Suspense>
```

**Additional Optimizations**:
- Enable gzip compression on server
- Use service worker caching
- Optimize bundle size with tree shaking
- Lazy load images and components

### Memory leaks
**Problem**: Memory usage increases over time

**Solution**:
```typescript
// Clean up effects and intervals
useEffect(() => {
  const interval = setInterval(() => {
    // periodic task
  }, 1000);
  
  return () => clearInterval(interval); // Cleanup
}, []);

// Remove event listeners
const handleResize = () => console.log('resize');
window.addEventListener('resize', handleResize);

return () => {
  window.removeEventListener('resize', handleResize);
};
```

---

## Security Issues

### XSS vulnerabilities
**Problem**: Potential cross-site scripting attacks

**Solution**:
```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const safeHTML = DOMPurify.sanitize(userInput);

// Use React's built-in XSS protection
<div>{userInput}</div> // Safe
<div dangerouslySetInnerHTML={{ __html: safeHTML }} /> // Sanitized
```

### Insecure API calls
**Problem**: API calls missing security headers

**Solution**:
```typescript
// Add security headers to API client
const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
});

// Add authentication interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## AI Service Issues

### Gemini API errors
**Problem**: AI service returns errors

**Solution**:
```typescript
// Check API key configuration
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('Gemini API key not configured');
}

// Handle rate limiting
const handleRateLimit = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // retry request
};

// Validate content policy
const validateContent = (content: string) => {
  const restrictedWords = ['banned', 'content', 'words'];
  return !restrictedWords.some(word => 
    content.toLowerCase().includes(word)
  );
};
```

### AI responses too slow
**Problem**: AI taking too long to respond

**Solution**:
```typescript
// Implement timeout
const getAIResponse = async (prompt: string, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: prompt }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('AI service timeout');
    }
    throw error;
  }
};
```

---

## Database Issues

### D1 database connection errors
**Problem**: Cannot connect to or query D1 database

**Solution**:
```bash
# Check database status
npx wrangler d1 info malnu-kananga-db

# Test connection with simple query
npx wrangler d1 execute malnu-kananga-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# Backup database
npx wrangler d1 export malnu-kananga-db --output backup.sql
```

### Vector search not working
**Problem**: RAG search returns no results

**Solution**:
```bash
# Check Vectorize index
npx wrangler vectorize list

# Create index if missing
npx wrangler vectorize create malnu-kananga-index --dimensions=768

# Verify embeddings are being generated
npx wrangler d1 execute malnu-kananga-db --command "SELECT COUNT(*) FROM vector_embeddings;"
```

---

## Debug Tools

### Browser DevTools
```javascript
// Check application state
console.log('Auth state:', localStorage.getItem('authToken'));
console.log('App version:', import.meta.env.VITE_APP_VERSION);

// Network debugging
fetch('/api/health').then(r => r.json()).then(console.log);

// Performance monitoring
performance.mark('start-operation');
// ... your code
performance.mark('end-operation');
performance.measure('operation-duration', 'start', 'end');
console.log(performance.getEntriesByName('operation-duration'));
```

### Server-side debugging
```bash
# Check Worker logs
npx wrangler tail

# Monitor API performance
npx wrangler tail --format=json

# Debug D1 queries
npx wrangler d1 execute malnu-kananga-db --command "EXPLAIN QUERY PLAN SELECT * FROM users;"
```

---

## Getting Help

### Internal Resources
- Check [API Documentation](./api-documentation.md) for API issues
- Review [BLUEPRINT.md](./BLUEPRINT.md) for system understanding
- Consult [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines

### External Resources
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

### Community Support
- GitHub Issues: Report bugs or request features
- Stack Overflow: Technical questions with specific tags
- Discord/Slack: Real-time community support

---

**Emergency Contacts**:
- System Administrator: [admin@malnukananga.sch.id]
- Technical Lead: [tech-lead@malnukananga.sch.id]

---

**Last Updated**: 2026-01-05  
**Next Review**: 2026-02-05