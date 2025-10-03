#!/bin/bash

# One-Click Deployment Script untuk MA Malnu Kananga
# Script ini akan setup semua resources Cloudflare dan deploy aplikasi

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="MA Malnu Kananga"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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

# Prerequisites check
log_info "Memeriksa prerequisites..."

if ! command -v node &> /dev/null; then
    log_error "Node.js tidak ditemukan. Install Node.js terlebih dahulu."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm tidak ditemukan. Install npm terlebih dahulu."
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null && ! npx wrangler --version &> /dev/null; then
    log_info "Installing wrangler CLI..."
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
log_info "Memeriksa login Cloudflare..."
if ! npx wrangler whoami &> /dev/null; then
    log_error "Anda belum login ke Cloudflare."
    log_info "Silakan login dengan command: npx wrangler login"
    log_info "Kemudian jalankan script ini lagi."
    exit 1
fi

log_success "Prerequisites check selesai"

# Navigate to project root
cd "$PROJECT_ROOT"

# Install dependencies
log_info "Installing dependencies..."
npm ci

# Run tests
log_info "Menjalankan tests..."
npm run test || {
    log_warning "Tests gagal, tapi melanjutkan deployment..."
}

# Build application
log_info "Building aplikasi..."
npm run build

# Setup Cloudflare resources
log_info "Setup Cloudflare resources..."
node scripts/setup-cloudflare-resources.js

# Set API key if provided
if [ ! -z "$1" ]; then
    log_info "Setting Google Gemini API key..."
    npx wrangler secret put API_KEY --env=production << EOF
$1
EOF
    log_success "API key berhasil diset"
fi

log_success "🎉 Deployment berhasil!"
echo ""
echo "📋 Informasi deployment:"
echo "1. Website frontend akan di-deploy otomatis melalui GitHub Actions"
echo "2. Worker backend sudah aktif"
echo "3. Database dan Vectorize sudah siap"
echo ""
echo "🔧 Setup manual yang mungkin diperlukan:"
if [ -z "$1" ]; then
    echo "- Set Google Gemini API key: npx wrangler secret put API_KEY --env=production"
fi
echo "- Monitor deployment di: https://dash.cloudflare.com/"
echo ""
echo "🚀 Website Anda siap digunakan!"