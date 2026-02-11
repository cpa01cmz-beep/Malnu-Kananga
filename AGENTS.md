# OpenCode Configuration for MA Malnu Kananga

**Last Updated**: 2026-02-11 (RepoKeeper: ULW-Loop Run #19 - All FATAL checks PASSED)

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
├── config/             # Configuration files
├── constants.ts        # Centralized constants
├── data/              # Default data and static resources
├── hooks/             # Custom React hooks
├── services/          # API and business logic services
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
└── config.ts          # Main configuration

Note: Tests are located in `__tests__/` directories alongside the code they test
```

### Key Services

- `apiService.ts` - Main API service with JWT auth
- `authService.ts` - Authentication service
- `geminiService.ts` - AI/LLM integration
- `speechRecognitionService.ts` - Voice recognition
- `speechSynthesisService.ts` - Text-to-speech
- `pushNotificationHandler.ts` (in src/services/notifications/) - PWA notifications
- `ocrService.ts` - OCR for PPDB documents
- `permissionService.ts` - Role-based permissions

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

### RepoKeeper Audit Status (2026-02-11 - ULW-Loop Run #19)

**Current Status:** ✅ All FATAL checks PASSED - Repository is PRISTINE

#### ULW-Loop Health Check Results (Run #19 - RepoKeeper)
**RepoKeeper Audit - All FATAL checks PASSED:**
- ✅ Typecheck: PASS (0 errors) - No FATAL type errors
- ✅ Lint: PASS (0 warnings, max 20) - No FATAL lint warnings
- ✅ Build: PASS (29.01s) - Production build successful (126 PWA precache entries)
- ✅ Security Audit: PASS (0 vulnerabilities) - No security issues
- ✅ Working tree: Clean (no uncommitted changes)
- ✅ Current branch: main (up to date with origin/main)
- ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
- ✅ No cache directories found outside node_modules
- ✅ No TypeScript build info files found
- ✅ No TODO/FIXME/XXX/HACK comments in codebase (verified: false positives only)
- ✅ Dependencies: Clean (no misplaced @types, 6 outdated packages noted)
- ✅ Documentation: 31 files up to date (including Run #19 report)
- ✅ Stale branches: None (all 17 branches <7 days old)
- ✅ Merged branches: None requiring deletion
- ✅ Repository size: 900M (acceptable)
- ✅ Code quality: No console.log in production, no `any` types, no @ts-ignore
- **Result**: Repository is in EXCELLENT condition - All systems clean and verified

#### Key Findings (Run #19)

**Documentation Status:**
- AGENTS.md: Updated with Run #19 results
- 31 documentation files in docs/ (consolidated ULW reports maintained)
- Tech stack versions accurate (React 19.2.3, TypeScript 5.9.3, Vite 7.3.1, Tailwind 4.1.18)
- All ULW reports maintained in docs/ULW_REPORTS/ (6 reports - 921 total lines)

**Dependency Status:**
- All @types packages correctly in devDependencies
- 6 outdated packages identified (non-critical):
  - @eslint/js: 9.39.2 → 10.0.1
  - @types/react: 19.0.7 → 19.0.8
  - eslint: 9.39.2 → 10.0.0
  - eslint-plugin-react-refresh: 0.4.26 → 0.5.0
  - jsdom: 27.4.0 → 28.0.0
  - globals: 16.1.0 → 16.3.0
- No security vulnerabilities (npm audit clean)

**Branch Management:**
- 17 remote branches active (increased from 16 - new branch: fix/brocula-performance-optimization-20260211)
- No stale branches (>7 days old)
- No merged branches requiring deletion
- Main branch up to date with origin/main
- No stale remote branches to prune

**Code Quality:**
- 2 false-positive TODO matches (XXXL size constant, test date pattern)
- Zero console.log in production code
- Zero `any` type usage
- Zero @ts-ignore or @ts-expect-error directives

#### Active Branches (17 branches + main)
All branches from Feb 9-11 with active development:
- `feature/ai-services-tests`
- `feature/enhanced-ui-ux-improvements`
- `feature/enhanced-ux-ui-mobile-first`
- `feature/searchinput-clear-button-ux`
- `feature/searchinput-clear-button-ux-enhancement`
- `feature/ux-improve-datatable-error-state`
- `feature/ux-improvements`
- `fix/brocula-performance-optimization-20260211` (NEW)
- `fix/build-errors-20260209`
- `fix/build-errors-and-lint-warnings`
- `fix/css-unexpected-closing-brace`
- `fix/fatal-build-errors`
- `fix/icon-fast-refresh-warning`
- `fix/modal-test-updates`
- `fix/ulw-loop-bugfixer-run9-docs-update`
- `fix/ulw-loop-lint-errors-20260210`
- `fix/ulw-loop-repokeeper-run14-cleanup`

#### Open Pull Requests
- **PR #1641**: feat: comprehensive UX enhancements with micro-interactions and mobile improvements

#### Previous Cleanup History

**ULW-Loop Run #18 (2026-02-11 - RepoKeeper):**
- **RepoKeeper Audit - All FATAL checks PASSED:**
  - ✅ Typecheck: PASS (0 errors) - No FATAL type errors
  - ✅ Lint: PASS (0 warnings, max 20) - No FATAL lint warnings
  - ✅ Build: PASS (31.52s) - Production build successful (126 PWA precache entries)
  - ✅ Security Audit: PASS (0 vulnerabilities) - No security issues
  - ✅ Working tree: Clean (no uncommitted changes)
  - ✅ Current branch: main (up to date with origin/main)
  - ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
  - ✅ No cache directories found outside node_modules
  - ✅ No TypeScript build info files found
  - ✅ No TODO/FIXME/XXX/HACK comments in codebase (verified: false positives only)
  - ✅ Dependencies: Clean (no misplaced @types, 6 outdated packages noted)
  - ✅ Documentation: 31 files up to date (including Run #18 report)
  - ✅ Stale branches: None (all 16 branches <7 days old)
  - ✅ Merged branches: None requiring deletion
  - ✅ Repository size: 900M (acceptable)
  - ✅ Code quality: No console.log in production, no `any` types, no @ts-ignore
  - **Result**: Repository is in EXCELLENT condition - All systems clean and verified

#### Key Findings (Run #18)

**Documentation Status:**
- AGENTS.md: Current and accurate
- 31 documentation files in docs/ (1 new ULW report added)
- Tech stack versions accurate (React 19.2.3, TypeScript 5.9.3, Vite 7.3.1, Tailwind 4.1.18)
- All ULW reports consolidated in docs/ULW_REPORTS/ (6 reports now)

**Dependency Status:**
- All @types packages correctly in devDependencies
- 6 outdated packages identified (non-critical):
  - @eslint/js: 9.39.2 → 10.0.1
  - @types/react: 19.0.7 → 19.0.8
  - eslint: 9.39.2 → 10.0.0
  - eslint-plugin-react-refresh: 0.4.26 → 0.5.0
  - jsdom: 27.4.0 → 28.0.0
  - globals: 16.1.0 → 16.3.0
- No security vulnerabilities (npm audit clean)

**Branch Management:**
- 16 remote branches active
- No stale branches (>7 days old)
- No merged branches requiring deletion
- Main branch up to date with origin/main
- No stale remote branches to prune

**Code Quality:**
- 2 false-positive TODO matches (XXXL size constant, test date pattern)
- Zero console.log in production code
- Zero `any` type usage
- Zero @ts-ignore or @ts-expect-error directives

#### Active Branches (16 branches + main)
All branches from Feb 9-11 with active development:
- `feature/ai-services-tests`
- `feature/enhanced-ui-ux-improvements`
- `feature/enhanced-ux-ui-mobile-first`
- `feature/searchinput-clear-button-ux`
- `feature/searchinput-clear-button-ux-enhancement`
- `feature/ux-improve-datatable-error-state`
- `feature/ux-improvements`
- `fix/build-errors-20260209`
- `fix/build-errors-and-lint-warnings`
- `fix/css-unexpected-closing-brace`
- `fix/fatal-build-errors`
- `fix/icon-fast-refresh-warning`
- `fix/modal-test-updates`
- `fix/ulw-loop-bugfixer-run9-docs-update`
- `fix/ulw-loop-lint-errors-20260210`
- `fix/ulw-loop-repokeeper-run14-cleanup`

#### Open Pull Requests
- **PR #1641**: feat: comprehensive UX enhancements with micro-interactions and mobile improvements

#### Previous Cleanup History

**ULW-Loop Run #17 (2026-02-11 - RepoKeeper):**
- **RepoKeeper Audit - All FATAL checks PASSED:**
  - ✅ Typecheck: PASS (0 errors) - No FATAL type errors
  - ✅ Lint: PASS (0 warnings, max 20) - No FATAL lint warnings
  - ✅ Build: PASS (31.52s) - Production build successful (126 PWA precache entries)
  - ✅ Security Audit: PASS (0 vulnerabilities) - No security issues
  - ✅ Working tree: Clean (no uncommitted changes)
  - ✅ Current branch: main (up to date with origin/main)
  - ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
  - ✅ No cache directories found outside node_modules
  - ✅ No TypeScript build info files found
  - ✅ No TODO/FIXME/XXX/HACK comments in codebase (verified: false positives only)
  - ✅ Dependencies: Clean (no misplaced @types, 6 outdated packages noted)
  - ✅ Documentation: 30 files up to date
  - ✅ Stale branches: None (all 16 branches <7 days old)
  - ✅ Merged branches: None requiring deletion
  - ✅ Code quality: No console.log in production, no `any` types, no @ts-ignore
  - **Result**: Repository is in EXCELLENT condition - All systems clean and verified

**ULW-Loop Run #16 (2026-02-11 - RepoKeeper):**
- **RepoKeeper Audit - All FATAL checks PASSED:**
  - ✅ Typecheck: PASS (0 errors) - No FATAL type errors
  - ✅ Lint: PASS (0 warnings, max 20) - No FATAL lint warnings
  - ✅ Build: PASS (26.71s) - Production build successful
  - ✅ Security Audit: PASS (0 vulnerabilities) - No security issues
  - ✅ Working tree: Clean (no uncommitted changes)
  - ✅ Current branch: main (up to date with origin/main)
  - ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
  - ✅ No cache directories found outside node_modules
  - ✅ No TODO/FIXME/XXX/HACK comments in codebase (verified: false positives only)
  - ✅ Dependencies: Clean (no misplaced @types, 6 outdated packages noted)
  - ✅ Documentation: 30 files up to date
  - ✅ Stale branches: None (all 16 branches <7 days old)
  - ✅ Merged branches: None requiring deletion
  - ✅ Code quality: No console.log in production, no `any` types, no @ts-ignore
  - **Result**: Repository is in EXCELLENT condition - All systems clean and verified

**ULW-Loop Run #15 (2026-02-11 - RepoKeeper):**
- ✅ Typecheck: PASS (0 errors) - No FATAL type errors
- ✅ Lint: PASS (0 warnings, max 20) - No FATAL lint warnings
- ✅ Build: PASS (28.09s) - Production build successful
- ✅ Branch sync: PASS - Up to date with origin/main
- ✅ Working tree: Clean (no uncommitted changes)
- ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
- ✅ No cache directories found outside node_modules
- ✅ No TODO/FIXME/XXX/HACK comments in codebase (verified: false positives only)
- ✅ Dependencies: Clean (no unused, @types in devDependencies)
- ✅ Documentation: 30 files (Run #15 report added)
- ✅ Stale branches: None (all 16 branches <7 days old)
- ✅ Merged branches: None requiring deletion

#### Open Pull Requests
- **PR #1641**: feat: comprehensive UX enhancements with micro-interactions and mobile improvements

#### Previous Cleanup History

**ULW-Loop Run #14 (2026-02-11 - RepoKeeper):**
- **CRITICAL FIX**: Resolved merge conflict markers in AGENTS.md
  - Removed conflict markers: `<<<<<<< HEAD`, `=======`, `>>>>>>> main`
  - Consolidated duplicate Run #13 entries
  - Restored clean documentation state
- **RepoKeeper Audit - All FATAL checks PASSED:**
  - ✅ Typecheck: PASS (0 errors)
  - ✅ Lint: PASS (0 warnings, max 20)
  - ✅ Build: PASS (28.09s)
  - ✅ Branch sync: Up to date with origin/main
  - ✅ Working tree: Clean
  - ✅ No temporary files found
  - ✅ No cache directories found
  - ✅ No TODO/FIXME/XXX/HACK comments
  - ✅ No merged branches requiring deletion
  - ✅ Documentation: 31 files updated with Run #14 report
- All health checks passed, repository in pristine condition

**ULW-Loop Run #13 (2026-02-11 - BugFixer):**
- **BugFixer Audit - All FATAL checks PASSED:**
  - ✅ Typecheck: PASS (0 errors) - No FATAL type errors
  - ✅ Lint: PASS (0 warnings, max 20) - No FATAL lint warnings
  - ✅ Build: PASS (32.81s) - Production build successful
  - ✅ Branch sync: PASS - Up to date with origin/main
  - ✅ Working tree: Clean (no uncommitted changes)
  - ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
  - ✅ No cache directories found outside node_modules
  - ✅ No TODO/FIXME/XXX/HACK comments in codebase
  - ✅ Dependencies: Clean (no unused, @types in devDependencies)
  - ✅ Documentation: 30 files (Run #13 report added)
  - ✅ Stale branches: None (all 18 branches <7 days old)

**ULW-Loop Run #12 (2026-02-11 - RepoKeeper):
- Consolidated redundant documentation files:
  - ✅ Removed `REPO_MAINTENANCE_REPORT_20260209.md` from root (consolidated to docs/ULW_REPORTS/)
  - ✅ Removed `REPO_MAINTENANCE_REPORT_20260210.md` from root (consolidated to docs/ULW_REPORTS/)
  - Result: Single source of truth for maintenance reports in docs/ULW_REPORTS/
- All health checks passed:
  - ✅ Typecheck: PASS (0 errors)
  - ✅ Lint: PASS (0 warnings, max 20)
  - ✅ Build: PASS (production build successful - 32.48s)
  - ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
  - ✅ No cache directories found outside node_modules
  - ✅ No TODO/FIXME/XXX/HACK comments in codebase (verified: XXXL and XX-XX-XXXX are false positives)
  - ✅ Confirmed dist/, node_modules/, .env properly gitignored
  - ✅ Working tree clean (no uncommitted changes)
  - ✅ No stale branches (all 18 branches from Feb 9-11, <7 days old)
  - ✅ No merged branches requiring deletion
  - ✅ Updated AGENTS.md with Run #12 results

**ULW-Loop Run #11 (2026-02-11 - RepoKeeper):**
- Comprehensive repository audit completed:
  - ✅ Typecheck: PASS (0 errors)
  - ✅ Lint: PASS (0 warnings, under max 20 threshold)
  - ✅ Build: PASS (production build successful - 31.95s)
  - ✅ No temporary files found (*.tmp, *~, *.log, *.bak)
  - ✅ No cache directories found (.cache, __pycache__, *.tsbuildinfo)
  - ✅ No TODO/FIXME/XXX/HACK comments in codebase
  - ✅ Confirmed dist/ and node_modules/ properly gitignored
  - ✅ Working tree clean (no uncommitted changes)
  - ✅ Documentation: 26 files up to date
  - ✅ Active branches: 19 total (18 active + main), all from Feb 9-11
  - ✅ Merged branch deleted: `feature/palette-disabled-button-tooltips`
  - ✅ Updated AGENTS.md with Run #11 results
All health checks passed successfully:
- ✅ Typecheck: PASS (0 errors)
- ✅ Lint: PASS (0 warnings, max 20)
- ✅ Build: PASS (production build successful - 27.95s)
- ✅ No temporary files found
- ✅ Dependencies: Clean (no unused dependencies)
- ✅ Documentation: 29 files (updated ULW reports)
- ✅ Working tree: Clean (no uncommitted changes)

#### Merged Branches Deleted (Run #7)
- ✅ `feature/comprehensive-ux-ui-enhancements` - Deleted merged branch
- ✅ `feature/comprehensive-ux-ui-improvements` - Deleted merged branch
- ✅ `feature/enhanced-ux-ui-improvements` - Deleted merged branch
- ✅ `feature/ui-ux-enhancements-v2` - Deleted merged branch

#### Stale Branches Deleted (Run #6)
- ✅ `ux-improvements-pr` - Deleted stale branch from closed PR #1633

#### Merged Branches Deleted (Run #11)
- ✅ `feature/palette-disabled-button-tooltips` - Deleted merged branch

#### Open Pull Requests
- **PR #1641**: feat: comprehensive UX enhancements with micro-interactions and mobile improvements

#### Merged Branches Deleted (Run #7)
- ✅ `feature/comprehensive-ux-ui-enhancements` - Deleted merged branch
- ✅ `feature/comprehensive-ux-ui-improvements` - Deleted merged branch
- ✅ `feature/enhanced-ux-ui-improvements` - Deleted merged branch
- ✅ `feature/ui-ux-enhancements-v2` - Deleted merged branch

#### Stale Branches Deleted (Run #6)
- ✅ `ux-improvements-pr` - Deleted stale branch from closed PR #1633

#### Merged Branches Deleted (Run #11)
- ✅ `feature/palette-disabled-button-tooltips` - Deleted merged branch

#### Previous Cleanup History

**ULW-Loop Run #10 (2026-02-10 - RepoKeeper):**
- **CRITICAL FIX**: Resolved node_modules corruption causing build failures
  - Root cause: `es-abstract` package invalid/corrupted with version conflicts
  - Solution: Clean reinstall of all dependencies (`rm -rf node_modules package-lock.json && npm install`)
  - Result: Build now passes successfully
- All health checks passed:
  - ✅ Typecheck: PASS (0 errors)
  - ✅ Lint: PASS (0 warnings, max 20)
  - ✅ Build: PASS (production build successful - 32.40s)
- Branch cleanup: 1 merged branch candidate identified (already cleaned remotely)
- No temporary files, redundant files, or stale branches found
- Updated package-lock.json with clean dependency tree

**ULW-Loop Run #9 (2026-02-10 - RepoKeeper):**
- Comprehensive repository audit completed:
  - ✅ Verified no temporary files (*.tmp, *~, *.log, *.bak)
  - ✅ Verified no cache directories (.cache, __pycache__, *.tsbuildinfo)
  - ✅ Verified no empty directories outside .git internals
  - ✅ Verified no TODO/FIXME/XXX/HACK comments in codebase
  - ✅ Confirmed dist/ and node_modules/ properly gitignored
  - ✅ Updated AGENTS.md with current status
- All health checks passed (Typecheck, Lint, Build)
- 22 active branches, no stale candidates
- Working tree clean (no uncommitted changes)

**ULW-Loop Run #8 (2026-02-10 - RepoKeeper):**
- Fixed package.json dependency organization:
  - ✅ Moved `@types/papaparse` from dependencies to devDependencies
  - ✅ Moved `@types/qrcode` from dependencies to devDependencies
- Updated package-lock.json to reflect changes
- All health checks passed (Typecheck, Lint, Build)
- 21 active branches, no stale candidates

**ULW-Loop Run #7 (2026-02-10 - RepoKeeper):**
- Deleted 4 merged branches to main
- Updated AGENTS.md and ULW reports
- All health checks passed (Typecheck, Lint, Build)
- 20 active branches, 4 merged deleted

**ULW-Loop Run #6 (2026-02-10 - RepoKeeper):**
- Deleted 1 stale branch from closed PR
- Updated ULW reports and AGENTS.md
- All health checks passed (Typecheck, Lint, Build)
- 24 active branches, 1 stale deleted

**ULW-Loop Run #5 (2026-02-10 - RepoKeeper):**
- Consolidated 3 duplicate ULW reports into single file
- Updated AGENTS.md with latest status
- All health checks passed (Typecheck, Lint, Build)
- 22 active branches, 0 stale

**ULW-Loop Run #4 (2026-02-10 - BugFixer):**
- All health checks passed (Typecheck, Lint, Build)
- No errors or warnings detected
- Working tree clean

**ULW-Loop Run #3 (2026-02-10 - RepoKeeper):**
- All health checks passed
- Documentation: 24 files up to date

**ULW-Loop Run #2 (2026-02-10):**
- Dependency Cleanup (2 packages removed):
  - ✅ `playwright-lighthouse` (v4.0.0)
  - ✅ `puppeteer` (v24.37.2)
- Deleted Redundant Repokeeper Branches (3 branches)
- Deleted Stale Branches (10 branches)

### Cleanup Commands
```bash
# Delete stale branches (run with caution)
git push origin --delete branch-name

# View branch ages
git for-each-ref --sort=committerdate refs/remotes/origin/ --format='%(committerdate:short) %(refname:short)'
```

### Repository Health Checks
- ✅ Typecheck: PASS (0 errors)
- ✅ Lint: PASS (0 warnings, max 20)
- ✅ Build: PASS (production build successful - 29.01s)
- ✅ No temp files found
- ✅ .gitignore: Comprehensive (141 lines)
- ✅ Dependencies: Clean (no unused, @types packages correctly in devDependencies)
- ✅ Documentation: 31 files (consolidated reports in docs/ULW_REPORTS/)
- ✅ Branches: 18 total (17 active + main), 0 stale candidates
- ✅ Repository Size: 900M (acceptable)
- ✅ Working tree: Clean
- ✅ No TODO/FIXME/XXX/HACK comments in codebase
