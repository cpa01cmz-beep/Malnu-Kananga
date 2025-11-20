# 🔧 Troubleshooting Guide & FAQ - MA Malnu Kananga

## 🚨 Common Issues & Solutions

This comprehensive troubleshooting guide covers common issues, their solutions, and frequently asked questions for all user types.

### 📊 System Status Overview

Before troubleshooting, check current system status:
- **Status Page**: https://status.ma-malnukananga.sch.id
- **Health Check**: Test endpoints directly (health endpoint not yet implemented)
- **API Documentation**: Available in repository docs/API_DOCUMENTATION.md
- **System Uptime**: 99.9% (SLA guaranteed)
- **Last Maintenance**: November 20, 2024
- **Current Version**: v1.2.0
- **Known Issues**: Health check endpoint not implemented, use direct endpoint testing

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
- Rate limit: 5 request per 15 menit
- Clear browser cache sebelum request baru

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

2. **Email in Spam Folder**
   - ✅ **Solution**: Check spam/junk folder
   - ✅ **Prevention**: Add noreply@ma-malnukananga.sch.id to contacts

3. **Email Server Delay**
   - ✅ **Solution**: Wait 2-3 minutes, then request again
   - ⚠️ **Note**: Magic links expire after 15 minutes

4. **Rate Limiting**
   - ✅ **Solution**: Wait 15 minutes before requesting again
   - ✅ **Prevention**: Limit login attempts to avoid rate limit
   - 🔍 **Check**: Browser console for "429 Too Many Requests" errors
   - ✅ **Prevention**: Monitor email delivery metrics

4. **Invalid Email Domain**
   - ✅ **Solution**: Use registered school email
   - ✅ **Prevention**: Validate domain against whitelist

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
   ```

2. **Test API Connection**
   ```bash
   curl -X POST "https://malnu-api.sulhi-cmz.workers.dev/api/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   ```

3. **Check Rate Limits**
   - Gemini API has rate limits
   - Wait 1 minute between requests
   - Check API quota usage

4. **Vector Database Status**
    ```bash
    # Check if vector database is seeded
    curl https://malnu-api.sulhi-cmz.workers.dev/seed
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
   ```

2. **Missing Dependencies**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Import Errors**
   ```bash
   # Check for circular dependencies
   npx madge --circular src/
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
```

**Common Test Issues**:
1. **Mock Failures**: Update mock implementations
2. **Async Issues**: Add proper await/async handling
3. **Environment Variables**: Set test environment variables

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
1. **Check Status Page**: https://status.ma-malnukananga.sch.id
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
- **GitHub Issues**: https://github.com/your-repo/issues
- **Documentation**: https://docs.ma-malnukananga.sch.id
- **Developer Chat**: Discord/Slack channel

**For Administrators**:
- **Emergency Hotline**: 24/7 available
- **Admin Portal**: https://admin.ma-malnukananga.sch.id
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
- [API Documentation](./API_DOCUMENTATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Administrator Guide](./ADMINISTRATOR_GUIDE.md)
- [User Guides](./USER_GUIDE_STUDENT.md)

### 🔗 External Resources
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 🎓 Training Materials
- [Video Tutorials](https://training.ma-malnukananga.sch.id)
- [Best Practices Guide](https://bestpractices.ma-malnukananga.sch.id)
- [Security Guidelines](https://security.ma-malnukananga.sch.id)

---

**🔧 Troubleshooting Guide - MA Malnu Kananga**

*Comprehensive guide for resolving common issues and answering frequently asked questions*

---

*Document Version: 1.1.0*  
*Last Updated: November 20, 2024*  
*Maintained by: MA Malnu Kananga Technical Team*