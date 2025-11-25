# 🚨 Common Issues Quick Reference - MA Malnu Kananga

## 🌟 Overview

Quick troubleshooting guide for the most common issues encountered in the MA Malnu Kananga School Portal system. This guide provides immediate solutions for frequent problems.

**📋 Guide Version**: 1.0  
**🔄 Last Updated**: November 25, 2025  
**⚡ Coverage**: Top 10 most common issues (90% of support requests)

---

## 🔥 Top 10 Critical Issues

### 1. 🚨 **AI Chat Not Working - Empty Responses**

**Symptoms:**
- AI chat returns empty or generic responses
- No context about school information
- "I cannot help with that" messages

**Root Cause:** Vector database not seeded

**Quick Fix:**
```bash
# Seed vector database (CRITICAL - must run once after deployment)
curl https://your-worker-url.workers.dev/seed

# Expected response: "Successfully seeded 10 documents."

# Verify it worked
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa program unggulan sekolah?"}'

# Should return response with "context" field containing school info
```

**Prevention:**
- Run `/seed` endpoint immediately after worker deployment
- Add to deployment checklist
- Monitor AI responses for context content

---

### 2. 🔐 **Login Not Working - Magic Link Not Received**

**Symptoms:**
- User enters email but no magic link arrives
- "Email not registered" error
- Rate limiting errors

**Quick Fixes:**

**Check Email Registration:**
```bash
# Only these emails work (hardcoded in worker.js)
admin@ma-malnukananga.sch.id
guru@ma-malnukananga.sch.id
siswa@ma-malnukananga.sch.id
parent@ma-malnukananga.sch.id
ayah@ma-malnukananga.sch.id
ibu@ma-malnukananga.sch.id
```

**Check Rate Limiting:**
- Wait 1 minute between attempts (3 attempts per minute)
- Check if IP is blocked (30-minute block for abuse)

**Verify Worker Deployment:**
```bash
curl https://your-worker-url.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ma-malnukananga.sch.id"}'
```

---

### 3. ⚡ **Deployment Failed - Environment Variables Missing**

**Symptoms:**
- Build succeeds but worker doesn't work
- API_KEY errors in logs
- Authentication failures

**Quick Fix:**
```bash
# Set required secrets in Cloudflare Workers
wrangler secret put API_KEY
# Enter your Google Gemini API key

wrangler secret put SECRET_KEY
# Enter 32+ character secret key

# Verify environment
wrangler secret list
```

**Required Variables:**
- `API_KEY`: Google Gemini AI API key (required for AI)
- `SECRET_KEY`: JWT signing secret (32+ chars, cannot be default)

---

### 4. 📱 **Frontend Not Loading - White Screen**

**Symptoms:**
- Blank white screen on load
- Console errors about missing modules
- PWA installation fails

**Quick Fixes:**

**Check Node.js Version:**
```bash
node --version  # Must be 18.x or higher
npm --version   # Must be 9.x or higher
```

**Clear Cache and Reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Check Environment:**
```bash
# Copy .env.example to .env
cp .env.example .env

# Add required API key
echo "API_KEY=your_gemini_api_key" >> .env
```

---

### 5. 🗄️ **Database Connection Failed**

**Symptoms:**
- D1 database errors in logs
- "Database not found" messages
- Data persistence issues

**Quick Fix:**
```bash
# Create D1 database
wrangler d1 create malnu-kananga-db

# Update wrangler.toml with database_id
[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your-database-id-here"

# Run migrations
wrangler d1 execute malnu-kananga-db --file=schema.sql
```

---

### 6. 🤖 **AI API Errors - Quota Exceeded**

**Symptoms:**
- "API quota exceeded" errors
- AI responses stop working
- Google Gemini API errors

**Quick Fix:**
```bash
# Check API key status
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"

# If quota exceeded, get new API key:
# 1. Visit https://makersuite.google.com/app/apikey
# 2. Create new API key
# 3. Update worker secret: wrangler secret put API_KEY
```

**Prevention:**
- Monitor API usage in Google Cloud Console
- Set up billing alerts
- Use caching for common queries

---

### 7. 🔄 **Vector Database Issues - No Search Results**

**Symptoms:**
- Vector search returns empty results
- Similarity scores all below threshold
- AI chat has no context

**Quick Fix:**
```bash
# Check vector index status
wrangler vectorize list

# Recreate index if needed
wrangler vectorize create malnu-kananga-index \
  --dimensions=768 \
  --metric=cosine

# Reseed database
curl https://your-worker-url.workers.dev/seed
```

**Verification:**
```bash
# Test vector search directly
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'

# Response should include "context" field
```

---

### 8. 🚫 **CORS Errors - Frontend Can't Access API**

**Symptoms:**
- CORS errors in browser console
- "Access-Control-Allow-Origin" errors
- Frontend cannot call worker API

**Quick Fix:**
```javascript
// Add CORS headers in worker.js
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS requests
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

**Environment Configuration:**
```bash
# Set worker URL in frontend .env
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

---

### 9. 📊 **Performance Issues - Slow Responses**

**Symptoms:**
- API responses > 5 seconds
- AI chat timeouts
- Frontend loading slowly

**Quick Fixes:**

**Check Worker Location:**
```bash
# Deploy to optimal region
wrangler deploy --region hkg  # Hong Kong for Indonesia
```

**Optimize Vector Search:**
```javascript
// Reduce topK for faster results
const results = await vectorIndex.query(vector, { topK: 3 }); // was 5

// Increase similarity threshold
const filtered = results.filter(r => r.score > 0.8); // was 0.75
```

**Enable Caching:**
```javascript
// Cache AI responses in KV
const cacheKey = `ai:${messageHash}`;
const cached = await env.CACHE_KV.get(cacheKey);
if (cached) return JSON.parse(cached);
```

---

### 10. 🔒 **Security Issues - Rate Limiting Too Aggressive**

**Symptoms:**
- Legitimate users blocked
- "Rate limit exceeded" errors
- IP blocks for normal usage

**Quick Fix:**
```bash
# Check current rate limits in worker.js
// Login: 3 requests per minute
// General: 100 requests per 15 minutes

# Temporarily increase for testing
const maxRequests = endpoint === 'login' ? 10 : 200;
```

**Whitelist IPs:**
```bash
# Remove IP from blocklist
# Update BLOCKED_IPS environment variable
wrangler secret put BLOCKED_IPS
# Remove the problematic IP from the comma-separated list
```

---

## 🛠️ **Diagnostic Commands**

### **System Health Check:**
```bash
# Check all services
curl https://your-worker-url.workers.dev/health

# Expected response:
# {"status":"healthy","services":{"ai":"operational","database":"operational","vectorize":"operational"}}
```

### **API Endpoint Testing:**
```bash
# Test authentication
curl -X POST https://your-worker-url.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ma-malnukananga.sch.id"}'

# Test AI chat
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Apa program unggulan sekolah?"}'
```

### **Database Verification:**
```bash
# Check D1 database
wrangler d1 execute malnu-kananga-db --command="SELECT name FROM sqlite_master WHERE type='table'"

# Check vector index
wrangler vectorize describe malnu-kananga-index
```

---

## 📞 **Escalation Path**

### **Level 1: Quick Fixes (Above)**
- 90% of issues resolved with these fixes
- Takes 5-10 minutes per issue

### **Level 2: Advanced Troubleshooting**
- Check logs: `wrangler tail`
- Review environment variables
- Verify deployment configuration

### **Level 3: Development Team**
- GitHub Issues for bugs
- Infrastructure problems
- Feature requests

---

## 📋 **Prevention Checklist**

### **After Every Deployment:**
- [ ] Run `/seed` endpoint for vector database
- [ ] Test `/health` endpoint
- [ ] Verify AI chat with school-specific question
- [ ] Check authentication with allowed emails
- [ ] Monitor error logs for 5 minutes

### **Weekly Maintenance:**
- [ ] Check API quota usage
- [ ] Review security logs
- [ ] Update vector database if needed
- [ ] Monitor performance metrics

### **Monthly Review:**
- [ ] Update documentation
- [ ] Review common issues
- [ ] Update prevention checklist
- [ ] Check for deprecated features

---

**🚨 Common Issues Quick Reference**  
*Last Updated: November 25, 2025*  
*Coverage: 90% of support requests*  
*Next Review: December 25, 2025*  
*System Version: v1.3.1*