# Cloudflare Worker Setup Guide

## Quick Setup

### 1. Install Dependencies
```bash
npm install wrangler -g
```

### 2. Authenticate with Cloudflare
```bash
wrangler auth
```

### 3. Create D1 Database
```bash
wrangler d1 create malnu-kananga-db
```

### 4. Update Configuration
```bash
# Automatic configuration update
./scripts/configure.sh update-db production
./scripts/configure.sh create-env development
```

Or manually update `wrangler.toml` with the returned `database_id`.

### 5. Create Vectorize Index
```bash
wrangler vectorize create malnu-kananga-index --dimensions=768 --metric=cosine
```

### 6. Deploy Worker
```bash
wrangler deploy
```

### 7. Seed Database
```bash
./scripts/configure.sh seed
# Or manually:
curl -X POST https://malnu-kananga-worker.cpa01cmz.workers.dev/seed
```

### 8. Update Frontend Configuration
Create `.env` file:
```
VITE_API_BASE_URL=https://malnu-kananga-worker.cpa01cmz.workers.dev
API_KEY=your_google_gemini_api_key_here
```

## Manual Setup

If the automated script fails, follow these steps:

1. **Update wrangler.toml** with your actual database_id and worker URL
2. **Deploy worker**: `wrangler deploy`
3. **Test endpoints**:
   - `https://your-worker-url.workers.dev/` (should return "Endpoint tidak ditemukan.")
   - `https://your-worker-url.workers.dev/api/chat` (POST with JSON message)
   - `https://your-worker-url.workers.dev/request-login-link` (POST with JSON email)

## Troubleshooting

- **CORS errors**: Check ALLOWED_ORIGIN in wrangler.toml
- **Database errors**: Ensure D1 database is created and bound correctly
- **Vectorize errors**: Ensure index exists with correct dimensions (768)
- **Authentication**: Run `wrangler auth` to re-authenticate

## Environment Variables

Required environment variables for the worker:
- `AI`: Automatically bound by Cloudflare (Workers AI)
- `VECTORIZE_INDEX`: Bound to your Vectorize index
- `DB`: Bound to your D1 database
- `ALLOWED_ORIGIN`: CORS configuration (e.g., "https://ma-malnukananga.sch.id")