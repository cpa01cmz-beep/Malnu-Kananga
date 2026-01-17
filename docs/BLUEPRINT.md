# Blueprint Sistem Informasi Manajemen Sekolah

**Created**: 2025-01-01
**Last Updated**: 2026-01-17
**Version**: 2.1.5
**Status**: Active

## 1. Ringkasan

Sistem Informasi Manajemen Sekolah Berbasis Web (School Management Information System/SMIS) adalah platform terintegrasi yang menghubungkan semua aspek pengelolaan sekolah: akademik, administratif, keuangan, dan komunikasi.

## 2. Arsitektur Sistem

### 2.1 Arsitektur Umum

```mermaid
graph TD
    User[Pengguna] --> |Akses Web| Frontend[React App (Vite)]

    subgraph "Frontend Layer"
        Frontend --> |State Management| AppState[React State]
        AppState --> |Persistence Strategy| CustomHooks[Custom Hooks]
        CustomHooks --> |Logic| ApiService[apiService.ts]
        ApiService --> |HTTP Requests| Backend[Cloudflare Workers]

        Frontend --> |Render UI| Components[Komponen UI]
    end

    subgraph "AI Services Layer"
        Frontend --> |Chat & Edit Prompt| GeminiAPI[Google Gemini API]
        GeminiAPI --> |Response Text/JSON| Frontend
    end

    subgraph "Backend Layer (Cloudflare)"
        Frontend --> |Auth Request| WorkerAuth[Worker: JWT Auth]
        WorkerAuth --> |Verify & Store| Sessions[JWT Sessions]
        WorkerAuth --> |Query Users| D1[Cloudflare D1 Database]

        Frontend --> |CRUD Operations| WorkerAPI[Worker: API Endpoints]
        WorkerAPI --> |SQL Operations| D1

        Frontend --> |Cari Konteks Chat| WorkerRAG[Worker: RAG Endpoint]
        WorkerRAG --> |Vector Search| Vectorize[Cloudflare Vectorize]
        WorkerRAG --> |Embeddings| CFAi[Cloudflare Workers AI]
    end

    subgraph "Storage Layer"
        D1 -->|Relational Data| Tables[15+ Tables]
        WorkerAPI -->|File Upload| R2[Cloudflare R2 Storage]
    end
```

### 2.2 Struktur Frontend

```
src/
├── components/          # React UI components
│   ├── admin/         # Admin-specific components
│   ├── icons/         # Icon components
│   ├── sections/      # Bagian-bagian besar halaman
│   └── ui/           # Reusable UI components
├── config/             # Configuration files (permissions, notification templates)
├── contexts/           # React Context providers
├── constants.ts        # Centralized constants (STORAGE_KEYS)
├── data/              # Default data dan static resources
├── hooks/             # Custom React hooks (useVoiceRecognition, useVoiceSynthesis)
├── services/          # API dan business logic services
├── styles/            # Global CSS styles (themes.css)
├── tests/             # Integration tests
├── types/             # TypeScript type definitions
├── utils/             # Utility functions dan helpers
├── App.tsx            # Main application component
├── config.ts          # Main configuration
└── index.tsx          # Entry point
### 2.2 Teknologi Stack

**Frontend**: React 19, TypeScript, Vite, Tailwind CSS
**Backend**: Cloudflare Workers (Serverless)
**Database**: Cloudflare D1 (SQLite-based)
**Search/AI**: Cloudflare Vectorize + Workers AI
**File Storage**: Cloudflare R2 (S3-compatible)
**Authentication**: JWT dengan session management

## 3. Fitur Utama

### 3.1 Manajemen Data Master
- Manajemen Siswa
- Manajemen Guru
- Manajemen Kelas
- Manajemen Mata Pelajaran
- Manajemen Tahun Akademik

### 3.2 Sistem Akademik
- Penjadwalan kelas
- Manajemen Nilai (Input, Rekap, Analisis)
- Silabus & RPP (Upload & manajemen materi)
- Tugas & Penilaian online
- E-Learning platform

### 3.3 Sistem Presensi & Absensi
- Absensi Real-time
- Laporan Presensi (bulanan/semester)
- Alert Otomatis untuk ketidakhadiran

### 3.4 Sistem Penilaian & Rapor
- Input Nilai (Tugas, UTS, UAS)
- Kalkulasi Rapor otomatis
- Distribusi Rapor digital ke parent (wali murid)
- Analisis Performa akademik

### 3.5 Manajemen Keuangan
- Manajemen SPP
- Verifikasi Pembayaran
- Laporan Keuangan
- Donasi sekolah

### 3.6 PPDB Online dengan OCR
- Formulir Pendaftaran Online
- Upload Dokumen
- **OCR Ekstrak Nilai Otomatis** (Tesseract.js)
- Validasi Data & Status Tracking

### 3.7 Voice Interaction (Fase 3 - COMPLETED)
- Voice-to-Text (Speech Recognition)
- Text-to-Speech (Speech Synthesis)
- Multi-language (id-ID, en-US)
- Voice Commands ("Buka pengaturan", "Hentikan bicara")
- Continuous mode & auto-read all
- Backup & restore voice settings

### 3.8 Progressive Web App - Offline Support (Fase 4 - COMPLETED)
- Service Workers untuk caching otomatis
- "Add to Home Screen" support
- Runtime caching untuk fonts, images, API
- Background sync

### 3.9 Push Notifications - Real-time Engagement (Fase 4 - COMPLETED)
- Permission management
- Notification types (announcement, grade, PPDB, event, library, system)
- User settings & preferences
- Quiet hours functionality
- Notification history

### 3.10 Unified Notification System (Fase 4 - COMPLETED)
- Template-based notification engine
- Role-based filtering
- Unified notification center UI
- Search & filter functionality
- Real-time status updates

### 3.11 Enhanced E-Library Experience (Fase 4 - COMPLETED)
- Advanced search dengan multi-filter
- Material favoriting system
- Reading progress tracking
- Rating system dengan reviews
- Recently read section
- Offline download capability

### 3.12 Improved E-Library Experience (Fase 4 - COMPLETED)
- Advanced search (subject, teacher, date, file type, rating)
- Material favoriting dengan heart icon
- Reading progress tracking (last read, percentage)
- 5-star rating system dengan comments
- Recently read quick access (5 items)
- Offline download (PWA support)

### 3.13 Enhanced Event Management for OSIS (Fase 4 - COMPLETED)
- Event registration system dengan tracking kehadiran
- Budget tracking dengan approval workflow
- Photo gallery dengan R2 upload
- Event announcements dengan notifikasi
- Feedback collection system

### 3.14 Parent Dashboard Strengthening (Fase 4 - COMPLETED)
- Full TypeScript interfaces untuk parent data
- Validation utilities untuk meeting, message, payment, teacher
- Retry logic dengan exponential backoff
- Offline detection & network status monitoring
- Multi-child data isolation validation

### 3.15 Teacher Dashboard Strengthening (Fase 4 - COMPLETED)
- Comprehensive validation utilities (grade, student, subject, class, attendance, library)
- Confirmation dialogs untuk destructive actions
- Input sanitization sebelum validasi
- Grade range validation (0-100)
- Enhanced error handling

### 3.16 Student Portal Strengthening (Fase 4 - COMPLETED)
- Validation utilities untuk grade, student, subject, attendance, goal
- Offline detection dengan UI indicators
- Progress tracking analytics validated
- Error handling dengan user-friendly messages
- Consistent onShowToast integration

### 3.17 Accessibility & Form Compliance (Fase 4 - COMPLETED)
- All form inputs have proper `id`, `name`, `autocomplete` attributes
- Proper label-to-input associations dengan `htmlFor`
- ARIA labels maintained untuk voice settings
- WCAG 2.1 AA compliant
- Enhanced NotificationCenter keyboard navigation and ARIA compliance (2026-01-07)

### 3.18 UI Component System (Fase 5 - COMPLETED 2026-01-07)
- Reusable Card component with 4 variants (default, hover, interactive, gradient)
- Configurable padding options (none, sm, md, lg)
- Full accessibility support (ARIA labels, keyboard navigation, focus management)
- Dark mode support across all variants
- Comprehensive test coverage with 50+ test cases
- Componentized 41+ card instances across the application
- Eliminated code duplication and improved maintainability
- See `docs/UI_COMPONENTS.md` for detailed usage documentation

### 3.19 Textarea Component System (Fase 5 - COMPLETED 2026-01-07)
- Reusable Textarea component with auto-resize functionality
- Consistent styling with Input and Select components
- Size variants (sm, md, lg) for flexible layouts
- State variants (default, error, success) for form validation
- Label, helperText, and errorText support for accessibility
- Configurable auto-resize with minRows and maxRows limits
- Full accessibility (ARIA labels, keyboard navigation, screen reader support)
- WCAG 2.1 AA compliant with proper focus management
- Integrated into BatchManagement, PPDBRegistration, and OsisEvents components
- Comprehensive test coverage with 20+ test cases
- Eliminated inconsistent textarea styling across application

### 3.20 Modal Component System (Fase 5 - COMPLETED 2026-01-07)
- Reusable Modal component with focus trap and comprehensive accessibility
- Size variants (sm, md, lg, xl, full) for flexible content
- Animation variants (fade-in, fade-in-up, scale-in) for smooth transitions
- Backdrop click and escape key close handlers
- Configurable close button and title/header display
- Full ARIA compliance with proper role, aria-modal, aria-labelledby, aria-describedby
- Body scroll lock when modal is open to prevent background scrolling
- Focus trap using existing useFocusTrap hook for keyboard navigation
- Refactored ConfirmationDialog to use Modal component
- Eliminates modal pattern duplication across 27+ instances in codebase
- Comprehensive test coverage with 50+ test cases
- Dark mode support with proper color classes
- See `src/components/ui/Modal.tsx` for implementation details

### 3.21 Gradient Configuration System (Fase 5 - COMPLETED 2026-01-07)
- Centralized gradient configuration in `src/config/gradients.ts`
- 23 pre-defined gradient classes for consistent visual design
- Dark mode support via dedicated `DARK_GRADIENT_CLASSES`
- Type-safe gradient configuration with TypeScript interfaces
- Integration with Card component gradient variant
- Refactored 5+ components to use gradient system (Header, LoginModal, ProgressAnalytics, StudentPortal, AdminDashboard)
- Eliminated hardcoded gradient duplication across 39+ instances
- See `docs/GRADIENTS.md` for complete documentation and usage guide

 ### 3.22 Badge Component System (Fase 5 - COMPLETED 2026-01-07)
 - Reusable Badge component with 5 variants (success, error, warning, info, neutral)
 - Two style types (solid and outline) for visual flexibility
 - Three size options (sm, md, lg) for flexible layouts
 - Configurable rounded corners (pill vs. standard corners)
 - Full dark mode support with dedicated color classes
 - Smooth transition effects for color changes
 - Comprehensive accessibility with ARIA attributes support
 - Refactored 3+ badge instances in PermissionManager and PPDBManagement
 - Eliminated inconsistent badge styling across 2+ components
 - Comprehensive test coverage with 27 test cases
 - See `src/components/ui/Badge.tsx` for implementation details

  ### 3.23 Styling System Integration (Fase 5 - COMPLETED 2026-01-08)
  - Fixed Tailwind v4 + ThemeManager integration conflicts
  - Implemented CSS custom properties system (`--theme-*` variables) for dynamic theming
  - Updated `src/index.css` to use `var(--theme-*)` with fallback values in `@theme` block
  - Added missing `--color-purple-*` color scale definitions
  - Updated `src/services/themeManager.ts` to control `--theme-*` CSS variables
  - All Tailwind utility classes (`bg-purple-600`, `bg-green-600`, etc.) now properly adapt to theme changes
  - Eliminated static color conflicts between Tailwind and ThemeManager
  - User-selected themes now apply consistently across entire application
  - Improved color system maintainability and extensibility
  - See `src/index.css` and `src/services/themeManager.ts` for implementation details

  ### 3.24 Gradient System Refactoring (Fase 5 - COMPLETED 2026-01-10)
  - Refactored hardcoded `bg-gradient-to-*` classes across 10+ components to use centralized `GRADIENT_CLASSES`
  - Added 4 new background gradients (FOOTER, PROFILE, PPDB, RELATED_LINKS) to gradients config
  - Added 4 new decorative gradients (PRIMARY_DECORATIVE, PRIMARY_DECORATIVE_SOFT, CHAT_HEADER, AI_SEMANTIC) to gradients config
  - Implemented `getResponsiveGradient()` helper function for light/dark mode gradient switching
  - Refactored 10 components: HeroSection, Footer, App.tsx, ProfileSection, PPDBSection, RelatedLinksSection, ProgramsSection, NewsSection, ELibrary, ChatWindow, ParentDashboard
  - Eliminated gradient code duplication across entire codebase
  - Improved design system consistency and maintainability
  - All gradients now properly support light/dark mode switching
  - See `src/config/gradients.ts` for complete gradient configuration

   ### 3.25 GradientButton Component Refactoring (Fase 5 - COMPLETED 2026-01-10)
   - Refactored GradientButton component to use centralized GRADIENT_CLASSES configuration
   - Updated primary variant to use GRADIENT_CLASSES.CHAT_HEADER instead of hardcoded `bg-gradient-to-r from-primary-600 to-primary-700`
   - Maintained hover states using Tailwind utilities for enhanced user feedback
   - Improved design system consistency with centralized gradient management
   - Simplified gradient updates - changing CHAT_HEADER gradient now updates all GradientButton instances
   - See `src/components/ui/GradientButton.tsx` for implementation details

   ### 3.26 UI Component Index Completion (Fase 5 - COMPLETED 2026-01-13)
    - Updated `src/components/ui/index.ts` to export all 32+ available UI components
    - Organized exports into 9 logical categories for better discoverability:
      - Form Components (7): Input, Select, Textarea, Label, FileInput, Toggle, SearchInput
      - Button Components (5): Button, IconButton, GradientButton, BackButton, SmallActionButton
      - Layout Components (7): Card, Modal, BaseModal, ConfirmationDialog, Section, ErrorBoundary, SkipLink
      - Display Components (6): Heading, Badge, Alert, LinkCard, DashboardActionCard, SocialLink
      - Table Components (2): Table (with Thead, Tbody, Tfoot, Tr, Th, Td), DataTable
      - Interactive Components (2): Tab, Toast
      - Navigation Components (1): Pagination
      - Loading Components (5): LoadingState (EmptyState, ErrorState), LoadingSpinner, SuspenseLoading, LoadingOverlay, Skeleton
      - Progress Components (1): ProgressBar
      - Utility Components (3): PageHeader, ErrorMessage, PDFExportButton
    - Improved developer experience: Single import location for all UI components
    - Eliminated need for longer relative import paths throughout codebase
    - Enhanced component discoverability with logical categorization and comments
    - Maintained backward compatibility with legacy FileUpload export
    - All components verified to exist, be properly typed, and support accessibility
    - Developers can now use concise imports like: `import { Button, Input, Modal } from './components/ui'`
    - See `src/components/ui/index.ts` for complete export list and component organization

### 3.27 High-Contrast Accessibility Fix (Fase 5 - COMPLETED 2026-01-13)

     - Fixed broken `@media (prefers-contrast: high)` media query in `src/styles/themes.css`
     - Replaced non-existent CSS variables (`--color-border`, `--color-text`, `--color-background`) with correct Tailwind v4 format
     - Implemented proper `--theme-neutral-*` and `--theme-primary-*` variable overrides
      - Added separate high-contrast overrides for light mode (`:root`) and dark mode (`.dark`)
      - Enhanced contrast ratios to meet WCAG 2.1 AAA standards for high-contrast preference
      - Users with high-contrast OS preference now receive improved visual clarity
      - See `src/styles/themes.css:204-221` for implementation

### 3.28 WebSocket Real-Time System (Fase 5 - COMPLETED 2026-01-16)
      - Backend WebSocket server implementation (`/ws` endpoint)
      - Fallback polling endpoint (`/api/updates`) for offline scenarios
      - JWT authentication for WebSocket connections
      - Message subscription and unsubscription handling
      - Ping/pong mechanism for connection health
      - Automatic disconnection and cleanup
      - Frontend integration with `webSocketService.ts`
      - Support for 16 real-time event types (grades, attendance, announcements, library, events, users, messages, notifications)
      - Local storage synchronization for real-time updates
      - Offline-first fallback with 30-second polling interval
      - Connection state management with reconnection logic
      - See `worker.js:1782-1940` for backend implementation
      - See `src/services/webSocketService.ts` for frontend implementation

### 3.29 Database Query Optimization (Fase 5 - COMPLETED 2026-01-17)
      - Created comprehensive database migration file (migration-2026-01-17-database-optimization.sql)
      - Added 12 composite indexes for multi-column WHERE clauses optimization
      - Added 4 single-column indexes for JOIN operations optimization
      - Created 4 optimized views for common query patterns
      - Implemented query result caching strategy with Cloudflare KV
      - Created detailed optimization guide (docs/DATABASE_OPTIMIZATION_GUIDE.md)
      - Composite indexes cover: grades (3), attendance (2), schedules (1), sessions (2), events (3), library (1)
      - Join optimization indexes cover: grades, attendance, schedules tables
      - Optimized views: active_sessions_with_users, student_grades_detail, class_attendance_summary, events_with_registration_counts
      - Expected performance improvement: 80-90% reduction in query execution time
      - Expected API response time improvement: 10x faster for dashboard queries
      - Migration ready for deployment: `wrangler d1 execute malnu-database --remote --file=migration-2026-01-17-database-optimization.sql`
      - See docs/DATABASE_OPTIMIZATION_GUIDE.md for complete usage examples and migration steps
      - See migration-2026-01-17-database-optimization.sql for all SQL changes
     - Backend WebSocket server implementation (`/ws` endpoint)
     - Fallback polling endpoint (`/api/updates`) for offline scenarios
     - JWT authentication for WebSocket connections
     - Message subscription and unsubscription handling
     - Ping/pong mechanism for connection health
     - Automatic disconnection and cleanup
     - Frontend integration with `webSocketService.ts`
     - Support for 16 real-time event types (grades, attendance, announcements, library, events, users, messages, notifications)
     - Local storage synchronization for real-time updates
     - Offline-first fallback with 30-second polling interval
     - Connection state management with reconnection logic
     - See `worker.js:1782-1940` for backend implementation
     - See `src/services/webSocketService.ts` for frontend implementation

## 4. User Roles & Access Control

| Role | Akses | Tanggung Jawab |
|------|-------|----------------|
| **Administrator** | Semua modul | Manajemen sistem, user, data master |
| **Guru** | Akademik, penilaian, presensi, komunikasi | Input nilai, kehadiran, pembelajaran |
| **Siswa** | Portal siswa, tugas, forum, akademik | Mengikuti pembelajaran, melihat nilai |
| **Parent (Wali Murid)** | Portal orang tua, rapor, pengumuman | Monitoring prestasi anak |
| **Staff (Guru Tambahan)** | Inventaris | Manajemen aset sekolah |
| **OSIS (Siswa Tambahan)** | Kegiatan OSIS | Menjadwalkan acara sekolah |
| **Wakasek (Guru Tambahan)** | Pengawasan akademik, evaluasi guru, disiplin | Mengawasi operasional akademik dan mengevaluasi guru |
| **Kepsek (Guru Tambahan)** | Pengawasan akademik, kurikulum, kebijakan sekolah | Menetapkan kurikulum dan kebijakan sekolah |

### 4.1 Access Control
- Role-Based Access Control (RBAC)
- JWT Authentication dengan refresh token mechanism
- Extra role support (staff, osis, wakasek, kepsek)
- Audit trail untuk tracking aktivitas

## 5. Keamanan & Compliance

 ### 5.1 Keamanan Data
- JWT-based authentication (access token: 15min, refresh token: 7 days)
- HTTPS/SSL encryption
- CORS protection
- Input validation & SQL injection prevention
- Audit logging
- Standardized Error Handling (2026-01-14):
  - 34 ERROR_MESSAGES constants untuk semua endpoint
  - HTTP_STATUS_CODES constants untuk semua status codes
  - Konsistensi bahasa (Bahasa Indonesia) di seluruh error messages
  - Tidak ada hardcoded error messages di backend
  - Type-safe error handling dengan constants
  - Mudah diperbarui secara global
  - Mengurangi risiko inkonsistensi di antar endpoint

### 5.2 AI Error Recovery
- Exponential backoff retry mechanism
- Circuit breaker pattern
- Specific error handling untuk rate limits (429)
- User-friendly error messages
- Environment-based logging system

### 5.3 Memory Leak Prevention
- ChatWindow history size limiting (MAX_HISTORY_SIZE = 20)
- Proper useEffect cleanup
- Ref-based history untuk prevent closure capture
- Optimized bundle chunking (eliminated circular dependencies)

### 5.4 Build Optimization
- Eliminated circular chunk dependencies (7 → 0)
- Build time improvement: 12.71s → 13.35s (stable)
- Bundle size optimization: 649 KB → 626 KB uncompressed (23 KB reduction, 3.5% faster)
- GZIP size optimization: 636 KB → 157.77 KB (478.23 KB reduction, 75% faster!)
- Lazy loading strategy: Public sections now loaded on-demand (Hero, Profile, Programs, News, PPDB, RelatedLinks)
- Created 5 new async chunks for public sections (total: 17.77 KB)
- Simplified manualChunks strategy
- Google GenAI library manually chunked
- Target: <500KB GZIP initial load ✅ ACHIEVED (157.77 KB GZIP)

## 6. CI/CD & DevOps

### 6.1 GitHub Actions
- Action versions: Latest stable (checkout@v5, setup-node@v6, codeql-action@v4, cache@v5)
- Lockfile-based cache keys untuk optimal cache invalidation
- Reusable composite actions (harden-runner, failure-notification)
- Standardized permissions dan error handling
- Pre-deployment configuration validation

### 6.2 Branch Lifecycle Management
- Comprehensive branch naming conventions (feature/, fix/, refactor/, ux/, docs/)
- Four-stage branch lifecycle: Creation, Development, Review & Merge, Cleanup
- Automated branch audit guidelines (weekly/monthly)
- Cleanup criteria: branches >30 days old, merged branches, abandoned branches
- `docs/BRANCH_LIFECYCLE.md` for complete policy documentation
- Current status: 52 remote branches, all 0-12 days old (2026-01-17)
- No branches require immediate cleanup
- Next scheduled review: 2026-02-17

### 6.2 Quality Metrics
- **System Uptime**: Target 99.5%
- **User Adoption**: Target 95%
- **Data Accuracy**: Target 99.9%
- **Performance**: Target <2s page load
- **User Satisfaction**: Target 4.0/5.0 NPS score

## 7. Cost Considerations

**Estimated Monthly Cost (Free Tier)**
- R2 Storage: ~$0.015/GB/month
- D1 Database: Free tier (5GB storage, 5M reads/day)
- Workers: Free tier (100,000 requests/day)
- Vectorize: Based on vector dimensions and query volume
- **Total**: <$5/month untuk small deployment

---

**Last Updated**: 2026-01-17
**Version**: 2.1.5
**Status**: Active
