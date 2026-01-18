# MA Malnu Kananga - System Blueprint

**Last Updated**: 2026-01-18

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

#### AI & Voice Services
- **`geminiService.ts`** - Google Gemini AI integration
- **`speechRecognitionService.ts`** - Web Speech API (Voice → Text)
- **`speechSynthesisService.ts`** - Text-to-Speech (Text → Voice)

#### Feature Services
- **`ocrService.ts`** - OCR for PPDB documents
- **`pushNotificationService.ts`** - PWA push notifications
- **`dataService.ts`** - Data management & CRUD operations

#### Frontend Components (`src/components/`)
- **UI Components** - Reusable UI elements
- **Feature Components** - Domain-specific functionality
- **Layout Components** - Page structure & navigation

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

#### RESTful Endpoints
```
/auth/*          - Authentication (login, logout, refresh)
/users/*         - User management
/content/*       - Content CRUD
/materials/*     - Learning materials
/ppdb/*          - PPDB management
/notifications/* - Push notifications
/ai/*            - AI endpoints
/ocr/*           - OCR processing
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

#### Test Commands
- `npm test` - Run all tests
- `npm run test:ui` - Vitest UI
- `npm run test:coverage` - Coverage report

### Deployment Architecture

#### Frontend (Cloudflare Pages)
- Build: `npm run build`
- Deploy: `wrangler pages deploy dist --project-name=malnu-kananga`
- Auto-deploy on main branch push

#### Backend (Cloudflare Workers)
- Deploy: `wrangler deploy --env production`
- Dev: `wrangler deploy --env=""` (uses dev DB)
- D1 database attached

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
