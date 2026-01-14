#!/bin/bash

# Production Deployment Script for MA Malnu Kananga
# This script handles the complete deployment process

set -e

echo "🚀 Starting MA Malnu Kananga Production Deployment..."

# Check if required tools are installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

# Note: Production environment variables should be set via Cloudflare secrets:
# - For Worker: wrangler secret put JWT_SECRET --env production
# - For Worker: wrangler secret put GEMINI_API_KEY --env production
# - For Pages: wrangler pages secret put VITE_GEMINI_API_KEY --project-name=malnu-kananga
# - For Pages: wrangler pages secret put VITE_API_BASE_URL --project-name=malnu-kananga

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🔧 Building application..."
npm run build

echo "🧪 Running tests..."
npm run test:run

echo "☁️  Deploying to Cloudflare Workers..."

# Deploy worker
wrangler deploy --env production

echo "🌐 Deploying frontend to Cloudflare Pages..."
# Build frontend if not already built
if [ ! -d "dist" ]; then
    echo "🔧 Building frontend..."
    npm run build
fi

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=malnu-kananga

echo "🌱 Seeding database..."
# Seed database with documents
WORKER_URL="https://malnu-kananga-worker-prod.cpa01cmz.workers.dev"
curl -X POST "${WORKER_URL}/seed" \
    -H "Content-Type: application/json" || {
    echo "⚠️  Database seeding failed, continuing deployment..."
}

echo "🔍 Verifying deployment..."
# Check if worker is responding
MAX_RETRIES=5
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f "${WORKER_URL}/health"; then
        echo "✅ Health check passed"
        break
    else
        echo "⚠️  Health check failed, retrying... ($((RETRY_COUNT + 1))/$MAX_RETRIES)"
        sleep 10
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Health check failed after $MAX_RETRIES attempts"
    exit 1
fi

echo "📊 Setting up monitoring..."
# Test AI functionality
echo "🧠 Testing AI chat functionality..."
curl -X POST "${WORKER_URL}/api/chat" \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello, this is a test message"}' \
    --max-time 30 && {
    echo "✅ AI chat endpoint functional"
} || {
    echo "⚠️  AI chat endpoint test failed"
}

echo "🔧 Running post-deployment validation..."
# Validate critical endpoints
ENDPOINTS=("/api/chat" "/health")
for endpoint in "${ENDPOINTS[@]}"; do
    curl -f "${WORKER_URL}${endpoint}" >/dev/null && echo "✅ ${endpoint}: OK" || echo "❌ ${endpoint}: FAILED"
done

echo "✅ Production deployment completed successfully!"
echo "🌐 Frontend deployed to: https://malnu-kananga.pages.dev"
echo "📝 Worker API is available at: ${WORKER_URL}"
echo ""
echo "📋 Next steps:"
echo "  - Set up custom domain (e.g., ma-malnukananga.sch.id) via Cloudflare Dashboard"
echo "  - Configure R2 bucket for file uploads (PPDB documents, E-Library)"