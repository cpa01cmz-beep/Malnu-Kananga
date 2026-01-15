# MA Malnu Kananga - Blueprint
**Architecture & System Design Document**
**Version**: 3.2.0
**Last Updated**: 2026-01-15

---

## 1. SYSTEM OVERVIEW

MA Malnu Kananga is a modern, AI-powered school management system designed for Indonesian schools (SMA/SMK). The system provides comprehensive functionality for administrators, teachers, students, and parents with emphasis on accessibility, offline support, and intelligent automation.

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

**Supporting Services**:
- `webSocketService.ts` - Real-time communication
- `aiCacheService.ts` - AI response caching
- `emailService.ts` - Email queue and templates
- `pdfExportService.ts` - PDF generation
- `themeManager.ts` - Theme management (light/dark)
- `storageMigration.ts` - localStorage schema migrations
- `voiceSettingsBackup.ts` - Voice settings synchronization

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

### 4.2 Custom Hooks (60+)

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

**Data Management**
- `useForm` - Form state management
- `useLocalStorage` - localStorage persistence
- `useAutoSave` - Auto-save functionality
- `useFieldValidation` - Field validation
- `useSemanticSearch` - Content search

**Real-Time & Events**
- `useWebSocket` - WebSocket connection
- `useEventNotifications` - Event-based notifications
- `useUnifiedNotifications` - Unified notification system

**User-Specific**
- `useStudentInsights` - Student analytics
- `useNotifications` - User notifications

### 4.3 Storage Strategy

**localStorage Keys** (60+ keys, all prefixed with `malnu_`)
- Authentication: `malnu_auth_session`, `malnu_users`
- Site Content: `malnu_site_content_*`
- Materials: `malnu_materials_*`
- Notifications: `malnu_notifications_*`
- Voice Settings: `malnu_voice_*`
- AI Cache: `malnu_ai_cache_*`
- PPDB: `malnu_ppdb_*`
- Offline Data: `malnu_offline_*`

**Storage Keys Constants**: `src/constants.ts` - `STORAGE_KEYS`

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

**Test Coverage**: 84 test files with offline test suites

---

## 7. TESTING STRATEGY

### 7.1 Test Framework

- **Runner**: Vitest
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

**Total**: 1529 tests across 84 test files

### 7.3 Test Organization

```
src/
├── services/__tests__/         # Service unit tests
├── hooks/__tests__/           # Hook tests
├── components/__tests__/       # Component tests
├── utils/__tests__/           # Utility tests
└── __tests__/                 # Integration tests
```

---

## 8. PERFORMANCE OPTIMIZATION

### 8.1 Frontend Optimization

- **Code Splitting**: React.lazy, dynamic imports
- **Memoization**: React.memo, useMemo, useCallback
- **Bundle Size**: Vite optimizations, tree shaking
- **Image Optimization**: Lazy loading, WebP support
- **Voice Optimization**: Debouncing, throttling (`voiceOptimization.ts`)

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

- **ARIA**: Semantic HTML, ARIA labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Focus traps, focus indicators
- **Screen Reader**: Screen reader compatible
- **Voice Control**: Voice commands for major actions

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
**Last Review**: 2026-01-15
**Next Review**: 2026-02-15

---

*This blueprint is the Single Source of Truth for MA Malnu Kananga architecture. All architectural decisions must reference this document.*
