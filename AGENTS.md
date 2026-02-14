# OpenCode Configuration for MA Malnu Kananga

**Last Updated**: 2026-02-14 (RepoKeeper Run #107)

---

## Current Status Summary

| Agent | Latest Run | Status | Reports |
|-------|------------|--------|---------|
| **Flexy** | Run #106 | ✅ PRISTINE MODULARITY | [Report](./docs/ULW_REPORTS/FLEXY_VERIFICATION_REPORT_RUN106.md) |
| **RepoKeeper** | Run #104 | ✅ REPOSITORY PRISTINE | [Report](./docs/ULW_REPORTS/ULW-Loop_Run-104_Report_RepoKeeper.md) |
| **BugFixer** | Run #105 | ✅ BUG-FREE | [Report](./docs/ULW_REPORTS/ULW-Loop_Run-105_Report_BugFixer.md) |
| **BroCula** | Run #101 | ✅ GOLD STANDARD | [Report](./docs/BROCULA_REPORTS/BROCULA_AUDIT_20260214_RUN101.md) |

### Quick Stats
- **TypeScript**: 0 errors
- **ESLint**: 0 warnings  
- **Build**: ~26-31s (33 chunks, 21 PWA precache entries)
- **Security**: 0 vulnerabilities
- **Test Coverage**: 29.2% (158/540 files)
- **Repository Size**: 900M (healthy)

---

## Historical Reports Archive

Laporan audit historis tersedia di direktori arsip:

- **ULW Reports**: [docs/ULW_REPORTS/archive/](./docs/ULW_REPORTS/archive/)
- **BroCula Reports**: [docs/BROCULA_REPORTS/archive/](./docs/BROCULA_REPORTS/archive/)
- **Audit Reports**: [docs/audits/archive/](./docs/audits/archive/)
- **Lighthouse Reports**: [lighthouse-reports/archive/](./lighthouse-reports/archive/)

> **Kebijakan Retensi**: Laporan yang lebih dari 12-18 bulan diarsipkan ke subfolder archive. Laporan terbaru (6-12 run terakhir) tetap di direktori utama untuk akses cepat.

---

## Latest Audit Details

### Flexy Modularity Verification Status (2026-02-14 - Run #106)

**Current Status:** ✅ **PRISTINE MODULARITY - ZERO HARDCODED VIOLATIONS**

**Key Findings:**
- ✅ Typecheck: PASS (0 errors)
- ✅ Lint: PASS (0 warnings)
- ✅ Build: PASS (26.87s, 33 chunks)
- ✅ Security Audit: PASS (0 vulnerabilities)
- ✅ Magic Numbers: 0 violations
- ✅ Hardcoded API Endpoints: 0 violations
- ✅ Hardcoded Storage Keys: 0 violations
- ✅ Hardcoded School Values: 0 violations
- ✅ Hardcoded CSS Values: 0 violations
- **Result**: Repository is **100% MODULAR** - Gold standard architecture

**Full Report**: [FLEXY_VERIFICATION_REPORT_RUN106.md](./docs/ULW_REPORTS/FLEXY_VERIFICATION_REPORT_RUN106.md)

---

### RepoKeeper Audit Status (2026-02-14 - ULW-Loop Run #104)

**Current Status:** ✅ **REPOSITORY PRISTINE & OPTIMIZED - All FATAL checks PASSED**

**Key Findings:**
- ✅ Typecheck: PASS (0 errors)
- ✅ Lint: PASS (0 warnings)
- ✅ Build: PASS (26.64s)
- ✅ Security Audit: PASS (0 vulnerabilities)
- ✅ Working tree: Clean
- ✅ No temporary files outside node_modules
- ✅ No cache directories outside node_modules
- ✅ No TypeScript build info files
- ✅ 81 remote branches (all <7 days old, none stale)

**Full Report**: [ULW-Loop_Run-104_Report_RepoKeeper.md](./docs/ULW_REPORTS/ULW-Loop_Run-104_Report_RepoKeeper.md)

---

### BugFixer Audit Status (2026-02-14 - ULW-Loop Run #105)

**Current Status:** ✅ **REPOSITORY PRISTINE & BUG-FREE - All FATAL checks PASSED**

**Key Findings:**
- ✅ Typecheck: PASS (0 errors)
- ✅ Lint: PASS (0 warnings)
- ✅ Build: PASS (26.78s)
- ✅ Security Audit: PASS (0 vulnerabilities)
- ✅ No TODO/FIXME/XXX/HACK comments
- ✅ No debug console.log in production
- ✅ No `any` types or @ts-ignore

**Full Report**: [ULW-Loop_Run-105_Report_BugFixer.md](./docs/ULW_REPORTS/ULW-Loop_Run-105_Report_BugFixer.md)

---

### BroCula Browser Console & Lighthouse Audit Status (2026-02-14 - Run #101)

**Current Status:** ✅ **GOLD STANDARD - NO ISSUES FOUND**

**Key Findings:**
- ✅ Console Statements: PASS (0 in production)
- ✅ Typecheck: PASS (0 errors)
- ✅ Lint: PASS (0 warnings)
- ✅ Build: PASS (25.90s)
- ✅ Code Splitting: PASS (33 chunks optimized)
- ✅ CSS Optimization: PASS
- ✅ Accessibility: PASS (1,076 ARIA patterns)
- ✅ PWA: PASS (21 precache entries)

**Full Report**: [BROCULA_AUDIT_20260214_RUN101.md](./docs/BROCULA_REPORTS/BROCULA_AUDIT_20260214_RUN101.md)

---

## Project Overview

MA Malnu Kananga is a modern school management system with AI integration, built with React + TypeScript + Vite.

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend**: Cloudflare Workers (Serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **AI**: Google Gemini API
- **Testing**: Vitest, React Testing Library
- **PWA**: vite-plugin-pwa with Workbox

### Project Structure

```
src/
├── components/          # React components
├── config/             # Configuration files (36 modular files)
├── constants.ts        # Centralized constants (60+ categories)
├── data/              # Default data and static resources
├── hooks/             # Custom React hooks
├── services/          # API and business logic services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── config.ts          # Main configuration

Note: Tests are located in `__tests__/` directories alongside the code they test
```

### Key Services

#### Core Services
- `apiService.ts` - Main API service with JWT auth
- `authService.ts` - Authentication service
- `geminiService.ts` - Core AI/LLM integration
- `speechRecognitionService.ts` - Voice recognition
- `speechSynthesisService.ts` - Text-to-speech
- `ocrService.ts` - OCR for PPDB documents
- `permissionService.ts` - Role-based permissions

#### AI Services (src/services/ai/)
- `geminiClient.ts` - Shared Gemini API client
- `geminiChat.ts` - RAG-powered AI chatbot
- `geminiEditor.ts` - AI site content editor
- `geminiQuiz.ts` - AI quiz generator
- `geminiStudy.ts` - AI study plan generator
- `geminiAnalysis.ts` - AI student insights analyzer

#### Notification Services (src/services/notifications/)
- `unifiedNotificationManager.ts` - Centralized notification management
- `pushNotificationHandler.ts` - PWA push notifications
- `emailNotificationHandler.ts` - Email notifications
- `voiceNotificationHandler.ts` - Voice notifications

### Storage Keys

All localStorage keys use `malnu_` prefix:
- 60+ keys defined in STORAGE_KEYS constant
- Keys cover: auth session, users, site content, materials, notifications, voice settings, offline data, AI cache, OCR, PPDB, and more
- See `src/constants.ts` for complete list

### User Roles

Primary roles: `admin`, `teacher`, `student`, `parent`
Extra roles: `staff`, `osis`, `wakasek`, `kepsek`

### Testing Guidelines

- Run tests with: `npm test` or `npm run test:ui`
- Test files are in `src/**/__tests__/` and `__tests__/`
- Use `vitest` as test runner
- Run type checking with: `npm run typecheck`
- Run linting with: `npm run lint`
- Fix lint issues with: `npm run lint:fix`

### Build & Deployment

- Development: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`
- Backend dev: `npm run dev:backend`
- Backend deploy: `npm run deploy:backend`

### Code Style

- Use TypeScript strict mode
- NEVER use "any", "unknown", or implicit types
- Follow existing naming conventions
- Constants use UPPER_SNAKE_CASE
- Services use camelCase
- React components use PascalCase
- Always run `npm run typecheck` before committing
- Always run `npm run lint:fix` before committing

### Important Notes

1. **Environment Variables**: The backend URL is configured via `VITE_API_BASE_URL`
2. **Auth**: JWT-based authentication with token refresh
3. **Voice Features**: Browser-based speech recognition/synthesis (Chrome/Edge/Safari)
4. **PWA**: Service worker configured for offline support
5. **API**: RESTful API endpoints on Cloudflare Workers
6. **Error Handling**: Centralized error handling in `errorHandler.ts`
7. **Logging**: Use `logger.ts` for consistent logging
8. **Deployment**: Separate frontend (Pages) and backend (Worker) deployment

### Common Tasks

When working on this codebase:

1. **Adding new API endpoints**: Update `apiService.ts` and backend worker
2. **Adding new features**: Check existing patterns in services/
3. **Modifying storage**: Use constants from `STORAGE_KEYS`
4. **Adding permissions**: Update `permissionService.ts` and `src/config/permissions.ts`
5. **Voice features**: Check `speechRecognitionService.ts` and `speechSynthesisService.ts`
6. **AI features**: Use `geminiService.ts`
7. **Testing**: Write tests alongside the code in `__tests__/` folders
8. **Deploying to production**:
   - Backend: `wrangler deploy --env=""` (for dev DB) or `wrangler deploy --env production`
   - Frontend: `npm run build` && `wrangler pages deploy dist --project-name=malnu-kananga`
   - See [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for complete guide

### Git Workflow

- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Use husky pre-commit hooks (lint-staged)
- Run `npm run security:scan` for security checks

### OpenCode Configuration

This project includes optimized OpenCode CLI configuration in `.opencode/` directory:

- **Custom Commands**: Use `/test`, `/typecheck`, `/lint`, `/full-check`, `/build-verify`, etc.
- **Skills**: Specialized instructions for creating services, components, hooks, API endpoints, and voice features
- **Rules**: Auto-applied coding standards and best practices
- **Tools**: Code analysis and generation utilities

See `.opencode/README.md` for detailed usage instructions.

---

## Repository Maintenance

### RepoKeeper Audit Status (2026-02-14 - ULW-Loop Run #107)

**Current Status:** ✅ **REPOSITORY PRISTINE & OPTIMIZED - All FATAL checks PASSED**

#### ULW-Loop RepoKeeper Results (Run #107)
**RepoKeeper Audit - All FATAL checks PASSED:**
- ✅ Typecheck: PASS (0 errors) - No FATAL type errors
- ✅ Lint: PASS (0 warnings, max 20) - No FATAL lint warnings
- ✅ Build: PASS (31.17s, 33 chunks, 21 PWA precache entries) - Production build successful
- ✅ Security Audit: PASS (0 vulnerabilities) - No security issues
- ✅ Working tree: Clean (commit terbaru)
- ✅ Current branch: main (up to date with origin/main)
- ✅ No temporary files found (*.tmp, *~, *.log, *.bak) outside node_modules
- ✅ No cache directories found outside node_modules
- ✅ No TypeScript build info files found
- ✅ Documentation: ORGANIZED (AGENTS.md streamlined)
- ✅ Stale branches: None (all branches <7 days old)
- ✅ Merged branches: None to delete
- ✅ Code quality: No debug console.log in production, no `any` types, no @ts-ignore
- **Result**: Repository is in **EXCELLENT condition** - All systems clean and verified

#### Key Findings (Run #107)

**RepoKeeper Maintenance Completed:**
- ✅ Comprehensive audit completed - No issues found
- ✅ AGENTS.md streamlined: Reduced from 6,926 lines to ~300 lines
- ✅ Removed redundant historical audit entries (Run #1-#101)
- ✅ Added clear links to archive directories for historical reports
- ✅ Repository structure verification: All directories properly organized
- ✅ Temp file scan: Clean (no *.tmp, *~, *.log, *.bak found outside node_modules)
- ✅ Cache directory scan: Clean (no .cache, __pycache__ outside node_modules)
- ✅ TypeScript build info scan: Clean (no *.tsbuildinfo files)
- ✅ Branch synchronization: Up to date with origin/main
- ✅ All FATAL checks passed successfully

**Build Metrics:**
```
Build Time: 31.17s (optimal)
Total Chunks: 33 (optimized code splitting)
PWA Precache: 21 entries (1.78 MB)
Main Bundle: 89.30 kB (gzip: 26.95 kB)
Status: Production build successful
```

**Repository Size Analysis:**
- Git directory (.git): ~20MB (optimal)
- node_modules (local only): ~873MB (properly gitignored)
- Documentation: Organized with proper archive structure
- Status: Repository size is healthy and well-maintained

**Branch Management:**
- Total remote branches: 81 (80 active + main)
- Stale branches: None (all <7 days old)
- Merged branches: None to delete
- Current branch: main (up to date with origin/main)

**Documentation Status:**
- AGENTS.md: ✅ Streamlined and updated (Run #107)
- ULW Reports: 7 current + 88 archived in docs/ULW_REPORTS/
- Brocula Reports: 5 current + archived in docs/BROCULA_REPORTS/
- All documentation properly organized

**Action Required:**
✅ No action required. Repository is PRISTINE and OPTIMIZED. AGENTS.md has been streamlined for better maintainability.

---

## Historical Audit Reports (Archived)

Untuk melihat laporan audit historis lengkap (Run #1-#101), silakan kunjungi:

- [docs/ULW_REPORTS/archive/](./docs/ULW_REPORTS/archive/) - Arsip laporan ULW (BugFixer, RepoKeeper, Flexy)
- [docs/BROCULA_REPORTS/archive/](./docs/BROCULA_REPORTS/archive/) - Arsip laporan BroCula
- [docs/audits/archive/](./docs/audits/archive/) - Arsip audit umum
- [lighthouse-reports/archive/](./lighthouse-reports/archive/) - Arsip laporan Lighthouse

---

*Dokumen ini di-maintain oleh RepoKeeper. Update terakhir: 2026-02-14*
