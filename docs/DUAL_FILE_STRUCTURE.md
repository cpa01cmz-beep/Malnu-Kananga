# 📋 Dual File Structure Guide - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga project maintains a dual file structure where certain files exist in both the root directory and the `src/` directory. This guide explains the structure, purpose, and critical rules for working with this architecture.

---

**Dual File Structure Guide Version: 1.0.1**  
**Last Updated: November 25, 2025**  
**Implementation Status: Production Ready**  
**Documentation Audit: Completed - Aligned with AGENTS.md requirements**

---

## 🏗️ Architecture Rationale

### Why Dual Structure?

The dual file structure serves specific purposes:

1. **Development Focus**: `src/` directory contains the actual source code used in development
2. **Build Process**: Root directory files may be build artifacts or configuration
3. **Deployment**: Some root-level files are required for specific deployment targets
4. **Legacy Compatibility**: Maintains compatibility while transitioning to modern structure

### Critical Rule (from AGENTS.md)

> **ALWAYS use src/ versions for development (App.tsx, components/, services/)**

This is the most important rule - all development work should target files in the `src/` directory.

---

## 📁 Directory Structure

### Complete Structure Overview

```
malnu-kananga/
├── 📂 Root Level Files
│   ├── worker.js                    # Cloudflare Worker backend
│   ├── index.html                   # Entry HTML for Vite
│   ├── package.json                 # Dependencies and scripts
│   ├── vite.config.ts              # Vite configuration
│   ├── wrangler.toml               # Cloudflare Workers config
│   ├── tailwind.config.js          # Tailwind CSS config
│   ├── tsconfig.json               # TypeScript configuration
│   └── .env.example                # Environment variables template
│
├── 📂 src/ (Development Source)
│   ├── App.tsx                     # Main React application ⭐
│   ├── main.tsx                    # React entry point
│   ├── 📂 components/              # React components ⭐
│   │   ├── ChatWindow.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   └── ...
│   ├── 📂 services/                # Business logic ⭐
│   │   ├── api/
│   │   ├── geminiService.ts
│   │   └── ...
│   ├── 📂 hooks/                   # Custom React hooks
│   ├── 📂 utils/                   # Utility functions
│   ├── 📂 types/                   # TypeScript type definitions
│   └── 📂 styles/                  # CSS and styling
│
└── 📂 Other Directories
    ├── 📂 docs/                    # Documentation
    ├── 📂 public/                  # Static assets
    ├── 📂 scripts/                 # Build and deployment scripts
    └── 📂 coverage/                # Test coverage reports
```

### Legend
- ⭐ = **Primary development location** - Always use these files
- 📂 = Directory
- 📄 = File

---

## 🎯 File Categories

### 1. Development Source Files (Use src/ versions)

These files exist in both locations but **always use the src/ version**:

| File Type | Root Location | src/ Location | ✅ Which to Use |
|-----------|---------------|---------------|----------------|
| React App | ❌ Ignore | `src/App.tsx` | **src/App.tsx** |
| Components | ❌ Ignore | `src/components/` | **src/components/** |
| Services | ❌ Ignore | `src/services/` | **src/services/** |
| Hooks | ❌ Ignore | `src/hooks/` | **src/hooks/** |
| Utils | ❌ Ignore | `src/utils/` | **src/utils/** |
| Types | ❌ Ignore | `src/types/` | **src/types/** |

### 2. Configuration Files (Root level only)

These files only exist or should only be edited at root level:

| File | Purpose | Location |
|------|---------|----------|
| `package.json` | Dependencies and scripts | Root |
| `vite.config.ts` | Vite build configuration | Root |
| `wrangler.toml` | Cloudflare Workers config | Root |
| `tailwind.config.js` | Tailwind CSS configuration | Root |
| `tsconfig.json` | TypeScript compiler options | Root |
| `.env.example` | Environment variables template | Root |

### 3. Backend Files (Root level only)

These files are part of the Cloudflare Worker backend:

| File | Purpose | Location |
|------|---------|----------|
| `worker.js` | Main Cloudflare Worker | Root |
| `security-middleware.js` | Security utilities | Root |

---

## 🔧 Development Workflow

### Correct Development Approach

```bash
# ✅ CORRECT: Work with src/ files
cd src/
# Edit App.tsx, components/, services/, etc.

# ✅ CORRECT: Run development from root
npm run dev  # Uses src/ as source

# ✅ CORRECT: Build from root
npm run build  # Builds src/ to dist/
```

### Incorrect Approaches to Avoid

```bash
# ❌ WRONG: Don't edit root-level React files
# (If they exist, they're build artifacts)

# ❌ WRONG: Don't create components in root
# Always use src/components/

# ❌ WRONG: Don't duplicate files
# Maintain single source of truth in src/
```

---

## 📦 Build Process

### How Vite Uses the Structure

```javascript
// vite.config.ts
export default {
  root: '.', // Root directory
  publicDir: 'public', // Static assets
  build: {
    outDir: 'dist', // Build output
    rollupOptions: {
      input: {
        main: './index.html' // Entry point
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src' // src/ directory alias
    }
  }
}
```

### File Resolution

1. **Entry Point**: `index.html` (root) → `src/main.tsx`
2. **React App**: `src/main.tsx` → `src/App.tsx`
3. **Components**: Import from `src/components/`
4. **Services**: Import from `src/services/`
5. **Build Output**: `dist/` directory (root)

---

## 🚀 Deployment Impact

### Frontend Deployment

```bash
# Build React app (uses src/)
npm run build

# Deploy dist/ to hosting
# (Vercel, Netlify, Cloudflare Pages, etc.)
```

### Backend Deployment

```bash
# Deploy Cloudflare Worker (root file)
wrangler deploy worker.js

# Worker is independent of frontend structure
```

### Environment Variables

```bash
# Frontend (Vite) - .env files
VITE_WORKER_URL=https://your-worker.workers.dev
VITE_API_KEY=your_gemini_api_key

# Backend (Cloudflare Workers) - secrets
wrangler secret put SECRET_KEY
wrangler secret put API_KEY
```

---

## 🔍 Common Scenarios

### Scenario 1: Adding a New Component

```bash
# ✅ CORRECT
mkdir src/components/NewComponent
touch src/components/NewComponent/NewComponent.tsx
touch src/components/NewComponent/NewComponent.test.tsx

# ❌ WRONG
mkdir components/NewComponent  # Don't create in root
```

### Scenario 2: Adding a New Service

```bash
# ✅ CORRECT
touch src/services/newService.ts
touch src/services/newService.test.tsx

# ❌ WRONG
touch services/newService.ts  # Don't create in root
```

### Scenario 3: Updating Configuration

```bash
# ✅ CORRECT
# Edit root-level config files
vim vite.config.ts
vim package.json
vim wrangler.toml

# ❌ WRONG
# Don't create duplicate configs in src/
```

### Scenario 4: Finding Files to Edit

```bash
# ✅ CORRECT: Looking for React components
find src/ -name "*.tsx" -type f

# ✅ CORRECT: Looking for configuration
ls -la *.config.* *.json *.toml

# ❌ WRONG: Don't search root for React files
find . -name "*.tsx"  # This will confuse you
```

---

## 🛠️ IDE Configuration

### VS Code Settings

```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

### Recommended Extensions

- **TypeScript Importer**: Automatically imports from src/
- **Path Intellisense**: Understands @/ alias for src/
- **ESLint**: Lints src/ files correctly
- **Prettier**: Formats src/ files consistently

---

## 🔧 Import Patterns

### Correct Import Examples

```typescript
// ✅ CORRECT: Importing components
import { ChatWindow } from '@/components/ChatWindow';
import { StudentDashboard } from '@/components/StudentDashboard';

// ✅ CORRECT: Importing services
import { geminiService } from '@/services/geminiService';
import { apiClient } from '@/services/api';

// ✅ CORRECT: Importing utilities
import { formatDate } from '@/utils/dateUtils';
import { validateEmail } from '@/utils/validation';

// ✅ CORRECT: Importing types
import { User, Message } from '@/types';
```

### Incorrect Import Examples

```typescript
// ❌ WRONG: Don't import from root
import { ChatWindow } from './components/ChatWindow';  // Relative path issues

// ❌ WRONG: Don't assume root structure
import { something } from '/worker.js';  // Backend file

// ❌ WRONG: Don't use complex relative paths
import { utils } from '../../../services/utils';  // Hard to maintain
```

---

## 📋 File Naming Conventions

### src/ Directory Naming

```
src/
├── components/
│   ├── ComponentName.tsx          # PascalCase for components
│   ├── ComponentName.test.tsx     # Test files
│   └── ComponentName.styles.ts    # Styles if separated
├── services/
│   ├── serviceName.ts             # camelCase for services
│   ├── serviceName.test.ts        # Test files
│   └── serviceName.types.ts       # Types if separated
├── hooks/
│   ├── useHookName.ts             # camelCase with 'use' prefix
│   └── useHookName.test.ts        # Test files
├── utils/
│   ├── utilityFunction.ts         # camelCase for utilities
│   └── utilityFunction.test.ts    # Test files
└── types/
    ├── typeName.ts                # camelCase for types
    └── index.ts                   # Barrel exports
```

---

## 🚨 Critical Gotchas

### 1. Always Use src/ for Development

> **CRITICAL**: Never edit React components, services, or hooks in the root directory. Always use the versions in `src/`.

### 2. Build Dependencies

The build process depends on the correct structure:
- Vite expects source files in `src/`
- Tests expect source files in `src/`
- IDE integration works best with `src/` structure

### 3. Import Resolution

Using the `@/` alias (configured in Vite) ensures imports work correctly:
```typescript
import { Component } from '@/components/Component';  // ✅ Correct
```

### 4. Git Ignore Patterns

Ensure `.gitignore` properly excludes build artifacts:
```
dist/
build/
coverage/
*.log
.env
.env.local
```

---

## 🔍 Troubleshooting

### Common Issues

#### Import Errors
```bash
# Problem: Cannot find module '@/components/X'
# Solution: Check vite.config.ts alias configuration
grep -A 5 "alias" vite.config.ts
```

#### Build Failures
```bash
# Problem: Build can't find files
# Solution: Ensure you're working in src/, not root
ls src/components/  # Should show your components
```

#### Test Failures
```bash
# Problem: Tests can't find modules
# Solution: Check Jest configuration for src/ paths
grep -A 10 "moduleNameMapping" jest.config.js
```

### Debug Commands

```bash
# Verify src/ structure
tree src/ -I node_modules

# Check Vite configuration
cat vite.config.ts | grep -A 10 "alias"

# Test import resolution
npm run type-check  # Should resolve all @/ imports
```

---

## 📚 Best Practices

### 1. Consistent Structure
- Always place new React code in `src/`
- Follow established naming conventions
- Use absolute imports with `@/` alias

### 2. Separation of Concerns
- `src/` = Frontend React code
- Root = Configuration, backend, build tools
- `public/` = Static assets

### 3. Documentation
- Comment complex components in `src/`
- Update README when adding major features
- Maintain API documentation for services

### 4. Testing
- Place test files alongside source files
- Use relative imports for tests
- Maintain high test coverage in `src/`

---

## 🔄 Migration Guide

### If You Find Root-Level React Files

If you encounter React files in the root directory:

1. **Identify Purpose**
   ```bash
   # Check if it's a build artifact
   git log -- path/to/root/file.tsx
   ```

2. **Move to src/ if Needed**
   ```bash
   # Move to correct location
   mv root/file.tsx src/components/file.tsx
   ```

3. **Update Imports**
   ```bash
   # Find and update imports
   grep -r "from.*root/file" src/
   ```

4. **Test Thoroughly**
   ```bash
   npm run build
   npm test
   npm run type-check
   ```

---

## 📞 Support & Resources

### Documentation References
- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/

### Project-Specific Help
- **AGENTS.md**: Critical architecture patterns
- **DEVELOPER_GUIDE.md**: Comprehensive development setup
- **API_DOCUMENTATION.md**: Backend API reference

---

**Dual File Structure Guide Version: 1.0.0**  
**Last Updated: November 25, 2025**  
**Next Review: February 25, 2026**  
**Maintainer: MA Malnu Kananga Development Team**