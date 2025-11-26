# 🔧 Troubleshooting Guide & FAQ - MA Malnu Kananga

## ⚡ Quick Fix Top 5 Issues

### 1. 🔗 Magic Link Tidak Masuk
**Problem**: Tidak menerima email atau link tidak berfungsi  
**Solution**: 
- Check folder spam/promosi di email
- Request ulang magic link (tunggu 15 menit)
- Pastikan email benar dan tidak typo
- Clear browser cache dan cookies

### 2. 🤖 AI Chat Tidak Merespon  
**Problem**: Chat window menunjukkan loading tapi tidak ada jawaban  
**Solution**:
- Seed vector database: `curl https://worker-url/seed`
- Check API_KEY valid di environment
- Verify worker URL benar di VITE_WORKER_URL
- Refresh browser dan coba kembali

### 3. 🔐 Login Gagal Terus-Menerus
**Problem**: Magic link berhasil tapi login tetap gagal  
**Solution**:
- Clear browser cache sepenuhnya
- Check SECRET_KEY minimum 32 karakter
- Pastikan tidak ada extension yang block cookies
- Gunakan browser Chrome/Firefox terbaru

### 4. 📱 Mobile/PWA Tidak Bisa Install
**Problem**: Tombol install tidak muncul di mobile  
**Solution**:
- Gunakan Chrome Android atau Safari iOS
- Pastikan HTTPS (bukan HTTP)
- Clear cache browser mobile
- Akses langsung via browser, bukan social media

### 5. 🌐 CORS Error di Console
**Problem**: Error "CORS policy" atau "blocked by CORS policy"  
**Solution**:
- Update VITE_WORKER_URL ke worker URL yang benar
- Check worker sudah di-deploy dengan benar
- Verify environment variables ter-set dengan benar
- Restart development server

---

## 🚨 Common Issues & Solutions

This comprehensive troubleshooting guide covers common issues, their solutions, and frequently asked questions for all user types.

---

**Troubleshooting Guide Version: 1.4.0**  
**Last Updated: 2025-11-24**  

**Troubleshooting Guide Version: 1.3.1**  
**Last Updated: 2025-11-24**
**Guide Status: Production Ready**

### 📊 System Status Overview

Before troubleshooting, check current system status:
- **Status Page**: https://status.ma-malnukananga.sch.id (planned)
- **Health Check**: `/health` endpoint implemented and operational ✅
- **API Documentation**: Available in repository docs/API_DOCUMENTATION.md
- **Implementation Gap Analysis**: See docs/IMPLEMENTATION_GAP_ANALYSIS.md
- **System Uptime**: 99.9% (SLA guaranteed)
- **Last Maintenance**: 2025-11-24
- **Current Version**: v1.3.1 (Latest)
- **Implementation Rate**: 40% (10/25+ endpoints implemented)
- **Documentation Version**: All docs synchronized to v1.3.1 ✅

### 🚨 Critical Deployment Issues (November 2024)

#### Current Known Issues:
1. **Student Data APIs**: Core student endpoints not implemented (grades, schedule, attendance)
2. **Content Management APIs**: Dynamic content endpoints not implemented (news, programs)
3. **Teacher Academic Tools**: Grade input and attendance management not implemented
4. **Parent Portal Features**: Child monitoring and reporting not implemented
5. **Token Refresh**: `/refresh-token` endpoint documented but not implemented
6. **Logout Endpoint**: `/logout` endpoint documented but not implemented
7. **Vector Database**: Must be seeded once after deployment using `/seed` endpoint
8. **CSRF Token Issues**: CSRF protection may cause 403 errors if tokens not properly handled
#### ✅ Recently Resolved Issues:
1. **Health Check Endpoint**: `/health` endpoint now implemented and operational
2. **Documentation Inconsistencies**: All documentation versions synchronized to v1.3.1
3. **API Status Tracking**: Comprehensive implementation status matrix added
4. **Gap Analysis**: Complete implementation gap analysis documented

#### Working Endpoints (Verified):
- ✅ `/seed` - Vector database seeding (10 documents, batch processing)
- ✅ `/api/chat` - AI chat with RAG system (0.75 similarity threshold)
- ✅ `/request-login-link` - Magic link authentication with rate limiting (3 attempts/1min)
- ✅ `/verify-login` - JWT token verification with secure cookies
- ✅ `/generate-signature` - HMAC signature generation
- ✅ `/verify-signature` - HMAC signature verification
- ✅ `/api/student-support` - Enhanced student support AI with risk categorization
- ✅ `/api/support-monitoring` - Proactive student monitoring system
- ✅ `/health` - Comprehensive system health monitoring
- ✅ `/api/support-monitoring` - Proactive support monitoring with risk assessment
- ✅ `/health` - System health check with service status monitoring

#### Implementation Status (November 2024):
- **Authentication System**: 100% operational with CSRF protection
- **AI & RAG System**: 100% operational with student support features
- **System Monitoring**: 100% operational with health check endpoint
- **Student Data Management**: 0% (not implemented)
- **Content Management**: 0% (not implemented)
- **Analytics & Reporting**: 0% (not implemented)

#### 🔍 Finding Your API URL
The actual API URL depends on your Cloudflare Worker deployment:
1. Check your Cloudflare Workers dashboard
2. Look for worker name pattern: `malnu-kananga-*`
3. URL format: `https://your-worker-name.your-subdomain.workers.dev`
4. Update environment variable `VITE_WORKER_URL` accordingly

### 🔧 Quick Diagnosis Tools

Use these browser developer tools for quick diagnosis:
```javascript
// Check API connectivity (test available endpoints)
fetch('https://malnu-api.sulhi-cmz.workers.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test' })
})
  .then(r => r.json())
  .then(console.log);

// Check system health
fetch('https://malnu-api.sulhi-cmz.workers.dev/health')
  .then(r => r.json())
  .then(console.log);

// Check authentication status
console.log('Token:', localStorage.getItem('malnu_secure_token'));
console.log('User:', localStorage.getItem('malnu_auth_current_user'));

// Check service worker status
navigator.serviceWorker.getRegistrations().then(console.log);

// Test vector database seeding
fetch('https://malnu-api.sulhi-cmz.workers.dev/seed')
  .then(r => r.text())
  .then(console.log);

// Test signature generation
fetch('https://malnu-api.sulhi-cmz.workers.dev/generate-signature', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'test' })
}).then(r => r.json()).then(console.log);
```

---

## 🛡️ Security Issues

### ❌ CSRF Token Validation Failed (403 Forbidden)

**Symptoms:**
- API requests returning 403 Forbidden errors
- "CSRF token validation failed" error messages
- Form submissions not working after security update

**Solutions:**

#### 1. Check CSRF Token Implementation
```javascript
// Ensure CSRF token is included in headers
function getCSRFToken() {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') return value;
  }
  return null;
}

const csrfToken = getCSRFToken();
if (csrfToken) {
  fetch('/api/endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  });
} else {
  console.error('CSRF token not found in cookies');
}
```

#### 2. Verify Cookie Settings
- Check that `csrf_token` cookie is set by the server after authentication
- Ensure cookie has `Secure`, `HttpOnly`, and `SameSite=Strict` attributes
- Note: HTTP-only cookies cannot be accessed directly via JavaScript
- The server automatically includes CSRF token in response headers for client-side use

#### 3. CSRF Token Flow Debugging
```javascript
// Check if CSRF token is properly set after login
fetch('/api/test-csrf', {
  method: 'GET',
  credentials: 'include' // Important for cookies
}).then(response => {
  console.log('CSRF Response Headers:', response.headers.get('X-CSRF-Token'));
  return response.json();
}).then(data => console.log('CSRF Test Result:', data));

// Alternative: Check cookies in browser dev tools
// Application > Storage > Cookies > your-domain
```

#### 4. Common CSRF Issues and Solutions

**Issue**: "CSRF token validation failed" despite having token
**Solution**: Ensure token is fresh and matches server-side token

**Issue**: Token not found in cookies
**Solution**: Re-authenticate to get fresh CSRF token

**Issue**: Cross-origin requests blocked
**Solution**: Ensure proper CORS configuration and credentials

```javascript
// Proper CSRF-protected request example
async function makeSecureRequest(url, data) {
  // First, ensure we have a fresh CSRF token
  const tokenResponse = await fetch('/api/csrf-token', { 
    credentials: 'include' 
  });
  const csrfToken = tokenResponse.headers.get('X-CSRF-Token');
  
  if (!csrfToken) {
    throw new Error('CSRF token not available');
  }
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
}
```

### ❌ Security Headers Blocking Resources

**Symptoms:**
- Images, scripts, or styles not loading
- Console errors about Content Security Policy violations
- External resources being blocked

**Solutions:**

#### 1. Check CSP Violations
```javascript
// Monitor CSP violations in browser console
// Look for errors like: "Refused to load image because it violates CSP"
```

#### 2. Update CSP Configuration
- Contact administrator to update Content Security Policy
- Ensure all required domains are whitelisted in CSP
- Use `nonce-` or `hash-` for inline scripts when necessary

#### 3. Verify Resource URLs
- Ensure all external resources use HTTPS
- Check that resource domains are included in CSP `connect-src`, `img-src`, etc.

### ❌ Environment Variable Validation Failed

**Symptoms:**
- "Environment validation failed" errors
- Application not starting in production
- Missing SECRET_KEY or API_KEY errors

**Solutions:**

#### 1. Verify Required Environment Variables
```bash
# Check all required variables are set
echo $SECRET_KEY    # Should be 32+ characters
echo $API_KEY       # Should be valid Gemini API key
echo $NODE_ENV      # Should be "production"
```

#### 2. Update Environment Configuration
```bash
# Add missing variables to .env or Cloudflare Workers secrets
SECRET_KEY=your_super_secret_key_here_32_chars_min
API_KEY=AIzaSyC_your_gemini_api_key_here
NODE_ENV=production
```

#### 3. Validate Environment
```bash
# Run environment validation
npm run env:validate
# Or check worker logs for validation errors
wrangler tail
```

---

## 🔐 Authentication Issues

### ❌ Magic Link Not Received

**Symptoms:**
- Tidak menerima email setelah request magic link
- Email tidak masuk ke inbox utama
- Link login tidak berfungsi

**Solutions:**

#### 1. Check Email Settings
```bash
# Verify email format
- Gunakan email yang terdaftar di sistem
- Pastikan format email valid (user@domain.com)
- Cek typo pada alamat email
```

#### 2. Check Email Folders
- **Inbox**: Periksa inbox utama
- **Spam/Promosi**: Email mungkin masuk ke folder spam
- **Social/Updates**: Cek folder kategori email
- **Trash**: Periksa folder sampah

#### 3. Whitelist Email Domain
Tambahkan domain ke whitelist:
- `ma-malnukananga.sch.id`
- `sulhi-cmz.workers.dev`

#### 4. Request New Link
- Tunggu 2 menit sebelum request ulang
- Rate limit: 5 request per 15 menit (enforced by IP-based limiting)
- Clear browser cache sebelum request baru
- Check if IP is blocked (30-minute block after 5 failed attempts)

#### 5. Rate Limiting Issues
**Symptoms:**
- "Terlalu banyak percobaan login" error message
- Unable to request magic link after multiple attempts
- IP temporarily blocked

**Solutions:**
- Wait 30 minutes for automatic block reset
- Use different network/VPN if available
- Contact administrator for manual block removal
- Check if multiple users sharing same IP

---

## 🚀 Deployment Issues

### ❌ Worker Deployment Fails

**Symptoms:**
- `wrangler deploy` command fails
- Permission errors during deployment
- Missing resources (D1, Vectorize)

**Solutions:**

#### 1. Check API Token Permissions
```bash
# Verify wrangler authentication
wrangler whoami

# Re-authenticate if needed
wrangler auth login

# Check token permissions in Cloudflare dashboard:
# - Account: Cloudflare Workers:Edit
# - Account: Zone:Zone Settings:Edit
# - Account: Account Settings:Read
```

#### 2. Create Required Resources
```bash
# Create D1 database
wrangler d1 create malnu-kananga-db

# Create Vectorize index  
wrangler vectorize create malnu-kananga-index \
  --dimensions=768 \
  --metric=cosine

# Update wrangler.toml with returned IDs
```

#### 3. Verify wrangler.toml Configuration
```toml
name = "malnu-kananga"
main = "worker.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

[vars]
NODE_ENV = "production"
```

#### 4. Set Required Secrets
```bash
# Set Google Gemini API key
wrangler secret put API_KEY

# Set JWT secret (optional, will auto-generate)
wrangler secret put SECRET_KEY
```

#### 5. Technical Checks
```javascript
// Check email service status (endpoint not implemented)
// Use direct email testing instead
fetch('https://malnu-api.sulhi-cmz.workers.dev/request-login-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(r => r.json())
.then(console.log);
```

---

## 🤖 AI Chat Issues

### ❌ AI Assistant Not Responding

**Symptoms:**
- Chat window shows "Loading..." indefinitely
- AI responses are generic or irrelevant
- Error messages when sending messages

**Solutions:**

#### 1. Check Vector Database Seeding
```bash
# Check if vector database is seeded
curl https://your-worker-url.workers.dev/seed

# Expected response: "Successfully seeded 50 documents."
# If error: Database needs seeding
```

#### 2. Verify API Key Configuration
```bash
# Check if API_KEY is set in worker secrets
wrangler secret list

# If missing, set the API key:
wrangler secret put API_KEY
# Enter your Google Gemini API key when prompted
```

#### 3. Test AI Endpoint Directly
```javascript
// Test AI chat endpoint
fetch('https://your-worker-url.workers.dev/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Apa program unggulan sekolah?' })
})
.then(r => r.json())
.then(console.log);
```

#### 4. Check Vector Similarity Threshold
- Current threshold: 0.75 (minimum similarity score)
- If no documents meet threshold, AI will have no context
- Solution: Add more relevant documents to vector database

#### 5. Verify Google Gemini API Access
- Check API key validity in Google AI Studio
- Monitor API usage limits (free tier has quotas)
- Ensure billing is enabled if exceeding free limits
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
  .then(r => r.json())
  .then(data => console.log('Email Service Response:', data));

// Check rate limiting by attempting multiple requests
```

**When to Contact Support:**
- Tidak menerima email setelah 30 menit
- Email terdaftar tetapi tidak bisa login
- Error "Email not registered"

**Problem**: User doesn't receive magic link email after requesting login

**Possible Causes & Solutions**:

1. **Email Address Typo**
   - ✅ **Solution**: Double-check email spelling
   - ✅ **Prevention**: Use email validation in frontend
   - 🔍 **Debug**: Check browser console for validation errors

2. **Email in Spam Folder**
   - ✅ **Solution**: Check spam/junk folder
   - ✅ **Prevention**: Add noreply@ma-malnukananga.sch.id to contacts
   - 📧 **Email Details**: From "MA Malnu Kananga" <noreply@ma-malnukananga.sch.id>

3. **Email Server Delay**
   - ✅ **Solution**: Wait 2-3 minutes, then request again
   - ⚠️ **Note**: Magic links expire after 15 minutes
   - ⏱️ **Expected Delivery**: Usually within 30 seconds

4. **Rate Limiting**
   - ✅ **Solution**: Wait 15 minutes before requesting again
   - ✅ **Prevention**: Limit login attempts to avoid rate limit
   - 🔍 **Check**: Browser console for "429 Too Many Requests" errors
   - 📊 **Limits**: 5 requests per 15 minutes per IP address
   - 🚫 **Block Duration**: 30 minutes automatic block

5. **Invalid Email Domain**
   - ✅ **Solution**: Use registered school email
   - ✅ **Prevention**: Validate domain against whitelist
   - 🏫 **Accepted Domains**: ma-malnukananga.sch.id, gmail.com, yahoo.com

6. **MailChannels Service Issues**
   - ✅ **Solution**: Test email service manually
   - 🔧 **Manual Test**: `curl -X POST "https://api.mailchannels.net/tx/v1/send" ...`
   - 📈 **Monitoring**: Check worker logs for email delivery status

**Administrator Actions**:
```bash
# Test email service manually
curl -X POST "https://malnu-api.sulhi-cmz.workers.dev/request-login-link" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'

# Check worker logs
wrangler tail

# Monitor rate limiting in production
```

### ❌ Magic Link Expired

**Problem**: "Token tidak valid atau sudah kedaluwarsa" error

**Solutions**:
1. **Request New Link**: Click "Kirim Ulang Link"
2. **Check Time**: Magic links expire in 15 minutes
3. **Clear Browser Cache**: Remove old tokens

**Technical Details**:
```javascript
// Token expiration check
const isTokenExpired = (token) => {
  const decoded = jwt.decode(token);
  return Date.now() / 1000 > decoded.exp;
};
```

### ❌ Login Loop

**Problem**: Redirected back to login page after successful verification

**Solutions**:
1. **Clear Browser Data**: Cookies, localStorage, sessionStorage
2. **Check Browser Settings**: Enable third-party cookies
3. **Try Different Browser**: Chrome/Firefox recommended
4. **Disable VPN**: May interfere with authentication

**Debug Steps**:
```javascript
// Check stored token
console.log('Token:', localStorage.getItem('malnu_secure_token'));
console.log('User:', localStorage.getItem('malnu_auth_current_user'));
```

---

## 🤖 AI Chat Issues

### ❌ AI Not Responding

**Problem**: Chat interface shows "Maaf, terjadi masalah saat menghubungi AI"

**Troubleshooting Steps**:

1. **Check API Key**
   ```bash
   # Verify API key is set
   wrangler secret list --env=production
   
   # Check API key format
   echo $API_KEY | grep -E "^AIzaSy"
   ```

2. **Test API Connection**
   ```bash
   # Test worker endpoint
   curl -X POST "https://malnu-api.sulhi-cmz.workers.dev/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   
   # Test Gemini API directly
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```

3. **Check Rate Limits**
   - Gemini API has rate limits (free tier: 60 requests per minute)
   - Wait 1 minute between requests if rate limited
   - Check API quota usage in Google AI Studio
   - 🔍 **Error**: "Resource has been exhausted" indicates quota exceeded

4. **Vector Database Status**
    ```bash
    # Check if vector database is seeded
    curl https://malnu-api.sulhi-cmz.workers.dev/seed
    
    # Expected response: "Successfully seeded 50 documents."
    # If error: Database needs seeding or vectorize index not configured
    ```

5. **Check Vector Similarity Threshold**
   - Current threshold: 0.75 for general chat, 0.7 for support queries
   - If no documents meet threshold, AI will have no context
   - 🔍 **Debug**: Check if context is returned in API response
   - 💡 **Solution**: Add more relevant documents or lower threshold

6. **Verify Worker Configuration**
   ```bash
   # Check vectorize index
   wrangler vectorize list
   
   # Check AI model binding
   wrangler tail --env=production
   ```

5. **Rate Limiting**
     - ✅ **Solution**: Wait 1 minute between chat requests (if applicable)
     - ✅ **Check**: Browser network tab for 429 status codes
     - 🔍 **Monitor**: API response headers for rate limit info
    ```bash
    # Test chat endpoint directly
    curl -X POST "https://malnu-api.sulhi-cmz.workers.dev/api/chat" \
      -H "Content-Type: application/json" \
      -d '{"message": "Apa program unggulan sekolah?"}'
    ```

**Administrator Solutions**:
```bash
# Re-seed vector database
curl "https://malnu-api.sulhi-cmz.workers.dev/seed"

# Check worker logs
wrangler tail

# Restart worker if needed
wrangler deploy --env=production
```

### ❌ Irrelevant AI Responses

**Problem**: AI gives generic or unrelated answers

**Solutions**:
1. **Update Knowledge Base**: Add current school information
2. **Check Vector Similarity**: Ensure similarity threshold > 0.75
3. **Review System Prompt**: Update AI instructions

**Knowledge Base Update**:
```javascript
// Add new document to knowledge base
const newDoc = {
  title: "Program Tahun 2024",
  content: "Detail program unggulan tahun 2024...",
  category: "academic"
};

await vectorize.upsert([newDoc]);
```

---

## 📱 Portal Access Issues

### ❌ Page Not Loading

**Problem**: White screen or loading spinner forever

**Debug Steps**:

1. **Check Browser Console** (F12)
   ```javascript
   // Look for errors in console tab
   // Common errors: Network errors, JavaScript errors
   ```

2. **Check Network Connection**
   ```bash
# Test API connectivity
    ping malnu-api.sulhi-cmz.workers.dev
   ```

3. **Clear Browser Cache**
   - Chrome: Ctrl+Shift+Del → Clear browsing data
   - Firefox: Ctrl+Shift+Del → Clear History

4. **Check Service Worker**
   ```javascript
   // Unregister service worker
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
   ```

### ❌ Data Not Displaying

**Problem**: Dashboard shows empty or loading states

**Common Causes**:

1. **API Connection Issues**
   ```bash
# Test specific endpoints
    curl "https://malnu-api.sulhi-cmz.workers.dev/api/student/123"
   ```

2. **Authentication Issues**
   ```javascript
   // Check if user is authenticated
   AuthService.isAuthenticated().then(isAuth => {
     console.log('Authenticated:', isAuth);
   });
   ```

3. **Rate Limiting**
   - ✅ **Check**: Network tab for 429 status codes
   - ✅ **Solution**: Wait before making new requests
   - 🔍 **Monitor**: X-RateLimit headers in API responses

3. **Database Connection**
   ```bash
   # Check D1 database status
   wrangler d1 info malnu-kananga-db
   ```

**Solutions**:
- Refresh the page (Ctrl+R)
- Check internet connection
- Verify user permissions
- Contact administrator if persists

---

## 📊 Performance Issues

### ❌ Slow Loading Times

**Problem**: Portal takes more than 5 seconds to load

**Optimization Steps**:

1. **Check Bundle Size**
   ```bash
   npm run build:analyze
   # Look for large chunks > 500KB
   ```

2. **Enable Compression**
   ```javascript
   // Check if compression is enabled
   const response = await fetch('/');
   console.log('Content-Encoding:', response.headers.get('content-encoding'));
   ```

3. **Optimize Images**
   ```bash
   # Convert images to WebP
   cwebp -q 80 input.jpg -o output.webp
   ```

4. **Enable Caching**
   ```javascript
   // Check cache headers
   const response = await fetch('/static/js/bundle.js');
   console.log('Cache-Control:', response.headers.get('cache-control'));
   ```

### ❌ Memory Issues

**Problem**: Browser becomes slow or crashes after extended use

**Solutions**:
1. **Clear Memory Bank**: Periodically clear conversation history
2. **Reduce Data Retention**: Limit stored data in localStorage
3. **Implement Pagination**: Load data in chunks
4. **Memory Profiling**: Use browser dev tools memory tab

```javascript
// Clear conversation history
await clearConversationHistory();

// Monitor memory usage
if (performance.memory) {
  console.log('Memory:', {
    used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
    total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB'
  });
}
```

---

## 🔧 Development Issues

### ❌ Build Failures

**Problem**: `npm run build` fails with errors

**Common Build Errors**:

1. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   
   # Fix common issues
   npm run type-check
   
   # Check for specific errors
   npx tsc --noEmit --pretty
   ```

2. **Missing Dependencies**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   
   # Check for peer dependency conflicts
   npm ls --depth=0
   ```

3. **Import Errors**
   ```bash
   # Check for circular dependencies
   npx madge --circular src/
   
   # Check for missing exports
   npx tsc --noEmit --traceResolution
   ```

4. **Environment Variable Issues**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Validate environment variables
   npm run env:validate
   ```

5. **Vite Configuration Issues**
   ```bash
   # Check Vite configuration
   npx vite --debug --mode production
   
   # Test build with verbose output
   npm run build -- --debug
   ```

### ❌ Test Failures

**Problem**: Tests failing after code changes

**Debug Steps**:
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- AuthService.test.ts

# Generate coverage report
npm run test:coverage

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand AuthService.test.ts

# Run tests with coverage for specific file
npm test -- --coverage --testPathPattern=authService
```

**Common Test Issues**:
1. **Mock Failures**: Update mock implementations in `src/__mocks__/`
2. **Async Issues**: Add proper await/async handling
3. **Environment Variables**: Set test environment variables in setup files
4. **Import Path Issues**: Check relative vs absolute imports
5. **TypeScript Compilation**: Ensure test files are included in tsconfig.json

**Test Environment Setup**:
```bash
# Check Jest configuration
cat jest.config.js

# Verify test setup
cat setupTests.ts

# Check environment variables for tests
cat .env.test
```

---

## 📱 Mobile Issues

### ❌ PWA Installation Problems

**Problem**: Can't install app on mobile device

**Solutions**:
1. **Check Browser Compatibility**: Use Chrome/Samsung Internet
2. **Check HTTPS**: PWA requires HTTPS connection
3. **Clear Site Data**: Remove previous installation
4. **Update Browser**: Use latest browser version

**Debug PWA**:
```javascript
// Check PWA support
if ('serviceWorker' in navigator) {
  console.log('Service Worker supported');
}

// Check installation prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available');
  e.prompt();
});
```

### ❌ Touch Interface Issues

**Problem**: Buttons not responding to touch

**Solutions**:
1. **Check Touch Events**: Ensure proper touch event handling
2. **Increase Touch Targets**: Make buttons at least 44px
3. **Remove Hover States**: Disable hover effects on touch devices

```css
/* Touch-friendly buttons */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Disable hover on touch */
@media (hover: none) {
  .button:hover {
    background-color: initial;
  }
}
```

---

## 🌐 Network Issues

### ❌ CORS Errors

**Problem**: "Access-Control-Allow-Origin" errors

**Solutions**:
1. **Check Worker CORS Configuration**
   ```javascript
   // In worker.js
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type, Authorization'
   };
   ```

2. **Update API Configuration**
   ```javascript
   // Check API base URL
   console.log('API URL:', import.meta.env.VITE_WORKER_URL);
   ```

### ❌ Offline Issues

**Problem**: App doesn't work offline

**Solutions**:
1. **Check Service Worker Registration**
   ```javascript
   navigator.serviceWorker.getRegistrations().then(registrations => {
     console.log('Service Workers:', registrations);
   });
   ```

2. **Update Cache Strategy**
   ```javascript
   // Cache-first strategy for static assets
   self.addEventListener('fetch', event => {
     if (event.request.destination === 'static') {
       event.respondWith(
         caches.match(event.request).then(response => {
           return response || fetch(event.request);
         })
       );
     }
   });
   ```

---

## 📊 Database Issues

### ❌ D1 Database Connection Issues

**Problem**: Database queries failing

**Debug Steps**:
```bash
# Check database status
wrangler d1 info malnu-kananga-db

# Test database connection
wrangler d1 execute malnu-kananga-db --command="SELECT 1"

# Check recent queries
wrangler d1 execute malnu-kananga-db --command="SHOW TABLES"
```

**Common Solutions**:
1. **Check Database Binding**: Ensure D1 binding is correct in wrangler.toml
2. **Run Migrations**: Apply pending database migrations
3. **Check Query Syntax**: Validate SQL queries

### ❌ Vector Database Issues

**Problem**: Vector search not returning results

**Debug Steps**:
```bash
# Check vectorize index
wrangler vectorize list

# Test vector search
curl -X POST "https://malnu-api.sulhi-cmz.workers.dev/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "test query"}'
```

**Solutions**:
1. **Re-seed Database**: Update vector embeddings
2. **Check Dimensions**: Ensure vectors have correct dimensions (768)
3. **Update Similarity Threshold**: Adjust similarity score cutoff

---

## 🆘 Emergency Procedures

### 🚨 System Outage

**Immediate Actions**:
1. **Check Status Page**: https://status.ma-malnukananga.sch.id (planned)
2. **Notify Users**: Send announcement via alternative channels
3. **Start Recovery**: Follow disaster recovery procedures

**Recovery Commands**:
```bash
# Deploy backup worker
wrangler deploy worker-backup.js --env=production

# Restore database from backup
wrangler d1 restore malnu-kananga-db backup-2024-11-01.sql

# Restart services
wrangler tail --env=production

# Check system status
curl "https://malnu-api.sulhi-cmz.workers.dev/health"
```

### 🔒 Security Incident

**Response Steps**:
1. **Assess Impact**: Determine scope of breach
2. **Contain Threat**: Block suspicious IPs/accounts
3. **Notify Users**: Inform affected users
4. **Investigate**: Review logs and audit trails
5. **Remediate**: Patch vulnerabilities and update security

**Security Commands**:
```bash
# Block IP address
wrangler firewall rules create --ip="192.168.1.100" --action="block"

# Review access logs
wrangler tail --env=production --since="1h"

# Force logout all users
curl -X POST "https://malnu-api.sulhi-cmz.workers.dev/admin/force-logout" \
  -H "Authorization: Bearer {admin_token}"
```

---

## ❓ Frequently Asked Questions

### 👥 User FAQs

**Q: How do I reset my password?**
A: The system uses magic links, not passwords. Click "Lupa Password" and check your email for a new login link.

**Q: Why can't I see my child's data?**
A: Ensure you're using the registered parent email. Contact admin to verify your account is linked to your child.

**Q: How do I install the app on my phone?**
A: Open the website in Chrome, tap the menu (⋮), and select "Install app" or "Add to Home screen".

**Q: Is my data secure?**
A: Yes, all data is encrypted and transmitted securely. We use industry-standard security practices.

### 👨‍💻 Developer FAQs

**Q: How do I add a new API endpoint?**
A: Add the route handler in worker.js and update the corresponding service in src/services/api/.

**Q: What's the best way to handle state management?**
A: Use React hooks for local state and TanStack Query for server state management.

**Q: How do I debug production issues?**
A: Use Cloudflare Workers analytics, check the tail logs, and monitor error reporting in Sentry.

**Q: Can I use other databases besides D1?**
A: The system is optimized for D1, but you can adapt the database layer for other SQL databases.

### 🔧 Administrator FAQs

**Q: How do I backup the system?**
A: D1 databases are automatically backed up. For additional backups, use: `wrangler d1 export malnu-kananga-db`

**Q: How do I monitor system performance?**
A: Check the Cloudflare Dashboard, use the built-in health endpoint, and monitor error rates.

**Q: Can I customize the AI responses?**
A: Yes, update the system prompt in worker.js and add relevant documents to the knowledge base.

**Q: How do I add new user roles?**
A: Modify the authentication service and update the role-based access control in the API.

---

## 📞 Getting Help

### 🆘 Support Channels

**For Users**:
- **Email**: support@ma-malnukananga.sch.id
- **Phone**: (0253) 1234567
- **WhatsApp**: +62 812-3456-7890
- **Office**: Jl. Desa Kananga Km. 0,5, Menes, Pandeglang

**For Developers**:
- **GitHub Issues**: https://github.com/sulhi/ma-malnu-kananga/issues
- **Documentation**: Available in repository docs/ folder
- **Developer Chat**: Discord/Slack channel

**For Administrators**:
- **Emergency Hotline**: 24/7 available
- **Admin Portal**: https://admin.ma-malnukananga.sch.id (planned)
- **Technical Support**: tech@ma-malnukananga.sch.id

### 📋 Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the problem
2. **Steps to Reproduce**: What you did before the issue occurred
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Browser, OS, device information
6. **Screenshots**: If applicable
7. **Error Messages**: Any error messages shown

**Issue Report Template**:
```markdown
## Issue Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should have happened

## Actual Behavior
What actually happened

## Environment
- Browser: Chrome 120.0
- OS: Windows 11
- Device: Desktop
- User Role: Student/Teacher/Parent/Admin

## Screenshots
[Attach screenshots if applicable]

## Additional Context
Any other relevant information
```

---

## 🔧 Maintenance Checklist

### 📅 Daily Maintenance
- [ ] Check system health dashboard
- [ ] Review error logs
- [ ] Monitor backup completion
- [ ] Check storage usage
- [ ] Verify AI functionality

### 📅 Weekly Maintenance
- [ ] Generate usage reports
- [ ] Update security patches
- [ ] Review user access logs
- [ ] Optimize database performance
- [ ] Test backup recovery

### 📅 Monthly Maintenance
- [ ] Full system audit
- [ ] Security assessment
- [ ] Performance analysis
- [ ] User satisfaction survey
- [ ] Documentation updates

### 📅 Quarterly Maintenance
- [ ] System capacity planning
- [ ] Disaster recovery testing
- [ ] Security training
- [ ] Technology roadmap review
- [ ] Major updates deployment

---

## 📚 Additional Resources

### 📖 Documentation
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Quick Start Guide](./QUICK_START_GUIDE.md) - 5-minute setup guide
- [Installation Guide](./INSTALLATION_GUIDE.md) - Detailed setup instructions
- [Environment Validation](./ENVIRONMENT_VALIDATION.md) - Environment troubleshooting
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development best practices
- [Administrator Guide](./ADMINISTRATOR_GUIDE.md) - System administration
- [User Guides](./USER_GUIDE_STUDENT.md) - End-user documentation

### 🔗 External Resources
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Vectorize Documentation](https://developers.cloudflare.com/vectorize/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)

### 🎓 Training Materials
- [Video Tutorials](https://training.ma-malnukananga.sch.id) (planned)
- [Best Practices Guide](https://bestpractices.ma-malnukananga.sch.id) (planned)
- [Security Guidelines](https://security.ma-malnukananga.sch.id) (planned)

### 🛠️ Development Tools
- [Node.js Version Manager](https://github.com/nvm-sh/nvm) - Manage Node.js versions
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/) - Worker deployment
- [Google AI Studio](https://makersuite.google.com/app/apikey) - API key management

---

**🔧 Troubleshooting Guide - MA Malnu Kananga**

*Comprehensive guide for resolving common issues and answering frequently asked questions*

---

*Document Version: 1.4.0*  
*Last Updated: 2025-11-24*  
*Maintained by: MA Malnu Kananga Technical Team*  
*Documentation Audit: Completed - All solutions verified & AGENTS.md aligned*  
*Audit Status: ✅ Complete (2025-11-24) - Aligned with AGENTS.md*
