# 🔧 Environment Setup Guide - MA Malnu Kananga

## 🌟 Overview

Comprehensive guide for setting up and managing environment variables across development, testing, and production environments for MA Malnu Kananga school portal.

---

## 🏗️ Environment Architecture

### Environment Types
- **Development**: Local development with hot reload
- **Testing**: CI/CD testing environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Configuration Files
```
Project Root/
├── .env.example           # Template with all variables
├── .env.local            # Local development (gitignored)
├── .env.development      # Development overrides
├── .env.test            # Testing environment
├── .env.staging         # Staging environment
└── .env.production      # Production overrides
```

---

## 📋 Required Environment Variables

### 🔑 Critical Variables (Required for All Environments)

#### AI Configuration
```bash
# Google Gemini AI API Key - REQUIRED for AI functionality
# Get from: https://makersuite.google.com/app/apikey
API_KEY=AIzaSyC_your_gemini_api_key_here
GEMINI_API_KEY=AIzaSyC_your_gemini_api_key_here

# AI Model Configuration
GEMINI_MODEL=gemini-1.5-flash
```

#### Application Configuration
```bash
# Environment Mode
NODE_ENV=production

# Application URLs
VITE_APP_URL=https://ma-malnukananga.sch.id
VITE_WORKER_URL=https://malnu-api.sulhi-cmz.workers.dev

# PWA Configuration
VITE_ENABLE_PWA=true
VITE_PWA_ENABLED=true
```

#### Security Configuration
```bash
# JWT Secret for authentication (32+ characters recommended)
SECRET_KEY=your_super_secret_key_minimum_32_characters

# CSRF Protection
CSRF_SECRET=your_csrf_secret_key_here

# Session Configuration
SESSION_TIMEOUT=900000  # 15 minutes in milliseconds
```

### 🗄️ Database Configuration

#### Cloudflare D1 (Primary)
```bash
# D1 Database (auto-configured by Cloudflare)
# These are typically set via wrangler.toml and Cloudflare dashboard
DB=malnu-kananga-db
D1_DATABASE_NAME=malnu-kananga-db
D1_DATABASE_ID=your_database_id_here
```

#### Supabase (Alternative)
```bash
# Supabase Configuration (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_SUPABASE=false
```

### 🌐 Cloudflare Configuration

#### Worker Configuration
```bash
# Cloudflare Worker Settings
WORKER_NAME=malnu-kananga
WORKER_SCRIPT=worker.js

# Vector Database
VECTORIZE_INDEX=malnu-kananga-index
VECTOR_DIMENSIONS=768

# AI Model Bindings
AI_MODEL=@cf/baai/bge-base-en-v1.5
```

#### API Token (Production Only)
```bash
# Cloudflare API Token for deployment
# ⚠️ SENSITIVE: Keep secure and never commit
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

---

## 🔧 Environment Setup by Stage

### 🛠️ Development Environment

#### 1. Local Development Setup
```bash
# Clone repository
git clone https://github.com/sulhi/ma-malnu-kananga.git
cd ma-malnu-kananga

# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Configure .env.local
nano .env.local
```

#### 2. Development .env.local Configuration
```bash
# .env.local - Development Environment
NODE_ENV=development

# AI Configuration (use development key)
API_KEY=AIzaSyC_development_gemini_key
GEMINI_API_KEY=AIzaSyC_development_gemini_key
GEMINI_MODEL=gemini-1.5-flash

# Local Development URLs
VITE_APP_URL=http://localhost:9000
VITE_WORKER_URL=http://localhost:8787  # Local worker dev server

# Development Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=false

# Development Database (local D1)
VITE_DB_URL=http://localhost:8787

# Development Security (use test keys)
SECRET_KEY=development_secret_key_32_chars_min
CSRF_SECRET=development_csrf_secret_key

# Debug Mode
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

#### 3. Running Development Server
```bash
# Start development server
npm run dev

# Start worker in development (separate terminal)
npm run dev:worker

# Run with specific port
npm run dev -- --port 9000
```

### 🧪 Testing Environment

#### 1. Testing Configuration (.env.test)
```bash
# .env.test - Testing Environment
NODE_ENV=test

# Mock AI Configuration
API_KEY=test_api_key
GEMINI_API_KEY=test_gemini_key
GEMINI_MODEL=gemini-1.5-flash

# Testing URLs
VITE_APP_URL=http://localhost:3000
VITE_WORKER_URL=http://localhost:8787

# Testing Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
VITE_ENABLE_NOTIFICATIONS=false

# Testing Security
SECRET_KEY=test_secret_key_32_characters_minimum
CSRF_SECRET=test_csrf_secret_key

# Testing Database
VITE_USE_SUPABASE=false
DB=test_db

# Mock Services
VITE_MOCK_APIS=true
VITE_MOCK_AUTH=true
```

#### 2. Running Tests
```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- ChatWindow.test.tsx
```

### 🚀 Staging Environment

#### 1. Staging Configuration (.env.staging)
```bash
# .env.staging - Staging Environment
NODE_ENV=staging

# Staging AI Configuration
API_KEY=AIzaSyC_staging_gemini_api_key
GEMINI_API_KEY=AIzaSyC_staging_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Staging URLs
VITE_APP_URL=https://staging.ma-malnukananga.sch.id
VITE_WORKER_URL=https://malnu-api-staging.sulhi-cmz.workers.dev

# Staging Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true

# Staging Security
SECRET_KEY=staging_secret_key_32_characters_minimum
CSRF_SECRET=staging_csrf_secret_key

# Staging Database
DB=malnu-kananga-staging-db
VECTORIZE_INDEX=malnu-kananga-staging-index
```

#### 2. Staging Deployment
```bash
# Deploy to staging
npm run deploy:staging

# Deploy worker to staging
wrangler deploy --env staging

# Seed staging database
curl https://malnu-api-staging.workers.dev/seed
```

### 🌐 Production Environment

#### 1. Production Configuration (.env.production)
```bash
# .env.production - Production Environment
NODE_ENV=production

# Production AI Configuration (REAL KEES REQUIRED)
API_KEY=AIzaSyC_production_gemini_api_key_here
GEMINI_API_KEY=AIzaSyC_production_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Production URLs
VITE_APP_URL=https://ma-malnukananga.sch.id
VITE_WORKER_URL=https://malnu-api.sulhi-cmz.workers.dev

# Production Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true

# Production Security (USE STRONG KEYS)
SECRET_KEY=production_super_secret_key_64_characters_minimum_recommended
CSRF_SECRET=production_csrf_secret_key_64_characters_minimum

# Production Database
DB=malnu-kananga-prod-db
VECTORIZE_INDEX=malnu-kananga-prod-index
D1_DATABASE_ID=your_production_database_id

# Production Cloudflare
CLOUDFLARE_API_TOKEN=your_production_api_token
CLOUDFLARE_ACCOUNT_ID=your_production_account_id
```

#### 2. Production Deployment
```bash
# Build for production
npm run build

# Deploy to production
npm run deploy:production

# Deploy worker to production
wrangler deploy

# Seed production database (ONE TIME ONLY)
curl https://malnu-api.workers.dev/seed

# Verify deployment
curl https://malnu-api.workers.dev/health
```

---

## 🔐 Security Best Practices

### 🔑 API Key Management

#### 1. Google Gemini API Key
```bash
# ✅ Good: Use environment-specific keys
API_KEY=AIzaSyC_development_key_for_dev_env
API_KEY=AIzaSyC_production_key_for_prod_env

# ❌ Bad: Using same key across environments
API_KEY=AIzaSyC_same_key_used_everywhere

# ✅ Good: Key rotation strategy
# - Rotate keys every 90 days
# - Have backup keys ready
# - Monitor usage and anomalies
```

#### 2. Secret Key Generation
```bash
# Generate strong secret keys (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output: a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

# Use in environment
SECRET_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 🛡️ Environment Security

#### 1. File Security
```bash
# .gitignore - NEVER commit these files
.env
.env.local
.env.*.local
.env.production
.env.staging

# ✅ Good: Only commit templates
.env.example
.env.template

# ✅ Good: Use environment-specific files
.env.development
.env.test
```

#### 2. Cloudflare Workers Secrets
```bash
# Set secrets via wrangler CLI (RECOMMENDED)
wrangler secret put API_KEY
wrangler secret put SECRET_KEY
wrangler secret put CSRF_SECRET

# Or via Cloudflare Dashboard
# 1. Go to Workers & Pages
# 2. Select your worker
# 3. Settings > Variables
# 4. Add encrypted secrets
```

#### 3. Access Control
```bash
# ✅ Good: Principle of least privilege
# - Development team: Development keys only
# - Deployment team: Production API tokens only
# - CI/CD: Limited scope tokens

# ❌ Bad: Sharing production keys
# - Never share production API keys in chat/email
# - Use secure key sharing systems
# - Rotate keys immediately if compromised
```

---

## 🔍 Environment Validation

### Validation Script

#### 1. Environment Validator
```typescript
// src/utils/envValidation.ts
interface EnvConfig {
  API_KEY: string;
  SECRET_KEY: string;
  NODE_ENV: string;
  VITE_WORKER_URL: string;
}

export const validateEnvironment = (): EnvConfig => {
  const required = ['API_KEY', 'SECRET_KEY', 'NODE_ENV'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  const config: EnvConfig = {
    API_KEY: process.env.API_KEY!,
    SECRET_KEY: process.env.SECRET_KEY!,
    NODE_ENV: process.env.NODE_ENV!,
    VITE_WORKER_URL: process.env.VITE_WORKER_URL || 'http://localhost:8787'
  };
  
  // Validate API key format
  if (!config.API_KEY.startsWith('AIzaSyC')) {
    throw new Error('Invalid API_KEY format. Expected Google Gemini API key.');
  }
  
  // Validate secret key length
  if (config.SECRET_KEY.length < 32) {
    throw new Error('SECRET_KEY must be at least 32 characters long.');
  }
  
  return config;
};
```

#### 2. Validation Command
```bash
# Add to package.json
{
  "scripts": {
    "env:validate": "node -e \"require('./src/utils/envValidation.ts').validateEnvironment()\"",
    "env:check": "node -e \"console.log('Environment:', process.env.NODE_ENV); console.log('API Key:', process.env.API_KEY ? 'Set' : 'Missing');\""
  }
}

# Run validation
npm run env:validate
npm run env:check
```

### Health Check Validation

#### 1. Environment Health Endpoint
```typescript
// worker.js - Add to health check
if (url.pathname === '/health') {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV || 'unknown',
    services: {
      ai: env.API_KEY ? 'configured' : 'missing',
      database: env.DB ? 'configured' : 'missing',
      vectorize: env.VECTORIZE_INDEX ? 'configured' : 'missing'
    },
    version: '1.3.0'
  };
  
  return new Response(JSON.stringify(health), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
```

#### 2. Automated Health Checks
```bash
# Health check script
#!/bin/bash
# health-check.sh

WORKER_URL=${VITE_WORKER_URL:-"http://localhost:8787"}

echo "Checking worker health at $WORKER_URL..."

response=$(curl -s "$WORKER_URL/health")
status=$(echo "$response" | jq -r '.status')

if [ "$status" = "healthy" ]; then
    echo "✅ Worker is healthy"
    echo "$response" | jq '.'
else
    echo "❌ Worker health check failed"
    echo "$response"
    exit 1
fi
```

---

## 🚨 Troubleshooting Environment Issues

### Common Issues & Solutions

#### 1. API Key Issues
```bash
# Problem: "Invalid API key" error
# Solution: Verify API key format and permissions

# Check API key format
echo $API_KEY | grep -E "^AIzaSyC_.*"

# Test API key directly
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$API_KEY"
```

#### 2. Environment Variable Not Loading
```bash
# Problem: Environment variables not available in app
# Solution: Check variable naming and loading order

# Debug environment loading
node -e "console.log('NODE_ENV:', process.env.NODE_ENV)"
node -e "console.log('API_KEY exists:', !!process.env.API_KEY)"

# Check Vite environment variables
# Must be prefixed with VITE_ for client-side access
echo $VITE_API_KEY  # ✅ Available in client
echo $API_KEY       # ❌ Server-side only
```

#### 3. Worker Deployment Issues
```bash
# Problem: Worker not loading environment variables
# Solution: Use wrangler secrets for sensitive data

# Set secrets properly
wrangler secret put API_KEY
wrangler secret put SECRET_KEY

# Verify secrets are set
wrangler secret list

# Check worker logs
wrangler tail
```

#### 4. CORS Issues
```bash
# Problem: CORS errors when calling worker
# Solution: Update allowed origins in worker

# Check current CORS configuration
curl -H "Origin: http://localhost:9000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     $VITE_WORKER_URL/api/chat

# Should return CORS headers
```

### Debug Commands

#### Environment Debug Script
```bash
#!/bin/bash
# debug-env.sh

echo "=== Environment Debug Information ==="
echo "Node Environment: $NODE_ENV"
echo "Shell Environment: $(basename $SHELL)"
echo "Current Directory: $(pwd)"
echo ""

echo "=== Required Variables ==="
echo "API_KEY: ${API_KEY:+SET}${API_KEY:-MISSING}"
echo "SECRET_KEY: ${SECRET_KEY:+SET}${SECRET_KEY:-MISSING}"
echo "VITE_WORKER_URL: $VITE_WORKER_URL"
echo ""

echo "=== Optional Variables ==="
echo "VITE_ENABLE_PWA: $VITE_ENABLE_PWA"
echo "VITE_ENABLE_ANALYTICS: $VITE_ENABLE_ANALYTICS"
echo "CLOUDFLARE_API_TOKEN: ${CLOUDFLARE_API_TOKEN:+SET}${CLOUDFLARE_API_TOKEN:-MISSING}"
echo ""

echo "=== File Checks ==="
echo ".env file exists: $([ -f .env ] && echo 'YES' || echo 'NO')"
echo ".env.local file exists: $([ -f .env.local ] && echo 'YES' || echo 'NO')"
echo ""

echo "=== Network Tests ==="
if command -v curl &> /dev/null; then
    echo "Testing worker connectivity..."
    if [ -n "$VITE_WORKER_URL" ]; then
        curl -s -o /dev/null -w "%{http_code}" "$VITE_WORKER_URL/health" && echo " - Worker reachable" || echo " - Worker unreachable"
    else
        echo "VITE_WORKER_URL not set"
    fi
else
    echo "curl not available for network testing"
fi
```

---

## 📋 Environment Setup Checklist

### Development Setup Checklist
- [ ] Clone repository and navigate to project directory
- [ ] Copy `.env.example` to `.env.local`
- [ ] Generate/set Google Gemini API key
- [ ] Generate strong SECRET_KEY (32+ characters)
- [ ] Set VITE_WORKER_URL for local development
- [ ] Install dependencies with `npm install`
- [ ] Run environment validation with `npm run env:validate`
- [ ] Start development server with `npm run dev`
- [ ] Test AI functionality with chat interface
- [ ] Verify all features work locally

### Production Deployment Checklist
- [ ] Generate production API keys (different from development)
- [ ] Set strong SECRET_KEY and CSRF_SECRET
- [ ] Configure Cloudflare Workers secrets
- [ ] Set up D1 database and Vectorize index
- [ ] Update production URLs in environment
- [ ] Run production build with `npm run build`
- [ ] Deploy worker to Cloudflare
- [ ] Seed vector database with `/seed` endpoint
- [ ] Verify health check endpoint works
- [ ] Test all functionality in production
- [ ] Set up monitoring and alerts

### Security Checklist
- [ ] All sensitive variables are in secrets (not .env files)
- [ ] API keys have appropriate permissions
- [ ] SECRET_KEY is 32+ characters and random
- [ ] .env files are in .gitignore
- [ ] Production secrets are different from development
- [ ] Regular key rotation schedule established
- [ ] Access to production secrets is limited
- [ ] Monitoring for unusual API usage
- [ ] Backup and recovery plan for secrets

---

## 🔗 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - API endpoint configuration
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment process
- [Security Guide](./SECURITY_GUIDE.md) - Security best practices
- [Database Schema](./DATABASE_SCHEMA.md) - Database configuration
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) - Common issues and solutions

---

## 📞 Support

For environment setup issues:
- **Email**: devops@ma-malnukananga.sch.id
- **Documentation**: Available in repository docs/
- **Issues**: Report via GitHub Issues
- **Security**: Report security issues to security@ma-malnukananga.sch.id

---
 
*Environment Setup Guide Version: 1.3.1*  
*Last Updated: November 25, 2025*  
*Supported Environments: Development, Testing, Staging, Production*  
*Primary Database: Cloudflare D1*  
*AI Service: Google Gemini*