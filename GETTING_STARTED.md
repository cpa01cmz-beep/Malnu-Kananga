# 🚀 Getting Started Guide - MA Malnu Kananga

Welcome to the MA Malnu Kananga project! This guide will help you get up and running quickly, whether you're a developer, system administrator, or contributor.

---

## 🎯 Who This Guide Is For

- **New Developers**: Getting familiar with the codebase
- **System Administrators**: Setting up the development environment
- **Contributors**: Understanding how to make meaningful contributions
- **Technical Staff**: Deploying and maintaining the system

---

## ⚡ Quick Start (5 Minutes)

### Prerequisites
- **Node.js 18+** (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **Git** for version control
- **VS Code** (recommended) with extensions

### One-Command Setup
```bash
# Clone and setup in one command
git clone https://github.com/your-username/malnu-kananga.git && \
cd malnu-kananga && \
npm install && \
cp .env.example .env && \
echo "✅ Setup complete! Now:"
echo "1. Edit .env with your API_KEY"
echo "2. Run: npm run dev -- --port 9000"
echo "3. Open: http://localhost:9000"
```

### Verify Installation
```bash
# Check if everything works
npm run dev -- --port 9000
# Should see: "VITE v5.x.x ready in xxxms"
# Open http://localhost:9000 - should load the application
```

---

## 🛠️ Detailed Setup

### 1. System Requirements

**Minimum Requirements:**
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: Version 18.0.0 or higher
- **Memory**: 4GB RAM (8GB recommended)
- **Storage**: 2GB free disk space
- **Network**: Stable internet connection for AI features

**Recommended Setup:**
- **CPU**: Multi-core processor (4+ cores)
- **Memory**: 8GB+ RAM
- **SSD**: For faster development experience
- **Browser**: Chrome 90+ or Firefox 88+

### 2. Install Dependencies

#### Node.js Version Management
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install and use Node.js 18
nvm install 18
nvm use 18
nvm alias default 18
```

#### Project Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/malnu-kananga.git
cd malnu-kananga

# Install dependencies
npm install

# Verify installation
npm --version  # Should be 9.x.x or higher
node --version # Should be 18.x.x or higher
```

### 3. Environment Configuration

#### Get Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (starts with `AIzaSy...`)

#### Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file
nano .env  # or use your preferred editor
```

**Required .env Configuration:**
```bash
# Google Gemini AI (Required for chat functionality)
API_KEY=AIzaSyC_your_gemini_api_key_here

# Development Settings
VITE_DEV_MODE=true
VITE_WORKER_URL=http://localhost:8787  # For local worker testing

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_AI_CHAT=true
VITE_ENABLE_ANALYTICS=false  # Disable in development
```

### 4. Development Server

#### Start Frontend Development Server
```bash
# Start development server on port 9000
npm run dev -- --port 9000

# Alternative: Use default port (5173)
npm run dev
```

#### Start Backend Worker (Optional)
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler auth login

# Start local worker development
wrangler dev worker.js --port 8787
```

### 5. Verify Setup

#### Frontend Verification
1. Open http://localhost:9000
2. Should see the MA Malnu Kananga homepage
3. Check browser console - no errors should be present
4. Test AI chat functionality (requires API key)

#### Backend Verification (Optional)
```bash
# Test worker health
curl http://localhost:8787/health

# Test AI endpoint
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## 🧪 Testing Your Setup

### Run Test Suite
```bash
# Run all tests
npm run test

# Run tests in watch mode (for development)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- AuthService.test.ts
```

### Linting and Type Checking
```bash
# Check code style
npm run lint

# Check TypeScript types
npm run type-check

# Format code automatically
npm run format

# Run all quality checks
npm run quality
```

### Expected Test Results
```
✅ All tests should pass
✅ Coverage should be 80%+
✅ No TypeScript errors
✅ No ESLint warnings
```

---

## 🏗️ Understanding the Project Structure

### High-Level Architecture
```
malnu-kananga/
├── 📱 Frontend (React + TypeScript)
│   ├── src/components/    # UI components
│   ├── src/services/      # Business logic
│   ├── src/hooks/         # React hooks
│   └── src/data/          # Static data
├── 🔧 Backend (Cloudflare Worker)
│   ├── worker.js          # Main worker file
│   └── wrangler.toml      # Worker configuration
├── 📚 Documentation
│   ├── docs/              # Technical docs
│   └── *.md               # User guides
└── 🧪 Testing
    ├── src/__tests__/     # Test files
    └── coverage/          # Coverage reports
```

### Key Components to Understand

#### 1. Authentication System
- **Location**: `src/services/authService.ts`
- **Method**: Magic link authentication (no passwords)
- **Flow**: Email → Magic Link → JWT Token → Access

#### 2. AI Chat System
- **Location**: `src/services/geminiService.ts`
- **Technology**: Google Gemini + Vector Database (RAG)
- **Language**: Indonesian (Bahasa Indonesia)

#### 3. Portal System
- **Student Portal**: `src/components/StudentDashboard.tsx`
- **Teacher Portal**: `src/components/TeacherDashboard.tsx`
- **Parent Portal**: `src/components/ParentDashboard.tsx`
- **Admin Portal**: `src/components/AdminDashboard.tsx`

#### 4. PWA Features
- **Service Worker**: `public/sw.js`
- **Manifest**: `public/manifest.json`
- **Install Prompt**: `src/components/PwaInstallPrompt.tsx`

---

## 🎯 Common Development Tasks

### 1. Adding a New Component
```bash
# Create component file
touch src/components/NewComponent.tsx

# Create test file
touch src/components/NewComponent.test.tsx

# Create styles (if needed)
touch src/components/NewComponent.css
```

**Component Template:**
```typescript
// src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction?: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction
}) => {
  return (
    <div className="new-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default NewComponent;
```

### 2. Adding a New API Endpoint
```bash
# Add to worker.js
# Add route handler in worker.js

# Add service method
touch src/services/api/newEndpointService.ts
```

**Service Template:**
```typescript
// src/services/api/newEndpointService.ts
import { BaseApiService } from './baseApiService';

export class NewEndpointService extends BaseApiService {
  static async getData(): Promise<any> {
    return this.request<any>('/api/new-endpoint');
  }
}
```

### 3. Adding Tests
```typescript
// src/components/NewComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { NewComponent } from './NewComponent';

describe('NewComponent', () => {
  it('renders title correctly', () => {
    render(<NewComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

---

## 🔧 Development Workflow

### 1. Daily Development Routine
```bash
# Start development server
npm run dev -- --port 9000

# In another terminal, run tests in watch mode
npm run test:watch

# Make changes
# Tests will auto-run
# Browser will auto-reload
```

### 2. Before Committing
```bash
# Run all quality checks
npm run quality

# Run full test suite
npm run test

# Check for any issues
git status
git add .
git commit -m "feat: add new feature"
```

### 3. Branch Management
```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "feat: implement amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## 🚨 Common Issues & Solutions

### Issue: "API_KEY not configured"
**Solution:**
1. Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to `.env` file: `API_KEY=your_key_here`
3. Restart development server

### Issue: "Port already in use"
**Solution:**
```bash
# Kill process on port 9000
lsof -ti:9000 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Issue: "Module not found" errors
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tests failing
**Solution:**
```bash
# Update test snapshots
npm test -- --updateSnapshot

# Run tests with verbose output
npm test -- --verbose

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand NewComponent.test.tsx
```

---

## 📚 Next Steps

### 1. Explore the Codebase
- Read the [Developer Guide](docs/DEVELOPER_GUIDE.md)
- Study the [API Documentation](docs/API_DOCUMENTATION.md)
- Review existing components and patterns

### 2. Make Your First Contribution
- Find a good first issue in [GitHub Issues](https://github.com/your-repo/issues)
- Follow the [Contributing Guide](CONTRIBUTING.md)
- Submit a Pull Request

### 3. Set Up Production Environment
- Read the [Deployment Guide](DEPLOYMENT.md)
- Set up Cloudflare account
- Deploy to production

### 4. Join the Community
- Join our developer Discord/Slack
- Participate in code reviews
- Share your knowledge

---

## 🔗 Helpful Resources

### Documentation
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)**: Comprehensive technical documentation
- **[API Documentation](docs/API_DOCUMENTATION.md)**: Complete API reference
- **[Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)**: Common issues and solutions

### External Resources
- **[React Documentation](https://react.dev/)**: Learn React
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**: Learn TypeScript
- **[Vite Guide](https://vitejs.dev/guide/)**: Learn Vite
- **[Cloudflare Workers](https://developers.cloudflare.com/workers/)**: Learn Workers
- **[Google Gemini API](https://ai.google.dev/docs)**: Learn AI integration

### Tools and Extensions
- **VS Code Extensions**:
  ```
  - bradlc.vscode-tailwindcss
  - esbenp.prettier-vscode
  - dbaeumer.vscode-eslint
  - ms-vscode.vscode-typescript-next
  ```

---

## 🆘 Getting Help

### Self-Service
- **Search Issues**: Check [GitHub Issues](https://github.com/your-repo/issues)
- **Read Documentation**: Browse all documentation files
- **Check Troubleshooting**: Review [Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)

### Community Support
- **Discord/Slack**: Join our developer community
- **GitHub Discussions**: Ask questions and share ideas
- **Stack Overflow**: Tag questions with `ma-malnu-kananga`

### Direct Support
- **Email**: dev-support@ma-malnukananga.sch.id
- **GitHub Issues**: Report bugs or request features
- **Documentation Issues**: Report documentation problems

---

## 🎉 Congratulations!

You've successfully set up the MA Malnu Kananga development environment! Here's what you can do next:

1. **Explore**: Browse the codebase and understand the architecture
2. **Experiment**: Make small changes and see how they work
3. **Contribute**: Find an issue to solve or a feature to add
4. **Learn**: Read the documentation and expand your knowledge
5. **Share**: Help others by answering questions and improving documentation

---

**🚀 Happy Coding!**

*This getting started guide is maintained by the MA Malnu Kananga development team. For questions or suggestions, please open an issue or contact the development team.*

---

*Getting Started Guide Version: 1.0.0*  
*Last Updated: November 19, 2024*  
*Compatible with: MA Malnu Kananga v1.0.0+*