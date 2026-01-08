# Production Deployment Guide

**Created**: 2026-01-05  
**Last Updated**: 2026-01-08  
**Version**: 2.1.0  
**Status**: Active

## Overview

This guide provides step-by-step instructions for deploying Smart Portal MA Malnu Kananga system to production using Cloudflare Workers, D1 Database, Cloudflare Pages, and R2 Storage.

## Deployment Architecture

```
Frontend (Cloudflare Pages)
  https://malnu-kananga.pages.dev
      ↓
Backend (Cloudflare Worker)
  https://malnu-kananga-worker.cpa01cmz.workers.dev
      ↓
Database (Cloudflare D1)
  malnu-kananga-db-dev
      ↓
Storage (Cloudflare R2)
  malnu-kananga-files (optional)
```

## Prerequisites

Before starting production deployment, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Cloudflare account (free tier works)
- [ ] Wrangler CLI installed: `npm install -g wrangler`
- [ ] Git access to repository
- [ ] Google Cloud account (for Gemini API key)
- [ ] Wrangler authenticated: `wrangler whoami`

## Step 1: Cloudflare Account Setup

### 1.1 Authenticate with Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

**Expected output:**
```
Logged in as your@email.com with API Token
Account ID: 2560d478b3d26a83c3efe3565bed7f4f
```

### 1.2 Verify D1 Database

The project uses an existing D1 database. Verify it exists:

```bash
# List all databases
wrangler d1 list

# Current database:
# malnu-kananga-db-dev (ID: 69605f72-4b69-4dd6-a72c-a17006f61254)
```

**Note**: Currently using development database. For production, create a new database and update wrangler.toml.

### 1.3 (Optional) Create Production D1 Database

```bash
# Create R2 bucket for file storage
wrangler r2 bucket create malnu-kananga-files

# Create dev bucket (optional)
wrangler r2 bucket create malnu-kananga-files-dev
```

#### R2 File Storage Organization

The R2 bucket uses the following structure:
```
malnu-kananga-files/
├── ppdb-documents/
│   └── {year}/
│       └── {registrant_id}/
│           └── ijazah.pdf
├── e-library/
│   ├── {subject_id}/
│   │   └── {material_id}/
│   │       └── {filename}
│   └── {category}/
│       └── {material_id}/
│           └── {filename}
└── uploads/
    └── {user_id}/
        └── {timestamp}/
            └── {filename}
```

#### File Validation Rules

**PPDB Documents:**
- Allowed Types: PDF, JPG, PNG, JPEG
- Max Size: 5 MB
- Required Fields: Ijazah, KK, Akta Kelahiran

**E-Library Materials:**
- Allowed Types: PDF, DOCX, PPT, PPTX, MP4, JPG, PNG
- Max Size: 50 MB
- Categories: Matematika, Bahasa, IPA, IPS, Agama, etc.

**General Uploads:**
- Allowed Types: All common document and image formats
- Max Size: 10 MB

#### R2 API Endpoints

**Upload File**
```bash
POST /api/files/upload
Content-Type: multipart/form-data

Parameters:
- file: File to upload
- path: Optional custom path (default: uploads/{user_id}/{timestamp})
```

**Download File**
```bash
GET /api/files/download?key={key}
```

**Delete File**
```bash
DELETE /api/files/delete?key={key}
```

### 1.4 (Optional) Create Vectorize Index

```bash
# Create production database (optional)
wrangler d1 create malnu-kananga-db-prod

# Copy the database_id from output
# Example output:
# ✨ Successfully created DB 'malnu-kananga-db-prod'
# [[d1_databases]]
# binding = "DB"
# database_name = "malnu-kananga-db-prod"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 1.4 Create R2 Bucket (Optional)

## Step 2: Configure Backend Worker

### 2.1 Update wrangler.toml for Worker

Edit `wrangler.toml` for Worker deployment. Current configuration:

```toml
name = "malnu-kananga-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

# Default environment (for basic deployment without production/separate dev configs)
[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db-dev"
database_id = "69605f72-4b69-4dd6-a72c-a17006f61254"

[vars]
ALLOWED_ORIGIN = "*"
NODE_ENV = "development"
LOG_LEVEL = "info"

# Environment bindings for production (optional - create separate DB if needed)
[env.production]
name = "malnu-kananga-worker-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db-prod"
# Production D1 database ID (create with: wrangler d1 create malnu-kananga-db-prod)
# database_id = "your-production-db-id-here"

# Vectorize index bindings (optional - create with: wrangler vectorize create malnu-kananga-index --dimensions=768 --metric=cosine)
# [[env.production.vectorize]]
# binding = "VECTORIZE_INDEX"
# index_name = "malnu-kananga-index"

# R2 Bucket bindings (optional - create with: wrangler r2 bucket create malnu-kananga-files)
# [[env.production.r2_buckets]]
# binding = "BUCKET"
# bucket_name = "malnu-kananga-files"

[env.production.vars]
# Set to your production domain (for CORS) or use "*" for all origins
ALLOWED_ORIGIN = "*"
# Secrets are set via: wrangler secret put <SECRET_NAME> --env production
# JWT_SECRET and GEMINI_API_KEY are managed as Cloudflare secrets, not in wrangler.toml
NODE_ENV = "production"
LOG_LEVEL = "error"

# Local development
[env.dev]
name = "malnu-kananga-worker-dev"

[[env.dev.d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db-dev"
database_id = "69605f72-4b69-4dd6-a72c-a17006f61254"

[env.dev.vars]
# Allow all origins for local development
ALLOWED_ORIGIN = "*"
NODE_ENV = "development"
LOG_LEVEL = "info"
```

### 2.2 Set Worker Secrets

```bash
# Set JWT_SECRET for production (optional if using dev database)
openssl rand -base64 32 | wrangler secret put JWT_SECRET

# Set GEMINI_API_KEY for production (optional for AI chat)
echo "your-gemini-api-key" | wrangler secret put GEMINI_API_KEY

# List all secrets
wrangler secret list
```

### 2.3 Deploy Backend Worker

```bash
# Deploy to default environment (currently using dev DB)
wrangler deploy --env=""

# Deploy to production environment (if production DB is set up)
wrangler deploy --env production
```

Expected output:
```
✨ Successfully published your Worker to
  https://malnu-kananga-worker.cpa01cmz.workers.dev
```

### 2.4 Seed Database

```bash
# Seed database with initial data (creates tables and default admin)
curl -X POST https://malnu-kananga-worker.cpa01cmz.workers.dev/seed

# Expected response:
# {"success":true,"message":"Database seeded successfully!","data":null}
```

This will create:
- All required database tables
- Default admin user (email: admin@malnu.sch.id, password: admin123)
- Sample subjects for RAG chatbot

**⚠️ IMPORTANT**: Change default admin password immediately after first login!

### 2.5 Verify Backend Deployment

```bash
# Test login endpoint
curl -X POST https://malnu-kananga-worker.cpa01cmz.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@malnu.sch.id","password":"admin123"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {...},
    "token": "eyJhbGc...",
    "refreshToken": "..."
  }
}
```

## Step 3: Validate Configuration

Before deploying, validate your configuration:

```bash
# Run validation script
npm run validate-config

# Expected output:
# ✓ All validations passed - Ready for deployment
```

If validation fails, fix all reported errors before proceeding.

## Step 4: Deploy Backend Worker

### 4.1 Deploy to Production

```bash
# Deploy the worker
wrangler deploy --env production

# Verify deployment
wrangler deployments list --env production
```

Expected output:
```
✨ Successfully published your Worker to
  https://malnu-kananga-worker-prod.workers.dev
```

### 4.2 Seed the Database

```bash
# Seed the database with initial data
curl https://malnu-kananga-worker-prod.workers.dev/seed

# Expected response:
# {"success":true,"message":"Database seeded successfully",...}
```

This will create:
- All required tables
- Default admin user (email: admin@malnu.sch.id, password: admin123)
- Sample subjects

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

### 4.3 Verify Deployment

```bash
# Test health endpoint
curl https://malnu-kananga-worker-prod.workers.dev/health

# Test login endpoint
curl -X POST https://malnu-kananga-worker-prod.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@malnu.sch.id","password":"admin123"}'
```

## Step 3: Deploy Frontend to Cloudflare Pages

### 3.1 Create Pages Project (First Time Only)

```bash
# Create Pages project (first time only)
wrangler pages project create malnu-kananga

# Follow the prompts to connect to GitHub repository or upload manually
```

### 3.2 Configure Pages Secrets

Set environment variables for Pages:

```bash
# Set API base URL
echo "https://malnu-kananga-worker.cpa01cmz.workers.dev" | wrangler pages secret put VITE_API_BASE_URL --project-name=malnu-kananga

# Enable PWA features
echo "true" | wrangler pages secret put VITE_ENABLE_PWA --project-name=malnu-kananga

# Enable AI chat features
echo "true" | wrangler pages secret put VITE_ENABLE_AI_CHAT --project-name=malnu-kananga

# List all secrets
wrangler pages secret list --project-name=malnu-kananga
```

### 3.3 Build Frontend

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Verify build output
ls -la dist/
```

Expected output:
```
dist/
├── index.html
├── manifest.webmanifest
├── sw.js
├── workbox-*.js
├── apple-touch-icon.png
├── favicon.ico
├── pwa-192x192.png
├── pwa-512x512.png
└── assets/
    ├── index-*.js
    ├── index-*.css
    └── ...
```

### 3.4 Deploy to Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=malnu-kananga

# Deploy with uncommitted changes
wrangler pages deploy dist --project-name=malnu-kananga --commit-dirty=true
```

Expected output:
```
Uploading... (39/39)
✨ Success! Uploaded 27 files

🌎 Deploying...
✨ Deployment complete! Take a peek over at https://xxx.pages.dev
```

### 3.5 Verify Pages Deployment

```bash
# Check deployed site
curl -I https://malnu-kananga.pages.dev

# Expected:
# HTTP/2 200
# server: cloudflare
# content-type: text/html; charset=utf-8
```

### 3.6 (Optional) Configure Custom Domain

If you have a custom domain:

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Select your Pages project: `malnu-kananga`
3. Go to Custom Domains
4. Add your domain (e.g., `ma-malnukananga.sch.id`)
5. Follow DNS instructions (usually CNAME to *.pages.dev)
6. Update `ALLOWED_ORIGIN` in wrangler.toml if needed

**Note**: This step is optional. The default Pages URL works perfectly fine.

## Step 4: Post-Deployment Checklist

After successful deployment:

Backend:
- [x] Change default admin password (admin@malnu.sch.id / admin123)
- [ ] Verify all API endpoints are accessible
- [ ] Test authentication flow (login/refresh token/logout)
- [ ] Verify database tables are created and populated

Frontend:
- [x] Verify frontend loads at https://malnu-kananga.pages.dev
- [ ] Test login to admin dashboard
- [ ] Test AI chatbot functionality
- [ ] Test PWA installation (mobile)
- [ ] Verify CORS is properly configured
- [ ] Test with different browsers

Optional Features:
- [ ] Set up R2 bucket for file upload/download
- [ ] Test PPDB document upload (if R2 configured)
- [ ] Test E-Library file management (if R2 configured)
- [ ] Create production D1 database and update wrangler.toml
- [ ] Configure custom domain (if needed)

Maintenance:
- [ ] Set up monitoring and logging (wrangler tail)
- [ ] Configure rate limiting (if needed)
- [ ] Set up database backups
- [ ] Review security headers
- [ ] Test with real user workflows

## Step 7: Monitoring and Maintenance

### 7.1 View Worker Logs

```bash
# View real-time logs
wrangler tail --env production

# View recent logs
wrangler deployments tail --env production
```

### 7.2 Database Management

```bash
# Execute SQL queries
wrangler d1 execute malnu-kananga-db-prod --env production --command="SELECT COUNT(*) FROM users"

# Backup database
wrangler d1 export malnu-kananga-db-prod --env production --output=backup.sql
```

### 7.3 R2 Storage Management

```bash
# View bucket contents
wrangler r2 object list malnu-kananga-files --prefix="ppdb-documents/2024/"

# Get file info
wrangler r2 object get malnu-kananga-files --key=ppdb-documents/2024/abc123/ijazah.pdf

# Delete file
wrangler r2 object delete malnu-kananga-files --key=ppdb-documents/2024/abc123/ijazah.pdf
```

### 7.4 Performance Monitoring

Monitor key metrics:
- Worker response time
- Database query performance
- R2 storage usage
- API error rates
- User activity

## Troubleshooting

### Common Issues

**1. CORS Errors**

```bash
# Check ALLOWED_ORIGIN in wrangler.toml
# For Pages deployment, use "*" or specific domain
ALLOWED_ORIGIN = "*"

# Or set specific origin
ALLOWED_ORIGIN = "https://malnu-kananga.pages.dev"
```

**2. Authentication Failures**

```bash
# Verify JWT_SECRET is set in Worker
wrangler secret list

# Check that tokens are being sent in Authorization header
# Verify user status is 'active' in database

# Test login endpoint directly
curl -X POST https://malnu-kananga-worker.cpa01cmz.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@malnu.sch.id","password":"admin123"}'
```

**3. Database Connection Errors**

```bash
# Verify database_id is correct
wrangler d1 list

# Check database binding in wrangler.toml
# Ensure database tables exist (run /seed endpoint)

# For remote database, use --remote flag
wrangler d1 execute malnu-kananga-db-dev --remote --command="SELECT COUNT(*) FROM users"
```

**4. Pages Build Issues**

```bash
# Verify Vite build completes locally
npm run build

# Check for TypeScript errors
npm run typecheck

# Verify build output exists
ls -la dist/

# Clear Pages cache and redeploy
wrangler pages deploy dist --project-name=malnu-kananga
```

**5. Worker Deployment Issues**

```bash
# Verify wrangler is authenticated
wrangler whoami

# Check worker syntax
node worker.js

# Check wrangler.toml for errors
wrangler deploy --dry-run

# View deployment logs
wrangler tail
```

**6. Pages Functions Issues**

If you need API routing on Pages (not required for this project):

```bash
# Create functions directory
mkdir -p functions/api

# Add _worker.js for API proxy
# Then deploy again
```

**7. File Upload Failures** (if R2 is configured)

```bash
# Verify R2 bucket is created and bound
wrangler r2 bucket list

# Check file size limits (50MB max)
# Verify file types are allowed
# Check authentication token is valid
```

**8. AI Features Not Working**

```bash
# Verify GEMINI_API_KEY is set in Worker
wrangler secret list

# Or set VITE_GEMINI_API_KEY in frontend (browser-based AI)
echo "your-gemini-key" | wrangler pages secret put VITE_GEMINI_API_KEY --project-name=malnu-kananga

# Check API key has not expired
# Verify rate limits not exceeded
```

**9. Pages Environment Variables Not Available**

```bash
# Verify secrets are set in Pages
wrangler pages secret list --project-name=malnu-kananga

# Check that variables are prefixed with VITE_ (for browser access)
# Rebuild and redeploy after setting secrets
npm run build
wrangler pages deploy dist --project-name=malnu-kananga
```

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Rotate keys regularly** - Update API keys periodically
3. **Use HTTPS only** - All endpoints should use HTTPS
4. **Enable rate limiting** - Prevent API abuse
5. **Monitor logs** - Watch for suspicious activity
6. **Keep dependencies updated** - Run `npm audit` regularly
7. **Use strong passwords** - Change default passwords
8. **Implement backup strategy** - Regular database backups
9. **Secure file uploads** - Validate file types, enforce size limits, authenticate all requests
10. **Signed URLs** - Use expiring signed URLs for file downloads

## Cost Considerations

- **R2 Storage**: No egress fees (unlike S3)
  - Storage: ~$0.015/GB/month
  - Class A operations: $4.50/1M requests
  - Class B operations: $0.36/1M requests
- **D1 Database**: Free tier includes 5GB storage, 5M reads/day
- **Workers**: Free tier includes 100,000 requests/day
- **Vectorize**: Based on vector dimensions and query volume

Estimated monthly cost for small deployment: <$5

## Rollback Procedures

If deployment fails:

```bash
# Rollback worker to previous version
wrangler rollback --env production

# Or deploy specific commit
git checkout <previous-commit-hash>
wrangler deploy --env production
```

## Support and Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [API Reference](./api-documentation.md)

## Quick Reference URLs

- **Pages URL**: https://malnu-kananga.pages.dev
- **Worker API**: https://malnu-kananga-worker.cpa01cmz.workers.dev
- **Login Endpoint**: /api/auth/login
- **Seed Endpoint**: /seed
- **Wrangler Config**: wrangler.toml (Worker only, not Pages)

## Deployment Summary

| Component | Platform | URL | Status |
|-----------|-----------|------|--------|
| Frontend | Cloudflare Pages | https://malnu-kananga.pages.dev | ✅ Deployed |
| Backend API | Cloudflare Worker | https://malnu-kananga-worker.cpa01cmz.workers.dev | ✅ Deployed |
| Database | Cloudflare D1 | malnu-kananga-db-dev | ✅ Connected |
| Storage | Cloudflare R2 | malnu-kananga-files | ⚠️ Optional |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-05 | Initial production deployment guide |
| 2.1.0 | 2026-01-08 | Updated to Pages deployment, removed custom domain references, fixed backend URLs |

## License

© 2026 MA Malnu Kananga. All rights reserved.
