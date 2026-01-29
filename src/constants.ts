
import { VoiceLanguage } from './types';

// Centralized Storage Keys to prevent typo and ensure consistency
export const STORAGE_KEYS = {
    SITE_CONTENT: 'malnu_site_content',
    USERS: 'malnu_users',
    GRADES: 'malnu_grades',
    ASSIGNMENTS: 'malnu_assignments',
    ASSIGNMENT_SUBMISSIONS: 'malnu_assignment_submissions',
    CLASS_DATA: 'malnu_class_data',
    PPDB_REGISTRANTS: 'malnu_ppdb_registrants',
    PPDB_DRAFT: 'malnu_ppdb_draft',
    MATERIALS: 'malnu_materials',
    INVENTORY: 'malnu_inventory',
    EVENTS: 'malnu_events',
    AUTH_SESSION: 'malnu_auth_session',
    THEME: 'malnu_theme',
    VOICE_STORAGE_KEY: 'malnu_voice_settings',
    VOICE_SETTINGS_BACKUP_KEY: 'malnu_voice_settings_backup',
    NOTIFICATION_SETTINGS_KEY: 'malnu_notification_settings',
    NOTIFICATION_HISTORY_KEY: 'malnu_notification_history',
    PUSH_SUBSCRIPTION_KEY: 'malnu_push_subscription',
    MATERIAL_FAVORITES: 'malnu_material_favorites',
    MATERIAL_RATINGS: 'malnu_material_ratings',
    READING_PROGRESS: 'malnu_reading_progress',
    OFFLINE_MATERIALS: 'malnu_offline_materials',
    AI_CACHE: 'malnu_ai_cache',
    
    // Authentication tokens (refactored from hardcoded)
    AUTH_TOKEN: 'malnu_auth_token',
    REFRESH_TOKEN: 'malnu_refresh_token',
    
    // User and push notification data (refactored from hardcoded)
    USER: 'malnu_user',
    CHILDREN: 'malnu_children',
    NOTIFICATION_BATCHES: 'malnu_notification_batches',
    NOTIFICATION_TEMPLATES: 'malnu_notification_templates',
    NOTIFICATION_ANALYTICS: 'malnu_notification_analytics',
    
    // E-Library student features (refactored from hardcoded)
    STUDENT_BOOKMARKS: 'malnu_student_bookmarks',
    STUDENT_FAVORITES: 'malnu_student_favorites',
    STUDENT_READING_PROGRESS: 'malnu_student_reading_progress',
    STUDENT_OFFLINE_DOWNLOADS: 'malnu_student_offline_downloads',
    STUDENT_REVIEWS: 'malnu_student_reviews',
    
    // Academic goals (dynamic factory function)
    STUDENT_GOALS: (studentNIS: string) => `malnu_student_goals_${studentNIS}`,
    
    // Site editor (refactored from hardcoded)
    SITE_EDITOR_HISTORY: 'malnu_site_editor_history',
    AI_EDITOR_AUDIT_LOG: 'malnu_ai_editor_audit_log',
    
    // Category service cache keys (refactored from hardcoded)
    SUBJECTS_CACHE: 'malnu_subjects_cache',
    CLASSES_CACHE: 'malnu_classes_cache',
    CATEGORY_SUGGESTIONS: 'malnu_category_suggestions',
    MATERIAL_STATS: 'malnu_material_stats',
    
    // OCR Integration (new)
    MATERIALS_OCR_ENABLED: 'malnu_materials_ocr_enabled',
    OCR_PROCESSING_STATE: 'malnu_ocr_processing_state',
    OCR_CACHE: 'malnu_ocr_cache',
    SEARCH_INDEX: 'malnu_search_index',
    
    // Dashboard cache keys for offline support
    TEACHER_DASHBOARD_CACHE: 'malnu_teacher_dashboard_cache',
    ADMIN_DASHBOARD_CACHE: 'malnu_admin_dashboard_cache',
    ATTENDANCE_CACHE: 'malnu_attendance_cache',
    QUEUED_ACTIONS: 'malnu_queued_actions',
    
    // Programs and News storage keys
    PROGRAMS: 'malnu_programs',
    NEWS: 'malnu_news',
    
    // Parent Grade Notifications (new)
    PARENT_NOTIFICATION_SETTINGS: 'malnu_parent_notification_settings',
    PARENT_NOTIFICATION_QUEUE: 'malnu_parent_notification_queue',
    
    // OCR Audit
    OCR_AUDIT: 'malnu_ocr_audit',
    OCR_VALIDATION_QUEUE: 'malnu_queued_ocr_validations',
    OCR_VALIDATION_EVENTS: 'ocr_validation_events',
    
    // Student Insights (dynamic factory functions)
    STUDENT_INSIGHTS: (studentId: string) => `malnu_student_insights_${studentId}`,
    INSIGHTS_ENABLED: (studentId: string) => `malnu_insights_enabled_${studentId}`,

    // Study Plans (dynamic factory function)
    STUDY_PLANS: (studentId: string) => `malnu_study_plans_${studentId}`,
    ACTIVE_STUDY_PLAN: (studentId: string) => `malnu_active_study_plan_${studentId}`,
    STUDY_PLAN_ANALYTICS: (studentId: string) => `malnu_study_plan_analytics_${studentId}`,
    STUDY_PLAN_HISTORY: (studentId: string) => `malnu_study_plan_history_${studentId}`,
    WEEKLY_PROGRESS: (studentId: string, weekNumber: number) => `malnu_weekly_progress_${studentId}_${weekNumber}`,
    
    // Voice Notifications
    VOICE_NOTIFICATIONS_QUEUE: 'malnu_voice_notifications_queue',
    VOICE_NOTIFICATIONS_HISTORY: 'malnu_voice_notifications_history',
    
    // WebSocket real-time sync
    WS_CONNECTION: 'malnu_ws_connection',
    ANNOUNCEMENTS: 'malnu_announcements',
    NOTIFICATIONS: 'malnu_notifications',
    ATTENDANCE: 'malnu_attendance',
    
    // WebSocket sync timestamps
    LAST_SYNC_TIME: 'malnu_last_sync_time',
    
    // Grade Analytics (new)
    GRADE_ANALYTICS_EXPORT: (classId: string) => `malnu_grade_analytics_export_${classId}`,

    // Grade History for tracking changes (new)
    GRADE_HISTORY: 'malnu_grade_history',
    
    // AI Analysis cache for offline support
    CACHED_AI_ANALYSES: 'malnu_cached_ai_analyses',
    
    // Offline data service for student/parent portals
    OFFLINE_STUDENT_DATA: 'malnu_offline_student_data',
    OFFLINE_PARENT_DATA: 'malnu_offline_parent_data',
    
    // Email Service (new)
    EMAIL_TEMPLATES: 'malnu_email_templates',
    EMAIL_QUEUE: 'malnu_email_queue',
    EMAIL_NOTIFICATION_SETTINGS: 'malnu_email_notification_settings',
    EMAIL_ANALYTICS: 'malnu_email_analytics',
    EMAIL_DELIVERY_HISTORY: 'malnu_email_delivery_history',
    
    // AI Quiz Generation (new)
    QUIZZES: 'malnu_quizzes',
    QUIZ_DRAFT: 'malnu_quiz_draft',
    QUIZ_ATTEMPTS: (quizId: string) => `malnu_quiz_attempts_${quizId}`,
    QUIZ_ANALYTICS: (quizId: string) => `malnu_quiz_analytics_${quizId}`,
    QUIZ_GENERATION_CACHE: 'malnu_quiz_generation_cache',
    AI_FEEDBACK_CACHE: 'malnu_ai_feedback_cache',

    // Messaging System (new)
    MESSAGES: 'malnu_messages',
    CONVERSATIONS: 'malnu_conversations',
    ACTIVE_CONVERSATION: 'malnu_active_conversation',
    TYPING_INDICATORS: 'malnu_typing_indicators',
    MESSAGE_DRAFTS: (conversationId: string) => `malnu_message_draft_${conversationId}`,
    UNREAD_COUNTS: 'malnu_unread_counts',
    
    // Announcement System (new)
    ANNOUNCEMENT_DRAFT: 'malnu_announcement_draft',
    ANNOUNCEMENT_CACHE: 'malnu_announcement_cache',
    ANNOUNCEMENT_READ: (announcementId: string, userId: string) => `malnu_announcement_read_${announcementId}_${userId}`,
    ANNOUNCEMENT_ANALYTICS: (announcementId: string) => `malnu_announcement_analytics_${announcementId}`,

    // Activity Feed (new)
    ACTIVITY_FEED: 'malnu_activity_feed',
} as const;

export const USER_ROLES = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    PARENT: 'parent',
    STAFF: 'staff',
    OSIS: 'osis',
    WAKASEK: 'wakasek',
    KEPSEK: 'kepsek',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_EXTRA_ROLES = {
    STAFF: 'staff',
    OSIS: 'osis',
    WAKASEK: 'wakasek',
    KEPSEK: 'kepsek',
} as const;

export type UserExtraRole = typeof USER_EXTRA_ROLES[keyof typeof USER_EXTRA_ROLES];

export const APP_CONFIG = {
    SCHOOL_NAME: 'MA Malnu Kananga',
    SCHOOL_NPSN: '69881502',
};

export const EXTERNAL_URLS = {
    MAKER_SUITE_API: 'https://makersuite.google.com/app/apikey',
    PLACEHOLDER_IMAGE_BASE: 'https://placehold.co/600x400?text=',
    RDM_PORTAL: 'https://rdm.ma-malnukananga.sch.id',
    KEMENAG: 'https://kemenag.go.id',
    EMIS: 'https://emis.kemenag.go.id',
    SIMPATIKA: 'https://simpatika.kemenag.go.id',
} as const;

export const VOICE_CONFIG = {
    DEFAULT_RECOGNITION_CONFIG: {
        language: VoiceLanguage.Indonesian,
        continuous: false,
        interimResults: true,
        maxAlternatives: 1,
    },
    DEFAULT_SYNTHESIS_CONFIG: {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
    },
    SPEECH_RECOGNITION_TIMEOUT: 5000,
    DEBOUNCE_DELAY: 500,
    MAX_VOICE_CACHE_SIZE: 50,
CONTINUOUS_MODE_TIMEOUT: 10000,
    COMMAND_DETECTION_THRESHOLD: 0.7,
    MESSAGE_QUEUE_MAX_SIZE: 50,
} as const;

export const ERROR_MESSAGES = {
    VOICE_NOT_SUPPORTED: 'Browser Anda tidak mendukung fitur suara. Silakan gunakan Chrome, Edge, atau Safari terbaru.',
    MICROPHONE_DENIED: 'Izin mikrofon ditolak. Silakan izinkan akses mikrofon di pengaturan browser Anda.',
    NO_SPEECH_DETECTED: 'Tidak ada suara terdeteksi. Silakan coba lagi.',
    SPEECH_PROCESSING_FAILED: 'Gagal memproses suara. Silakan coba lagi.',
    TTS_NOT_SUPPORTED: 'Browser Anda tidak mendukung fitur suara. Silakan gunakan Chrome, Edge, atau Safari terbaru.',
    COMMAND_NOT_RECOGNIZED: 'Perintah tidak dikenali. Silakan coba lagi.',
    QUEUE_FULL: 'Antrian pesan penuh. Tunggu hingga pesan selesai dibaca.',
} as const;

export const ADMIN_EMAIL = 'admin@malnu-kananga.sch.id';
export const INFO_EMAIL = 'info@ma-malnukananga.sch.id';

export const VOICE_COMMANDS = {
    OPEN_SETTINGS: ['buka pengaturan', 'buka setting', 'open settings', 'open setting'],
    CLOSE_SETTINGS: ['tutup pengaturan', 'tutup setting', 'close settings', 'close setting'],
    STOP_SPEAKING: ['hentikan bicara', 'berhenti bicara', 'stop speaking', 'stop talk'],
    PAUSE_SPEAKING: ['jeda bicara', 'pause speaking', 'pause'],
    RESUME_SPEAKING: ['lanjutkan bicara', 'resume speaking', 'resume'],
    READ_ALL: ['baca semua', 'baca semua pesan', 'read all', 'read all messages'],
    CLEAR_CHAT: ['hapus chat', 'clear chat', 'clear history'],
    SEND_MESSAGE: ['kirim', 'send', 'kirim pesan'],
    TOGGLE_VOICE: ['aktifkan suara', 'matikan suara', 'toggle voice', 'toggle speech'],
    
    // Common dashboard commands
    GO_HOME: ['pulang', 'kembali', 'go home', 'beranda', 'dashboard'],
    LOGOUT: ['keluar', 'logout', 'sign out'],
    HELP: ['bantuan', 'help', 'bisa ngapain saja'],
    
    // Admin dashboard commands
    SHOW_PPDB: ['tampilkan ppdb', 'lihat pendaftaran', 'show ppdb', 'buka ppdb'],
    VIEW_GRADES_OVERVIEW: ['lihat nilai', 'tampilkan nilai', 'view grades', 'grades overview'],
    OPEN_LIBRARY: ['buka perpustakaan', 'perpustakaan', 'open library'],
    SEARCH_LIBRARY: ['cari materi', 'cari di perpustakaan', 'search materials', 'search library', 'cari materi {query}', 'search materials {query}', 'cari di perpustakaan {query}', 'search library {query}'],
    GO_TO_CALENDAR: ['kalender', 'buka kalender', 'calendar', 'go to calendar'],
    SHOW_STATISTICS: [' statistik', 'tampilkan statistik', 'show statistics', 'stats'],
    
    // Teacher dashboard commands
    SHOW_MY_CLASSES: ['kelas saya', 'tampilkan kelas', 'show my classes', 'my classes'],
    OPEN_GRADING: ['nilai', 'buka penilaian', 'open grading', 'grading'],
    VIEW_ATTENDANCE: ['absensi', 'lihat absensi', 'view attendance', 'attendance'],
    CREATE_ANNOUNCEMENT: ['buat pengumuman', 'pengumuman baru', 'create announcement', 'announcement'],
    VIEW_SCHEDULE: ['jadwal', 'lihat jadwal', 'view schedule', 'schedule'],

    // Attendance management commands
    MARK_PRESENT: ['hadir', 'set hadir', 'mark present', 'set present'],
    MARK_ABSENT: ['absen', 'set absen', 'mark absent', 'set absent'],
    MARK_LATE: ['terlambat', 'set terlambat', 'mark late', 'set late'],
    MARK_PERMITTED: ['izin', 'set izin', 'mark permitted', 'permitted'],
    SUBMIT_ATTENDANCE: ['kirim kehadiran', 'submit attendance', 'simpan absensi', 'save attendance'],
    SHOW_ATTENDANCE: ['tampilkan kehadiran', 'show attendance', 'lihat kehadiran', 'view attendance list'],
    EXPORT_ATTENDANCE: ['ekspor kehadiran', 'export attendance', 'ekspor absensi', 'export attendance list'],
    MARK_ALL_PRESENT: ['semua hadir', 'all present', 'set semua hadir', 'set all present'],

    // Grading management commands
    SET_GRADE: ['set nilai', 'set grade', 'beri nilai', 'give grade'],
    GRADE_NEXT: ['siswa berikutnya', 'next student', 'lanjut ke siswa', 'next student please'],
    GRADE_PASS: ['lulus', 'pass', 'set lulus', 'set pass'],
    GRADE_FAIL: ['gagal', 'fail', 'set gagal', 'set fail'],
    MARK_GRADE_ABSENT: ['tidak ikut ujian', 'absent for exam', 'absen ujian', 'exam absent'],
    BULK_GRADE: ['nilai semua', 'grade all', 'bulk grade', 'masukkan semua nilai'],
    SUBMIT_GRADES: ['kirim nilai', 'submit grades', 'simpan nilai', 'save grades'],
    
    // Student dashboard commands
    SHOW_MY_GRADES: ['nilai saya', 'lihat nilai saya', 'show my grades', 'my grades'],
    CHECK_ATTENDANCE: ['cek absensi', 'absensi saya', 'check attendance', 'my attendance'],
    VIEW_INSIGHTS: ['insight', 'lihat insight', 'view insights', 'my insights'],
    
    // Parent dashboard commands
    VIEW_CHILD_GRADES: ['nilai anak', 'lihat nilai anak', 'view child grades', 'child grades'],
    VIEW_CHILD_ATTENDANCE: ['absensi anak', 'lihat absensi anak', 'view child attendance', 'child attendance'],
    VIEW_CHILD_SCHEDULE: ['jadwal anak', 'lihat jadwal anak', 'view child schedule', 'child schedule'],
    SEE_NOTIFICATIONS: ['notifikasi', 'lihat notifikasi', 'see notifications', 'notifications'],
} as const;

export const NOTIFICATION_CONFIG = {
    DEFAULT_SETTINGS: {
        enabled: true,
        announcements: true,
        grades: true,
        ppdbStatus: true,
        events: true,
        library: true,
        system: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00',
        },
        voiceNotifications: {
            enabled: false,
            highPriorityOnly: true,
            respectQuietHours: true,
            voiceSettings: {
                rate: 1.0,
                pitch: 1.0,
                volume: 0.8,
            },
            categories: {
                grades: true,
                attendance: true,
                system: true,
                meetings: true,
            },
        },
    },
    MAX_HISTORY_SIZE: 100,
    NOTIFICATION_TTL: 2592000000, // 30 days in milliseconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    VIBRATION_PATTERN: [200, 100, 200],
} as const;

export const NOTIFICATION_ERROR_MESSAGES = {
    NOT_SUPPORTED: 'Browser Anda tidak mendukung notifikasi. Silakan gunakan Chrome, Edge, atau Firefox terbaru.',
    PERMISSION_DENIED: 'Izin notifikasi ditolak. Silakan izinkan notifikasi di pengaturan browser Anda.',
    SUBSCRIPTION_FAILED: 'Gagal mendaftar ke notifikasi. Silakan coba lagi.',
    INVALID_KEYS: 'Kunci aplikasi tidak valid. Hubungi administrator.',
    NETWORK_ERROR: 'Gagal mengirim notifikasi. Periksa koneksi internet Anda.',
    SERVICE_WORKER_FAILED: 'Service Worker tidak tersedia. Pastikan HTTPS aktif.',
} as const;

export const NOTIFICATION_ICONS = {
    DEFAULT: '/pwa-192x192.png',
    ANNOUNCEMENT: '/pwa-192x192.png',
    GRADE: '/pwa-192x192.png',
    PPDB: '/pwa-192x192.png',
    EVENT: '/pwa-192x192.png',
    LIBRARY: '/pwa-192x192.png',
    SYSTEM: '/pwa-192x192.png',
    OCR: '/pwa-192x192.png',
} as const;

export const VOICE_NOTIFICATION_CONFIG = {
    DEFAULT_VOICE_SETTINGS: {
        enabled: true,
        highPriorityOnly: true,
        respectQuietHours: true,
        voiceSettings: {
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8,
        },
        categories: {
            grades: true,
            attendance: true,
            system: true,
            meetings: true,
        },
    },
    MAX_QUEUE_SIZE: 10,
    MAX_HISTORY_SIZE: 50,
    SPEECH_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 2000, // 2 seconds
    HIGH_PRIORITY_TYPES: ['grade', 'attendance', 'system'],
} as const;

export const OPACITY_TOKENS = {
    WHITE_10: 'bg-white/10%',
    WHITE_20: 'bg-white/20%',
    WHITE_30: 'bg-white/30%',
    WHITE_40: 'bg-white/40%',
    WHITE_50: 'bg-white/50%',
    WHITE_80: 'bg-white/80%',
    WHITE_95: 'bg-white/95%',
    WHITE_100: 'bg-white',
    NEUTRAL_800_80: 'dark:bg-neutral-800/80%',
    NEUTRAL_800_95: 'dark:bg-neutral-800/95%',
    NEUTRAL_900_80: 'dark:bg-neutral-900/80%',
    NEUTRAL_900_95: 'dark:bg-neutral-900/95%',
    NEUTRAL_900_10: 'dark:ring-neutral-900/10%',
    WHITE_10_HOVER: 'hover:bg-white/20%',
    WHITE_20_HOVER: 'hover:bg-white/30%',
    WHITE_30_HOVER: 'hover:bg-white/40%',
    RING_WHITE_50: 'focus:ring-white/50%',
    RING_PRIMARY_50: 'focus:ring-primary-500/50%',
    BACKDROP_BLUR: 'backdrop-blur',
    BACKDROP_BLUR_SM: 'backdrop-blur-sm',
    BACKDROP_BLUR_XL: 'backdrop-blur-xl',
} as const;
