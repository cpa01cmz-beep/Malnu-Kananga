# MA Malnu Kananga - Blueprint (Architecture & Design)

**Version**: 3.2.1
**Last Updated**: 2026-01-29
**Maintained By**: Lead Autonomous Engineer & System Guardian

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Design Principles](#design-principles)
5. [Key Services](#key-services)
6. [Data Flow](#data-flow)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Security Model](#security-model)
10. [PWA & Offline Strategy](#pwa--offline-strategy)

---

## Architecture Overview

MA Malnu Kananga is a **modern PWA-based school management system** with AI integration, following **Clean Architecture** principles with **separation of concerns**.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  React 19   │  │  Tailwind 4  │  │   Recharts   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Business Logic Layer                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │    Hooks     │  │   Contexts   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Data Access Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Service │  │  LocalStore  │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        Infrastructure Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Sentry     │  │  Workbox     │  │   Wrangler   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

 ### Frontend
 - **Framework**: React 19.2.3 with TypeScript 5.9.3
 - **Build Tool**: Vite 7.3.1
 - **Styling**: Tailwind CSS 4.1.18 (PostCSS)
 - **Charts**: Recharts 3.6.0
 - **Routing**: React Router DOM 7.12.0
 - **Icons**: Heroicons React 2.2.0

 ### Bug Fixes (2026-01-22 - 2026-01-23)
  - **WebSocket Memory Leak**: Fixed visibilitychange listener cleanup in disconnect() (Issue #1223, P1)
  - **Incomplete useOfflineActionQueue Mocks**: Fixed incomplete mocks causing 300+ test failures (Issue #1236, P0)

### Backend (Cloudflare Workers)
- **Runtime**: Serverless (Cloudflare Workers)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Deployment**: Wrangler 4.59.2

### AI & ML
- **LLM**: Google Gemini API (@google/genai 1.37.0)
- **OCR**: Tesseract.js 7.0.0

### PDF & Document Processing
- **PDF Generation**: jsPDF 4.0.0 + jsPDF-AutoTable 5.0.7
- **Canvas**: html2canvas 1.4.1

### Testing
- **Unit Testing**: Vitest 4.0.17 + React Testing Library 16.3.1
- **E2E Testing**: Playwright 1.57.0
- **Test Environment**: jsdom 27.4.0

### PWA
- **Service Worker**: Workbox (via vite-plugin-pwa 1.2.0)
- **Manifest**: Auto-generated with 192x192 and 512x512 icons

### Error Monitoring
- **Tracking**: Sentry 10.34.0 (Browser + React + Tracing)

### CSV Processing
- **Library**: PapaParse 5.5.3
- **QR Code**: qrcode 1.5.4

---

## Project Structure

```
src/
├── components/              # React components
│   ├── __tests__/          # Component tests (co-located)
│   ├── examples/           # Example components
│   ├── sections/           # Public page sections
│   └── ui/                 # Reusable UI components
├── config/                 # Configuration files
│   ├── chartColors.ts     # Chart color schemes
│   ├── colors.ts          # Color constants
│   ├── gradients.ts       # Gradient definitions
│   ├── heights.ts         # Layout height tokens
│   ├── monitoringConfig.ts # Sentry & error monitoring
│   ├── permissions.ts     # Permission definitions
│   ├── semanticColors.ts  # Semantic color tokens
│   ├── themes.ts          # Theme configurations
│   └── colorIcons.ts      # Color-coded icon mappings
├── contexts/               # React Context providers
├── data/                  # Default data and static resources
│   └── defaults.ts        # Initial data
├── hooks/                  # Custom React hooks
├── services/               # Business logic services
│   ├── apiService.ts      # Main API service with JWT auth
│   ├── authService.ts     # Authentication service
│   ├── geminiService.ts   # AI/LLM integration
│   ├── ocrService.ts      # OCR for PPDB documents
│   ├── permissionService.ts # Role-based permissions
│   ├── speechRecognitionService.ts # Voice recognition
│   ├── speechSynthesisService.ts   # Text-to-speech
│   ├── pushNotificationService.ts # PWA notifications
│   └── [30+ services]     # See Key Services section
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions and helpers
├── constants.ts            # Centralized constants (STORAGE_KEYS, USER_ROLES, etc.)
├── config.ts               # Main configuration entry
├── App.tsx                 # Main application component
└── main.tsx                # Application entry point

__tests__/                  # Shared test utilities
  └── test-setup.ts         # Vitest configuration

scripts/                    # Build and deployment scripts
  ├── deploy-production.sh # Production deployment
  ├── setup-env.sh         # Environment setup
  └── validate-env.sh      # Environment validation
```

---

## Design Principles

### The 16 Pillars
1. **Flow**: Optimize user/system/data flow
2. **Standardization**: Consolidate patterns
3. **Stability**: Eliminate crashes/regressions
4. **Security**: Harden against threats (OWASP)
5. **Integrations**: Robust API/3rd-party handling
6. **Optimization Ops**: Identify improvements
7. **Debug**: Fix TypeErrors/Bugs
8. **Documentation**: Keep docs as Single Source of Truth
9. **Feature Ops**: Refine existing features
10. **New Features**: Identify & implement opportunities
11. **Modularity**: Atomic, reusable components
12. **Scalability**: Prepare for growth
13. **Performance**: Speed & efficiency
14. **Content/SEO**: Semantic & discoverable
15. **Dynamic Coding**: Zero hardcoded values
16. **UX/DX**: Experience for users & devs

### Core Architectural Principles

1. **Strict TypeScript**: No `any`, `unknown`, or implicit types
2. **Centralized Constants**: All magic strings in `constants.ts`
3. **Service-Oriented**: Business logic in services, not components
4. **Component-First**: Build reusable, atomic components
5. **Defensive Programming**: Error boundaries, validation, type guards
6. **Lazy Loading**: Code-split with React.lazy()
7. **Progressive Enhancement**: Core features work offline
8. **Semantic HTML**: Accessibility-first approach
9. **Zero Hardcoding**: All URLs, keys, and values in constants/env
10. **Single Source of Truth**: Documentation in blueprint.md and roadmap.md

---

## Key Services

### Core Services (Critical Path)

#### apiService.ts
- **Purpose**: Main API service with JWT authentication
- **Features**:
  - Request/response interceptors
  - Token refresh mechanism
  - Error handling
  - Type-safe API calls

#### authService.ts
- **Purpose**: Authentication and session management
- **Features**:
  - Login/logout
  - Token management
  - Session persistence
  - Password reset

#### geminiService.ts
- **Purpose**: AI/LLM integration (Google Gemini)
- **Features**:
  - Content generation
  - Quiz generation
  - AI-powered feedback
  - Smart recommendations

#### permissionService.ts
- **Purpose**: Role-based access control (RBAC)
- **Features**:
  - Permission validation
  - Role combination checks
  - Resource access control
  - Audit logging

### Voice Services

#### speechRecognitionService.ts
- **Purpose**: Browser-based speech recognition
- **Features**:
  - Voice command parsing
  - Multi-language support (ID/EN)
  - Error handling for unsupported browsers

#### speechSynthesisService.ts
- **Purpose**: Text-to-speech (TTS)
- **Features**:
  - Customizable voice settings
  - Queue management
  - Play/pause/resume controls

### Data Services

#### ocrService.ts
- **Purpose**: OCR for PPDB documents
- **Features**:
  - Tesseract.js integration
  - Image preprocessing
  - Text extraction
  - Validation queue

#### offlineDataService.ts
- **Purpose**: Offline data management
- **Features**:
  - Data synchronization
  - Queue management
  - Conflict resolution

### Notification Services

#### pushNotificationService.ts
- **Purpose**: PWA push notifications (deprecated wrapper for unified manager)
- **Features**:
  - Subscription management
  - Permission handling
  - Message queuing

#### voiceNotificationService.ts
- **Purpose**: Voice-based notifications
- **Features**:
  - TTS for notifications
  - Priority-based queuing
  - Quiet hours support

#### unifiedNotificationManager.ts
- **Purpose**: Unified notification management with voice integration
- **Features**:
  - Template management with variable substitution
  - Batch notification support
  - Analytics and history tracking
  - Voice notification integration
  - Event system for reactive updates
  - Role-based filtering
  - Quiet hours support

### Validation & Error Recovery Utilities

#### notificationValidation.ts
- **Purpose**: Comprehensive input validation for notification services
- **Features**:
   - PushNotification validation (ID, type, title, body, timestamp, priority)
   - NotificationSettings validation (enabled flags, quiet hours, categories)
   - VoiceNotificationSettings validation (voice settings, categories, ranges)
   - XSS sanitization for notification text
   - Type guards for runtime validation
   - Validation error reporting

#### voiceSettingsValidation.ts
- **Purpose**: Comprehensive input validation for voice services
- **Features**:
   - VoiceSettings validation (recognition, synthesis, enabled flags)
   - SpeechRecognitionConfig validation (language, continuous, maxAlternatives)
   - SpeechSynthesisConfig validation (rate, pitch, volume)
   - VoiceCommand validation (id, action, transcript, confidence, data)
   - VoiceLanguage validation (enum values: id-ID, en-US)
   - VoiceSettingsBackup validation (timestamp, settings structure)
   - XSS sanitization for transcripts and command data
   - Type guards for runtime validation
   - Validation error reporting
   - Sanitization of nested data objects (studentName, query, etc.)

#### errorRecovery.ts
- **Purpose**: Error recovery patterns for resilient service operation
- **Features**:
   - Retry with exponential backoff
   - Circuit breaker pattern for preventing cascading failures
   - ErrorRecoveryStrategy class (retry + circuit breaker + fallback)
   - Debounce utility
   - Throttle utility

### Additional Services (30+ total)
- **Material Services**: categoryService, materialPermissionService
- **Messaging Services**: emailService, emailQueueService
- **Monitoring Services**: errorMonitoringService, performanceMonitor
- **Theme Services**: themeManager, voiceSettingsBackup
- **Real-time Services**: webSocketService
- **File Services**: pdfExportService
- **Queue Services**: offlineActionQueueService, voiceMessageQueue
- **Cache Services**: aiCacheService
- **Notification Services**: unifiedNotificationManager, notificationTemplates
- **Parent Services**: parentGradeNotificationService
 - **Validation & Recovery**: notificationValidation, voiceSettingsValidation, errorRecovery

---

## Data Flow

### Authentication Flow
```
User → LoginModal → authService → apiService → Backend (JWT)
                           ↓
                    LocalStorage (Session)
                           ↓
                    App State (AuthSession)
```

### API Request Flow
```
Component → apiService → Request Interceptor (Add Token)
                          ↓
                          Backend (Cloudflare Workers)
                          ↓
                    Response Interceptor (Handle Errors)
                          ↓
                    Component (Update State)
```

### Voice Command Flow
```
User Speech → speechRecognitionService → voiceCommandParser
                              ↓
                         Permission Check
                              ↓
                    Action Execution (if authorized)
```

### Notification Flow
```
Event → unifiedNotificationManager → Queue Service
                      ↓
           ┌──────────┴──────────┐
           ↓                     ↓
    Push Notification    Voice Notification
           ↓                     ↓
    Browser Alert         Speech Synthesis
```

### Offline Flow
```
User Action → offlineActionQueueService → LocalStorage
                      ↓
             Background Sync (when online)
                      ↓
              Conflict Resolution (if needed)
```

---

## Component Architecture

### Component Hierarchy

```
App
├── Header
├── Footer
├── Main Content
│   ├── Public View
│   │   ├── HeroSection
│   │   ├── RelatedLinksSection
│   │   ├── ProfileSection
│   │   ├── PPDBSection
│   │   ├── ProgramsSection
│   │   └── NewsSection
│   └── Dashboard View (Role-Based)
│       ├── AdminDashboard
│       ├── TeacherDashboard
│       ├── StudentPortal
│       └── ParentDashboard
├── Modals
│   ├── LoginModal
│   ├── PPDBRegistration
│   ├── SiteEditor
│   ├── DocumentationPage
│   ├── ThemeSelector
│   └── ResetPassword
├── ChatWindow
├── Toast
└── ErrorBoundary
```

### Component Design Patterns

1. **Container/Presentational**: Separation of logic and UI
2. **Compound Components**: Composable UI elements
3. **Render Props**: Flexible rendering
4. **Higher-Order Components**: Cross-cutting concerns
5. **Custom Hooks**: Reusable logic
6. **Error Boundaries**: Graceful error handling

---

## State Management

### State Strategy

1. **Local State**: useState for component-specific state
2. **Persistence**: useLocalStorage hook for durable state
3. **Context**: React Context for app-wide state (e.g., Theme, Notifications)
4. **Server State**: API calls with caching (services)
5. **Offline State**: Offline queues for action buffering

### Storage Keys (60+ keys in STORAGE_KEYS)

All localStorage keys use `malnu_` prefix and are centralized in `src/constants.ts`:

**Categories**:
- Auth: `AUTH_SESSION`, `AUTH_TOKEN`, `REFRESH_TOKEN`
- Users: `USERS`, `USER`, `CHILDREN`
- Content: `SITE_CONTENT`, `PROGRAMS`, `NEWS`
- Academic: `GRADES`, `ASSIGNMENTS`, `CLASS_DATA`
- Materials: `MATERIALS`, `MATERIAL_FAVORITES`, `MATERIAL_RATINGS`
- PPDB: `PPDB_REGISTRANTS`, `PPDB_DRAFT`
- Notifications: `NOTIFICATION_SETTINGS_KEY`, `NOTIFICATION_HISTORY_KEY`
- Voice: `VOICE_STORAGE_KEY`, `VOICE_SETTINGS_BACKUP_KEY`
- AI: `AI_CACHE`, `CACHED_AI_ANALYSES`, `QUIZ_GENERATION_CACHE`
- OCR: `OCR_CACHE`, `OCR_PROCESSING_STATE`, `OCR_AUDIT`
- Messaging: `MESSAGES`, `CONVERSATIONS`, `ACTIVE_CONVERSATION`
- Email: `EMAIL_QUEUE`, `EMAIL_TEMPLATES`, `EMAIL_DELIVERY_HISTORY`
- WebSocket: `WS_CONNECTION`, `ANNOUNCEMENTS`, `ATTENDANCE`
- Activity: `ACTIVITY_FEED`

### Dynamic Storage Keys (Factory Functions)

Some keys are generated dynamically:
```typescript
STUDENT_GOALS(studentNIS)
STUDENT_INSIGHTS(studentId)
STUDY_PLANS(studentId)
QUIZ_ATTEMPTS(quizId)
QUIZ_ANALYTICS(quizId)
MESSAGE_DRAFTS(conversationId)
ANNOUNCEMENT_READ(announcementId, userId)
```

---

## Security Model

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Storage**: LocalStorage with refresh token mechanism
- **Session Management**: Automatic token refresh

### Authorization (RBAC)
- **Primary Roles**: admin, teacher, student, parent
- **Extra Roles**: staff, osis, wakasek, kepsek
- **Permission Service**: Validates access to resources
- **Resource-Level Control**: Granular permissions per module

### Security Measures
1. **Input Validation**: All inputs validated before processing
2. **XSS Prevention**: React's built-in escaping
3. **CSRF Protection**: Token-based validation
4. **Content Security Policy**: CSP headers (configured in deployment)
5. **Error Handling**: No sensitive data in error messages
6. **Dependency Scanning**: `npm run security:scan`
7. **Secrets Scanning**: `detect-secrets` integration
8. **OWASP Compliance**: Following OWASP guidelines

### Environment Variables
- `VITE_GEMINI_API_KEY`: Google Gemini API key
- `VITE_API_BASE_URL`: Backend API endpoint
- Environment validation via `npm run env:validate`

---

## PWA & Offline Strategy

### PWA Configuration
- **Display Mode**: Standalone
- **Orientation**: Portrait
- **Theme Color**: #10b981 (Emerald-500)
- **Icons**: 192x192 and 512x512 SVG

### Service Worker Strategy
- **Registration Type**: AutoUpdate
- **Caching Strategy**:
  - CSS: StaleWhileRevalidate (24h TTL)
  - Fonts: CacheFirst (365d TTL)
  - Assets: Static caching

### Offline Support
1. **Service Worker**: Caches static assets
2. **Offline Queue**: Buffers actions when offline
3. **Background Sync**: Syncs when online
4. **Conflict Resolution**: Merges changes from multiple clients
5. **Offline Indicator**: Visual feedback for offline state

### Key Features
- Offline-first data loading
- Queued action synchronization
- Real-time updates when online
- Graceful degradation

---

## Performance Optimization

### Code Splitting
- **Vendor Chunks**: Separated by library
  - `vendor-genai`: @google/genai
  - `vendor-tesseract`: tesseract.js
  - `vendor-jpdf`: jsPDF + html2canvas
  - `vendor-charts`: recharts
  - `vendor-icons`: @heroicons/react

### Lazy Loading
- **Modals**: DocumentationPage, SiteEditor, PPDBRegistration, ResetPassword
- **Dashboards**: StudentPortal, AdminDashboard, TeacherDashboard, ParentDashboard
- **Sections**: HeroSection, RelatedLinksSection, ProfileSection, ProgramsSection, NewsSection, PPDBSection

### Bundle Optimization
- **Minification**: Terser with console/debugger removal
- **Tree Shaking**: Dead code elimination
- **Target**: ESNext for modern browsers

---

## Testing Strategy

### Unit Testing
- **Framework**: Vitest
- **UI Testing**: React Testing Library
- **Coverage**: Co-located tests in `__tests__/` folders

### E2E Testing
- **Framework**: Playwright
- **Scenarios**: User flows, critical paths

### Test Commands
```bash
npm test              # Run unit tests
npm run test:ui       # Run tests with UI
npm run test:run      # Run tests without UI
npm run test:e2e      # Run E2E tests
npm run test:all      # Run all tests
```

### Test Configuration
- **Test Timeout**: 10 seconds per test (explicitly configured)
- **Hook Timeout**: 10 seconds for setup/teardown hooks
- **Test Discovery**: Excludes `.opencode` directory from test discovery
- **Include Pattern**: `src/**/*.{test,spec}.{js,jsx,ts,tsx}`, `__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}`
- **Exclude Pattern**: `node_modules`, `dist`, `.idea`, `.git`, `.cache`, `.opencode`, `e2e`

---

## Deployment

### Development
```bash
npm run dev              # Frontend dev server
npm run dev:backend      # Backend dev server
```

### Production
```bash
npm run build            # Build for production
npm run preview          # Preview production build
npm run deploy:prod      # Deploy both frontend and backend
```

### Backend Deployment
```bash
wrangler deploy --env=""          # Dev environment
wrangler deploy --env production  # Production environment
```

### Frontend Deployment
```bash
wrangler pages deploy dist --project-name=malnu-kananga
```

---

## Monitoring & Observability

### Error Tracking
- **Service**: Sentry
- **Scope**: Browser + React + Tracing
- **Features**: Error aggregation, performance monitoring

### Performance Monitoring
- **Service**: Custom performanceMonitor.ts
- **Metrics**: Page load, API latency, user interactions

### Logging
- **Service**: Custom logger.ts
- **Levels**: info, warn, error
- **Output**: Console + Sentry (production)

---

## Accessibility

### Standards
- **WCAG 2.1**: Level AA compliance
- **ARIA**: ARIA labels for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators

### Key Features
- Skip links for keyboard users
- Semantic HTML elements
- Alt text for images
- Screen reader announcements
- Color contrast ratios (verified)

---

## Code Quality

### Linting
```bash
npm run lint              # Run ESLint
npm run lint:fix          # Auto-fix lint issues
```

### Type Checking
```bash
npm run typecheck         # Run TypeScript compiler
```

### Pre-commit Hooks
- **Husky**: Git hooks
- **lint-staged**: Lint staged files
- **Auto-fix**: Runs on commit

### ESLint Configuration
- **Parser**: TypeScript ESLint
- **Plugins**: React, React Hooks, React Refresh
- **Max Warnings**: 20

---

## API Endpoints

### Base URL
- Development: Configured via `VITE_API_BASE_URL`
- Production: Configured via environment variable

### Key Endpoints
- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Grades: `/api/grades/*`
- Assignments: `/api/assignments/*`
- Materials: `/api/materials/*`
- PPDB: `/api/ppdb/*`
- Notifications: `/api/notifications/*`
- AI: `/api/ai/*`
- OCR: `/api/ocr/*`

### API Features
- JWT authentication
- Request/response interceptors
- Error handling
- Token refresh
- Rate limiting (backend)

---

## Version Control

### Git Workflow
- **Main Branch**: Default branch
- **Feature Branches**: `feature/feature-name`
- **Bug Fixes**: `fix/bug-description`
- **Branch Protection**: Enabled (configured in repository)

### Commit Messages
- **Conventional Commits**: feat, fix, docs, chore, test, refactor
- **Format**: `type(scope): description`

---

## Documentation

### Single Source of Truth
- **Architecture**: This file (blueprint.md)
- **Roadmap**: roadmap.md
- **Tasks**: task.md
- **Agent Config**: AGENTS.md

### API Documentation
- OpenAPI/Swagger (backend)
- JSDoc comments (frontend)

---

## Future Architecture Considerations

### Scalability
- **Load Balancing**: Cloudflare Workers (auto-scaling)
- **Database**: D1 (SQLite with scaling)
- **CDN**: Cloudflare CDN for assets

### Modularity
- **Micro-frontends**: Potential future split
- **Module Federation**: Code sharing between deployments
- **Feature Flags**: Rollout new features safely

### Performance
- **Web Workers**: Offload heavy computations
- **IndexedDB**: Larger offline storage
- **WebRTC**: Real-time features (if needed)

---

## Contact

**Project Maintainer**: Lead Autonomous Engineer & System Guardian
**School**: MA Malnu Kananga
**Website**: https://ma-malnukananga.sch.id
**Email**: admin@malnu-kananga.sch.id

---

**Last Review**: 2026-01-22
**Next Review**: 2026-02-22
