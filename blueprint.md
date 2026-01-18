# MA Malnu Kananga - System Blueprint

**Last Updated**: 2026-01-18 (Security audit completed)

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Cloudflare Workers (Serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **AI/ML**: Google Gemini API
- **Testing**: Vitest + React Testing Library
- **PWA**: vite-plugin-pwa with Workbox

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React 19   │  │  Tailwind 4  │  │  Vite PWA    │  │
│  │  Components  │  │    Styles    │  │  Service     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
┌────────────────────┴────────────────────────────────────┐
│                  API Gateway Layer                      │
│              Cloudflare Workers (JWT Auth)               │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        ▼            ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Cloudflare  │ │   R2     │ │  Gemini  │ │  OCR     │
│     D1       │ │  Storage  │ │    API   │ │  Service │
│  (SQLite)    │ │           │ │          │ │          │
└──────────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Module Structure

#### Core Services (`src/services/`)
- **`apiService.ts`** - Main API communication with JWT auth
- **`authService.ts`** - Authentication & authorization logic
- **`permissionService.ts`** - Role-based access control (RBAC)
- **`errorHandler.ts`** - Centralized error handling
- **`logger.ts`** - Structured logging utility
- **`webSocketService.ts`** - WebSocket client for real-time communication
- **`offlineDataService.ts`** - Offline data caching and synchronization
- **`offlineActionQueueService.ts`** - Queue for offline actions to sync
- **`errorMonitoringService.ts`** - Sentry error tracking integration
- **`performanceMonitor.ts`** - Performance metrics collection

#### AI & Voice Services
- **`geminiService.ts`** - Google Gemini AI integration
- **`aiCacheService.ts`** - AI response caching and management
- **`speechRecognitionService.ts`** - Web Speech API (Voice → Text)
- **`speechSynthesisService.ts`** - Text-to-Speech (Text → Voice)
- **`voiceSettingsBackup.ts`** - Voice settings persistence
- **`voiceMessageQueue.ts`** - Queue for voice commands/messages
- **`voiceNotificationService.ts`** - Voice notification alerts
- **`voiceCommandParser.ts`** - Voice command parsing and validation
- **`ocrService.ts`** - OCR for PPDB documents
- **`ocrEnhancementService.ts`** - OCR result enhancement and validation

#### Feature Services
- **`pushNotificationService.ts`** - PWA push notifications
- **`unifiedNotificationManager.ts`** - Unified notification system
- **`notificationTemplates.ts`** - Notification message templates
- **`emailService.ts`** - Email sending service (SendGrid, Mailgun, Cloudflare)
- **`emailQueueService.ts`** - Email sending queue and retry logic
- **`emailTemplates.ts`** - Email template management
- **`parentGradeNotificationService.ts`** - Parent grade change notifications
- **`themeManager.ts`** - Theme management and persistence
- **`categoryService.ts`** - Category management for resources
- **`pdfExportService.ts`** - PDF generation for reports and certificates

#### Frontend Components (`src/components/`)

##### Dashboard Components
- **`AdminDashboard.tsx`** - Admin dashboard with management cards
- **`TeacherDashboard.tsx`** - Teacher dashboard with class and grade management
- **`StudentPortal.tsx`** - Student portal with grades, materials, schedule
- **`ParentDashboard.tsx`** - Parent portal with child's academic data

##### Feature Components
- **`UserManagement.tsx`** - User CRUD with permissions
- **`PPDBRegistration.tsx`** - New student registration form
- **`PPDBManagement.tsx`** - PPDB application management
- **`SiteEditor.tsx`** - WYSIWYG site content editor
- **`MaterialUpload.tsx`** - Learning material upload interface
- **`MaterialSharing.tsx`** - Material sharing with permissions
- **`MaterialAnalytics.tsx`** - Material usage analytics
- **`MaterialTemplatesLibrary.tsx`** - Template library for materials
- **`GradingManagement.tsx`** - Grade entry and management
- **`ClassManagement.tsx`** - Class schedule and management
- **`ELibrary.tsx`** - E-library browsing and access
- **`StudentInsights.tsx`** - Student performance insights
- **`CalendarView.tsx`** - Calendar with events and schedule
- **`AICacheManager.tsx`** - AI cache management interface

##### UI Components (`src/components/ui/`)
- **Button**, **Input**, **Select**, **Textarea**, **FormGrid** - Form elements
- **Modal**, **ConfirmationDialog**, **Dialog** - Dialog components
- **Card**, **PageHeader**, **Section** - Layout components
- **Table**, **DataTable**, **Pagination** - Data display
- **Badge**, **ProgressBar**, **LoadingSpinner** - Status indicators
- **Tab**, **Toggle**, **SearchInput** - Interactive components
- **FileUploader**, **FileInput**, **FileUploader** - File handling
- **Toast**, **ErrorBoundary**, **LoadingState** - Error/loading states
- **SuspenseLoading**, **LoadingOverlay** - Loading states

##### Section Components (`src/components/sections/`)
- **`HeroSection.tsx`** - Landing page hero
- **`ProfileSection.tsx`** - School profile section
- **`ProgramsSection.tsx`** - Featured programs display
- **`NewsSection.tsx`** - Latest news display
- **`PPDBSection.tsx`** - PPDB information section
- **`RelatedLinksSection.tsx`** - Related links display

##### Layout Components
- **`Header.tsx`** - Main navigation header
- **`Footer.tsx`** - Page footer
- **`LoginModal.tsx`** - Login form modal
- **`ChatWindow.tsx`** - AI chat interface
- **`Toast.tsx`** - Toast notification component
- **`ThemeSelector.tsx`** - Theme selection modal
- **`AccessDenied.tsx`** - Permission denied page
- **`DocumentationPage.tsx`** - Documentation viewer

#### Configuration (`src/config/`)
- **`permissions.ts`** - Role permission matrix
- **Feature flags** - Feature toggles
- **Environment configs** - Environment-specific settings

### Data Models

#### Users
- `id`, `username`, `email`, `password_hash`
- `role`: admin, teacher, student, parent, staff, osis, wakasek, kepsek
- `profile_data`, `created_at`, `updated_at`

#### Content Management
- Site pages, announcements, news
- Learning materials, assignments
- Events, schedules

#### PPDB (New Student Admission)
- Student registration data
- Document uploads (OCR processed)
- Status tracking

### Storage Architecture (`STORAGE_KEYS`)
All localStorage keys use `malnu_` prefix:
- Authentication: `malnu_auth_session`, `malnu_refresh_token`
- Users: `malnu_users`, `malnu_current_user`
- Content: `malnu_site_content`, `malnu_materials`
- Notifications: `malnu_notifications`
- Voice: `malnu_voice_settings`, `malnu_voice_enabled`
- AI: `malnu_ai_cache`, `malnu_ai_interactions`
- OCR: `malnu_ocr_cache`
- PPDB: `malnu_ppdb_data`, `malnu_ppdb_status`
- Offline: `malnu_offline_queue`

### Authentication Flow

1. User logs in → `authService.login()`
2. JWT token received → Stored in `malnu_auth_session`
3. Each API request includes `Authorization: Bearer <token>`
4. Token expires → Refresh via `apiService.refreshToken()`
5. Refresh fails → Logout → Redirect to login

### API Architecture

#### Base URL
- Configured via `VITE_API_BASE_URL` environment variable
- Default: Cloudflare Worker endpoint
- Production: `https://malnu-kananga-worker-prod.cpa01cmz.workers.dev`

#### RESTful Endpoints
```
/auth/*          - Authentication (login, logout, refresh, password reset)
/users/*         - User management (CRUD)
/students/*      - Student records
/teachers/*      - Teacher records
/ppdb/*          - PPDB management
/content/*       - Content CRUD (programs, news)
/materials/*     - Learning materials
/schedules/*     - Class schedules
/grades/*        - Grade management
/attendance/*    - Attendance records
/e-library/*      - E-library resources
/files/*         - File operations (upload, download, delete, list)
/notifications/* - Push notifications
/email/*         - Email sending
/ai/*            - AI endpoints (chat, embeddings)
/ocr/*           - OCR processing
/sessions/*      - Session management
/events/*         - School events
/inventory/*     - Inventory management
```

### PWA Architecture

#### Service Worker
- Caches: static assets, API responses, offline pages
- Offline queue: Stores requests when offline, syncs when online
- Update strategy: Stale-while-revalidate

#### Push Notifications
- VAPID keys configured
- User opt-in
- Background sync support

### Voice Integration

#### Speech Recognition
- Browser Web Speech API
- Chrome/Edge/Safari support
- Configurable language & continuous mode

#### Speech Synthesis
- Browser SpeechSynthesis API
- Configurable voice, rate, pitch
- Text-to-speech for accessibility

### Error Handling

#### Error Categories
- Network errors (API failures)
- Authentication errors (401, 403)
- Validation errors (400)
- Server errors (500)
- Client errors (Type errors, etc.)

#### Error Handler (`errorHandler.ts`)
- Logs errors with context
- User-friendly messages
- Retry logic for transient failures
- Error boundary for React components

### Security Measures

#### OWASP Top 10 Coverage
1. **Injection**: Parameterized queries, input validation
2. **Broken Auth**: JWT with refresh tokens, secure storage
3. **XSS**: React auto-escaping, CSP headers
4. **SSRF**: No external URL fetching from user input
5. **Security Misconfiguration**: Environment variables, .env.example
6. **XSS**: Content Security Policy
7. **Broken Access Control**: RBAC, permission checks
8. **Cryptographic Failures**: HTTPS, secure headers
9. **Logging**: Structured logging (no sensitive data)
10. **SSRF**: Same-origin policy, CORS restrictions

#### Secrets Management
- `.env.example` for reference
- `.env` in `.gitignore`
- `.secrets.baseline` for security scanning
- No hardcoded secrets in code
- Centralized URL constants in `EXTERNAL_URLS` (constants.ts)
- All localStorage access uses `STORAGE_KEYS` constants

#### Code Quality & Security
- Zero `any` types in production code (TypeScript strict mode)
- No console.log usage in production code (uses logger.ts)
- All async functions have proper error handling with try-catch
- Centralized error handling in `errorHandler.ts`
- Structured logging via `logger.ts`
- Regular security scans (npm audit, SecretLint)

### Performance Optimization

#### Frontend
- Code splitting (Vite)
- Lazy loading components
- Memoization (React.memo, useMemo, useCallback)
- Virtualization for long lists

#### Backend
- Cloudflare Edge caching
- D1 query optimization
- R2 CDN distribution

#### Bundle Size
- Tree-shaking enabled
- Dynamic imports
- Bundle analysis (can be added)

### Testing Strategy

#### Unit Tests
- Services: `src/**/__tests__/*.test.ts`
- Components: `src/components/**/__tests__/*.test.tsx`
- Utilities: `src/utils/**/__tests__/*.test.ts`

#### Integration Tests
- API service tests
- Auth flow tests
- Multi-component tests
- Offline functionality tests
- OCR validation tests

#### Test Coverage (as of 2026-01-18)
- **84 test files**
- **1529 tests passing**
- **10 tests skipped**
- **Coverage areas**:
  - All core services (auth, API, permissions)
  - All UI components (30+ components)
  - Voice services (recognition, synthesis)
  - AI services (Gemini, cache management)
  - OCR services (validation, enhancement)
  - Notification services (push, email, unified)
  - Offline services (data sync, action queue)
  - Dashboard components (admin, teacher, student, parent)

#### Test Commands
- `npm test` - Run all tests
- `npm run test:run` - Run tests once
- `npm run test:ui` - Vitest UI
- `npm run test:coverage` - Coverage report

### Deployment Architecture

#### Frontend (Cloudflare Pages)
- Build: `npm run build`
- Deploy: `wrangler pages deploy dist --project-name=malnu-kananga`
- Auto-deploy on main branch push
- Production URL: https://ma-malnukananga.sch.id (configured)

#### Backend (Cloudflare Workers)
- Deploy: `wrangler deploy --env production`
- Production worker: `malnu-kananga-worker-prod`
- Production URL: https://malnu-kananga-worker-prod.cpa01cmz.workers.dev
- Dev: `wrangler dev --env dev` (uses dev DB)
- D1 database attached
- Production DB: `malnu-kananga-db-prod` (ID: 7fbd7834-0fd2-475f-8787-55ce81988642)
- Dev DB: `malnu-kananga-db-dev` (ID: 69605f72-4b69-4dd6-a72c-a17006f61254)

#### CI/CD
- GitHub Actions in `.github/workflows/`
- Lint on PR
- Test on PR
- Type check on PR
- Deploy on merge to main
- Pre-commit hooks (Husky, lint-staged)

#### CI/CD
- GitHub Actions in `.github/workflows/`
- Lint on PR
- Test on PR
- Type check on PR
- Deploy on merge to main

### Design System

#### Color Palette
- Primary: Blue (Tailwind `blue-500` to `blue-700`)
- Secondary: Green (`green-500` to `green-700`)
- Error: Red (`red-500`)
- Warning: Yellow (`yellow-500`)
- Success: Green (`green-500`)

#### Typography
- Font: System default (San Francisco, Inter, Segoe UI)
- Scale: Tailwind default text sizes

#### Spacing
- Tailwind spacing scale (4px base unit)

#### Components
- Consistent prop interfaces
- Reusable variants
- Accessible (ARIA labels, keyboard navigation)

### Monitoring & Observability

#### Logging
- Structured logs via `logger.ts`
- Log levels: ERROR, WARN, INFO, DEBUG
- Production: INFO and above
- Development: DEBUG and above

#### Error Tracking
- Error boundary captures React errors
- API errors logged with context
- User-friendly error messages

#### Analytics
- Can be integrated (Google Analytics, etc.)
- Currently not implemented

### Scalability Considerations

#### Database
- D1 scales automatically
- Connection pooling handled by Cloudflare
- Query optimization needed for large datasets

#### Storage
- R2 unlimited storage
- CDN distribution
- File size limits (per Cloudflare)

#### API Rate Limiting
- Can be implemented in Workers
- Per-user or per-IP limits
- Caching reduces load

### Future Enhancements

#### Planned Features
- Real-time chat (WebSocket)
- Video conferencing integration
- Advanced analytics dashboard
- Mobile app (React Native / PWA)
- Offline-first architecture enhancement

#### Technical Debt
- Add comprehensive integration tests
- Implement bundle analysis
- Add performance monitoring
- Enhance error tracking
- Add API rate limiting

---

**Notes**:
- This blueprint is the Single Source of Truth for architecture
- Update this file when making structural changes
- Refer to `AGENTS.md` for coding standards
- See `roadmap.md` for planned features
