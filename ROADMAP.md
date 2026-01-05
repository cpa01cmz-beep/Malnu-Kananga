
# Roadmap Pengembangan (Development Roadmap)

**Created**: 2025-01-01
**Last Updated**: 2026-01-05
**Version**: 2.3.0
**Status**: Active

Dokumen ini menguraikan rencana pengembangan jangka panjang untuk **Smart Portal MA Malnu Kananga**.

---

## ✅ Fase 1: MVP & Simulasi (Selesai - Current State)
Fokus: Membangun antarmuka pengguna (UI) lengkap dan logika bisnis menggunakan penyimpanan lokal browser.

- [x] **Frontend Modern**: React + Vite + Tailwind CSS.
- [x] **Multi-Role System**: Dashboard terpisah untuk Admin, Guru, Siswa.
- [x] **Simulasi Backend**: Penggunaan `useLocalStorage` untuk mensimulasikan database (CRUD User, Nilai, Inventaris, dll).
- [x] **Fitur AI**:
    - [x] Chatbot RAG (Retrieval Augmented Generation) dasar.
    - [x] AI Site Editor untuk mengubah konten JSON via natural language.
- [x] **Modul Akademik**: Jadwal, Nilai, Absensi, E-Library.
- [x] **Modul Administrasi**: PPDB Online, Manajemen User, Inventaris (Staff), Event (OSIS).

---

## ✅ Fase 2: Integrasi Backend Nyata (Selesai - Completed)
Fokus: Memindahkan penyimpanan data dari `localStorage` ke Database Serverless sesungguhnya (Cloudflare D1).

- [x] **Migrasi Database**:
    - [x] Buat skema tabel D1 (`users`, `students`, `teachers`, `grades`, `attendance`, `inventory`, `ppdb_registrants`, `school_events`, `sessions`, `audit_log`, `subjects`, `classes`, `schedules`, `e_library`, `announcements`).
    - [x] Buat API Endpoints di Cloudflare Workers untuk operasi CRUD (Users, PPDB, Inventory, Events).
    - [x] Implementasi API endpoints untuk Grade management (Students, Teachers, Subjects, Classes, Schedules, Grades)
    - [x] Implementasi API endpoints untuk Attendance tracking
    - [x] Implementasi API endpoints untuk E-Library materials
    - [x] Implementasi API endpoints untuk Announcements
 - [x] **Autentikasi Aman**:
     - [x] Ganti simulasi login dengan JWT (JSON Web Token) yang valid.
     - [x] Implementasi Session Management dengan JWT sessions
     - [x] Implementasi refresh token mechanism (access token: 15min, refresh token: 7 days) - COMPLETED
- [✅] **File Storage**:
    - [x] Integrasi Cloudflare R2 untuk penyimpanan file nyata (Upload materi guru, dokumen PPDB) - COMPLETED
    - [x] Implementasi file upload/download API endpoints - COMPLETED
    - [x] Update PPDB dan E-Library komponen untuk gunakan R2 - COMPLETED
  - [✅] **Frontend Migration**:
      - [x] User Management & Auth ke API (UserManagement, LoginModal, App.tsx) - COMPLETED
      - [x] Update PPDB komponen untuk menggunakan apiService.ts - COMPLETED
      - [x] Update Inventory komponen untuk menggunakan apiService.ts - COMPLETED
      - [x] Update Events komponen untuk menggunakan apiService.ts - COMPLETED
      - [x] Update Academic components untuk menggunakan apiService.ts (ClassManagement, ScheduleView, AcademicGrades, AttendanceView, ELibrary) - COMPLETED
      - [x] Hapus dependency ke localStorage untuk data utama - COMPLETED
      - [x] Implementasi proper error handling dan loading states untuk semua komponen - COMPLETED
 - [✅] **Code Quality & Test Improvements**:
      - [x] Fixed React Hooks exhaustive-deps warnings (5 components) - COMPLETED (PR #493)
      - [x] Verified all tests passing (30/30 tests) - COMPLETED
      - [x] Verified build successful (4.73s) - COMPLETED
      - [x] Resolved GitHub issues #124, #242, #297 - COMPLETED
 - [✅] **Repository Orchestration Improvements** (Issue #96):
      - [x] Updated GitHub Actions to latest versions (checkout@v5, setup-node@v6, codeql-action@v4, cache@v5) - COMPLETED
      - [x] Improved caching strategies with lockfile-based keys - COMPLETED
      - [x] Created reusable composite actions (harden-runner, failure-notification) - COMPLETED
      - [x] Created reusable workflows for common patterns - COMPLETED
      - [x] Standardized permissions and error handling across workflows - COMPLETED
  - [✅] **Workflow Reliability Improvements** (Issue #494):
       - [x] Resolved PR #492 merge conflicts - COMPLETED (PR #495)
       - [x] Applied retry logic for OpenCode connectivity issues - COMPLETED
       - [x] Maintained all PR #493 improvements - COMPLETED
       - [x] Verified build (5.05s) and tests (30/30 passing) - COMPLETED
  - [✅] **Gemini API Error Recovery & Stability** (Issue #518 - P1):
       - [x] Implement exponential backoff retry mechanism for transient failures - COMPLETED
       - [x] Add specific error handling for rate limits (429) with backoff - COMPLETED
       - [x] Add timeout handling with configurable thresholds - COMPLETED
       - [x] Provide user-friendly error messages for different error types - COMPLETED
       - [x] Add circuit breaker pattern to prevent cascading failures - COMPLETED
       - [x] Implement error logging without exposing sensitive data - COMPLETED
        - [x] Add comprehensive unit tests for error scenarios (29 tests) - COMPLETED
        - [x] Update documentation - COMPLETED
   - [✅] **Remove Console Statements from Production Code** (Issue #515 - P2):
        - [x] Create centralized logging utility with environment-based configuration - COMPLETED
        - [x] Replace all console statements with logger utility in 19 source files - COMPLETED
        - [x] Fix TypeScript linting warnings - COMPLETED
        - [x] Verify build success (2.96s) - COMPLETED
        - [x] Verify all tests passing (59/59 tests) - COMPLETED
        - [x] Zero linting errors/warnings - COMPLETED
        - [x] Update documentation - COMPLETED
    - [✅] **Remove Production Deployment Blockers** (Issue #528 - P0):
         - [x] Create pre-deployment validation script (scripts/validate-config.js) - COMPLETED
         - [x] Implement seeder-worker.js with full database seeding functionality - COMPLETED
         - [x] Add CI/CD workflow for configuration validation (.github/workflows/validate-config.yml) - COMPLETED
         - [x] Add validate-config script to package.json - COMPLETED
         - [x] Update wrangler.toml with clear placeholder documentation - COMPLETED
         - [x] Create comprehensive DEPLOYMENT_GUIDE.md - COMPLETED
         - [x] Update BACKEND_GUIDE.md with references to deployment guide - COMPLETED
         - [x] Fix lint errors in seeder-worker.js - COMPLETED
         - [x] Verify build success (2.72s) - COMPLETED
         - [x] Verify all tests passing (59/59 tests) - COMPLETED
         - [x] Zero linting errors/warnings - COMPLETED
         - [x] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED
    - [✅] **Environment Variable & Memory Leak Fixes** (Issue #532 - P1, Issue #531 - P1):
         - [x] Clarify environment variable documentation (VITE_GEMINI_API_KEY vs GEMINI_API_KEY) - COMPLETED
         - [x] Update .env.example with clear frontend vs backend variable explanations - COMPLETED
         - [x] Update wrangler.toml with explicit environment variable documentation - COMPLETED
         - [x] Fix memory leak in ChatWindow component - COMPLETED
         - [x] Implement history size limiting (MAX_HISTORY_SIZE = 20) - COMPLETED
         - [x] Add proper useEffect cleanup for history management - COMPLETED
         - [x] Use ref-based history to prevent closure capture - COMPLETED
         - [x] Verify build success (3.27s) - COMPLETED
         - [x] Verify all tests passing (60/60 tests) - COMPLETED
         - [x] Zero linting errors/warnings - COMPLETED
         - [x] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED

---

## 🚀 Fase 3: Advanced AI & Automation (In Progress)
Fokus: Meningkatkan kecerdasan sistem dengan fitur AI yang lebih canggih.

 - [x] **Analisis Nilai AI**:
     - [x] Fitur bagi Guru/Wali Kelas untuk meminta saran AI tentang performa siswa berdasarkan tren nilai - COMPLETED
     - [x] Implementasi analyzeClassPerformance di geminiService.ts
     - [x] Integrasi di GradingManagement.tsx dengan tombol "Analisis AI"
     - [x] Menggunakan Gemini 3 Pro dengan thinking budget untuk analisis mendalam

 - [✅] **Vocal Interaction - Core Services** (Phase 1 - COMPLETED):
      - [x] Voice-to-Text: Integrasi Web Speech API untuk input suara di Chatbot - COMPLETED
      - [x] Text-to-Speech: Implementasi speech synthesis untuk respon AI - COMPLETED
      - [x] Create SpeechRecognitionService with full API integration - COMPLETED
      - [x] Create SpeechSynthesisService with full API integration - COMPLETED
      - [x] Voice type definitions and constants - COMPLETED
      - [x] Voice icon components (Microphone, Speaker, etc.) - COMPLETED
      - [x] Browser compatibility detection and error handling - COMPLETED
      - [x] Indonesian (id-ID) and English (en-US) language support - COMPLETED

   - [✅] **Vocal Interaction - UI Components** (Phase 2 - COMPLETED):
       - [x] VoiceInputButton: Tombol mikrofon dengan recording UI - COMPLETED
       - [x] VoiceSettings: Panel pengaturan suara (bahasa, kecepatan, nada, volume) - COMPLETED
       - [x] React Hooks: useVoiceRecognition, useVoiceSynthesis - COMPLETED
       - [x] ChatWindow Integration: Integrasi fitur suara ke ChatWindow - COMPLETED
       - [x] Accessibility: Mendukung keyboard shortcuts dan ARIA labels - COMPLETED
       - [x] Verify build success (2.89s) - COMPLETED
       - [x] Verify all tests passing (60/60 tests) - COMPLETED
       - [x] Verify lint passing (0 errors, 0 warnings) - COMPLETED
       - [x] Update BLUEPRINT.md with Phase 2 completion - COMPLETED

   - [✅] **Vocal Interaction - Advanced Features** (Phase 3 - COMPLETED):
        - [x] Continuous Mode: Mode berkelanjutan untuk input suara panjang - COMPLETED
        - [x] Voice Commands: Perintah suara ("Buka pengaturan", "Hentikan bicara") - COMPLETED
        - [x] Auto-read All: Opsi untuk membaca semua pesan AI otomatis - COMPLETED
        - [x] VoiceCommandParser: Parser untuk voice commands dengan similarity matching - COMPLETED
        - [x] VoiceMessageQueue: Queue system untuk TTS dengan pause/resume/skip controls - COMPLETED
        - [x] useVoiceCommands hook: React hook untuk voice command parsing - COMPLETED
        - [x] useVoiceQueue hook: React hook untuk message queue management - COMPLETED
        - [x] Enhanced VoiceInputButton: Continuous mode visual feedback - COMPLETED
        - [x] Enhanced ChatWindow: Voice queue controls & command integration - COMPLETED
        - [x] Verify build success (3.15s) - COMPLETED
        - [x] Verify all tests passing (60/60 tests) - COMPLETED
        - [x] Verify lint passing (0 errors, 5 warnings - acceptable) - COMPLETED
        - [x] Update BLUEPRINT.md with Phase 3 completion - COMPLETED

    - [✅] **Vocal Interaction - Testing & Optimization** (Phase 4 - COMPLETED - SANITIZER MODE):
         - [x] Accessibility Audit: WCAG 2.1 AA compliance verification - COMPLETED
         - [x] Performance Optimization: Caching dan lazy loading utilities - COMPLETED
         - [x] Create accessibility audit report (docs/VOICE_ACCESSIBILITY_AUDIT.md) - COMPLETED
         - [x] Implement performance monitoring (voiceOptimization.ts) - COMPLETED
         - [x] Add debounce and throttle hooks - COMPLETED
         - [x] Add LRU cache for voice data - COMPLETED
         - [x] Add memory monitoring utilities - COMPLETED
         - [x] Document improvement priorities (P0-P3) - COMPLETED
         - [x] Verify build success (2.85s) - COMPLETED
         - [x] Verify all tests passing (60/60 tests) - COMPLETED
         - [x] Verify lint passing (0 errors, 5 warnings - acceptable) - COMPLETED
         - [x] Update BLUEPRINT.md, ROADMAP.md, TASK.md - COMPLETED
    - [✅] **Vocal Interaction - Backup & Restore** (Phase 5 - COMPLETED - ARCHITECT MODE):
         - [x] Add VOICE_SETTINGS_BACKUP_KEY to STORAGE_KEYS constants - COMPLETED
         - [x] Create voiceSettingsBackup service (backup/restore/check/delete) - COMPLETED
         - [x] Update SystemStats factory reset to backup voice settings - COMPLETED
         - [x] Add Backup & Restore UI section in VoiceSettings - COMPLETED
         - [x] Add confirmation modals for restore action - COMPLETED
         - [x] Display backup date and delete option - COMPLETED
         - [x] Verify voice settings survive factory reset - COMPLETED
         - [x] Verify build success (5.04s) - COMPLETED
         - [x] Verify all tests passing (60/60 tests) - COMPLETED
         - [x] Verify lint passing (0 errors, 0 warnings) - COMPLETED
         - [x] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED
    - [✅] **File Upload Progress Indicators** (COMPLETED - BUILDER MODE) (Issue #545 - P2):
         - [x] Update fileStorageAPI.upload() to support progress callbacks with XMLHttpRequest - COMPLETED
         - [x] Implement upload speed tracking and ETA calculation in FileUpload component - COMPLETED
         - [x] Add cancel upload functionality with AbortController - COMPLETED
         - [x] Display file size, upload speed, and estimated time remaining - COMPLETED
         - [x] Ensure proper ARIA labels for accessibility - COMPLETED
         - [x] Verify build success (2.92s) - COMPLETED
         - [x] Verify all tests passing (60/60 tests) - COMPLETED
         - [x] Verify lint passing (0 errors, 0 warnings) - COMPLETED
         - [x] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED
    - [✅] **Automasi PPDB - OCR** (COMPLETED - ARCHITECT MODE):
         - [x] Install Tesseract.js dependency for OCR functionality - COMPLETED
         - [x] Create OCR service (ocrService.ts) with Indonesian language support - COMPLETED
         - [x] Implement grade extraction regex patterns for diploma data - COMPLETED
         - [x] Add image upload component to PPDBRegistration.tsx - COMPLETED
         - [x] Implement OCR progress tracking with real-time status updates - COMPLETED
         - [x] Add preview modal for extracted grades with edit capability - COMPLETED
         - [x] Implement auto-form fill with extracted data (name, NISN, school) - COMPLETED
         - [x] Add graceful error handling and fallback to manual input - COMPLETED
         - [x] Verify build success (3.11s) - COMPLETED
         - [x] Verify all tests passing (60/60 tests) - COMPLETED
         - [x] Verify lint passing (0 errors, 0 warnings) - COMPLETED
         - [x] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED

---

## 📱 Fase 4: Mobile Experience & Expansion (In Progress)
Fokus: Meningkatkan aksesibilitas melalui perangkat seluler.

- [✅] **PWA (Progressive Web App)** (COMPLETED - ARCHITECT MODE):
    - [✅] Menambahkan Service Workers untuk dukungan offline penuh - COMPLETED
    - [✅] Fitur "Add to Home Screen" yang lebih optimal - COMPLETED
    - [✅] Configure vite-plugin-pwa with Workbox - COMPLETED
    - [✅] Create PWA icons and manifest - COMPLETED
    - [✅] Implement caching strategies for static assets - COMPLETED
    - [✅] Verify offline functionality and service worker registration - COMPLETED
    - [✅] Test build and ensure all tests passing - COMPLETED
    - [✅] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED
- [✅] **Push Notifications** (COMPLETED - ARCHITECT MODE):
    - [✅] Design Push Notifications architecture and VAPID key strategy - COMPLETED
    - [✅] Create pushNotificationService.ts with Web Push API integration - COMPLETED
    - [✅] Implement notification subscription management - COMPLETED
    - [✅] Create NotificationSettings component for user preferences - COMPLETED
    - [✅] Integrate notification triggers for key events (new announcements, PPDB status, grade updates) - COMPLETED
    - [✅] Add notification history and management UI - COMPLETED
    - [✅] Implement proper error handling and user consent - COMPLETED
    - [✅] Add notification type filtering (announcement, grade, PPDB, event, library, system) - COMPLETED
    - [✅] Implement quiet hours functionality - COMPLETED
    - [✅] Test notifications on supported browsers - COMPLETED
    - [✅] Verify build success (3.17s) - COMPLETED
    - [✅] Verify all tests passing (60/60 tests) - COMPLETED
    - [✅] Verify lint passing (0 errors, 0 warnings) - COMPLETED
    - [✅] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED
    - [✅] Real-time notifications for school announcements, new grades, and PPDB status - COMPLETED
- [✅] **Parent Portal** (COMPLETED - BUILDER MODE):
      - [x] Lock task in TASK.md - IN PROGRESS → COMPLETED
      - [x] Update schema.sql to add parent role and parent_student_relationship table - COMPLETED
      - [x] Update worker.js backend to support parent authentication and data access - COMPLETED
      - [x] Update types.ts to add Parent type and update UserRole - COMPLETED
      - [x] Update apiService.ts to add parentsAPI endpoints - COMPLETED
      - [x] Create ParentDashboard.tsx component with child selection and views - COMPLETED
      - [x] Create parent-specific view components (Schedule, Grades, Attendance) - COMPLETED
      - [x] Add icon components (UserIcon, AcademicCapIcon) - COMPLETED
      - [x] Update App.tsx to integrate ParentDashboard for parent role - COMPLETED
      - [x] Verify build success (4.00s) - COMPLETED
      - [x] Verify all tests passing (60/60 tests) - COMPLETED
      - [x] Verify lint passing (0 errors, 0 warnings) - COMPLETED
      - [x] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED
      - [x] Commit and push to main (commit: b6fc552) - COMPLETED (Direct push, no PR needed)
     - [✅] Wali Murid dashboard for monitoring children's specific data - COMPLETED
  - [✅] **Code Quality & Security Improvements** (COMPLETED - SANITIZER MODE):
         - [x] Replace all remaining console statements with centralized logger - COMPLETED
         - [x] Replace 7 console statements in categoryService.ts - COMPLETED
         - [x] Replace 1 console statement in voiceOptimization.ts - COMPLETED
         - [x] Replace 1 console statement in ChatWindow.tsx - COMPLETED
         - [x] Fix unused variables linting errors in voiceOptimization.ts - COMPLETED
         - [x] Verify all console statements use centralized logger - COMPLETED
         - [x] Verify build success (4.83s) - COMPLETED
         - [x] Verify all tests passing (60/60 tests) - COMPLETED
         - [x] Verify lint passing (0 errors, 0 warnings) - COMPLETED
         - [x] Update documentation (TASK.md, BLUEPRINT.md, ROADMAP.md) - COMPLETED
         - [x] Zero console statements in production code - COMPLETED
     - [✅] **Enhanced Academic Progress Tracking** (COMPLETED - BUILDER MODE) (Issue #556 - P1):
         - [x] Add progress charts showing grade trends over time - COMPLETED
         - [x] Include subject-wise performance breakdown with visualization - COMPLETED
         - [x] Add goal-setting and tracking features for students - COMPLETED
         - [x] Show attendance impact on grades correlation - COMPLETED
         - [x] Export academic reports in PDF format - COMPLETED
         - [x] Install recharts for chart visualization - COMPLETED
         - [x] Install jsPDF and jspdf-autotable for PDF export - COMPLETED
         - [x] Create ProgressAnalytics component with multiple tabs - COMPLETED
         - [x] Add goal-setting interface with progress tracking - COMPLETED
         - [x] Integrate correlation analysis with visual indicators - COMPLETED
          - [x] Update AcademicGrades to toggle between table and analytics views - COMPLETED
          - [x] Add Goal, SubjectPerformance, AttendanceGradeCorrelation types - COMPLETED
          - [x] Verify build success (10.85s) - COMPLETED
          - [x] Verify all tests passing (60/60 tests) - COMPLETED
          - [x] Verify lint passing (0 errors, 2 warnings - acceptable) - COMPLETED
          - [x] Update documentation (TASK.md, BLUEPRINT.md, ROADMAP.md) - COMPLETED
          - [x] Resolve merge conflicts in PR #568 - COMPLETED
          - [x] Merge PR #568 to main - COMPLETED
          - [x] Close Issue #556 - COMPLETED
      - [✅] **Unified Notification System Implementation** (COMPLETED - BUILDER MODE) (Issue #563 - P1):
          - [x] Design notification center architecture with role-based filtering - COMPLETED
          - [x] Create notification template engine for different event types - COMPLETED
          - [x] Build unified notification center UI component - COMPLETED
          - [x] Implement notification history with search functionality - COMPLETED
          - [x] Add role-based notification filtering logic - COMPLETED
          - [x] Integrate with existing pushNotificationService - COMPLETED
          - [x] Test notification center across all user roles - COMPLETED
          - [x] Verify build success (3.15s) - COMPLETED
          - [x] Verify all tests passing (60/60 tests) - COMPLETED
          - [x] Verify lint passing (0 errors, 1 warning - acceptable) - COMPLETED
          - [x] Update documentation (BLUEPRINT.md, ROADMAP.md, TASK.md) - COMPLETED
          - [x] Commit, push, and create PR - PENDING


