# MA Malnu Kananga - Blueprint (Architecture & Design)

 **Version**: 3.5.0
**Last Updated**: 2026-01-31 (Issue #1294: Test Coverage Enhancement - quizGradeIntegrationService Tests Added)
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

MA Malnu Kananga is a **modern PWA-based school management system** with AI integration, following **Clean Architecture** principles with **separation of concerns** and **modular type definitions**.

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

   ### Bug Fixes & Enhancements (2026-01-22 - 2026-01-31)
       - **WebSocket Memory Leak**: Fixed visibilitychange listener cleanup in disconnect() (Issue #1223, P1)
       - **Incomplete useOfflineActionQueue Mocks**: Fixed incomplete mocks causing 300+ test failures (Issue #1236, P0)
       - **Speech Recognition Error Recovery**: Added retry logic with exponential backoff and circuit breaker for transient errors (GAP-110, P2)
       - **Speech Synthesis Error Recovery**: Added retry logic with exponential backoff and circuit breaker for synthesis failures (GAP-111, P2)
       - **Async Function Error Handling**: Added lazy AI client initialization with error handling for ocrEnhancementService and geminiService (Issue #1243, P1)
       - **GradeAnalytics Test Failures**: Fixed 8 failing tests by refactoring useEffect pattern, adding missing mock data, and improving test matchers (Issue #1240, P1) - 19/19 tests passing (100%)
       - **QuizGenerator Test Failures**: Fixed 6/7 failing tests by improving checkbox testing, focus areas handling, and error state management (Issue #1239, P1) - 26/28 tests passing (92.9%)
        - **Duplicate Key Warning**: Fixed React duplicate key warning in GradeAnalytics by adding deduplication logic using Map-based filtering (Issue #1251, P2)
        - **GitHub Issues Synchronization**: Closed 3 P1/P2 issues (#1240, #1239, #1247) with proper references to resolving commits (SCRIBE MODE)
        - **Hardcoded localStorage Keys**: Replaced 5 hardcoded localStorage key strings with STORAGE_KEYS constants (Issue #1244, P2); Fixed remaining hardcoded keys in emailNotificationService (Issue #1269, P1)
        - **CI Workflow Deadlock**: Fixed turnstyle deadlock by changing same-branch-only to true (Issue #1258, P1)
        - **Custom Analysis Tools Package Error**: Fixed ERR_PACKAGE_PATH_NOT_EXPORTED error in @opencode-ai/plugin by creating automatic patch script that adds comprehensive exports and fixes ESM import extensions (Issue #1274, P1) - All 8 custom tools now execute successfully
        - **Activity Feed Notification Integration**: Integrated ActivityFeed with unifiedNotificationManager to automatically trigger push notifications for important events (Issue #1232, P2) - 21 tests covering notification triggering, filtering, content generation, and integration
        - **Test Coverage for pdfExportService**: Added comprehensive tests for PDF export service (Roadmap Technical Debt - Test Coverage) - 31 tests (100% pass rate) covering initialization, createReport, createGradesReport, createAttendanceReport, createConsolidatedReport, calculateAverage, and edge cases (PR #1275)
    - **Test Coverage for pdfExportService**: Added comprehensive tests for PDF export service (Issue: Roadmap Technical Debt - Test Coverage) - 31 tests (100% pass rate) covering initialization, createReport, createGradesReport, createAttendanceReport, createConsolidatedReport, calculateAverage, and edge cases
          - **AI Class Performance Analysis Integration**: Integrated analyzeClassPerformance from geminiService into GradeAnalytics component (Issue #1231, P2) - Added AI insights panel with generate button, caching using STORAGE_KEYS, loading states, error handling, and fallback to basic stats
    - Replaced 5 hardcoded localStorage key strings with STORAGE_KEYS constants
    - All localStorage keys now follow centralized pattern (Pillar 15: Dynamic Coding)
    - TypeScript type checking and ESLint linting passed
 - **PR Completion**: Completed PHASE 4 for Issue #1231 - AI Class Performance Analysis Integration
   - Resolved merge conflicts in PR #1281 by merging main into feature branch
   - Updated task.md with merge resolution and completion status
   - PR is now MERGEABLE and ready for approval (awaiting Cloudflare Pages CI check)
    - All acceptance criteria from Issue #1231 met (8/8 complete)
    - Documentation synchronized across blueprint.md, roadmap.md, task.md
  
     ### Recent Changes (2026-01-31)
    - **Large File Refactoring - types.ts Module Activation** (Issue #1293, P2)
      - Deleted old monolithic src/types.ts (1,808 lines) to activate modular structure
      - Confirmed all imports now resolve to src/types/index.ts (verified via typecheck)
      - All TypeScript compilation and linting passed (0 errors, 0 warnings)
      - Eliminated 1,808-line monolithic file, activated 17 domain-specific modules
      - Improved code modularity and maintainability (Pillars 2, 11, 13)
      - Total types directory: 1,991 lines across 17 files (average 117 lines per file)
      - This completes the types.ts portion of Issue #1293 (4 more large files remain)
    - **Type Definitions Refactoring - Modular Structure** (Issue #1293, P2)
      - Refactored types.ts (1808 lines) into 17 domain-specific type files
      - Created src/types/ directory with organized modules: common.ts, users.ts, academic.ts, ppdb.ts, events.ts, inventory.ts, materials.ts, announcements.ts, voice.ts, notifications.ts, chat.ts, messaging.ts, analytics.ts, study.ts, quiz.ts
      - Created index.ts that re-exports all types for backward compatibility
      - Improved code modularity and maintainability (Pillars 2, 11, 13)
      - TypeScript type checking: Passed (0 errors)
      - ESLint linting: Passed (0 errors, 0 warnings)
      - Total: 1,971 lines across 17 files (average 116 lines per file)
    - **QuizIntegrationDashboard Navigation Integration** (Follow-up to Issue #1288, P2)
      - Added QuizIntegrationDashboard to teacher dashboard navigation menu
      - Added 'quiz-integration' to ViewState type and voice command navigation
      - Added dashboard action card with indigo colorTheme (placed after "Buat Kuis AI" card)
      - Added conditional render for quiz-integration view with proper permission checking (academic.grades)
      - Teachers can now easily access QuizIntegrationDashboard to batch integrate quiz attempts into grades
      - TypeScript type checking and ESLint linting passed
      - Completes Issue #1288 feature implementation (Pillars 9: Feature Ops, 16: UX/DX)
    - **Test Coverage for quizGradeIntegrationService** (Issue #1294, P2)
      - Created comprehensive tests for quizGradeIntegrationService (437 lines, previously untested)
      - 35 tests (100% pass rate, 20ms duration) covering all public functions and edge cases
      - Functions tested: findExistingGrade, convertToGrade, integrateQuizAttempt, integrateQuizAttemptsBatch, getQuizAttempts, getQuiz, integrateAllQuizAttempts, integrateStudentQuizAttempts, integrateQuizAttempts, removeQuizGrades, getIntegrationStatus
      - Tests include: empty results, malformed data, API failures, localStorage errors, filtering logic, batch processing, deduplication, statistics
      - TypeScript type checking: Passed (0 errors)
      - ESLint linting: Passed (0 errors, 0 warnings)
      - Improves test coverage for quiz-to-grade integration feature (Pillars 3: Stability, 6: Optimization Ops, 7: Debug)
    - **Documentation Location Inconsistency Fix** (Issue #1285, P1)
    - Updated README.md version from 3.3.1 to 3.4.6 and Last Updated to 2026-01-31
    - Removed redundant documentation copies in docs/ directory (blueprint.md, roadmap.md, task.md)
    - Established root directory as canonical location for core documentation files
    - Updated docs/README.md to reflect root directory as Single Source of Truth
    - Updated docs/README.md version to 3.4.6 and Last Updated to 2026-01-31
    - Updated all links in docs/README.md from ./docs/ to ../ for root-based references
    - Eliminates confusion about which documentation location is authoritative
    - Improves developer onboarding experience (Pillars 8: Documentation, 16: UX/DX)
  - **Bug Fixes for attendanceOCRService** (Issue #1277, #1276, P2)
    - Fixed low confidence/empty OCR handling to return empty result instead of throwing error (Issue #1277)
    - Modified processAttendanceSheet to check `ocrResult.confidence < 50 || ocrResult.text.trim() === ''` and return empty result with zeroed summary
    - Fixed Indonesian date parser to convert month names to numeric format (Issue #1276)
    - Added indonesianMonths mapping (januari->01, februari->02, etc.) to convert Indonesian month names
    - Modified extractDateFromText to detect month names and convert before formatting date string
    - All 9 attendanceOCRService tests now passing (100% pass rate)
    - TypeScript type checking and ESLint linting passed
  - **Bug Fix for UnifiedNotificationManager Tests** (Issue #1278, P2)
    - Fixed state pollution between tests by adding comprehensive cleanup in beforeEach hook
    - Added calls to clearHistory(), clearAnalytics(), clearVoiceQueue(), clearVoiceHistory(), and resetSettings()
    - Test suite now passes 42/43 tests (1 skipped for unimplemented feature)
    - TypeScript type checking and ESLint linting passed
  - **Documentation Synchronization** (Issues #1279, #1277, #1276, #1278)
    - Closed Issue #1279: Test suite timeout was fixed on 2026-01-31 by adding vi.useRealTimers() to afterEach hooks
     - Closed Issue #1277: Empty/low confidence OCR handling fixed
     - Closed Issue #1276: Indonesian date parser conversion fixed
     - Closed Issue #1278: UnifiedNotificationManager state pollution fixed
     - All 4 P2/P1 issues closed with proper commit references
    - **Security Fix**: Updated hono package to v4.11.7 to resolve 4 moderate severity vulnerabilities (Issue #1287, PR #1290)
      - GHSA-9r54-q6cx-xmh5: XSS through ErrorBoundary component (CVSS: 4.7, CWE-79)
      - GHSA-w332-q679-j88p: Arbitrary Key Read in Serve static Middleware (CWE-200, CWE-284, CWE-668)
      - GHSA-6wqw-2p9w-4vw4: Cache Deception - Ignores Cache-Control: private (CVSS: 5.3, CWE-524, CWE-613)
      - GHSA-r354-f388-2fhh: IP Spoofing - IPv4 validation bypass (CVSS: 4.8, CWE-185)
      - npm audit: 0 vulnerabilities found
      - TypeScript type checking and ESLint linting passed
      - Hardens application against OWASP threats (Pillars 3: Stability, 4: Security, 7: Debug)
    - **Test Suite Timeout Fix**: Verified and completed afterEach hook cleanup for fake timers (Issue #1284)
      - All test files using vi.useFakeTimers() now have vi.useRealTimers() in afterEach hooks
      - emailNotificationService.test.ts (line 22), useWebSocket.test.ts (line 55), errorHandler.test.ts (line 557)
      - All 3 test files passed (83 tests, 2 skipped, no timeouts)
      - Test duration: 1.09s (fast, confirming timer fixes work)
      - Full test suite runs successfully without timeout
      - Improves CI/CD reliability (Pillars 3: Stability, 6: Optimization Ops, 7: Debug)
   
   - **Quiz-Grade Integration** (Issue #1288, P2)
     - Created QuizIntegrationDashboard.tsx component (292 lines) for teachers to batch integrate quiz attempts
     - Added integration status display (total/integrated/pending counts), progress bar, and error details
     - Updated AcademicGrades.tsx to support quiz grades with new formula (30% assignment + 30% mid + 40% final + 10% quiz)
     - Added quiz column to grades table UI
     - Verified GradeAnalytics.tsx already has quiz assignment type filter and integration
     - Added comprehensive tests for QuizIntegrationDashboard (8 tests, 100% pass rate)
     - TypeScript type checking and ESLint linting passed
     - Strengthens coupling between quiz results and grade analytics (Pillars 1: Flow, 2: Standardization, 5: Integrations, 9: Feature Ops, 16: UX/DX)
   
   ### Recent Changes (2026-01-30)
- **Bug Fixes**: Fixed GradeAnalytics test failure 'switches between tabs' (Issue #1267)
  - Changed `screen.getByText('Tugas')` to `screen.getByRole('tab', { name: 'Tugas' })`
  - Resolves ambiguous selector that matched both tab button and dropdown option
  - All 19 GradeAnalytics tests now passing (100% pass rate)
    - **Email Integration**: Added emailNotificationService with full integration to unifiedNotificationManager (Issue #1264)
      - Email templates for all notification types (grades, announcements, events, materials, system, PPDB, OCR)
      - User-controlled email notification preferences (per-type enable/disable)
      - Digest mode (daily/weekly email digest to reduce notification fatigue)
      - Quiet hours support for email notifications
      - Email delivery tracking and analytics
      - 20 tests (100% pass rate)
   - **Test Coverage - performanceMonitor**: Added comprehensive tests for performanceMonitor service (57 tests, 100% pass rate)
     - Initialization with custom config
     - Request tracking (startRequest/endRequest)
     - API response recording and statistics calculation
     - Error rate and threshold checks
     - Metrics management (clear, recent, time range filtering, export)
     - FIFO behavior and slow request detection
  - **Quiz-Grade Integration**: Added quizGradeIntegrationService to convert QuizAttempt to Grade entries (Issue #1246)
     - Automatic grade entry creation from quiz attempts
     - Deduplication and batch processing support
     - GradeAnalytics updated with assignment type filter (all/quiz/assignment/exam/project/etc.)
     - Quiz grades now included in all analytics calculations
   - **PPDB-Student Management Integration**: Added ppdbIntegrationService with 8-stage pipeline automation (Issue #1248)
   - **Attendance OCR Integration**: Added attendanceOCRService and AttendanceManagement component for automated attendance sheet processing (Issue #820)
     - AI-powered attendance extraction (Gemini) with regex fallback
     - Pattern recognition for attendance statuses (Hadir/Sakit/Izin/Alpa)
     - Student matching by NIS and name with confidence scoring
     - Progress callbacks for real-time OCR status updates
     - Validation and confidence indicators for manual review
     - Test coverage: 11 tests (9 passing, 81.8% pass rate)
   - **README.md**: Updated with comprehensive metrics section including:
    - Codebase statistics (296 source files, 125 test files, 42.2% coverage)
    - Test coverage breakdown by category (services, components, utils)
    - Code quality metrics (0% `any` usage, ESLint status)
    - Feature completion status (Q1 2026: P1 100%, P2 90%, P3 100%)
    - Technical debt status with targets
    - Tech stack with version numbers
    - Development workflow with available scripts
    - OpenCode CLI integration details
    - Comprehensive feature list
    - Contributing guidelines
    
