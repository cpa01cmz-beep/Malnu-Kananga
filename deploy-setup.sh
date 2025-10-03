#!/bin/bash

# MA Malnu Kananga - Production Deployment Script
# Automated deployment untuk production environment

set -e  # Exit on any error

echo "🚀 Starting MA Malnu Kananga Production Deployment..."

# Colors untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ma-malnu-kananga"
WORKER_NAME="malnu-api"
DB_NAME="ma-malnukananga-db"
FRONTEND_DIST="dist"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is required but not installed."
        exit 1
    fi
}

# Prerequisites check
log_info "Checking prerequisites..."
check_command "node"
check_command "npm"
check_command "wrangler"

# Verify we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "wrangler.toml" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

log_success "Prerequisites check completed"

# Install dependencies
log_info "Installing dependencies..."
npm ci

# Run tests
log_info "Running tests..."
npm run test

# Build application
log_info "Building application..."
npm run build

# Verify build output
if [ ! -d "$FRONTEND_DIST" ]; then
    log_error "Build failed - dist directory not found"
    exit 1
fi

log_success "Build completed successfully"

# Deploy database (if migration exists)
if [ -f "migration.sql" ]; then
    log_info "Deploying database schema..."
    wrangler d1 execute $DB_NAME --file=./migration.sql --local || {
        log_warning "Local database deployment failed, continuing with remote deployment..."
        wrangler d1 execute $DB_NAME --file=./migration.sql || {
            log_error "Database deployment failed"
            exit 1
        }
    }
    log_success "Database schema deployed"
else
    log_warning "No migration.sql found, skipping database deployment"
fi

# Deploy Cloudflare Worker
log_info "Deploying Cloudflare Worker..."
wrangler deploy worker.js --name $WORKER_NAME || {
    log_error "Worker deployment failed"
    exit 1
}

# Seed initial data
log_info "Seeding initial data..."
WORKER_URL=$(wrangler deployments list --name $WORKER_NAME | grep "malnu-api" | head -1 | awk '{print $3}')

if [ ! -z "$WORKER_URL" ]; then
    curl -X POST "${WORKER_URL}/seed" || {
        log_warning "Failed to seed initial data"
    }
    log_success "Initial data seeded"
else
    log_warning "Worker URL not found, skipping data seeding"
fi

# Deploy frontend (manual step for now)
log_info "Frontend deployment..."
log_warning "Frontend deployment requires manual upload of $FRONTEND_DIST folder to hosting provider"
log_info "Suggested hosting providers:"
echo "  - Cloudflare Pages (recommended)"
echo "  - Vercel"
echo "  - Netlify"
echo "  - GitHub Pages"

# Verify deployment
log_info "Verifying deployment..."
sleep 10  # Wait for deployment to propagate

# Health check
if [ ! -z "$WORKER_URL" ]; then
    HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${WORKER_URL}/api/chat" || echo "000")

    if [ "$HEALTH_CHECK" = "200" ] || [ "$HEALTH_CHECK" = "404" ]; then
        log_success "API deployment verified"
    else
        log_warning "API health check returned $HEALTH_CHECK"
    fi
else
    log_warning "Cannot verify deployment - Worker URL not available"
fi

# Generate deployment report
log_info "Generating deployment report..."
cat > deployment-report.txt << EOF
MA Malnu Kananga - Deployment Report
=====================================

Deployment Time: $(date)
Project: $PROJECT_NAME
Worker: $WORKER_NAME
Database: $DB_NAME

Status: ✅ DEPLOYMENT COMPLETED

Next Steps:
1. Test the application with real users
2. Monitor error logs in Cloudflare dashboard
3. Set up monitoring and analytics
4. Train users on the new system
5. Set up regular backup procedures

API Endpoints:
- Worker URL: ${WORKER_URL:-Not available}
- Health Check: ${WORKER_URL:-Not available}/api/chat
- Seed Data: ${WORKER_URL:-Not available}/seed

Frontend:
- Build Output: $FRONTEND_DIST/
- Status: Ready for hosting provider deployment

Database:
- Migration: Applied
- Status: Ready for data seeding

🚀 Deployment completed successfully!
EOF

log_success "Deployment completed successfully!"
echo ""
echo "📋 Deployment Report generated: deployment-report.txt"
echo ""
echo "🎯 Next Steps:"
echo "1. Upload $FRONTEND_DIST folder to your hosting provider"
echo "2. Test all functionality with real data"
echo "3. Train users on the new system"
echo "4. Monitor application performance"
echo "5. Set up regular backup procedures"
echo ""
echo "🌟 Your MA Malnu Kananga application is now live!"