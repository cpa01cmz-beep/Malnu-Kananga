# Production Deployment Checklist

## Prerequisites
- [ ] Cloudflare account with Workers enabled
- [ ] Google Gemini API key
- [ ] Supabase project (optional)
- [ ] Domain configured for production
- [ ] SSL certificate configured

## Environment Setup
- [ ] Copy `.env.example` to `.env.production`
- [ ] Fill in all required environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Configure production API keys

## Database Setup
- [ ] Create Cloudflare D1 database
- [ ] Update `wrangler.toml` with correct database IDs
- [ ] Create Vectorize index for RAG
- [ ] Run database migrations

## Worker Configuration
- [ ] Update `wrangler.toml` with production settings
- [ ] Configure AI bindings
- [ ] Set up vector database bindings
- [ ] Configure D1 database bindings

## Security Configuration
- [ ] Set up rate limiting
- [ ] Configure CORS settings
- [ ] Enable security middleware
- [ ] Set up monitoring and logging

## Deployment Steps
1. Install dependencies: `npm ci`
2. Run tests: `npm test`
3. Build application: `npm run build`
4. Deploy worker: `wrangler deploy --env production`
5. Seed vector database: `POST /seed`
6. Verify deployment: Health checks

## Post-Deployment
- [ ] Monitor error logs
- [ ] Set up alerts
- [ ] Configure analytics
- [ ] Test all functionality
- [ ] Update documentation

## Rollback Plan
- [ ] Keep previous worker version
- [ ] Database backup strategy
- [ ] Emergency contact procedures
- [ ] Communication plan