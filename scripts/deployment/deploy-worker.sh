#!/bin/bash

# Cloudflare Worker Deployment Script
# This script automates the deployment of the Cloudflare Worker backend

set -e

echo "🚀 Starting Cloudflare Worker Deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if user is logged in to Cloudflare
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "📝 Please login to Cloudflare:"
    wrangler auth
fi

# Create D1 database if it doesn't exist
echo "💾 Creating/Checking D1 database..."
if ! wrangler d1 list | grep -q "malnu-kananga-db"; then
    echo "📝 Creating D1 database..."
    wrangler d1 create malnu-kananga-db
    echo "⚠️  Please update the database_id in wrangler.toml with the ID shown above"
    echo "   Then run this script again."
    exit 1
fi

# Create Vectorize index if it doesn't exist
echo "🔍 Creating/Checking Vectorize index..."
if ! wrangler vectorize list | grep -q "malnu-kananga-index"; then
    echo "📝 Creating Vectorize index..."
    wrangler vectorize create malnu-kananga-index --dimensions=768 --metric=cosine
    echo "⚠️  Please update the index_name in wrangler.toml if needed"
fi

# Deploy worker
echo "🚀 Deploying worker..."
wrangler deploy

# Seed the database with initial data
echo "🌱 Seeding database with initial school data..."
curl -X POST https://malnu-kananga-worker.cpa01cmz.workers.dev/seed || {
    echo "⚠️  Please update the worker URL above with your actual worker URL"
    echo "   Then run: curl -X POST https://your-actual-worker-url.workers.dev/seed"
}

echo "✅ Worker deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Update VITE_API_BASE_URL in your .env file with your worker URL"
echo "2. Update the worker URL in the seed command above if needed"
echo "3. Test the endpoints:"
echo "   - Health: https://your-worker-url.workers.dev/"
echo "   - Chat API: https://your-worker-url.workers.dev/api/chat"
echo "   - Login: https://your-worker-url.workers.dev/request-login-link"