
# Roadmap Pengembangan (Development Roadmap)

**Created**: 2025-01-01  
**Last Updated**: 2026-01-05  
**Version**: 2.1.0  
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

## 🚀 Fase 2: Integrasi Backend Nyata (In Progress)
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

## 🤖 Fase 3: Advanced AI & Automation
Fokus: Meningkatkan kecerdasan sistem dengan fitur AI yang lebih canggih.

- [ ] **Analisis Nilai AI**:
    - [ ] Fitur bagi Guru/Wali Kelas untuk meminta saran AI tentang performa siswa berdasarkan tren nilai.
- [ ] **Vocal Interaction**:
    - [ ] Menambahkan dukungan *Voice-to-Text* dan *Text-to-Speech* pada Chatbot agar lebih aksesibel.
- [ ] **Automasi PPDB**:
    - [ ] OCR (Optical Character Recognition) untuk membaca nilai dari scan ijazah pendaftar secara otomatis.

---

## 📱 Fase 4: Mobile Experience & Expansion
Fokus: Meningkatkan aksesibilitas melalui perangkat seluler.

- [ ] **PWA (Progressive Web App)**:
    - [ ] Menambahkan Service Workers untuk dukungan offline penuh.
    - [ ] Fitur "Add to Home Screen" yang lebih optimal.
- [ ] **Push Notifications**:
    - [ ] Notifikasi real-time untuk pengumuman sekolah, nilai baru, atau status PPDB.
- [ ] **Parent Portal**:
    - [ ] Dashboard khusus Wali Murid untuk memantau anak secara spesifik.
