# Production Deployment Guide

**Created**: 2026-01-05  
**Last Updated**: 2026-01-05  
**Version**: 1.0.0  
**Status**: Active

## Overview

This guide provides step-by-step instructions for deploying the Smart Portal MA Malnu Kananga system to production using Cloudflare Workers, D1 Database, and R2 Storage.

## Prerequisites

Before starting production deployment, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Cloudflare account (free tier works)
- [ ] Wrangler CLI installed: `npm install -g wrangler`
- [ ] Git access to the repository
- [ ] Google Cloud account (for Gemini API key)
- [ ] Production domain ready: `ma-malnukananga.sch.id`

## Step 1: Cloudflare Account Setup

### 1.1 Authenticate with Cloudflare

```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### 1.2 Create D1 Database

```bash
# Create production database
wrangler d1 create malnu-kananga-db-prod

# Copy the database_id from the output
# Example output:
# ✨ Successfully created DB 'malnu-kananga-db-prod'
# [[d1_databases]]
# binding = "DB"
# database_name = "malnu-kananga-db-prod"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 1.3 Create R2 Bucket

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
# Create vector index for RAG chatbot
wrangler vectorize create malnu-kananga-index --dimensions=768 --metric=cosine
```

## Step 2: Configure Production Values

### 2.1 Update wrangler.toml

Edit `wrangler.toml` and replace all placeholder values:

```toml
[env.production]
name = "malnu-kananga-worker-prod"

[[env.production.d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db-prod"
# Replace with your actual database_id from step 1.2
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

[[env.production.vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

[[env.production.r2_buckets]]
binding = "BUCKET"
bucket_name = "malnu-kananga-files"

[env.production.vars]
ALLOWED_ORIGIN = "https://ma-malnukananga.sch.id"
# Generate a strong secret key
JWT_SECRET = "your-32-character-random-secret-key-here"
# Replace with actual Gemini API key
GEMINI_API_KEY = "AIzaSyD..."  # Your actual API key
NODE_ENV = "production"
LOG_LEVEL = "error"
```

### 2.2 Generate Strong JWT Secret

```bash
# Generate a 32-character random key for JWT_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2.3 Get Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Go to API Keys section
4. Create a new API key
5. Copy the API key

### 2.4 Create .env.production File

Create `.env.production` in the project root:

```env
# Google Gemini AI Configuration
VITE_GEMINI_API_KEY=AIzaSyD...  # Your actual Gemini API key

# Application Configuration
NODE_ENV=production
VITE_APP_ENV=production

# Logging Configuration
VITE_LOG_LEVEL=ERROR

# Development Configuration (disabled in production)
VITE_DEV_MODE=false

# Worker Configuration
VITE_API_BASE_URL=https://malnu-kananga-worker-prod.workers.dev
```

**Important**: Never commit `.env.production` to version control!

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

## Step 5: Deploy Frontend

### 5.1 Build Frontend

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Verify build output
ls -la dist/
```

### 5.2 Deploy to Cloudflare Pages

```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=ma-malnukananga

# Or use direct GitHub integration (recommended for CI/CD)
```

### 5.3 Configure Custom Domain

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Select your Pages project
3. Go to Custom Domains
4. Add `ma-malnukananga.sch.id`
5. Follow DNS instructions

## Step 6: Post-Deployment Checklist

After successful deployment:

- [ ] Change default admin password
- [ ] Verify all API endpoints are accessible
- [ ] Test file upload/download functionality
- [ ] Test AI chatbot functionality
- [ ] Verify CORS is properly configured
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
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
# Ensure it matches your frontend domain exactly
ALLOWED_ORIGIN = "https://ma-malnukananga.sch.id"
```

**2. Authentication Failures**

```bash
# Verify JWT_SECRET is set correctly
# Check that tokens are being sent in Authorization header
# Verify user status is 'active' in database
```

**3. Database Connection Errors**

```bash
# Verify database_id is correct
# Check database binding in wrangler.toml
# Ensure database tables exist (run /seed endpoint)
```

**4. File Upload Failures**

```bash
# Verify R2 bucket is created and bound
# Check file size limits (50MB max)
# Verify file types are allowed
# Check authentication token is valid
```

**5. R2-Specific Issues**

```bash
# "Bucket not found" - Create bucket: wrangler r2 bucket create malnu-kananga-files
# "File upload failed" - Check file size limits, Content-Type, JWT token
# "CORS error on download" - Check worker response headers (already configured)
# "Storage quota exceeded" - Monitor usage, implement cleanup policies
```

**5. AI Features Not Working**

```bash
# Verify GEMINI_API_KEY is valid
# Check API key has not expired
# Verify rate limits not exceeded
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
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [API Reference](./api-documentation.md)

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-05 | Initial production deployment guide |

## License

© 2026 MA Malnu Kananga. All rights reserved.
