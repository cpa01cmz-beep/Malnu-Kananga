# OpenCode Configuration for MA Malnu Kananga

**Last Updated**: 2026-02-10 (RepoKeeper: ULW-Loop Maintenance - Updated Branch Documentation, 1 Stale Branch Flagged for Review)

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

### Branch Cleanup Status (2026-02-10)

**Current Status:** 26 remote branches analyzed

#### Stale Branches Recommended for Deletion (10 branches)
These branches are >1 week old and appear to be abandoned:

**Oldest (>3 weeks):**
- `fix/skiplink-accessibility-tabindex` (Jan 13) - 54 commits ahead ⚠️ REVIEW BEFORE DELETE
- `feature/toast-accessibility-ux` (Jan 11) - 1 commit
- `fix/icon-imports` (Jan 11) - 2 commits  
- `fix/bug-107-elibrary-mock-component` (Jan 12) - 1 commit

**Older (2-3 weeks):**
- `feature/security-critical-fixes` (Jan 20) - 1 commit
- `fix/announcement-pushnotification-proper` (Jan 20) - 1 commit
- `fix/build-001-typecheck-lint-blocker` (Jan 21) - 4 commits

**Old (1-2 weeks):**
- `fix/issue-1284-test-timeout-aftereach-hooks` (Jan 31) - 1 commit
- `fix/issue-1323-circular-dependencies` (Feb 1) - 1 commit
- `feature/remove-duplicate-api-url-definitions` (Feb 1) - 2 commits

#### Potentially Duplicate Branches (4 branches)
These branches share similar purposes and may be consolidated:
- `fix/build-errors-20260209` (Feb 9)
- `fix/build-errors-and-lint-warnings` (Feb 9)
- `fix/fatal-build-errors` (Feb 9)
- `fix/brocula-console-errors-warnings` (Feb 9)

#### Active Branches (14 branches)
Recent branches from Feb 9-10 with active development should be retained.

### Cleanup Commands
```bash
# Delete stale branches (run with caution)
git push origin --delete fix/skiplink-accessibility-tabindex
# ... repeat for other stale branches

# View branch ages
git for-each-ref --sort=committerdate refs/remotes/origin/ --format='%(committerdate:short) %(refname:short)'
```

### Repository Health Checks
- ✅ Typecheck: PASS (0 errors)
- ✅ Lint: PASS (0 warnings)
- ✅ Build: PASS (production build successful)
- ✅ No temp files found
- ✅ .gitignore: Comprehensive (138 lines)
- ✅ Documentation: 24 docs files up to date
- ⚠️  Branches: 26 total, 10 stale candidates
