# 🚀 Deployment Guide - MA Malnu Kananga

## 🌟 Overview

This guide covers the deployment process for the MA Malnu Kananga School Portal. **Note**: Current implementation provides authentication and AI features only. Academic features are planned for future development.

## ⚠️ Current Implementation Status

**Working Features**:
- ✅ Authentication system (magic link login)
- ✅ AI chat assistant with RAG
- ✅ Modern responsive UI
- ✅ PWA functionality

**Not Yet Implemented**:
- ❌ Student academic data APIs
- ❌ Teacher grade input system
- ❌ Parent monitoring features
- ❌ Content management system
- ❌ Database persistence

This deployment guide focuses on getting the working features operational.

---

**Deployment Guide Version: 1.3.1**  
<<<<<<< HEAD
**Last Updated: November 24, 2024**  
=======
**Last Updated: 2025-11-24
>>>>>>> origin/main
**Deployment Status: Production Ready**

## 📋 Prerequisites

### Required Accounts & Services
- **GitHub Account**: For source code management and CI/CD
- **Cloudflare Account**: For hosting, database, and serverless functions
- **Google Cloud Account**: For Gemini AI API access
- **Domain Name** (Optional): Custom domain for production

### Development Environment
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Latest stable version
- **VS Code** (Recommended): With extensions for React, TypeScript, and Cloudflare

### Required API Keys
- **Google Gemini API Key**: For AI chat functionality (required)
- **Cloudflare API Token**: With appropriate permissions (Edit, D1, Vectorize)
- **SECRET_KEY**: HMAC secret key for JWT signing (required, 32+ characters)
- **Custom Domain DNS** (Optional): If using custom domain

### Security Requirements
- **SECRET_KEY**: Must be at least 32 characters long, random string
- **API Token**: Requires Edit permissions for D1 and Vectorize operations
- **HTTPS**: All production deployments must use HTTPS
- **CORS**: Properly configured for your domain
- **CSRF**: CSRF protection enabled by default in production

---

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/sulhi/ma-malnu-kananga.git
cd ma-malnu-kananga
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 4. Environment Variables
```bash
# Required for AI functionality
API_KEY=your_google_gemini_api_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here

# Required for authentication (MUST be 32+ characters)
SECRET_KEY=your_jwt_secret_key_here_minimum_32_characters
CSRF_SECRET=your_csrf_secret_key_here

# Application configuration
NODE_ENV=development
VITE_APP_ENV=development

# Cloudflare configuration (for local development)
VITE_WORKER_URL=http://localhost:8787

# Optional features
VITE_ENABLE_PWA=true
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ANALYTICS=false

# Security configuration (production only)
# CSRF_PROTECTION=true (automatically enabled in production)
# SECURITY_HEADERS=true (automatically enabled in production)
```

### 5. Environment Validation
```bash
# Validate environment configuration
npm run env:validate

# This will check:
# - SECRET_KEY is present and meets minimum requirements
# - API_KEY is properly formatted
# - Required environment variables are set
# - Production environment has proper security settings
```

### 6. 🔍 Finding Your Cloudflare Worker URL (CRITICAL)

After deploying your Cloudflare Worker, you MUST find and configure the correct URL:

#### Step-by-Step URL Discovery:
1. **Go to Cloudflare Dashboard** → Workers & Pages
2. **Find Your Worker**: Look for name pattern `malnu-kananga-*`
3. **Copy Worker URL**: Format will be `https://your-worker-name.subdomain.workers.dev`
4. **Update Environment**: Add to your `.env` file:
   ```bash
   VITE_WORKER_URL=https://your-actual-worker-url.workers.dev
   ```

#### Common URL Patterns:
- Development: `http://localhost:8787` (local worker)
- Staging: `https://malnu-kananga-staging.your-subdomain.workers.dev`
- Production: `https://malnu-kananga-prod.your-subdomain.workers.dev`

#### Verification:
```bash
# Test your worker URL
curl https://your-worker-url.workers.dev/health

# Should return: {"status": "ok", "timestamp": "..."}
```

#### ⚠️ Common Issues:
- **404 Error**: Worker not deployed or wrong URL
- **CORS Error**: VITE_WORKER_URL not matching actual worker URL
- **AI Not Working**: Vector database not seeded (run `/seed` endpoint)
- **Auth Failing**: SECRET_KEY missing or too short

---

## 🏗️ Local Development Setup

### 1. Start Development Server
```bash
npm run dev -- --port 9000
```

The application will be available at `http://localhost:9000`

### 2. Local Worker Development
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler auth login

# Start worker in development mode
wrangler dev worker.js --local
```

### 3. Database Setup (Local)
```bash
# Create local D1 database
wrangler d1 create malnu-kananga-dev-db

# Run migrations
wrangler d1 execute malnu-kananga-dev-db --file=./supabase/migrations/001_initial_schema.sql

# Seed initial data
npm run seed:dev
```

### 4. Testing Local Setup
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage report
npm run test:coverage

# Run linting
npm run lint

# Type checking
npm run type-check
```

---

## ☁️ Cloudflare Infrastructure Setup

### 1. Cloudflare Authentication
```bash
# Install Wrangler
npm install -g wrangler

# Authenticate with Cloudflare
wrangler auth login

# Verify authentication
wrangler whoami
```

### 2. Create D1 Database
```bash
# Create production database
wrangler d1 create malnu-kananga-db

# Note the database ID from the output
# Update wrangler.toml with the database ID
```

### 3. Create Vectorize Index
```bash
# Create vector database for AI
wrangler vectorize create malnu-kananga-index \
  --dimensions=768 \
  --metric=cosine \
  --description="MA Malnu Kananga AI Knowledge Base"
```

### 4. Update Wrangler Configuration
```toml
# wrangler.toml
name = "malnu-api"
main = "worker.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your-database-id-here"

# Vectorize binding
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

# AI binding
ai = { binding = "AI" }

# Environment variables
[vars]
NODE_ENV = "production"
# API_KEY and SECRET_KEY should be set as secrets

# Security configuration
[compatibility_flags]
nodejs_compat = true

# Security headers (automatically applied)
[compatibility_date]
date = "2024-01-01"
```

---

## 🚀 Production Deployment

### Option 1: One-Click Deploy (Recommended)

#### Automated Deployment
1. **Visit the deployment URL**: [Deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/ma-malnukananga/school-portal)
2. **Authorize GitHub**: Connect your GitHub account
3. **Configure Repository**: Select the repository and branch
4. **Set Environment Variables**: Add your Gemini API key
5. **Deploy**: Click "Deploy" to start the process

#### What Gets Created Automatically
- ✅ Cloudflare Pages for frontend hosting
- ✅ Cloudflare Worker for backend API
- ✅ D1 Database for data storage
- ✅ Vectorize Index for AI functionality
- ✅ Custom domain configuration (if provided)
- ✅ SSL certificates
- ✅ CDN distribution

### Option 2: Manual Deployment

#### Step 1: Build Frontend
```bash
# Build production bundle
npm run build

# Verify build output
ls -la dist/
```

#### Step 2: Configure Security Secrets
```bash
# Set required secrets (NEVER commit these to git)
wrangler secret put API_KEY
# Enter your Gemini API key when prompted

wrangler secret put SECRET_KEY
# Enter your 32+ character secret key when prompted

# Verify secrets are set
wrangler secret list
```

#### Step 3: Deploy Worker
```bash
# Deploy backend worker
wrangler deploy

# Verify deployment
wrangler tail
```

#### Step 3: Deploy Frontend
```bash
# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=malnu-kananga-frontend

# Or use the dashboard for Pages deployment
```

#### Step 4: Seed Vector Database
```bash
# Seed AI knowledge base (run once)
curl https://your-worker-url.workers.dev/seed

# Verify seeding
curl https://your-worker-url.workers.dev/health
```

#### Step 5: Security Verification
```bash
# Test CSRF protection
curl -X POST https://your-worker-url.workers.dev/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# Should return 403 without CSRF token

# Test security headers
curl -I https://your-worker-url.workers.dev/
# Should include CSP, X-Frame-Options, etc.

# Test environment validation
curl https://your-worker-url.workers.dev/api/health
# Should confirm all security requirements met
```

---

## 🔗 Domain Configuration

### Custom Domain Setup

#### Step 1: Add Domain to Cloudflare
1. Go to Cloudflare Dashboard
2. Add your domain to Cloudflare
3. Update nameservers at your domain registrar
4. Wait for DNS propagation (usually 24-48 hours)

#### Step 2: Configure Pages Domain
```bash
# Add custom domain to Pages
wrangler pages domain add your-domain.com

# Verify domain ownership
# Follow the DNS verification steps
```

#### Step 3: Configure Worker Route
```bash
# Add custom domain to worker
wrangler custom-domains add api.your-domain.com
```

#### Step 4: Update Environment Variables
```bash
# Update worker environment with custom domain
wrangler secret put API_KEY
wrangler secret put DOMAIN_NAME
```

---

## 🔐 Security Configuration

### 1. API Token Permissions
Create a Cloudflare API token with these permissions:
- **Zone:Zone**: Read (for DNS management)
- **Zone:DNS**: Edit (for domain configuration)
- **Account:Cloudflare Pages**: Edit (for frontend deployment)
- **Account:Account Settings**: Read (for account management)
- **User:User Details**: Read (for user authentication)

### 2. Environment Secrets
```bash
# Set production secrets
wrangler secret put API_KEY
wrangler secret put JWT_SECRET
wrangler secret put DATABASE_URL

# Verify secrets
wrangler secret list
```

### 3. SSL/TLS Configuration
- **Encryption**: Full SSL mode recommended
- **HSTS**: Enable HTTP Strict Transport Security
- **Certificate**: Automatic Let's Encrypt certificates
- **Minimum TLS Version**: TLS 1.2 or higher

---

## 📊 Monitoring & Logging

### 1. Application Monitoring
```bash
# View real-time logs
wrangler tail

# View analytics
wrangler analytics

# Check worker health
curl https://your-worker-url.workers.dev/health
```

### 2. Error Tracking Setup
```javascript
// Configure Sentry in production
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 3. Performance Monitoring
- **Lighthouse CI**: Automated performance testing
- **Core Web Vitals**: Real user monitoring
- **Uptime Monitoring**: 24/7 service availability
- **Error Alerts**: Real-time error notifications

---

## 🔄 CI/CD Pipeline Setup

### GitHub Actions Configuration

#### Workflow File: `.github/workflows/deploy.yml`
```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: malnu-kananga
          directory: dist
```

#### Required GitHub Secrets
- `CLOUDFLARE_API_TOKEN`: Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `GEMINI_API_KEY`: Google Gemini API key

---

## 🧪 Testing & Validation

### 1. Pre-Deployment Checklist
- [ ] All tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)
- [ ] Linting clean (`npm run lint`)
- [ ] Type checking passed (`npm run type-check`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Vector database seeded

### 2. Post-Deployment Verification
```bash
# Test frontend
curl https://your-domain.com/

# Test API endpoints
curl https://api.your-domain.com/health

# Test AI functionality
curl -X POST https://api.your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test authentication
curl -X POST https://api.your-domain.com/request-login-link \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Performance Testing
```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com/ \
  --output=json \
  --output-path=./lighthouse-report.json

# Load testing with artillery
artillery run load-test.yml
```

---

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. Worker Deployment Fails
**Problem**: Permission denied during deployment
**Symptoms**: 
- `Error: Permission denied` when running `wrangler deploy`
- `403 Forbidden` responses from Cloudflare API
- Authentication errors in CI/CD pipeline

**Solutions**: 
```bash
# Check API token permissions
wrangler auth whoami

# Re-authenticate if needed
wrangler auth login

# Verify token has required permissions
# Token needs: Account:Cloudflare Pages:Edit, Account:Account Settings:Read
```

**Prevention**:
- Use API tokens with minimum required permissions
- Regularly rotate API tokens
- Store tokens in secure environment variables

#### 2. Database Connection Issues
**Problem**: Cannot connect to D1 database
**Symptoms**:
- `Database binding not found` errors
- `502 Bad Gateway` on database queries
- Migration failures

**Solutions**:
```bash
# Check database binding in wrangler.toml
wrangler d1 list

# Test database connection
wrangler d1 execute malnu-kananga-db --command="SELECT 1"

# Recreate database if corrupted
wrangler d1 create malnu-kananga-db-new
# Update wrangler.toml with new database ID
# Run migrations again
```

**Common Causes**:
- Incorrect database ID in wrangler.toml
- Missing database binding configuration
- Database region mismatch

#### 3. AI API Errors
**Problem**: Gemini API not responding
**Symptoms**:
- `API key invalid` errors
- `Quota exceeded` messages
- Empty AI responses

**Solutions**:
```bash
# Verify API key is set
wrangler secret list

# Test API key validity
curl -H "x-goog-api-key: YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models

# Check API quota and billing
# Visit Google AI Studio to verify usage
```

**Prevention**:
- Monitor API usage quotas
- Set up billing alerts
- Implement fallback responses

#### 4. Vector Database Issues
**Problem**: Vector search not working
**Symptoms**:
- Empty context from AI chat
- `Vectorize index not found` errors
- Low similarity scores

**Solutions**:
```bash
# Check vectorize index exists
wrangler vectorize list

# Re-seed vector database
curl https://your-worker-url.workers.dev/seed

# Verify index dimensions match model (768 for bge-base-en-v1.5)
wrangler vectorize describe malnu-kananga-index
```

**Common Issues**:
- Wrong embedding model dimensions
- Index not properly seeded
- Similarity threshold too high (default 0.75)

#### 5. Environment Variable Issues
**Problem**: Missing or incorrect environment variables
**Symptoms**:
- `SECRET_KEY not configured` errors
- Authentication failures
- CORS issues

**Solutions**:
```bash
# List all secrets
wrangler secret list

# Set missing secrets
wrangler secret put SECRET_KEY
wrangler secret put API_KEY

# Validate environment
curl https://your-worker-url.workers.dev/health
```

**Critical Variables**:
- `SECRET_KEY`: Must be 32+ characters, cannot be default
- `API_KEY`: Valid Google Gemini API key
- `NODE_ENV`: Set to "production" for production

#### 6. CORS and Security Issues
**Problem**: Frontend cannot connect to backend
**Symptoms**:
- CORS errors in browser console
- `CSRF token invalid` errors
- Mixed content warnings

**Solutions**:
```bash
# Check CORS configuration
# Should allow your frontend domain
# Verify Origin header in requests

# Test CSRF protection
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
# Should return 403 without CSRF token
```

**Configuration Checklist**:
- Frontend domain added to CORS allowlist
- CSRF tokens enabled in production
- Secure cookies with __Host prefix

#### 7. Build and Bundle Issues
**Problem**: Frontend build fails
**Symptoms**:
- TypeScript compilation errors
- Missing dependencies
- Bundle size too large

**Solutions**:
```bash
# Clear build cache
rm -rf node_modules dist
npm install

# Check for TypeScript errors
npm run type-check

# Analyze bundle size
npm run build:analyze
```

**Common Fixes**:
- Update Node.js to version 18+
- Clear npm cache: `npm cache clean --force`
- Check for conflicting dependencies

#### 8. Domain and SSL Issues
**Problem**: Custom domain not working
**Symptoms**:
- DNS resolution failures
- SSL certificate errors
- Redirect loops

**Solutions**:
```bash
# Check DNS propagation
dig your-domain.com

# Verify SSL certificate
curl -I https://your-domain.com

# Check Cloudflare SSL settings
# Should be "Full (strict)" mode
```

**Troubleshooting Steps**:
1. Verify nameservers point to Cloudflare
2. Check CNAME/A records in DNS
3. Ensure SSL certificate is issued
4. Test with curl to isolate browser issues

### Debug Mode and Monitoring

#### Enable Debug Logging
```bash
# Local development with debug
wrangler dev worker.js --log-level debug

# Production log monitoring
wrangler tail --format json

# Filter specific error types
wrangler tail --filter "error"
```

#### Health Check Monitoring
```bash
# Comprehensive health check
curl https://your-worker-url.workers.dev/health

# Expected response structure:
{
  "status": "healthy",
  "services": {
    "ai": "operational",
    "database": "operational", 
    "vectorize": "operational"
  }
}
```

#### Performance Monitoring
```bash
# Check worker response times
curl -w "@curl-format.txt" https://your-worker-url.workers.dev/health

# Monitor with real user metrics
# Set up Core Web Vitals monitoring
# Configure Lighthouse CI for automated testing
```

### Emergency Procedures

#### Complete System Recovery
```bash
# 1. Restore database from backup
wrangler d1 execute malnu-kananga-db --file=backup.sql

# 2. Redeploy worker from known good version
wrangler deploy --compatibility-date=2024-01-01

# 3. Reseed vector database
curl https://your-worker-url.workers.dev/seed

# 4. Verify all systems
curl https://your-worker-url.workers.dev/health
```

#### Rollback Procedures
```bash
# Rollback worker to previous version
wrangler rollback --compatibility-date=2024-01-01

# Rollback Pages deployment
# Use Cloudflare dashboard:
# 1. Go to Pages project
# 2. Click "Deployments" 
# 3. Find previous successful deployment
# 4. Click "Rollback"

# Restore database if needed
wrangler d1 execute malnu-kananga-db --file=backup.sql
```

### Getting Help

#### Collect Debug Information
```bash
# System information
node --version
npm --version
wrangler --version

# Configuration dump
wrangler whoami
wrangler d1 list
wrangler vectorize list

# Recent logs
wrangler tail --since 1h

# Health status
curl https://your-worker-url.workers.dev/health
```

#### Contact Support
When reporting issues, include:
- Error messages and stack traces
- Steps to reproduce the problem
- System information (versions, configuration)
- Recent changes or deployments
- Browser and environment details

**Support Channels**:
- GitHub Issues: For bugs and feature requests
- Email: devops@ma-malnukananga.sch.id
- Documentation: Check this guide first

---

## 📈 Performance Optimization

### 1. Frontend Optimization
```bash
# Analyze bundle size
npm run build:analyze

# Optimize images
npx imagemin src/assets/* --out-dir=src/assets/optimized

# Enable compression
# Configure in vite.config.ts
```

### 2. Backend Optimization
```bash
# Enable caching in worker
// Add cache headers to responses
response.headers.set('Cache-Control', 'public, max-age=31536000');

# Optimize database queries
// Use prepared statements
// Add appropriate indexes
```

### 3. CDN Configuration
- **Cache TTL**: Static assets 1 year, API responses 5 minutes
- **Compression**: Brotli and Gzip enabled
- **Minification**: HTML, CSS, JavaScript minified
- **Image Optimization**: WebP format with fallbacks

---

## 🔄 Maintenance & Updates

### 1. Regular Maintenance Tasks
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Database backup
wrangler d1 export malnu-kananga-db --output=backup.sql

# Clear cache
wrangler cache purge --url=https://your-domain.com/*
```

### 2. Update Process
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test
npm run test

# 3. Commit and push
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 4. Create pull request
# 5. Review and merge to main
# 6. Automatic deployment triggers
```

### 3. Rollback Procedure
```bash
# Rollback worker to previous version
wrangler rollback --compatibility-date=2024-01-01

# Rollback Pages deployment
# Use Cloudflare dashboard to rollback

# Restore database if needed
wrangler d1 execute malnu-kananga-db --file=backup.sql
```

---

## 📞 Support & Resources

### Documentation
- **API Documentation**: [API_DOCS.md](./API_DOCUMENTATION.md)
- **System Architecture**: [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- **Troubleshooting Guide**: [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)

### Community Support
- **GitHub Issues**: [Report bugs and request features](https://github.com/sulhi/ma-malnu-kananga/issues)
- **Discord Community**: [Join our Discord](https://discord.gg/ma-malnukananga)
- **Email Support**: support@ma-malnukananga.sch.id

### External Resources
- **Cloudflare Documentation**: [docs.cloudflare.com](https://docs.cloudflare.com)
- **Google Gemini API**: [ai.google.dev](https://ai.google.dev)
- **React Documentation**: [react.dev](https://react.dev)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] API keys obtained and tested
- [ ] Database created and migrated
- [ ] Vector index created
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated

### Deployment
- [ ] Frontend built successfully
- [ ] Worker deployed without errors
- [ ] Database seeded with initial data
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates installed
- [ ] CDN caching configured

### Post-Deployment
- [ ] Health checks passing (test /health endpoint)
- [ ] API endpoints responding (verify /api/chat)
- [ ] AI functionality working (test RAG system)
- [ ] Authentication system operational (test magic link)
- [ ] CSRF protection working (verify secure headers)
- [ ] Vector database seeded (run /seed once)
- [ ] Monitoring and logging active
- [ ] Performance metrics within targets
- [ ] User acceptance testing completed

---

**Deployment Guide**  
*Version: 1.3.0*  
*Last Updated: 2025-11-24*
*Deployment Team: MA Malnu Kananga DevOps*  
*Next Review: 2025-12-24

---

*For deployment assistance, contact the DevOps team at devops@ma-malnukananga.sch.id*