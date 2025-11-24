# 🚀 Deployment Guide - MA Malnu Kananga

## 🌟 Overview

This comprehensive guide covers the complete deployment process for the MA Malnu Kananga School Portal, from development setup to production deployment on Cloudflare's serverless platform.

---

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
database_name = "malnu-kananga-auth"
database_id = "your-database-id-here"

# Vectorize binding
[[vectorize]]
binding = "VECTORIZE"
index_name = "malnu-kananga-docs"

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

### Common Issues

#### 1. Worker Deployment Fails
**Problem**: Permission denied during deployment
**Solution**: 
```bash
# Check API token permissions
wrangler auth whoami

# Re-authenticate if needed
wrangler auth login

# Verify token has required permissions
```

#### 2. Database Connection Issues
**Problem**: Cannot connect to D1 database
**Solution**:
```bash
# Check database binding in wrangler.toml
wrangler d1 list

# Test database connection
wrangler d1 execute malnu-kananga-db --command="SELECT 1"
```

#### 3. AI API Errors
**Problem**: Gemini API not responding
**Solution**:
```bash
# Verify API key
wrangler secret list

# Test API key validity
curl -H "x-goog-api-key: YOUR_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

#### 4. Vector Database Issues
**Problem**: Vector search not working
**Solution**:
```bash
# Check vectorize index
wrangler vectorize list

# Re-seed vector database
curl https://your-worker-url.workers.dev/seed
```

### Debug Mode
```bash
# Enable debug logging
wrangler dev worker.js --log-level debug

# View detailed logs
wrangler tail --format json
```

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
*Last Updated: November 24, 2024*  
*Deployment Team: MA Malnu Kananga DevOps*  
*Next Review: December 2024*

---

*For deployment assistance, contact the DevOps team at devops@ma-malnukananga.sch.id*