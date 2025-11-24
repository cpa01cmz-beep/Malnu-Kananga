# 🚀 Installation & Setup Guide - MA Malnu Kananga

## 🌟 Overview

Panduan lengkap untuk instalasi dan setup sistem portal MA Malnu Kananga. Guide ini mencakup setup development environment, production deployment, dan konfigurasi semua komponen sistem.

**📋 Current Status**: Production Ready - v1.3.1  
**🔄 Last Updated**: November 24, 2025  
**⚡ Deployment**: One-click deploy ke Cloudflare tersedia

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 atau lebih tinggi (wajib untuk ES2022 features)
- **npm**: Version 9.0.0 atau lebih tinggi (atau yarn 1.22.0+)
- **Git**: Version 2.30.0 atau lebih tinggi
- **OS**: Windows 10+, macOS 10.15+, atau Ubuntu 18.04+
- **Cloudflare Account**: Untuk production deployment (gratis tier cukup)
- **Google Gemini API Key**: Required untuk AI functionality

---

## 🔧 Node.js 18+ Installation Guide

### Why Node.js 18+ is Required
MA Malnu Kananga menggunakan fitur-fitur modern JavaScript yang hanya tersedia di Node.js 18+:
- ES2022 features (Top-level await, `.at()` method)
- Improved performance dan memory management
- Enhanced security features
- Better compatibility dengan modern dependencies

### Installation Methods

#### Method 1: Using NVM (Recommended)
NVM (Node Version Manager) memungkinkan multiple Node.js versions:

**Linux/macOS:**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell configuration
source ~/.bashrc  # atau source ~/.zshrc

# Install Node.js 18 LTS
nvm install 18
nvm use 18

# Set 18 as default version
nvm alias default 18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

**Windows:**
```powershell
# Download and install NVM for Windows from:
# https://github.com/coreybutler/nvm-windows/releases

# Install Node.js 18
nvm install 18.19.0
nvm use 18.19.0

# Verify installation
node --version
npm --version
```

#### Method 2: Official Installer

**Windows:**
1. Download dari [nodejs.org](https://nodejs.org/en/download/)
2. Pilih "Windows Installer (.msi)" untuk Node.js 18.x LTS
3. Run installer dengan default settings
4. Restart command prompt/terminal

**macOS:**
```bash
# Using Homebrew
brew install node@18

# Atau download .pkg installer dari nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Method 3: Package Managers

**macOS (Homebrew):**
```bash
brew install node@18
brew link --overwrite node@18
```

**Linux (Snap):**
```bash
sudo snap install node --classic --channel=18
```

**Windows (Chocolatey):**
```powershell
choco install nodejs --version=18.19.0
```

### Verification & Setup

#### Check Node.js Version
```bash
# Check current version
node --version
# Expected: v18.x.x (minimum v18.0.0)

# Check npm version
npm --version
# Expected: 9.x.x or higher

# Check if Node.js is properly installed
node -e "console.log('Node.js is working!')"
```

#### Configure npm (Optional)
```bash
# Configure npm for better performance
npm config set fund false
npm config set audit false

# Configure global packages location (optional)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to shell profile (~/.bashrc or ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH
source ~/.bashrc  # atau source ~/.zshrc
```

### Troubleshooting Node.js Installation

#### Issue: "Command not found: node"
```bash
# Check if Node.js is in PATH
which node
echo $PATH

# If using NVM, ensure NVM is loaded
source ~/.bashrc
nvm use 18
```

#### Issue: Permission denied
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Atau use npx to avoid global installation
npx npm install
```

#### Issue: Multiple Node.js versions
```bash
# List installed versions
nvm list

# Switch to Node.js 18
nvm use 18

# Uninstall old versions
nvm uninstall 16
nvm uninstall 14
```

#### Issue: npm version too old
```bash
# Update npm to latest version
npm install -g npm@latest

# Verify npm version
npm --version
```

### Development Environment Setup

#### Global Development Tools (Optional)
```bash
# Install useful global tools
npm install -g nodemon typescript ts-node vite

# Verify installations
nodemon --version
tsc --version
vite --version
```

#### Configure Git for Node.js Projects
```bash
# Configure Git to handle Node.js files properly
git config --global core.autocrlf input  # Linux/macOS
git config --global core.autocrlf true   # Windows

# Set default branch name
git config --global init.defaultBranch main
```

### Performance Optimization

#### Increase Node.js Memory Limit (Optional)
```bash
# Add to shell profile (~/.bashrc or ~/.zshrc)
export NODE_OPTIONS="--max-old-space-size=4096"

# Or set per project
export NODE_OPTIONS="--max-old-space-size=2048"
```

#### Configure npm Registry (Optional)
```bash
# Use faster npm registry (optional)
npm config set registry https://registry.npmmirror.com

# Reset to default registry
npm config set registry https://registry.npmjs.org
```

### Next Steps After Node.js Installation

1. **Verify Node.js 18+ is working**
2. **Clone the repository**
3. **Install project dependencies**
4. **Configure environment variables**
5. **Start development server**

```bash
# Quick verification
node --version && npm --version && echo "Node.js 18+ setup complete!"
```

### Required Accounts & Services
- **GitHub Account**: Untuk source code management
- **Cloudflare Account**: Untuk deployment dan infrastructure
- **Google Account**: Untuk Google Gemini AI API key
- **Email Provider**: Untuk magic link authentication (MailChannels terintegrasi)

### Browser Requirements
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

---

## 🔧 Development Setup

### Step 1: Clone Repository

```bash
# Clone repository
git clone https://github.com/sulhi/ma-malnu-kananga.git
cd ma-malnu-kananga

# Verify branch
git branch -a
git checkout main
```

### Step 2: Install Dependencies

```bash
# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env  # atau gunakan editor favorit Anda
```

**Environment Variables Configuration:**

```bash
# Required: Google Gemini AI API
API_KEY=AIzaSyC_xxxxxxxxxxxxxxxxxxxxxxxxxx  # Ganti dengan API key Anda

# Application Configuration
NODE_ENV=development
VITE_APP_ENV=development

# Optional: Development overrides
VITE_DEV_MODE=true
VITE_ENABLE_PWA=true
VITE_ENABLE_AI_CHAT=true

# API Configuration (jika menggunakan worker terdeploy)
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

**Mendapatkan Google Gemini API Key:**

1. Kunjungi [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Login dengan Google Account Anda
3. Click "Create API Key"
4. Copy API key dan paste ke `.env` file

### Step 4: Start Development Server

```bash
# Start development server
npm run dev -- --port 9000

# Alternative dengan port default
npm run dev

# Server akan berjalan di:
# Frontend: http://localhost:9000
# API: http://localhost:9000/api (jika menggunakan proxy)
```

### Step 5: Verify Development Setup

Buka browser dan kunjungi `http://localhost:9000`:

1. ✅ Homepage loads correctly
2. ✅ PWA installation prompt appears
3. ✅ AI chat interface accessible
4. ✅ All navigation links work
5. ✅ Responsive design on mobile

---

## 🧪 Testing Setup

### Run Test Suite

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=authService.test.ts
```

### Code Quality Checks

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Type checking
npm run type-check  # jika tersedia

# Format code dengan Prettier
npm run format      # jika tersedia
```

---

## 🌐 Production Deployment

### Option 1: One-Click Deploy (Recommended)

**Prerequisites:**
- GitHub Account dengan repository ini
- Cloudflare Account dengan API token

**Steps:**

1. **Visit Deploy URL:**
   ```
   https://deploy.workers.cloudflare.com/?url=https://github.com/ma-malnukananga/ma-malnu-kananga
   ```

2. **Authorize Cloudflare:**
   - Login ke Cloudflare
   - Allow repository access
   - Grant necessary permissions

3. **Configure Deployment:**
   - Enter project name: `malnu-kananga`
   - Select region: Automatic (recommended)
   - Configure environment variables:
     ```
     API_KEY=your_gemini_api_key
     NODE_ENV=production
     ```

4. **Deploy:**
   - Click "Deploy"
   - Tunggu proses deployment selesai
   - Copy deployment URL

5. **Post-Deployment Setup:**
   ```bash
   # Seed vector database (jalankan sekali saja)
   curl https://your-worker-url.workers.dev/seed
   
   # Verify deployment
   curl https://your-worker-url.workers.dev/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Test"}'
   ```

### Option 2: Manual Deployment

#### Step 1: Install Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login ke Cloudflare
wrangler auth login

# Verify authentication
wrangler whoami
```

#### Step 2: Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create malnu-kananga-db

# Create Vectorize index
wrangler vectorize create malnu-kananga-index \
  --dimensions=768 \
  --metric=cosine

# Note down database_id dan index_name dari output
```

#### Step 3: Configure Wrangler

Edit `wrangler.toml`:

```toml
name = "malnu-kananga"
main = "worker.js"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "malnu-kananga-db"
database_id = "your_database_id_here"

# Vectorize Index
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

# Environment Variables
[vars]
API_KEY = "your_gemini_api_key"
NODE_ENV = "production"
```

#### Step 4: Deploy Worker

```bash
# Deploy worker
wrangler deploy

# Verify deployment
wrangler tail

# Test deployment
curl https://malnu-kananga.your-subdomain.workers.dev/
```

#### Step 5: Deploy Frontend

```bash
# Build production bundle
npm run build

# Deploy ke Cloudflare Pages
wrangler pages deploy dist --compatibility-date=2024-01-01

# Atau gunakan Cloudflare Dashboard:
# 1. Login ke Cloudflare Dashboard
# 2. Pages > Create a project > Connect to Git
# 3. Pilih repository ini
# 4. Configure build settings:
#    - Build command: npm run build
#    - Build output directory: dist
#    - Node.js version: 18
```

#### Step 6: Seed Vector Database (Critical)

```bash
# Seed vector database dengan data sekolah
curl https://malnu-kananga.your-subdomain.workers.dev/seed

# Expected response:
# Successfully seeded 50 documents.

# Verify seeding worked
curl -X POST https://malnu-kananga.your-subdomain.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa saja program unggulan sekolah?"}'
```

**⚠️ Important Notes:**
- Vector database seeding MUST be done once after worker deployment
- Without seeding, AI chat will have no context and cannot answer questions
- Current document count: 50 school information entries
- Documents include: PPDB info, school programs, location, contact details

---

## 🔐 Security Configuration

### Environment Variables Security

**Production Environment Variables:**

```bash
# Cloudflare Workers Secrets (gunakan wrangler secret put)
wrangler secret put API_KEY
wrangler secret put SECRET_KEY

# Application Configuration
NODE_ENV=production
VITE_APP_ENV=production

# Security Headers (otomatis ditambahkan)
```

**Required Secrets for Production:**
- `API_KEY`: Google Gemini AI API key (required for chat functionality)
- `SECRET_KEY`: HMAC secret key for JWT token signing (auto-generated if not provided)

**Optional Environment Variables:**
- `NODE_ENV`: Set to "production" for production mode
- `VITE_WORKER_URL`: Override worker URL for frontend configuration
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### Domain & SSL Configuration

```bash
# Add custom domain (opsional)
wrangler pages deployment create dist \
  --compatibility-date=2024-01-01 \
  --project-name=malnu-kananga

# Configure domain di Cloudflare Dashboard:
# 1. Pilih project Pages
# 2. Custom domains > Add custom domain
# 3. Masukkan domain: portal.ma-malnukananga.sch.id
# 4. Update DNS records sesuai instruksi
```

---

## 📊 Monitoring & Analytics

### Error Monitoring Setup

```bash
# Sentry integration (jika diperlukan)
npm install @sentry/react @sentry/tracing

# Configure Sentry di src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your_sentry_dsn",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
});
```

### Performance Monitoring

```bash
# Install analytics tools (opsional)
npm install @vercel/analytics  # atau analytics provider lain

# Configure analytics di App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

---

## 🔄 Maintenance & Updates

### Regular Maintenance Tasks

**Weekly:**
```bash
# Update dependencies
npm update
npm audit fix

# Check for security vulnerabilities
npm audit
```

**Monthly:**
```bash
# Update major dependencies
npm install package@latest

# Review and update documentation
npm run docs:update  # jika tersedia
```

### Backup Procedures

**Database Backup:**
```bash
# Export D1 database
wrangler d1 export malnu-kananga-db --output=backup.sql

# Schedule regular backups (gunakan GitHub Actions atau cron)
```

**Configuration Backup:**
```bash
# Backup environment configuration
cp .env .env.backup.$(date +%Y%m%d)

# Backup wrangler configuration
cp wrangler.toml wrangler.toml.backup
```

---

## 🚨 Troubleshooting

### Common Installation Issues

**Issue: Node.js version too old**
```bash
# Solution: Install Node.js 18+ menggunakan nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Issue: Permission denied on npm install**
```bash
# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Atau gunakan npx
npx npm install
```

**Issue: API_KEY not working**
```bash
# Solution: Verify API key configuration
echo $API_KEY  # Check if environment variable is set
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY"
```

### Deployment Issues

**Issue: Worker deployment fails**
```bash
# Solution: Check wrangler authentication
wrangler auth login
wrangler whoami

# Check configuration
wrangler validate
```

**Issue: Vector database seeding fails**
```bash
# Solution: Check Vectorize index configuration
wrangler vectorize list

# Recreate index if necessary
wrangler vectorize delete malnu-kananga-index
wrangler vectorize create malnu-kananga-index --dimensions=768 --metric=cosine
```

---

## 📚 Additional Resources

### Documentation Links
- [API Documentation](./API_DOCUMENTATION.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)
- [User Guides](./README.md#user-guides)

### External Resources
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare Vectorize Documentation](https://developers.cloudflare.com/vectorize/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev/)

### Community Support
- **GitHub Issues**: [Report issues](https://github.com/sulhi/ma-malnu-kananga/issues)
- **Email Support**: support@ma-malnukananga.sch.id
- **Documentation Feedback**: docs@ma-malnukananga.sch.id

---

## ✅ Installation Checklist

### Pre-Installation
- [ ] Node.js 18+ installed
- [ ] Git configured
- [ ] GitHub account ready
- [ ] Cloudflare account created
- [ ] Google Gemini API key obtained

### Development Setup
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env`)
- [ ] Development server running (`npm run dev`)
- [ ] Tests passing (`npm test`)
- [ ] Code quality checks passing (`npm run lint`)

### Production Deployment
- [ ] Cloudflare resources created (D1, Vectorize)
- [ ] Wrangler configured (`wrangler.toml`)
- [ ] Worker deployed successfully
- [ ] Frontend built and deployed
- [ ] Vector database seeded
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring configured

### Post-Installation
- [ ] All endpoints tested
- [ ] Authentication flow working
- [ ] AI chat functionality verified
- [ ] PWA features working
- [ ] Mobile responsiveness confirmed
- [ ] Performance benchmarks met
- [ ] Backup procedures documented

---

**Installation & Setup Guide Version: 1.3.1**  
*Last Updated: November 23, 2024*  
*Maintained by: MA Malnu Kananga Technical Team*

---

*For additional support or questions, please contact our technical team or create an issue in the GitHub repository.*