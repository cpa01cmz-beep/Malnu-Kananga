# MA Malnu Kananga - Blueprint
**Architecture & System Design Document**
**Version**: 3.4.3
**Last Updated**: 2026-01-16 (Bundle Optimization Complete)
**Next Review**: 2026-02-16

---

## 18. RECENT CHANGES (2026-01-16)

### Bundle Size Optimization Completed

**Updated Files**:
- `src/App.tsx` - Lazy loading added for LoginModal, ChatWindow, ThemeSelector
- `vite.config.ts` - Improved chunk splitting strategy, removed vendor-react circular dependency

**Key Improvements**:
- Main bundle size reduced by 27.9% (552 KB → 398 KB)
- New vendor chunks created: i18n (50 KB), purify (23 KB), papaparse (19 KB), qrcode (25 KB)
- Circular chunk dependency warning fixed (removed vendor-react chunk)
- TeacherDashboard size reduced by 23% (184 KB → 141 KB)
- Advanced code splitting implemented for better lazy loading

**Configuration Changes** (vite.config.ts):
- Added vendor-i18n chunk for i18next library
- Added vendor-purify chunk for DOMPurify library
- Added vendor-papaparse chunk for CSV parsing library
- Added vendor-qrcode chunk for QR code generation
- Removed vendor-react chunk to prevent circular dependency with vendor-charts
- Added pure_funcs to terser options for console.log removal
- Reduced chunkSizeWarningLimit from 600 KB to 500 KB

**Test Coverage**:
- All tests passing (1895/1895, 73 skipped)
- Typecheck passing (0 errors)
- Lint passing (0 errors)

---

## 17. RECENT CHANGES (2026-01-15)

### Voice Command Expansion Completed

**New Files**:
- `src/services/__tests__/voiceCommandParser.test.ts` - Voice command parser tests (100+ tests)
- `src/hooks/__tests__/useDashboardVoiceCommands.test.ts` - Dashboard voice commands hook tests (60+ tests)
- `docs/VOICE_COMMANDS_REFERENCE.md` - Comprehensive voice commands documentation (600+ lines)

**Updated Files**:
- `src/constants.ts` - Expanded VOICE_COMMANDS from 28 to 58+ commands
- `src/services/voiceCommandParser.ts` - Added 30+ new command patterns
- `src/hooks/useDashboardVoiceCommands.ts` - Updated role-based command availability

**Key Features**:
- 58+ voice commands across all user roles (admin, teacher, student, parent)
- Bilingual support (Indonesian, English) for all commands
- Query extraction for search and parameterized commands
- Context-aware command filtering by user role
- Enhanced ELibrary, Chat, and Notification commands
- Lesson planning voice commands (generate, save, export)
- Common commands: toggle theme, change language, refresh, zoom, documentation
- Fuzzy matching with Jaccard similarity algorithm (70% threshold)

**Command Categories**:
- Common (12): Settings, navigation, help, theme, language, refresh, zoom, documentation
- Admin (11): PPDB, grades, library, calendar, statistics, users, permissions, AI cache, site editor, performance dashboard
- Teacher (11): Classes, grading, attendance, announcements, schedule, materials, inventory, lesson planning
- Student (7): Grades, attendance, insights, library, OSIS events, learning modules
- Parent (11): Child grades, attendance, schedule, profile, notifications, events, messaging, payments, meetings, reports
- ELibrary (3): Browse, download, open materials
- Chat (2): Reply, message history
- Notifications (3): Settings, clear, history
- Speech/TTS (5): Stop, pause, resume speaking, read all, clear chat, send message, toggle voice

**Test Coverage**:
- Voice command parser tests: 100+ tests
- Dashboard voice commands hook tests: 60+ tests
- Total voice command tests: 160+ tests
- Typecheck passing (0 errors)
- Lint passing (2 warnings from unrelated code, 0 errors)

---

### Internationalization (i18n) Completed

**New Files**:
- `src/i18n/config.ts` - i18next configuration with language detection
- `src/i18n/locales/en.json` - English translations (500+ keys)
- `src/i18n/locales/id.json` - Indonesian translations (500+ keys)
- `src/hooks/useLanguage.ts` - Language management custom hook
- `src/components/LanguageSwitcher.tsx` - Language switcher UI component
- `docs/I18N_GUIDE.md` - Comprehensive i18n documentation (500+ lines)

**Updated Files**:
- `src/index.tsx` - Added i18n initialization
- `src/constants.ts` - Added STORAGE_KEYS.LANGUAGE
- `package.json` - Added i18next, react-i18next, i18next-browser-languagedetector

**Test Files**:
- `src/i18n/__tests__/config.test.ts` - i18n configuration tests (14 tests)
- `src/hooks/__tests__/useLanguage.test.ts` - Hook tests (8 tests)
- `src/components/__tests__/LanguageSwitcher.test.tsx` - Component tests (11 tests)

**Key Features**:
- Multi-language support (Bahasa Indonesia, English)
- Automatic language detection (localStorage, browser)
- Language persistence in localStorage
- Comprehensive translation coverage (20 sections, 500+ keys)
- Language switcher component with ARIA attributes
- Custom hook for language management

**Translation Sections**:
- app, common, navigation, auth, dashboard, users, attendance, grades, materials, notifications, settings, language, errors, messages, forms, ppdb, ai, voice, accessibility, offline, export, time, validation

**Test Coverage**:
- Total i18n tests: 33
- All tests passing (33/33)
- Typecheck passing (0 errors)
- Lint passing (2 warnings from unrelated code, 0 errors)

---

### Mobile Optimization Completed

**New Files**:
- `src/utils/mobilePerformanceOptimization.ts` - Advanced mobile performance optimization utilities (22 functions)
- `docs/MOBILE_TESTING_GUIDE.md` - Comprehensive mobile testing guide (300+ lines)

**Updated Files**:
- `eslint.config.js` - Added mobile-related globals (TouchEvent, Screen, Navigator, Window, getComputedStyle, MediaQueryList)

**Key Features**:
- Network quality detection (slow-2g, 2g, 3g, 4g)
- Low-end device detection (memory, cores, pixel ratio)
- Low power mode detection (battery level)
- Reduced motion detection (prefers-reduced-motion)
- Adaptive animation quality (high/medium/low)
- Optimal image quality adjustment
- Dynamic debounce/throttle delays
- Lazy loading optimization
- Concurrent request limiting

**Test Coverage**:
- 34 tests added for mobilePerformanceOptimization
- Total mobile optimization tests: 113
- All typecheck passing (0 errors)
- Lint passing (2 warnings, 0 errors)

---

## 1. SYSTEM OVERVIEW

MA Malnu Kananga is a modern, AI-powered school management system designed for Indonesian schools (SMA/SMK). The system provides comprehensive functionality for administrators, teachers, students, and parents with emphasis on accessibility, offline support, and intelligent automation.

**Accessibility Status**: ✓ WCAG 2.1 AA Compliant (2026-01-15)

### 1.1 Core Philosophy
- **Accessibility First**: Voice commands, text-to-speech, keyboard navigation
- **Offline-First**: Progressive Web App (PWA) with service worker
- **AI-Powered**: Google Gemini integration for intelligent assistance
- **Role-Based Access**: Granular permissions for 8 user roles
- **Real-Time**: WebSocket support for live updates

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Vite | Modern reactive UI with type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Backend** | Cloudflare Workers | Serverless API endpoints |
| **Database** | Cloudflare D1 (SQLite) | Relational database |
| **Storage** | Cloudflare R2 | S3-compatible file storage |
| **AI** | Google Gemini API | LLM integration for AI features |
| **OCR** | Tesseract.js | Document recognition for PPDB |
| **Charts** | Recharts | Data visualization |
| **PDF** | jsPDF, jsPDF-AutoTable | PDF generation |
| **Testing** | Vitest, React Testing Library | Unit and integration tests |
| **PWA** | vite-plugin-pwa, Workbox | Offline capabilities |

---

## 2. ARCHITECTURE PATTERNS

### 2.1 Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Components, Pages, Hooks)             │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  (Services, Contexts, Utils)           │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│  (API Service, Storage)                │
├─────────────────────────────────────────┤
│         Infrastructure Layer           │
│  (Cloudflare Workers, D1, R2)          │
└─────────────────────────────────────────┘
```

### 2.2 Service-Oriented Architecture

**Core Services**:
- `apiService.ts` - RESTful API communication with JWT auth
- `authService.ts` - Authentication and session management
- `geminiService.ts` - AI/LLM integration with caching
- `speechRecognitionService.ts` - Voice-to-text (Web Speech API)
- `speechSynthesisService.ts` - Text-to-speech (Web Speech API)
- `pushNotificationService.ts` - PWA notifications
- `ocrService.ts` - Document OCR for PPDB registration
- `permissionService.ts` - Role-based access control (RBAC)
- `lessonPlanService.ts` - AI-powered lesson planning with templates and PDF export
- `analyticsService.ts` - Comprehensive analytics aggregation with caching (600+ lines)

**Supporting Services**:
- `webSocketService.ts` - Real-time communication with message queuing, deduplication, and health monitoring
- `aiCacheService.ts` - AI response caching
- `lessonPlanService.ts` - AI-powered lesson plan generation with Gemini 2.5 Flash
- `emailService.ts` - Email queue and templates
- `pdfExportService.ts` - PDF generation
- `themeManager.ts` - Theme management (light/dark)
- `storageMigration.ts` - localStorage schema migrations
- `voiceSettingsBackup.ts` - Voice settings synchronization
- `performanceMonitor.ts` - Core Web Vitals tracking, performance budgets, and alerting

**Mobile Optimization** (New - 2026-01-15)
- `mobileOptimization.ts` - Mobile device detection, touch targets, performance optimization
- `hapticFeedback.ts` - Haptic feedback utilities with predefined patterns
- `mobilePerformanceOptimization.ts` - Advanced mobile performance optimization (network quality, low-end detection, adaptive quality)

### 2.3 Data Flow

**Request Flow**:
```
Component → Hook → Service → API Service → Backend Worker → D1/R2
               ↓         ↓
            Context    Cache
```

**Error Handling Flow**:
```
Error → errorHandler.ts → logger.ts → Toast Notification
           ↓
      Error Boundary (React)
```

---

## 3. KEY COMPONENTS

### 3.1 Dashboard Architecture

**AnalyticsDashboard** (`src/components/AnalyticsDashboard.tsx`)
- School-wide analytics with 50+ metrics
- Student performance analytics with grade trends
- Teacher effectiveness metrics
- Interactive data visualization (4 chart types)
- Date range filtering (presets + custom)
- Export functionality (PDF/Excel/CSV)
- AI-powered insights and recommendations
- Role-based dashboards (admin, student, teacher)
- Caching system for performance optimization
- Accessibility compliant (WCAG 2.1 AA)

**CustomReportBuilder** (`src/components/CustomReportBuilder.tsx`)
- Full custom report builder with metric/chart/table selection
- Report template management (save, load, delete, duplicate)
- Template persistence in localStorage
- Role-based filtering of available options
- Integration with existing analytics service
- Export functionality for custom reports (PDF/Excel)
- Real-time report preview
- Accessibility compliant (WCAG 2.1 AA)

**AnalyticsCharts** (`src/components/analytics/AnalyticsCharts.tsx`)
- PerformanceTrendChart - Line chart with moving average
- AttendanceChart - Area chart with stacked data
- GradeDistributionChart - Line chart for grade breakdown
- SubjectComparisonChart - Multi-line comparison chart

**DateRangeFilter** (`src/components/analytics/DateRangeFilter.tsx`)
- Preset date ranges (Today, 7 Days, 30 Days, 3 Months, Year)
- Custom date range picker
- Real-time filter application
- Accessible UI with ARIA labels

**AdminDashboard** (`src/components/AdminDashboard.tsx`)
- User management
- System statistics
- Site content editing
- Permission management

**TeacherDashboard** (`src/components/TeacherDashboard.tsx`)
- Attendance management
- Grading system
- Material management
- Student insights

**ParentDashboard** (`src/components/ParentDashboard.tsx`)
- Child overview
- Attendance view
- Grades view
- Payments view
- Schedule view

**StudentPortal** (`src/components/StudentPortal.tsx`)
- Academic grades
- Learning modules
- E-Library access

### 3.2 Feature Modules

**PPDB (Penerimaan Peserta Didik Baru)**
- Registration form (`PPDBRegistration.tsx`)
- Management (`PPDBManagement.tsx`)
- OCR document processing (`ocrService.ts`)
- Queue management (`BatchManagement.tsx`)

**Academic Management**
- Attendance tracking (`AttendanceView.tsx`)
- Grading system (`GradingManagement.tsx`, `AcademicGrades.tsx`)
- Calendar management (`CalendarView.tsx`)
- Class management (`ClassManagement.tsx`)

**Communication**
- Chat system (`ChatWindow.tsx`)
- Notifications (`NotificationCenter.tsx`, `NotificationSettings.tsx`)
- Email notifications (`emailService.ts`)

**AI & Voice Features**
- Voice commands (`useVoiceCommands.ts`, `voiceCommandParser.ts`)
- Voice notifications (`voiceNotificationService.ts`)
- AI cache manager (`AICacheManager.tsx`)
- AI-powered content editing
- AI-powered lesson planning (`LessonPlanning.tsx`, `lessonPlanService.ts`)

### 3.3 UI Component Library

**Base Components** (`src/components/ui/`)
- Button, Input, Label, Select, Textarea
- Card, Modal, Dialog
- LoadingSpinner, Toast
- Tabs, Accordion, Pagination

**Specialized Components**
- Icon components (30+ from Heroicons)
- ImageWithFallback
- VoiceCommandsHelp
- VoiceSettings
- ThemeSelector
- WebSocketStatus

---

## 4. STATE MANAGEMENT

### 4.1 React Context

| Context | Purpose | Location |
|---------|---------|----------|
| `NotificationContext` | Global notifications | `src/contexts/` |
| `AuthContext` | Authentication state | Derived from authService |
| `ThemeContext` | Theme (light/dark) | Via useTheme hook |

### 4.2 Custom Hooks (70+)

**Authentication & Permissions**
- `useCanAccess` - Permission checking
- `usePermissions` - Permission service integration
- `useErrorHandler` - Centralized error handling

**Voice & AI**
- `useVoiceRecognition` - Speech recognition
- `useVoiceSynthesis` - Text-to-speech
- `useVoiceCommands` - Voice command parsing
- `useVoiceQueue` - Voice message queuing
- `useVoiceNotifications` - Voice notification alerts
- `useAICache` - AI response caching
- `useDashboardVoiceCommands` - Dashboard-specific commands
- `useLessonPlanning` - Lesson planning state management and AI generation

**Data Management**
- `useForm` - Form state management
- `useLocalStorage` - localStorage persistence
- `useAutoSave` - Auto-save functionality
- `useFieldValidation` - Field validation
- `useSemanticSearch` - Content search
- `usePerformanceMonitor` - Performance monitoring integration

**Real-Time & Events**
- `useWebSocket` - WebSocket connection
- `useEventNotifications` - Event-based notifications
- `useUnifiedNotifications` - Unified notification system

**User-Specific**
- `useStudentInsights` - Student analytics
- `useNotifications` - User notifications

**Mobile Optimization** (New - 2026-01-15)
- `useMobileOptimization` - Mobile state and metrics (isTouchDevice, isMobile, orientation, screen size)
- `useTouchGestures` - Touch gesture handling (swipe, pinch, tap, long press)
- `useHapticFeedback` - Haptic feedback triggering (tap, success, error, warning)
- `useTouchTarget` - Touch target size optimization
- `usePreventDoubleTap` - Prevent double-tap execution
- `useDebounce` - Debounce function
- `useThrottle` - Throttle function
- `useMobileMetrics` - Mobile performance metrics collection
- `useOrientation` - Device orientation tracking

### 4.3 Storage Strategy

**localStorage Keys** (60+ keys, all prefixed with `malnu_`)
- Authentication: `malnu_auth_session`, `malnu_users`
- Site Content: `malnu_site_content_*`
- Materials: `malnu_materials_*`
- Notifications: `malnu_notifications_*`
- Voice Settings: `malnu_voice_*`
- AI Cache: `malnu_ai_cache_*`
- Lesson Plans: `malnu_lesson_plans`
- PPDB: `malnu_ppdb_*`
- Offline Data: `malnu_offline_*`

**Storage Keys Constants**: `src/constants.ts` - `STORAGE_KEYS`, `PERFORMANCE_CONFIG`, `MOBILE_CONFIG`

---

## 5. SECURITY ARCHITECTURE

### 5.1 Authentication & Authorization

**JWT-Based Authentication**
- Access tokens with expiration
- Refresh token mechanism
- Secure token storage (httpOnly cookies recommended for production)

**Role-Based Access Control (RBAC)**
- Primary roles: `admin`, `teacher`, `student`, `parent`
- Extra roles: `staff`, `osis`, `wakasek`, `kepsek`
- Permission matrix in `src/config/permissions.ts`
- Permission service (`permissionService.ts`)

### 5.2 Security Measures

- **OWASP Compliance**: Input validation, XSS prevention, CSRF protection
- **Environment Variables**: `.env.example` provided, never commit `.env`
- **Secret Scanning**: `npm run secrets:scan` with detect-secrets
- **Security Audit**: `npm run security:scan` with audit-ci
- **API Security**: Rate limiting, input sanitization, SQL injection prevention (parameterized queries in D1)
- **Content Security Policy**: Configured in Vite/PWA

---

## 6. OFFLINE & PWA ARCHITECTURE

### 6.1 Progressive Web App

**Service Worker**: Workbox via vite-plugin-pwa
- Offline page caching
- Runtime caching strategies
- Background sync for offline actions
- Update notifications

**Offline Queue**: `offlineQueue` in localStorage
- Queued API requests
- Retry mechanism with exponential backoff
- Conflict resolution

### 6.2 Offline Support Components

- `OfflineIndicator` - Displays connection status
- `OfflineBanner` - Alerts when offline
- Network monitoring (`networkStatus.ts`)
- Auto-sync on reconnection

**Test Coverage**: 88 test files with offline test suites (including lesson planning tests)

---

## 7. TESTING STRATEGY

### 7.1 Test Framework

- **Unit/Integration Runner**: Vitest
- **E2E Runner**: Playwright
- **Rendering**: React Testing Library
- **Mocking**: Vitest mocking, `__mocks__` directory

### 7.2 Test Categories

| Type | Purpose | Count |
|------|---------|-------|
| Unit Tests | Service/utility logic | 60+ files |
| Component Tests | React component behavior | 50+ files |
| Integration Tests | Service/component integration | 15+ files |
| Offline Tests | PWA offline functionality | 10+ files |
| Accessibility Tests | ARIA, keyboard nav | 8+ files |
| E2E Tests | Critical user journeys | 50+ tests |

**Total**: 1565 unit/integration tests + 50+ E2E tests (86 test files, 11 skipped)

### 7.3 E2E Test Configuration

**Playwright Setup** (`playwright.config.ts`):
- **Test Timeout**: 30 seconds
- **Action Timeout**: 10 seconds
- **Navigation Timeout**: 30 seconds
- **Retry on CI**: 2 retries
- **Projects**:
  - Chromium (Desktop)
  - Firefox (Desktop)
  - WebKit (Desktop Safari)
  - Mobile Chrome (Pixel 5)
  - Mobile Safari (iPhone 12)
- **Base URL**: http://localhost:5173 (configurable via BASE_URL env var)

**E2E Test Coverage**:
- **Authentication**: Login/logout for 4 user roles (admin, teacher, parent, student)
- **Dashboards**: Admin, Teacher, Parent, Student portal navigation
- **Critical Journeys**:
  - Admin login and dashboard access
  - Teacher attendance marking
  - Parent viewing grades
  - Student accessing materials
  - PPDB registration flow
- **Visual Regression**: All major pages, mobile views, modal components
- **Accessibility**: WCAG 2.1 AA compliance E2E verification

**Test Data**:
- Test credentials defined in each test file
- No production data used
- Test isolation between runs

**CI/CD Integration**:
- GitHub Actions workflow: `.github/workflows/e2e-tests.yml`
- Parallel execution across browsers
- Artifact retention: 7 days
- Report merging and PR commenting
- Visual regression testing separate job

### 7.4 Test Organization

```
src/
├── services/__tests__/         # Service unit tests
├── hooks/__tests__/           # Hook tests
├── components/__tests__/       # Component tests
├── utils/__tests__/           # Utility tests
└── __tests__/                 # Integration tests

e2e/
├── admin-dashboard.spec.ts    # Admin authentication and dashboard
├── teacher-dashboard.spec.ts   # Teacher dashboard functionality
├── parent-dashboard.spec.ts    # Parent dashboard functionality
├── student-portal.spec.ts     # Student portal functionality
├── ppdb-registration.spec.ts  # PPDB registration flow
├── accessibility.spec.ts       # Accessibility E2E tests
├── visual-regression.spec.ts  # Visual regression tests
└── utils.ts                   # Test utilities and helpers
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Frontend Optimization

- **Code Splitting**: React.lazy, dynamic imports (2026-01-16: Enhanced lazy loading for LoginModal, ChatWindow, ThemeSelector)
- **Memoization**: React.memo, useMemo, useCallback
- **Bundle Size**: Vite optimizations, tree shaking, vendor chunking (2026-01-16: Main bundle reduced 27.9% from 552 KB to 398 KB)
- **Image Optimization**: Lazy loading, WebP support
- **Voice Optimization**: Debouncing, throttling (`voiceOptimization.ts`)

**Bundle Size Metrics** (2026-01-16):
- Main bundle: 398 KB (gzip: 117 KB) - 27.9% reduction
- Vendor-charts: 388 KB (Recharts)
- Vendor-jpdf: 380 KB (jsPDF)
- Vendor-genai: 248 KB (Google GenAI)
- Vendor-html2canvas: 196 KB
- New vendor chunks: i18n (50 KB), purify (23 KB), papaparse (19 KB), qrcode (25 KB)
- Dashboards: Teacher (141 KB), Parent (97 KB), Student (72 KB), Admin (57 KB)

### 8.2 Backend Optimization

- **Serverless Functions**: Cloudflare Workers (auto-scaling)
- **Database Indexing**: Optimized D1 queries
- **Caching Strategy**: AI response caching, localStorage caching
- **CDN Distribution**: Cloudflare Pages + Workers

### 8.3 Monitoring & Analytics

- **Error Tracking**: Centralized error handler (`errorHandler.ts`)
- **Logging**: Structured logging (`logger.ts`)
- **Performance Monitoring**: Web Vitals (configured in PWA)
- **System Stats**: `SystemStats.tsx` component

---

## 9. DEPLOYMENT ARCHITECTURE

### 9.1 Environments

| Environment | Purpose | Branch |
|------------|---------|--------|
| Development | Local development | feature/* |
| Staging | Pre-production testing | develop |
| Production | Live system | main |

### 9.2 Deployment Pipeline

**Frontend (Cloudflare Pages)**:
```bash
npm run build
wrangler pages deploy dist --project-name=malnu-kananga
```

**Backend (Cloudflare Workers)**:
```bash
wrangler deploy --env production
```

**Automated Deployment**:
- `npm run deploy:prod` - Production deployment script
- GitHub Actions in `.github/workflows/`

### 9.3 Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Cloudflare Pages | Static site deployment |
| Backend API | Cloudflare Workers | Serverless functions |
| Database | Cloudflare D1 | SQLite database |
| File Storage | Cloudflare R2 | S3-compatible storage |
| DNS/CDN | Cloudflare | Global CDN, DDoS protection |

---

## 10. CONFIGURATION MANAGEMENT

### 10.1 Configuration Files

| File | Purpose |
|------|---------|
| `src/config.ts` | Main application config |
| `src/config/api.ts` | API endpoints (environment-based) |
| `src/config/permissions.ts` | RBAC permission matrix |
| `src/config/themes.ts` | Theme definitions |
| `src/config/colors.ts` | Color palette |
| `src/config/gradients.ts` | Gradient definitions |
| `vite.config.ts` | Build configuration |
| `wrangler.toml` | Cloudflare Workers config |
| `wrangler.pages.toml` | Cloudflare Pages config |
| `.env.example` | Environment variables template |

**Constants Files**:
| File | Purpose |
|------|---------|
| `src/constants.ts` | Centralized constants (STORAGE_KEYS, IMAGE_URLS, EXTERNAL_LINKS, etc.) |

### 10.2 Environment Variables

**Required**:
- `VITE_API_BASE_URL` - Backend API URL (no default, must be set)
- `GEMINI_API_KEY` - Google Gemini API key (for AI features)

**Optional**:
- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking
- `VITE_ENVIRONMENT` - Environment identifier

---

## 11. API ARCHITECTURE

### 11.0 WebSocket Reliability Enhancements (New - 2026-01-16)

**Enhanced WebSocket Service Features**:

**Message Queue (Offline Buffering)**:
- Queue outbound messages when connection is lost
- Maximum queue size: 100 messages
- Message TTL: 5 minutes (expires old messages)
- Automatic retry with exponential backoff (max 3 retries)
- Priority-based message delivery
- Persistent storage in localStorage (`STORAGE_KEYS.WS_MESSAGE_QUEUE`)

**Message Deduplication**:
- Track received message IDs to prevent duplicates
- Deduplication window: 5 minutes
- Map-based cache for efficient lookup
- Automatic cleanup of expired entries
- Persistent storage in localStorage (`STORAGE_KEYS.WS_DEDUPLICATION_CACHE`)

**Health Monitoring**:
- Real-time latency tracking via ping/pong round-trip
- Message delivery success rate calculation
- Connection uptime tracking
- Connection quality rating (excellent/good/fair/poor/offline)
- Health check interval: 60 seconds
- Metrics: latency (ms), delivery rate (0-1), uptime (ms), messages sent/received/delivered/failed
- Thresholds: max latency 5000ms, min delivery rate 90%

**Enhanced Reconnection**:
- Exponential backoff with random jitter (0-1000ms)
- Prevents thundering herd on reconnection
- Max reconnection attempts: 10 (increased from 5)
- Base delay: 5000ms
- Formula: `delay = 5000 * 2^(attempt-1) + random(0-1000)`
- Automatic fallback to polling after max attempts

**Graceful Degradation**:
- Fallback polling interval: 30 seconds
- Automatic fallback when WebSocket fails
- Polling endpoint: `/api/updates`
- Continues to sync data via HTTP
- Seamless switch between WebSocket and polling

**Structured Logging**:
- Comprehensive logging with context objects
- Connection attempt logging with delay and jitter info
- Message queue operation logging
- Health metrics logging on disconnect
- Poor connection quality warnings
- Error handling with full context

**Storage Persistence**:
- Message queue: `malnu_ws_message_queue`
- Deduplication cache: `malnu_ws_deduplication_cache`
- Connection state: `malnu_ws_connection`
- Automatic cleanup of expired entries
- Restoration on service restart

**New Interfaces**:
```typescript
interface QueuedMessage {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  priority: number;
  retryCount: number;
  maxRetries: number;
}

interface WebSocketHealthMetrics {
  connected: boolean;
  uptime: number;
  lastConnected?: string;
  lastDisconnected?: string;
  latency: number;
  deliverySuccessRate: number;
  messagesSent: number;
  messagesReceived: number;
  messagesDelivered: number;
  messagesFailed: number;
  reconnectAttempts: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
}
```

**Configuration Constants**:
```typescript
WS_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 10,        // Increased from 5
  RECONNECT_DELAY: 5000,             // Base delay (ms)
  CONNECTION_TIMEOUT: 10000,            // Connection timeout (ms)
  PING_INTERVAL: 30000,              // Heartbeat interval (ms)
  FALLBACK_POLLING_INTERVAL: 30000,    // Fallback polling (ms)
  MESSAGE_QUEUE_MAX_SIZE: 100,         // Max queued messages
  MESSAGE_QUEUE_TTL: 300000,           // Message expiry (5 min)
  DEDUPLICATION_WINDOW: 300000,        // Deduplication window (5 min)
  HEALTH_CHECK_INTERVAL: 60000,         // Health check interval (1 min)
  MAX_LATENCY_THRESHOLD: 5000,          // Max acceptable latency (5 sec)
  MIN_DELIVERY_RATE_THRESHOLD: 0.9,    // Min acceptable delivery rate (90%)
}
```

**Test Coverage**: 40+ new tests added
- Message queue tests (queueing, expiration, size limits, reconnection processing)
- Message deduplication tests (ID tracking, window, duplicate detection)
- Health monitoring tests (latency tracking, delivery rate, quality calculation, uptime)
- Reconnection tests (jitter, exponential backoff, max attempts, fallback)
- Structured logging tests (connection, queue, health metrics, quality warnings)
- Graceful degradation tests (polling fallback, error handling, callback errors)
- Storage persistence tests (queue, cache, connection state)
- API getter tests (health metrics, connection state)

**Impact**:
- ✓ Improved connection reliability with jitter-based reconnection
- ✓ No message loss during network interruptions (message queue)
- ✓ Zero duplicate message processing (deduplication)
- ✓ Real-time visibility into connection health (monitoring)
- ✓ Better debugging with structured logging
- ✓ Seamless fallback to polling when WebSocket unavailable
- ✓ Foundation for Q3 2026 Milestone 3.0 (Real-Time Collaboration)

---

### 11.1 RESTful Endpoints

**Authentication**:
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

**User Management**:
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Academic**:
- `GET /api/academic/attendance` - Get attendance
- `POST /api/academic/attendance` - Record attendance
- `GET /api/academic/grades` - Get grades
- `POST /api/academic/grades` - Submit grades

**PPDB**:
- `POST /api/ppdb/register` - PPDB registration
- `GET /api/ppdb/applications` - List applications
- `POST /api/ppdb/ocr` - Process OCR document

**AI**:
- `POST /api/ai/generate` - Generate AI response
- `POST /api/ai/validate` - Validate AI response

### 11.2 WebSocket Events

**Real-Time Updates**:
- `notification:new` - New notification
- `attendance:update` - Attendance updated
- `grade:update` - Grade updated
- `message:new` - New chat message
- `system:status` - System status update

### API Documentation

**OpenAPI Specification** (`docs/openapi.yaml`):
- Complete OpenAPI 3.0 specification for all REST endpoints
- Machine-readable format for Swagger UI, Postman, and code generation tools
- Comprehensive request/response schemas with TypeScript types
- Authentication and authorization documentation
- Error response documentation

**WebSocket API** (`docs/WEBSOCKET_API.md`):
- Complete WebSocket connection and event documentation
- Event schemas for all real-time updates (grades, attendance, announcements, events)
- Client and server message specifications
- Reconnection strategies with exponential backoff
- Security considerations and best practices
- React integration examples

**Swagger UI Setup** (`docs/SWAGGER_SETUP.md`):
- Complete guide for setting up Swagger UI
- Multiple deployment options (Vite, static, Cloudflare Workers)
- Configuration options and customization
- Authentication setup for Bearer tokens
- Production deployment considerations

**REST API Reference** (`docs/api-reference.md`):
- Comprehensive REST API documentation (1762 lines)
- Detailed endpoint descriptions with examples
- cURL and TypeScript code examples
- Security best practices
- Rate limiting information

---

## 12. DESIGN SYSTEM

### 12.1 Color System

**Semantic Colors** (`src/config/semanticColors.ts`):
- Success, Warning, Error, Info
- Light/Dark variants for each

**Theme Colors** (`src/config/colors.ts`):
- Primary, Secondary, Accent
- Background, Text, Border

**Gradients** (`src/config/gradients.ts`):
- Hero gradients
- Card gradients
- Accent gradients

### 12.2 Typography

- Font family: System fonts (San Francisco, Segoe UI, Roboto)
- Scale: Rem-based (0.75rem - 2rem)
- Weights: Regular, Medium, Semibold, Bold

### 12.3 Spacing & Layout

- Base unit: 4px (Tailwind standard)
- Container max-width: 1280px
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

### 12.4 Accessibility

- **ARIA**: Semantic HTML, ARIA labels, 70+ ARIA roles defined
- **Keyboard Navigation**: Full keyboard support with 6 accessibility hooks
- **Focus Management**: Focus traps, focus indicators, skip links
- **Screen Reader**: Screen reader compatible (NVDA, VoiceOver, TalkBack)
- **Voice Control**: Voice commands for major actions
- **Skip Links**: Multiple skip targets for navigation (SkipLink component)
- **Live Regions**: ARIA live regions for dynamic content updates
- **WCAG 2.1 AA**: ✓ Full compliance verified (2026-01-15)
- **Accessibility Hooks**: useAnnouncer, useFocusContainment, useKeyboardNavigation, useFocusTrap, useReducedMotion, usePrefersColorScheme
- **Accessibility Config**: Centralized accessibility constants (src/config/accessibility.ts)
- **Accessibility Testing**: Automated tests with jest-axe (19 tests), all passing
- **Accessibility Documentation**:
  - ✓ Comprehensive guidelines in docs/ACCESSIBILITY.md
  - ✓ Detailed audit report in docs/ACCESSIBILITY_AUDIT_REPORT.md
- **Compliance Status**: WCAG 2.1 AA, Section 508, EN 301 549, UU No. 8/2016 (Indonesia)

---

## 13. DEVELOPMENT WORKFLOW

### 13.1 Git Workflow

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (new features)
fix/* (bug fixes)
```

### 13.2 Code Quality Gates

- **Type Check**: `npm run typecheck` (must pass)
- **Linting**: `npm run lint` (must pass)
- **Tests**: `npm run test:run` (must pass)
- **Security Scan**: `npm run security:scan` (must pass)
- **Secrets Scan**: `npm run secrets:scan` (must pass)

### 13.3 Pre-Commit Hooks

Husky + lint-staged configuration:
- Auto-fix linting issues on commit
- Run tests on commit
- Type checking on commit

---

## 14. MONITORING & MAINTENANCE

### 14.1 Health Checks

- `ai-health-check.ts` - AI service health
- Network status monitoring
- WebSocket connection status
- Service worker registration status

### 14.2 Error Handling

**Centralized Error Handler** (`errorHandler.ts`):
- Catches all errors
- Logs to `logger.ts`
- Displays toast notifications
- Reports to monitoring (if configured)

### 14.3 Logging

**Structured Logging** (`logger.ts`):
- Timestamp
- Level (INFO, WARN, ERROR, DEBUG)
- Context
- User info (if available)

---

## 15. FUTURE ARCHITECTURE CONSIDERATIONS

### 15.1 Scalability

- **Horizontal Scaling**: Serverless Workers auto-scale
- **Database**: D1 scales automatically
- **CDN**: Cloudflare global network

### 15.2 Potential Enhancements

- **GraphQL API**: Consider for complex queries
- **Real-Time Database**: Cloudflare Durable Objects
- **Edge Computing**: Move more logic to edge
- **Microservices**: Split Workers if needed
- **Advanced Analytics**: Custom analytics dashboard

### 15.3 Technical Debt Watchlist

- Replace hardcoded strings with constants (Pillar 15)
- Improve test coverage for edge cases
- Optimize bundle size further
- Enhance error boundary coverage
- Add performance monitoring (RUM)

---

## 16. MAINTAINERS

**Lead Architect**: Autonomous System Guardian
**Last Review**: 2026-01-16 (System Verification Complete)
**Next Review**: 2026-02-15

---

*This blueprint is the Single Source of Truth for MA Malnu Kananga architecture. All architectural decisions must reference this document.*
