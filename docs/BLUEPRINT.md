# Blueprint Sistem Informasi Manajemen Sekolah

**Created**: 2025-01-01
**Last Updated**: 2026-01-06
**Version**: 2.1.0
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
│   ├── sections/      # Page sections
│   └── ui/           # Reusable UI components
├── config/             # Configuration files (permissions, notification templates)
├── contexts/           # React contexts
├── constants.ts        # Centralized constants (STORAGE_KEYS)
├── data/              # Default data and static resources
├── hooks/             # Custom React hooks (useVoiceRecognition, useVoiceSynthesis)
├── services/          # API and business logic services
├── tests/             # Integration tests
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and helpers
├── App.tsx            # Main application component
├── config.ts          # Main configuration
└── index.tsx          # Entry point
```

### 2.2 Teknologi Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS
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
- Build time improvement: 12.71s → 9.76s (23% faster)
- Simplified manualChunks strategy
- Google GenAI library manually chunked

## 6. CI/CD & DevOps

### 6.1 GitHub Actions
- Action versions: Latest stable (checkout@v5, setup-node@v6, codeql-action@v4, cache@v5)
- Lockfile-based cache keys untuk optimal cache invalidation
- Reusable composite actions (harden-runner, failure-notification)
- Standardized permissions dan error handling
- Pre-deployment configuration validation

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

**Last Updated**: 2026-01-06
**Version**: 2.1.0
**Status**: Active
