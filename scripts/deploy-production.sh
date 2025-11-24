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

# Check environment variables
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found. Please create it from .env.example"
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🔧 Building application..."
npm run build

echo "🧪 Running tests..."
npm test -- --watchAll=false --passWithNoTests

echo "☁️  Deploying to Cloudflare Workers..."

# Deploy worker
wrangler deploy --env production

echo "🌱 Seeding vector database..."
# Seed the vector database with documents
curl -X POST "https://malnu-api.your-domain.workers.dev/seed" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json"

echo "🔍 Verifying deployment..."
# Check if worker is responding
curl -f "https://malnu-api.your-domain.workers.dev/health" || {
    echo "❌ Health check failed"
    exit 1
}

echo "📊 Setting up monitoring..."
# Configure monitoring (if needed)

echo "✅ Production deployment completed successfully!"
echo "🌐 Your application is now live at: https://your-domain.com"
echo "📝 Worker API is available at: https://malnu-api.your-domain.workers.dev"