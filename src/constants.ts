
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
    PPDB_NIS_COUNTER: 'malnu_ppdb_nis_counter',
    PPDB_METRICS: 'malnu_ppdb_metrics',
    PPDB_PIPELINE_STATUS: (registrantId: string) => `malnu_ppdb_pipeline_status_${registrantId}`,
    PPDB_AUTO_CREATION_CONFIG: 'malnu_ppdb_auto_creation_config',
    PPDB_AUTO_CREATION_AUDIT: (registrantId: string) => `malnu_ppdb_auto_creation_audit_${registrantId}`,
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
    
    // Parent Progress Reports (new)
    PARENT_PROGRESS_REPORTS: (studentId: string) => `malnu_parent_progress_reports_${studentId}`,
    PARENT_REPORT_SETTINGS: (parentId: string) => `malnu_parent_report_settings_${parentId}`,

    // Student Timeline (refactored from hardcoded in Issue #1393)
    TIMELINE_CACHE: (studentId: string) => `malnu_timeline_${studentId}`,
    
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

    // Payments (dynamic factory function)
    PAYMENT_HISTORY: (parentId: string) => `malnu_payment_history_${parentId}`,
    PAYMENT_IN_PROGRESS: (parentId: string) => `malnu_payment_in_progress_${parentId}`,
    PAYMENT_SETTINGS: (parentId: string) => `malnu_payment_settings_${parentId}`,
    STUDY_PLAN_HISTORY: (studentId: string) => `malnu_study_plan_history_${studentId}`,
    WEEKLY_PROGRESS: (studentId: string, weekNumber: number) => `malnu_weekly_progress_${studentId}_${weekNumber}`,
    STUDY_PLAN_MATERIAL_RECOMMENDATIONS: (studyPlanId: string) => `malnu_study_plan_material_recommendations_${studyPlanId}`,

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
    
    // Class AI Insights for teacher analytics (new - Issue #1231)
    CLASS_INSIGHTS: (classId: string) => `malnu_class_insights_${classId}`,
    CLASS_INSIGHTS_TIMESTAMP: (classId: string) => `malnu_class_insights_timestamp_${classId}`,
    
    // Offline data service for student/parent portals
    OFFLINE_STUDENT_DATA: 'malnu_offline_student_data',
    OFFLINE_PARENT_DATA: 'malnu_offline_parent_data',
    
    // Offline data service for teacher/admin dashboards (Issue #1315)
    OFFLINE_TEACHER_DATA: 'malnu_offline_teacher_data',
    OFFLINE_ADMIN_DATA: 'malnu_offline_admin_data',
    
    // Email Service (new)
    EMAIL_TEMPLATES: 'malnu_email_templates',
    EMAIL_QUEUE: 'malnu_email_queue',
    EMAIL_NOTIFICATION_SETTINGS: 'malnu_email_notification_settings',
    EMAIL_ANALYTICS: 'malnu_email_analytics',
    EMAIL_DELIVERY_HISTORY: 'malnu_email_delivery_history',
    EMAIL_DIGEST_QUEUE: 'malnu_email_digest_queue',

    // Quiz Auto-Save (new - Issue #1351)
    QUIZ_AUTO_SAVE: (quizId: string) => `malnu_quiz_auto_save_${quizId}`,
    EMAIL_NOTIFICATION_PREFERENCES: (userId: string) => `malnu_email_notification_prefs_${userId}`,
    EMAIL_DELIVERY_HISTORY_USER: (userId: string) => `malnu_email_notification_delivery_${userId}`,
    EMAIL_DIGEST_QUEUE_USER: (userId: string) => `malnu_email_digest_queue_${userId}`,
    
    // AI Quiz Generation (new)
    QUIZZES: 'malnu_quizzes',
    QUIZ_DRAFT: 'malnu_quiz_draft',
    QUIZ_ATTEMPTS: (quizId: string) => `malnu_quiz_attempts_${quizId}`,
    QUIZ_ANALYTICS: (quizId: string) => `malnu_quiz_analytics_${quizId}`,
    QUIZ_GENERATION_CACHE: 'malnu_quiz_generation_cache',
    AI_FEEDBACK_CACHE: 'malnu_ai_feedback_cache',
    QUIZ_GRADE_INTEGRATION_AUDIT: 'malnu_quiz_grade_integration_audit',

    // Messaging System (new)
    MESSAGES: 'malnu_messages',
    CONVERSATIONS: 'malnu_conversations',
    ACTIVE_CONVERSATION: 'malnu_active_conversation',
    TYPING_INDICATORS: 'malnu_typing_indicators',
    MESSAGE_DRAFTS: (conversationId: string) => `malnu_message_draft_${conversationId}`,
    UNREAD_COUNTS: 'malnu_unread_counts',
    
    // Communication Log (new for Issue #973)
    COMMUNICATION_LOG: 'malnu_communication_log',
    COMMUNICATION_LOG_FILTERS: 'malnu_communication_log_filters',
    
    // Announcement System (new)
    ANNOUNCEMENT_DRAFT: 'malnu_announcement_draft',
    ANNOUNCEMENT_CACHE: 'malnu_announcement_cache',
    ANNOUNCEMENT_READ: (announcementId: string, userId: string) => `malnu_announcement_read_${announcementId}_${userId}`,
    ANNOUNCEMENT_ANALYTICS: (announcementId: string) => `malnu_announcement_analytics_${announcementId}`,

    // Activity Feed (new)
    ACTIVITY_FEED: 'malnu_activity_feed',

    // Progress Report Auto-Generation (new)
    PROGRESS_REPORT_AUTO_GENERATION_AUDIT: 'malnu_progress_report_auto_generation_audit',

    ACCESSIBILITY_SETTINGS: 'malnu_accessibility_settings',
    COMMAND_PALETTE_RECENT: 'malnu_command_palette_recent',
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

import { ENV } from './config/env';

export const APP_CONFIG = {
    SCHOOL_NAME: ENV.SCHOOL.NAME,
    SCHOOL_NPSN: ENV.SCHOOL.NPSN,
    SCHOOL_ADDRESS: ENV.SCHOOL.ADDRESS,
    SCHOOL_PHONE: ENV.SCHOOL.PHONE,
    SCHOOL_EMAIL: ENV.SCHOOL.EMAIL,
    SCHOOL_WEBSITE: ENV.SCHOOL.WEBSITE,
    SK_PENDIRIAN: {
        NUMBER: 'D/Wi/MA./101/2000',
        DATE: '20-09-2000',
    },
    SK_OPERASIONAL: {
        NUMBER: 'D/Wi/MA./101/2000',
        DATE: '20-09-2000',
    },
} as const;

export const EXTERNAL_URLS = {
    MAKER_SUITE_API: 'https://makersuite.google.com/app/apikey',
    PLACEHOLDER_IMAGE_BASE: 'https://placehold.co/600x400?text=',
    RDM_PORTAL: 'https://rdm.ma-malnukananga.sch.id',
    KEMENAG: 'https://kemenag.go.id',
    EMIS: 'https://emis.kemenag.go.id',
    SIMPATIKA: 'https://simpatika.kemenag.go.id',
    // Google Fonts - Flexy: Never hardcode external URLs!
    GOOGLE_FONTS_INTER: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    GOOGLE_FONTS_JETBRAINS: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap',
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
    MAX_SPEAK_ATTEMPTS: 3,
    PREFERRED_LANGUAGE: 'id-ID',
    FALLBACK_LANGUAGE: 'en-US',
    RATE_BOUNDS: { MIN: 0.1, MAX: 10 },
    PITCH_BOUNDS: { MIN: 0, MAX: 2 },
    VOLUME_BOUNDS: { MIN: 0, MAX: 1 },
    TRANSCRIPT_PREVIEW_LENGTH: 30,
} as const;

export const ERROR_MESSAGES = {
    VOICE_NOT_SUPPORTED: 'Browser Anda tidak mendukung fitur suara. Silakan gunakan Chrome, Edge, atau Safari terbaru.',
    MICROPHONE_DENIED: 'Izin mikrofon ditolak. Silakan izinkan akses mikrofon di pengaturan browser Anda.',
    MICROPHONE_ACCESS_ERROR: 'Tidak dapat mengakses mikrofon. Pastikan mikrofon terhubung dan tidak digunakan aplikasi lain.',
    NO_SPEECH_DETECTED: 'Tidak ada suara terdeteksi. Silakan coba lagi.',
    SPEECH_PROCESSING_FAILED: 'Gagal memproses suara. Silakan coba lagi.',
    TTS_NOT_SUPPORTED: 'Browser Anda tidak mendukung fitur suara. Silakan gunakan Chrome, Edge, atau Safari terbaru.',
    COMMAND_NOT_RECOGNIZED: 'Perintah tidak dikenali. Silakan coba lagi.',
    QUEUE_FULL: 'Antrian pesan penuh. Tunggu hingga pesan selesai dibaca.',
    NETWORK_ERROR: 'Kesalahan jaringan terjadi. Periksa koneksi internet Anda.',
} as const;

export const ADMIN_EMAIL = ENV.EMAIL.ADMIN;
export const INFO_EMAIL = ENV.SCHOOL.EMAIL;

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

    // Study plan commands
    OPEN_STUDY_PLANS: ['buka rencana belajar', 'buka study plan', 'tampilkan rencana belajar', 'lihat jadwal belajar', 'study plan', 'rencana belajar'],
    VIEW_RECOMMENDATIONS: ['tampilkan rekomendasi materi', 'buat rekomendasi materi', 'apa materi yang disarankan', 'lihat materi yang disarankan', 'rekomendasi materi'],
    CHECK_PROGRESS: ['berapa progres belajar', 'cek progres study plan', 'sejauh mana progres belajar', 'lihat progres belajar saya', 'progres belajar'],
    CREATE_STUDY_PLAN: ['buat rencana belajar baru', 'create study plan', 'buat study plan'],
    VIEW_STUDY_ANALYTICS: ['lihat analitik belajar', 'analitik belajar', 'view study analytics'],
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

// Push notification log messages - Flexy: Never hardcode log messages!
export const PUSH_NOTIFICATION_LOG_MESSAGES = {
    INIT_FAILED: 'Failed to initialize push subscription',
    SAVE_SUBSCRIPTION_FAILED: 'Failed to save push subscription:',
    LOAD_SUBSCRIPTION_FAILED: 'Failed to load push subscription:',
    CLEAR_SUBSCRIPTION_FAILED: 'Failed to clear push subscription:',
    SERVICE_WORKER_NOT_SUPPORTED: 'Service Worker not supported, cannot load push subscription.',
    SUBSCRIPTION_LOADED: 'Loaded existing push subscription from browser.',
    NO_SUBSCRIPTION_FOUND: 'No active push subscription found.',
    PERMISSION_ALREADY_GRANTED: 'Notification permission already granted',
    PERMISSION_GRANTED: 'Notification permission granted',
    PERMISSION_DENIED: 'Notification permission denied',
    REQUEST_PERMISSION_FAILED: 'Failed to request notification permission:',
    SUBSCRIBE_SUCCESS: 'Successfully subscribed to push notifications',
    SUBSCRIBE_FAILED: 'Failed to subscribe to push notifications:',
    NO_SUBSCRIPTION_TO_UNSUBSCRIBE: 'No active subscription to unsubscribe',
    UNSUBSCRIBE_SUCCESS: 'Successfully unsubscribed from push notifications',
    UNSUBSCRIBE_FAILED: 'Failed to unsubscribe from push notifications:',
    CLEANUP_COMPLETE: 'Push notification handler cleaned up',
    NOTIFICATIONS_NOT_SUPPORTED: 'Notifications not supported',
    SERVICE_WORKER_NOT_AVAILABLE: 'Service worker not available',
    PUSH_MANAGER_NOT_AVAILABLE: 'PushManager not available',
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

const HIGH_PRIORITY_EVENTS: string[] = ['grade_created', 'grade_updated', 'attendance_updated', 'announcement_created', 'message_created'];
const NORMAL_PRIORITY_EVENTS: string[] = ['library_material_added', 'event_created', 'event_updated'];
const LOW_PRIORITY_EVENTS: string[] = ['library_material_updated', 'announcement_updated', 'message_updated', 'attendance_marked'];

export const ACTIVITY_EVENT_PRIORITY = {
    HIGH: HIGH_PRIORITY_EVENTS,
    NORMAL: NORMAL_PRIORITY_EVENTS,
    LOW: LOW_PRIORITY_EVENTS,
} as const;

export const ACTIVITY_NOTIFICATION_CONFIG = {
    getPriority: (eventType: string): 'high' | 'normal' | 'low' => {
        if (HIGH_PRIORITY_EVENTS.includes(eventType)) {
            return 'high';
        }
        if (NORMAL_PRIORITY_EVENTS.includes(eventType)) {
            return 'normal';
        }
        return 'low';
    },
    getNotificationType: (eventType: string): 'grade' | 'announcement' | 'event' | 'library' | 'system' => {
        if (eventType.startsWith('grade')) return 'grade';
        if (eventType.startsWith('attendance')) return 'system';
        if (eventType.startsWith('library')) return 'library';
        if (eventType.startsWith('announcement')) return 'announcement';
        if (eventType.startsWith('event')) return 'event';
        if (eventType.startsWith('message')) return 'system';
        return 'system';
    },
    shouldTriggerNotification: (eventType: string, settings?: { grades?: boolean; announcements?: boolean; events?: boolean; library?: boolean; system?: boolean }): boolean => {
        const type = ACTIVITY_NOTIFICATION_CONFIG.getNotificationType(eventType);
        const settingKey = type === 'announcement' ? 'announcements' : type;
        return settings?.[settingKey as keyof typeof settings] !== false;
    },
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

// Time constants in milliseconds - use these instead of hardcoded calculations
// Flexy Principle: NEVER use magic numbers for timeouts!
export const TIME_MS = {
    // Very short delays for immediate UI updates
    VERY_SHORT: 10,
    SHORT: 50,
    ANIMATION: 150,
    DEBOUNCE: 300,
    // Standard time units
    ONE_SECOND: 1000,
    FIVE_SECONDS: 5 * 1000,
    TEN_SECONDS: 10 * 1000,
    THIRTY_SECONDS: 30 * 1000,
    ONE_MINUTE: 60 * 1000,
    FIVE_MINUTES: 5 * 60 * 1000,
    THIRTY_MINUTES: 30 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    SIX_HOURS: 6 * 60 * 60 * 1000,
    TWELVE_HOURS: 12 * 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
    THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000,
    ONE_YEAR: 31557600000, // 365.25 days in milliseconds (accounts for leap years)
} as const;

// File size limits in bytes
export const FILE_SIZE_LIMITS = {
    MATERIAL_DEFAULT: 50 * 1024 * 1024, // 50MB
    MATERIAL_LARGE: 200 * 1024 * 1024,  // 200MB
    PPDB_DOCUMENT: 10 * 1024 * 1024,    // 10MB
    IMAGE_MIN: 10 * 1024,               // 10KB
    PROFILE_IMAGE: 5 * 1024 * 1024,     // 5MB
    BATCH_TOTAL: 500 * 1024 * 1024,     // 500MB
    TEACHER_MATERIAL_MAX: 100 * 1024 * 1024, // 100MB
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
    NOTIFICATIONS: 20,
    MESSAGES: 50,
    EMAIL_HISTORY: 50,
    TIMELINE_ITEMS: 20,
    MAX_LOG_ENTRIES: 1000,
    MAX_VISIBLE_PAGES: 5,
} as const;

// Display limits for array slice operations - Flexy: Never hardcode slice limits!
export const DISPLAY_LIMITS = {
    RECOMMENDATIONS: 5,
    SUGGESTIONS: 5,
    RELATED_CONCEPTS: 8,
    SIMILAR_ITEMS: 5,
    RECENT_ITEMS: 3,
    PREVIEW_ITEMS: 6,
    AUDIT_LOGS: 50,
    TABLE_ROWS: 10,
    CHART_POINTS: 10,
    SEARCH_RESULTS: 20,
    MAX_KEYWORDS: 10,
    NOTIFICATION_PREVIEW: 3,
    MESSAGE_PREVIEW: 3,
    COMPARISON_ITEMS: 5,
    HISTORY_ITEMS: 100,
    SUGGESTED_QUERIES: 5,
    TEMPLATE_EXAMPLES: 5,
} as const;

// Retry and timeout configuration
export const RETRY_CONFIG = {
    DEFAULT_INITIAL_DELAY: 1000,
    DEFAULT_MAX_DELAY: 10000,
    DEFAULT_RESET_TIMEOUT: 60000,
    DEFAULT_MONITORING_PERIOD: 10000,
    WEBSOCKET_RECONNECT_DELAY: 5000,
    WEBSOCKET_CONNECTION_TIMEOUT: 10000,
    WEBSOCKET_PING_INTERVAL: 30000,
    WEBSOCKET_FALLBACK_POLLING_INTERVAL: 30000,
    WEBSOCKET_SUBSCRIPTION_TTL: 3600000,
    NETWORK_SLOW_CONNECTION_THRESHOLD: 3000,
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: 5,
    CIRCUIT_BREAKER_TIMEOUT: 60000,
    MAX_ATTEMPTS: 3,
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 5000,
    BACKOFF_MULTIPLIER: 2,
} as const;

// Grade validation limits
export const GRADE_LIMITS = {
    MIN: 0,
    MAX: 100,
    PASS_THRESHOLD: 40,
    HISTORY_MAX_ENTRIES: 100,
    MIN_PASS: 60,
} as const;

// Grade thresholds for letter calculation
export const GRADE_THRESHOLDS = {
    A_PLUS: 90,
    A: 85,
    A_MINUS: 80,
    B_PLUS: 78,
    B: 75,
    B_MINUS: 72,
    C_PLUS: 68,
    C: 60,
    D: 0,
} as const;

// Validation length limits
export const VALIDATION_LIMITS = {
    NOTIFICATION_BODY_MAX: 1000,
    NOTIFICATION_TITLE_MAX: 200,
    DESCRIPTION_MAX: 1000,
    AI_PROMPT_MAX: 1000,
    TITLE_MAX: 255,
    IMAGE_URL_MAX: 500,
    URL_MAX: 500,
    PREVIEW_LENGTH: 200,
    MAX_DISPLAY_ITEMS: 5,
    MAX_SUGGESTIONS: 5,
    NEWS_CATEGORY_MAX: 100, // Maximum length for news category names
} as const;

// Input minimum values - Flexy: Never hardcode min values!
export const INPUT_MIN_VALUES = {
    QUANTITY: 1,
    SCORE: 1,
    POINTS: 1,
    DAYS: 1,
    DURATION_MINUTES: 1,
    PASSING_SCORE: 1,
    MAX_ATTEMPTS: 1,
} as const;

// UI delays in milliseconds
export const UI_DELAYS = {
    DEBOUNCE_DEFAULT: 1000,
    DEBOUNCE_SHORT: 200,
    DEBOUNCE_LONG: 5000,
    LOADING_INDICATOR: 1500,
    REDIRECT_DELAY: 3000,
    USER_IMPORT_DELAY: 100,
    SYNC_BATCH_DELAY: 100, // Delay between processing batch operations
    // Flexy Principle: Accessibility timing must be configurable!
    ACCESSIBILITY_ANNOUNCE: 100, // Delay for screen reader announcements to ensure proper DOM update
    SKELETON_DELAY: 200, // Delay before showing skeleton loader (ms)
} as const;

// UI gesture thresholds - Flexy: Never hardcode gesture values!
export const UI_GESTURES = {
    MIN_SWIPE_DISTANCE: 50, // Minimum swipe distance in pixels to trigger actions
    SWIPE_VELOCITY_THRESHOLD: 0.5, // Minimum velocity for swipe detection
    TOUCH_ACTION_DELAY: 50, // Delay before processing touch actions
    RESTRAINT: 100, // Maximum perpendicular movement allowed during swipe
    ALLOWED_TIME: 300, // Maximum time allowed for a swipe gesture (ms)
    LONG_PRESS_DELAY: 500, // Delay before triggering long press (ms)
} as const;

// Cache and storage limits
export const CACHE_LIMITS = {
    VOICE_CACHE_SIZE: 50,
    VOICE_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
    MESSAGE_QUEUE_SIZE: 50,
    NOTIFICATION_HISTORY_SIZE: 100,
    VOICE_NOTIFICATION_QUEUE_SIZE: 10,
    VOICE_NOTIFICATION_HISTORY_SIZE: 50,
} as const;

// Cache versioning - Flexy: Never hardcode cache versions!
export const CACHE_VERSIONS = {
    OFFLINE_DATA: '1.0',
    STORAGE_SCHEMA: '1.0',
} as const;

// ID Formatting Constants - Flexy: Never hardcode ID formatting rules!
export const ID_FORMAT = {
    PAD_LENGTH: 2,
    PAD_LENGTH_NIS: 4,
    PAD_STRING: '0',
} as const;

// Time Formatting Constants - Flexy: Never hardcode time formatting!
export const TIME_FORMAT = {
    HOURS_PAD_LENGTH: 2,
    MINUTES_PAD_LENGTH: 2,
    SEPARATOR: ':',
    PAD_STRING: '0',
} as const;

// API Configuration - Centralized to avoid circular dependencies
export const API_CONFIG = {
    DEFAULT_BASE_URL: 'https://malnu-kananga-worker-prod.cpa01cmz.workers.dev',
    WS_PATH: '/ws',
} as const;

// Language and Locale Codes - Flexy: Never hardcode language codes!
export const LANGUAGE_CODES = {
    INDONESIAN: 'id-ID',
    ENGLISH_US: 'en-US',
    ENGLISH_UK: 'en-GB',
    JAVANESE: 'jv-ID',
    DEFAULT: 'id-ID',
} as const;

// File Type Extensions - Flexy: Never hardcode file extensions!
export const FILE_EXTENSIONS = {
    DOCUMENTS: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'] as const,
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'] as const,
    VIDEOS: ['.mp4', '.avi', '.mov', '.mkv'] as const,
    AUDIO: ['.mp3', '.wav', '.ogg', '.m4a'] as const,
    SPREADSHEETS: ['.xls', '.xlsx', '.csv'] as const,
    ARCHIVES: ['.zip', '.rar', '.7z'] as const,
} as const;

// All accepted file extensions (for FileUpload component)
export const ACCEPTED_FILE_EXTENSIONS = [
    ...FILE_EXTENSIONS.DOCUMENTS,
    ...FILE_EXTENSIONS.IMAGES,
    '.mp4', // Video (commonly used)
] as const;

// Scheduler Intervals (milliseconds) - Flexy: Never hardcode intervals!
export const SCHEDULER_INTERVALS = {
    EMAIL_DIGEST_CHECK: 5 * 60 * 1000, // 5 minutes
    PROGRESS_REPORT_CHECK: 60 * 60 * 1000, // 60 minutes (1 hour)
    NOTIFICATION_BATCH_INTERVAL: 30 * 1000, // 30 seconds
    AI_CACHE_CLEANUP: 10 * 60 * 1000, // 10 minutes
    OFFLINE_SYNC_CHECK: 30 * 60 * 1000, // 30 minutes
    WEBSOCKET_PING: 30 * 1000, // 30 seconds
    AUTH_CHECK: 5 * 1000, // 5 seconds
    QUEUED_COUNT_UPDATE: 5 * 1000, // 5 seconds - for auto-save queue count updates
    SPEAKING_STATUS_CHECK: 1000, // 1 second - for voice notification speaking status
    VOICE_MESSAGE_QUEUE_POLL: 100, // 100ms - for voice message queue status polling
} as const;

// Performance Monitoring Thresholds - Flexy: Never hardcode thresholds!
export const PERFORMANCE_THRESHOLDS = {
    SLOW_REQUEST_MS: 3000, // 3 seconds
    ERROR_RATE_ALERT_PERCENT: 10, // 10%
    AVG_RESPONSE_TIME_ALERT_MS: 5000, // 5 seconds
    CONSECUTIVE_FAILURES_ALERT: 5,
    MEMORY_WARNING_PERCENT: 80, // 80%
    CPU_WARNING_PERCENT: 70, // 70%
} as const;

// Test Timeout Delays (milliseconds) - Flexy: Never hardcode test delays!
export const TEST_DELAYS = {
    SHORT: 10,
    MEDIUM: 50,
    LONG: 100,
    VERY_LONG: 500,
} as const;

// Hash Algorithm Configuration
export const HASH_CONFIG = {
    DEFAULT_ALGORITHM: 'simple',
    HASH_SHIFT_BITS: 5,
    OUTPUT_BASE: 36,
    DEFAULT_RANDOM_LENGTH: 9,
} as const;

// UI ID Configuration
export const UI_ID_CONFIG = {
    RANDOM_SUFFIX_LENGTH: 9,
    DEFAULT_SEPARATOR: '_',
} as const;

// Conversion Utilities
export const CONVERSION = {
    BYTES_PER_KB: 1024,
    BYTES_PER_MB: 1024 * 1024,
    BYTES_PER_GB: 1024 * 1024 * 1024,
    MS_PER_SECOND: 1000,
    MS_PER_MINUTE: 60 * 1000,
    MS_PER_HOUR: 60 * 60 * 1000,
} as const;

/**
 * Convert megabytes to bytes
 * Flexy says: Use this instead of hardcoded `mb * 1024 * 1024`
 */
export function mbToBytes(mb: number): number {
    return mb * CONVERSION.BYTES_PER_MB;
}

/**
 * Convert bytes to megabytes
 */
export function bytesToMb(bytes: number): number {
    return bytes / CONVERSION.BYTES_PER_MB;
}

/**
 * Convert bytes to kilobytes
 * Flexy says: Use this instead of hardcoded `bytes / 1024`
 */
export function bytesToKb(bytes: number): number {
    return bytes / CONVERSION.BYTES_PER_KB;
}

/**
 * Convert minutes to milliseconds
 * Flexy says: Use this instead of hardcoded `minutes * 60 * 1000`
 */
export function minutesToMs(minutes: number): number {
    return minutes * CONVERSION.MS_PER_MINUTE;
}

/**
 * Convert hours to milliseconds
 */
export function hoursToMs(hours: number): number {
    return hours * CONVERSION.MS_PER_HOUR;
}

// Validation regex patterns - Centralized to avoid hardcoded regex
export const VALIDATION_PATTERNS = {
    NAME: /^[a-zA-Z\s.'-]+$/,
    NIS: /^\d+$/,
    NISN: /^\d{10}$/,
    SEARCH_TERM: /^[a-zA-Z0-9\s.-]+$/,
    PHONE: /^[0-9+\-\s()]+$/,
    URL_PROTOCOLS: ['http://', 'https://'] as const,
} as const;

// Email validation constants - Flexy: Never hardcode email validation limits!
export const EMAIL_VALIDATION = {
    MAX_LOCAL_LENGTH: 64,
    MAX_DOMAIN_LENGTH: 253,
    MIN_PASSWORD_LENGTH: 6,
} as const;

// Search configuration constants
export const SEARCH_CONFIG = {
    DEFAULT_MAX_RESULTS: 20,
    MAX_SUGGESTED_QUERIES: 5,
    MAX_RELATED_CONCEPTS: 8,
    MAX_SIMILAR_ITEMS: 5,
    MAX_KEYWORDS: 10,
    MIN_RELEVANCE_SCORE: 0.3,
    HIGH_RELEVANCE_SCORE: 0.8,
    OCR_TEXT_MAX: 500,
} as const;

// Academic constants - Centralized academic year related values
export const ACADEMIC = {
    SEMESTERS: ['1', '2'] as const,
    DAYS_OF_WEEK: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const,
    ATTENDANCE_STATUSES: {
        PRESENT: 'hadir',
        SICK: 'sakit',
        PERMITTED: 'izin',
        ABSENT: 'alpa',
    } as const,
    ATTENDANCE_STATUS_LIST: ['hadir', 'sakit', 'izin', 'alpa'] as const,
    GRADE_WEIGHTS: {
        ASSIGNMENT: 0.3,
        MID_EXAM: 0.3,
        FINAL_EXAM: 0.4,
    } as const,
    GRADE_THRESHOLDS: {
        A: 85,
        B: 75,
        C: 60,
        MIN_PASS: 60,
    } as const,
    GRADE_THRESHOLDS_DETAILED: {
        A_PLUS: 90,
        A: 85,
        A_MINUS: 80,
        B_PLUS: 78,
        B: 75,
        B_MINUS: 72,
        C_PLUS: 68,
        C: 60,
        D: 0,
    } as const,
    GRADE_MIN_SCORES: {
        A: 85,
        B: 75,
        C: 60,
        D: 0,
    } as const,
    AGE_LIMITS: {
        STUDENT_MIN: 6,
        STUDENT_MAX: 25,
        STUDENT_TYPICAL_MIN: 12,
        STUDENT_TYPICAL_MAX: 20,
    } as const,
    CREDIT_HOURS: {
        MIN: 1,
        MAX: 6,
        TYPICAL_MIN: 2,
        TYPICAL_MAX: 4,
    } as const,
    NIS_LENGTH: {
        MIN: 5,
        MAX: 20,
    } as const,
    NISN_LENGTH: 10,
    MAJOR_EXAM_TYPES: ['mid_exam', 'final_exam', 'uts', 'uas', 'final_test'] as const,
} as const;

// Flexy: Centralized grade letter calculation - Never hardcode grade thresholds!
export const GRADE_LETTER_THRESHOLDS = {
    A: { min: 90, letter: 'A', gpa: 4.0 },
    A_MINUS: { min: 85, letter: 'A-', gpa: 3.7 },
    B_PLUS: { min: 80, letter: 'B+', gpa: 3.3 },
    B: { min: 75, letter: 'B', gpa: 3.0 },
    B_MINUS: { min: 70, letter: 'B-', gpa: 2.7 },
    C_PLUS: { min: 65, letter: 'C+', gpa: 2.3 },
    C: { min: 60, letter: 'C', gpa: 2.0 },
    C_MINUS: { min: 55, letter: 'C-', gpa: 1.7 },
    D: { min: 50, letter: 'D', gpa: 1.0 },
    E: { min: 0, letter: 'E', gpa: 0.0 },
} as const;

/**
 * Get grade letter from score using centralized thresholds
 * Flexy Principle: NEVER hardcode grade calculations!
 * @param score - Numeric score (0-100)
 * @returns Grade letter (A, A-, B+, etc.)
 */
export function getGradeLetter(score: number): string {
    if (score >= GRADE_LETTER_THRESHOLDS.A.min) return GRADE_LETTER_THRESHOLDS.A.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.A_MINUS.min) return GRADE_LETTER_THRESHOLDS.A_MINUS.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.B_PLUS.min) return GRADE_LETTER_THRESHOLDS.B_PLUS.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.B.min) return GRADE_LETTER_THRESHOLDS.B.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.B_MINUS.min) return GRADE_LETTER_THRESHOLDS.B_MINUS.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.C_PLUS.min) return GRADE_LETTER_THRESHOLDS.C_PLUS.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.C.min) return GRADE_LETTER_THRESHOLDS.C.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.C_MINUS.min) return GRADE_LETTER_THRESHOLDS.C_MINUS.letter;
    if (score >= GRADE_LETTER_THRESHOLDS.D.min) return GRADE_LETTER_THRESHOLDS.D.letter;
    return GRADE_LETTER_THRESHOLDS.E.letter;
}

/**
 * Simplified grade letter for basic use cases (A, B, C, D only)
 * Flexy Principle: NEVER hardcode grade calculations!
 * @param score - Numeric score (0-100)
 * @returns Simplified grade letter (A, B, C, D)
 */
export function getSimplifiedGradeLetter(score: number): string {
    if (score >= ACADEMIC.GRADE_THRESHOLDS.A) return 'A';
    if (score >= ACADEMIC.GRADE_THRESHOLDS.B) return 'B';
    if (score >= ACADEMIC.GRADE_THRESHOLDS.C) return 'C';
    return 'D';
}

// File validation constants
export const FILE_VALIDATION = {
    FILENAME_MAX_LENGTH: 255,
    FILENAME_MIN_LENGTH: 1,
    FILENAME_WARNING_LENGTH: 100,
    SEARCH_MAX_LENGTH: 100,
    MATERIAL_TITLE_MAX_LENGTH: 200,
    MATERIAL_TITLE_MIN_LENGTH: 3,
    ADDRESS_MAX_LENGTH: 200,
    // Windows reserved file names - Flexy: Never hardcode reserved names!
    RESERVED_NAMES: [
        'CON', 'PRN', 'AUX', 'NUL',
        'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
        'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
    ] as const,
} as const;

// XSS Protection Configuration - Flexy: Security constants must be centralized!
export const XSS_CONFIG = {
    DANGEROUS_TAGS: [
        'script', 'iframe', 'object', 'embed', 'form', 'input',
        'button', 'textarea', 'select', 'option', 'link', 'style',
    ] as const,
    DANGEROUS_ATTRIBUTES: [
        'onerror', 'onload', 'onmouseover', 'onmouseout', 'onclick',
        'ondblclick', 'onmousedown', 'onmouseup', 'onkeydown', 'onkeyup',
        'onfocus', 'onblur', 'javascript', 'data', 'vbscript',
    ] as const,
    INVALID_FILENAME_CHARS: /[<>:"|?*]/g,
    PATH_TRAVERSAL_PATTERN: /\.\.[/\\]/g,
    NULL_BYTE_PATTERN: /\0/g,
} as const;

// AI/Gemini configuration constants
export const AI_CONFIG = {
    THINKING_BUDGET: 32768,
    DEFAULT_CONFIDENCE_SCORE: 0.85,
    JSON_MIME_TYPE: 'application/json',
    MATERIAL_CONTENT_MAX: 500,
    // Quiz generation defaults - Flexy: Never hardcode quiz defaults!
    DEFAULT_QUIZ_TOTAL_POINTS: 100,
    DEFAULT_QUIZ_DURATION_MINUTES: 30,
    DEFAULT_QUIZ_PASSING_SCORE: 70,
    DEFAULT_QUIZ_POINTS_PER_QUESTION: 10,
} as const;

// OCR configuration constants
export const OCR_CONFIG = {
    SIMILARITY_THRESHOLD: 0.8,
    LOW_SIMILARITY_SCORE: 0.3,
    SHORT_TEXT_PENALTY: 0.8,
    CONFIDENCE_LOW_THRESHOLD: 0.5,
    CONFIDENCE_WARNING_THRESHOLD: 0.7,
    COMPARISON_TEXT_MAX: 200,
    INPUT_LOG_MAX: 500,
    ATTENDANCE_CONFIDENCE_THRESHOLD: 60, // Minimum average confidence for attendance OCR
} as const;

// OCR School Name Detection Keywords - Flexy: Never hardcode institution types!
export const OCR_SCHOOL_KEYWORDS = [
    'SMP', 'MTs', 'SD', 'MI', 'SMA', 'MA', 'SMK'
] as const;

// ID generation constants
export const ID_GENERATION = {
    RANDOM_SUFFIX_LENGTH: 9,
} as const;

// UI Accessibility constants - Flexy: Never hardcode accessibility values!
export const UI_ACCESSIBILITY = {
    OFFSCREEN_POSITION: '-9999px',
    SCREEN_READER_TIMEOUT: 1000,
} as const;

// UI Spacing constants - Flexy: Never hardcode spacing values!
export const UI_SPACING = {
    // Tailwind spacing values (in rem)
    XS: '0.25',    // 4px
    SM: '0.5',     // 8px  
    MD: '1',       // 16px
    LG: '1.5',     // 24px
    XL: '2',       // 32px
    XXL: '3',      // 48px
    XXXL: '4',     // 64px
    
    // Common gap patterns
    GAP_TIGHT: 'gap-2',      // 8px
    GAP_NORMAL: 'gap-4',     // 16px
    GAP_LOOSE: 'gap-6',      // 24px
    GAP_XL: 'gap-8',         // 32px
    
    // Common padding patterns
    PADDING_COMPACT: 'p-2',    // 8px
    PADDING_NORMAL: 'p-4',     // 16px
    PADDING_COMFORTABLE: 'p-6', // 24px
    PADDING_SPACIOUS: 'p-8',    // 32px
    
    // Common margin patterns
    MARGIN_TIGHT: 'm-2',      // 8px
    MARGIN_NORMAL: 'm-4',     // 16px
    MARGIN_LOOSE: 'm-6',      // 24px
    MARGIN_XL: 'm-8',         // 32px
    
    // Mobile touch targets (minimum 44px for accessibility)
    TOUCH_TARGET_MIN: 'min-w-[44px] min-h-[44px]',
    TOUCH_TARGET_NORMAL: 'min-w-[48px] min-h-[48px]',
    TOUCH_TARGET_LARGE: 'min-w-[52px] min-h-[52px]',
} as const;

// Cache TTL constants in milliseconds
export const CACHE_TTL = {
    CATEGORY: 30 * 60 * 1000, // 30 minutes
    AI_CACHE: 30 * 60 * 1000, // 30 minutes
    AI_CHAT: 20 * 60 * 1000, // 20 minutes
    AI_EDITOR: 15 * 60 * 1000, // 15 minutes
    AI_OCR: 45 * 60 * 1000, // 45 minutes
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// Storage limits for various services - centralized to avoid hardcoded limits
export const STORAGE_LIMITS = {
    EMAIL_HISTORY_MAX: 1000,
    NOTIFICATION_HISTORY_MAX: 1000,
    LOG_ENTRIES_MAX: 1000,
    METRICS_MAX: 1000,
    DELIVERY_HISTORY_MAX: 1000,
} as const;

// Email configuration constants
export const EMAIL_CONFIG = {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAYS: [TIME_MS.ONE_MINUTE, 5 * TIME_MS.ONE_MINUTE, 15 * TIME_MS.ONE_MINUTE], // 1min, 5min, 15min
    ANALYTICS_DAYS: 30,
    QUEUE_PROCESSING_DELAY_MS: 1000, // Delay between processing queue items
} as const;

// Byte conversion constants
export const BYTES_PER_KB = 1024;

// Component-specific debounce delays
export const DEBOUNCE_DELAYS = {
    ACTIVITY_FEED: 500,
    FIELD_VALIDATION: 300,
    SEARCH_INPUT: 300,
    AI_CACHE_REFRESH: 5000,
    RAPID_CHANGE_BATCH: 100, // Short delay to batch rapid changes
} as const;

// Component timeout constants
export const COMPONENT_TIMEOUTS = {
    TOAST_DEFAULT: 3000,
    VOICE_MESSAGE: 30000,
    PASSWORD_REQUIREMENTS_HIDE: 3000,
    PAGE_RELOAD: 1500,
    ERROR_FLUSH: 2000, // Sentry flush timeout
    SCREEN_READER_ANNOUNCEMENT_CLEAR: 1000, // Time to clear screen reader announcements
} as const;

// Animation constants
export const ANIMATION_CONFIG = {
    TOAST_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

// HTTP constants
export const HTTP = {
    HEADERS: {
        CONTENT_TYPE_JSON: 'application/json',
        CONTENT_TYPE_PDF: 'application/pdf',
        CONTENT_TYPE_FORM_DATA: 'multipart/form-data',
    } as const,
    METHODS: {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        PATCH: 'PATCH',
        DELETE: 'DELETE',
        HEAD: 'HEAD',
    } as const,
    STATUS_CODES: {
        OK: 200,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        UNPROCESSABLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500,
        BAD_GATEWAY: 502,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
    } as const,
    RETRYABLE_STATUSES: [408, 429, 500, 502, 503, 504] as const,
    SERVER_ERROR_STATUSES: [500, 502, 503, 504] as const,
} as const;

// WebSocket close codes (RFC 6455) - Flexy: Never hardcode WebSocket codes!
export const WEBSOCKET_CLOSE_CODES = {
    NORMAL: 1000,
    GOING_AWAY: 1001,
    PROTOCOL_ERROR: 1002,
    UNSUPPORTED_DATA: 1003,
    NO_STATUS_RCVD: 1005,
    ABNORMAL_CLOSURE: 1006,
    INVALID_FRAME_PAYLOAD: 1007,
    POLICY_VIOLATION: 1008,
    MESSAGE_TOO_BIG: 1009,
    MANDATORY_EXTENSION: 1010,
    INTERNAL_ERROR: 1011,
    SERVICE_RESTART: 1012,
    TRY_AGAIN_LATER: 1013,
} as const;

// Time constants in seconds (for JWT expiration calculations) - Flexy: Never hardcode time calculations!
export const TIME_SECONDS = {
    ONE_MINUTE: 60,
    FIVE_MINUTES: 300,
    FIFTEEN_MINUTES: 900,
    ONE_HOUR: 3600,
    ONE_DAY: 86400,
} as const;

// Animation stagger delays in milliseconds - Flexy: Never hardcode animation timing!
export const STAGGER_DELAYS = {
    FAST: 25,
    NORMAL: 50,
    SLOW: 100,
} as const;

// Animation Duration Constants - Flexy: Use these instead of hardcoded duration classes!
// Provides both numeric values (ms) and Tailwind classes for consistency
export const ANIMATION_DURATIONS = {
    // Micro-interactions (instant feedback)
    MICRO: 150,
    INSTANT: 150,

    // Fast transitions (hover states, small movements)
    FAST: 200,
    QUICK: 200,

    // Standard transitions (most UI changes)
    NORMAL: 300,
    STANDARD: 300,

    // Medium transitions (larger UI changes)
    MEDIUM: 500,

    // Slow transitions (emphasis, dramatic changes)
    SLOW: 700,

    // Very slow (special effects)
    VERY_SLOW: 1000,

    // Tailwind class equivalents
    CLASSES: {
        MICRO: 'duration-150',
        INSTANT: 'duration-150',
        FAST: 'duration-200',
        QUICK: 'duration-200',
        NORMAL: 'duration-300',
        STANDARD: 'duration-300',
        MEDIUM: 'duration-500',
        SLOW: 'duration-700',
        VERY_SLOW: 'duration-1000',
    },
} as const;

// Animation Timing Functions - Flexy: Use these for consistent easing!
export const ANIMATION_EASINGS = {
    DEFAULT: 'ease-in-out',
    IN: 'ease-in',
    OUT: 'ease-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
    ELASTIC: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Haptic feedback vibration patterns (milliseconds) - Flexy: Never hardcode haptic patterns!
export const HAPTIC_PATTERNS = {
    LIGHT: [10],
    MEDIUM: [25],
    HEAVY: [50],
    DOUBLE: [10, 50, 10],
    LONG: [100],
    SUCCESS: [10, 30],
    ERROR: [50, 30, 50],
    WARNING: [30],
    NOTIFICATION: [15, 10, 15],
} as const;

// UI Text Constants - Centralized to avoid hardcoded strings
export const UI_STRINGS = {
    // Common actions
    SAVE: 'Simpan',
    SAVING: 'Menyimpan...',
    SAVE_ALL: 'Simpan Semua',
    CANCEL: 'Batal',
    CLOSE: 'Tutup',
    DELETE: 'Hapus',
    EDIT: 'Edit',
    CREATE: 'Buat',
    SEARCH: 'Cari',
    LOADING: 'Memuat...',
    PROCESSING: 'Memproses...',
    ERROR: 'Error',
    SUCCESS: 'Berhasil',
    WARNING: 'Peringatan',
    INFO: 'Info',
    CONFIRM: 'Konfirmasi',
    BACK: 'Kembali',
    NEXT: 'Lanjut',
    SUBMIT: 'Kirim',
    DONE: 'Selesai',
    CONTINUE: 'Lanjutkan',
    TRY_AGAIN: 'Coba Lagi',
    SELECT_ALL: 'Pilih Semua',
    CLEAR_SELECTION: 'Bersihkan Pilihan',
    CLEAR_INPUT: 'Bersihkan input',
    CLEAR_TEXTAREA: 'Bersihkan textarea',
    SELECTED: 'terpilih',
    OR: 'atau',
    YES: 'Ya',
    NO: 'Tidak',
    OK: 'OK',
    CONFIRM_ACTION: 'Ya, Lanjutkan',
    REVOKE_ACCESS: 'Batasi',
    SHARE: 'Bagikan',
    SHARING: 'Membagikan...',
    TO: 'ke',
    LOGOUT: 'Keluar',
    LOGIN: 'Login',
    REGISTER: 'Daftar',
    FORGOT_PASSWORD: 'Lupa Password?',
    RESET_PASSWORD: 'Reset Password',
    DASHBOARD: 'Dashboard',
    HOME: 'Beranda',
    PROFILE: 'Profil',
    NOTIFICATIONS: 'Notifikasi',
    MESSAGES: 'Pesan',
    CALENDAR: 'Kalender',
    SCHEDULE: 'Jadwal',
    ATTENDANCE: 'Absensi',
    GRADES: 'Nilai',
    ASSIGNMENTS: 'Tugas',
    MATERIALS: 'Materi',
    LIBRARY: 'Perpustakaan',
    EVENTS: 'Kegiatan',
    ANNOUNCEMENTS: 'Pengumuman',
    NEWS: 'Berita',
    CLASSES: 'Kelas',
    STUDENTS: 'Siswa',
    TEACHERS: 'Guru',
    PARENTS: 'Orang Tua',
    SUBJECTS: 'Mata Pelajaran',
    EXAMS: 'Ujian',
    REPORTS: 'Laporan',
    ANALYTICS: 'Analitik',
    STATISTICS: 'Statistik',
    OVERVIEW: 'Ringkasan',
    DETAILS: 'Detail',
    HISTORY: 'Riwayat',
    ACTIVITY: 'Aktivitas',
    PROGRESS: 'Progres',
    PERFORMANCE: 'Performa',
    DOCUMENTS: 'Dokumen',
    FILES: 'File',
    SETTINGS: 'Pengaturan',
    HELP: 'Bantuan',
    SUPPORT: 'Dukungan',
    ABOUT: 'Tentang',
    VERSION: 'Versi',
    PRIVACY_POLICY: 'Kebijakan Privasi',
    TERMS_OF_SERVICE: 'Ketentuan Layanan',
} as const;

// Login-related UI strings
export const LOGIN_UI_STRINGS = {
    TITLE: 'Login',
    QUICK_LOGIN: 'Login Cepat (Demo)',
    SELECT_ROLE: 'Pilih peran untuk login instan:',
    ROLE_STUDENT: 'Siswa',
    ROLE_TEACHER: 'Guru',
    ROLE_ADMIN: 'Admin',
    ROLE_STAFF: 'Guru (Staff)',
    ROLE_OSIS: 'Siswa (OSIS)',
    SUCCESS_TITLE: 'Login Berhasil!',
    SUCCESS_MESSAGE: 'Anda akan diarahkan ke dashboard...',
    EMAIL_LABEL: 'Alamat Email Terdaftar',
    EMAIL_PLACEHOLDER: 'anda@email.com',
    PASSWORD_LABEL: 'Password',
    PASSWORD_PLACEHOLDER: 'Masukkan password',
    SEARCH_PLACEHOLDER: 'Cari Nama / NIS...',
    WEIGHT_INFO_TITLE: 'Info Pembobotan',
    VALIDATION_ERROR: 'Periksa kembali data yang Anda masukkan',
} as const;

// Forgot password UI strings
export const FORGOT_PASSWORD_STRINGS = {
    TITLE: 'Lupa Password',
    EMAIL_SENT_TITLE: 'Email Terkirim!',
    EMAIL_SENT_MESSAGE: 'Kami telah mengirimkan link reset password ke:',
    LINK_EXPIRY_INFO: 'Link ini hanya berlaku selama 1 jam.',
    CLOSE_BUTTON: 'Tutup',
    INSTRUCTIONS_TITLE: 'Instruksi:',
    INSTRUCTION_ENTER_EMAIL: 'Masukkan email yang terdaftar',
    INSTRUCTION_CHECK_INBOX: 'Cek inbox Anda untuk link reset',
    INSTRUCTION_EXPIRY: 'Link berlaku selama 1 jam',
    EMAIL_LABEL: 'Alamat Email',
    EMAIL_PLACEHOLDER: 'nama@email.com',
    SUBMIT_BUTTON: 'Kirim Link Reset Password',
    BACK_TO_LOGIN: 'Kembali ke Login',
    VALIDATION_ERROR: 'Masukkan email yang valid',
} as const;

// Header navigation UI strings
export const HEADER_NAV_STRINGS = {
    HOME: 'Beranda',
    PROFILE: 'Profil',
    NEWS: 'Berita',
    DOWNLOAD: 'Download',
    LOGIN_EMAIL: 'Login Email',
    LOGO_TEXT: 'M',
    SCHOOL_NAME: 'Malnu Kananga',
    NPSN_LABEL: 'NPSN: 69881502',
    AI_EDITOR: 'Editor AI',
    AI_EDITOR_OPEN: 'Buka Editor AI',
    AI_ASK: 'Tanya AI',
    VIEW_DASHBOARD: 'Lihat Dashboard',
    VIEW_WEBSITE: 'Lihat Website',
} as const;

// Access denied UI strings  
export const ACCESS_DENIED_STRINGS = {
    TITLE: 'Access Denied',
    MESSAGE: 'You do not have permission to access this feature.',
    REQUIRED_PERMISSION: 'Required permission:',
    GO_BACK: 'Go Back',
} as const;

// Toast notification UI strings
export const TOAST_UI_STRINGS = {
    CLOSE: 'Tutup notifikasi',
} as const;

// Grading management UI strings
export const GRADING_UI_STRINGS = {
    PAGE_TITLE: 'Input Nilai Siswa',
    SUBJECT_LABEL: 'Mata Pelajaran:',
    UNSAVED_CHANGES_WARNING: 'Ada perubahan belum disimpan',
    SEARCH_PLACEHOLDER: 'Cari Nama / NIS...',
    AUTO_SAVING: 'Auto-saving...',
    WEIGHT_INFO_TITLE: 'Info Pembobotan',
    WEIGHT_INFO_DESC: 'Tugas (30%) + UTS (30%) + UAS (40%)',
    SAVE_ALL_BUTTON: 'Simpan Semua Nilai',
    BATCH_OPERATIONS_TITLE: 'Batch Operations',
    ASSIGNMENT_LABEL: 'Assignment',
    UTS_LABEL: 'UTS',
    UAS_LABEL: 'UAS',
} as const;

// Section titles for marketing/landing page sections
export const SECTION_TITLES = {
    PROFILE: 'Profil Madrasah',
    PROFILE_SUBTITLE: 'Mengenal Lebih Dekat MA Malnu Kananga',
    PROGRAMS: 'Program Unggulan',
    PPDB: 'Bergabunglah Bersama Kami',
    PPDB_SUBTITLE: 'Masa Depan Gemilang Dimulai dari Sini',
    NEWS: 'Berita & Kegiatan Terbaru',
    NEWS_SUBTITLE: 'Update terkini dari MA Malnu Kananga',
    ACHIEVEMENTS: 'Prestasi Madrasah',
    GALLERY: 'Galeri Kegiatan',
    TESTIMONIALS: 'Testimoni',
    CONTACT: 'Hubungi Kami',
    FACILITIES: 'Fasilitas Madrasah',
} as const;

// Service error messages - centralized for consistency
export const SERVICE_ERROR_MESSAGES = {
    NIS_GENERATION_FAILED: 'Gagal generate NIS',
    CLASS_ASSIGNMENT_FAILED: 'Gagal menentukan kelas',
    PARENT_ACCOUNT_FAILED: 'Gagal membuat akun orang tua',
    STUDENT_CREATION_FAILED: 'Gagal membuat data siswa dari pendaftar PPDB',
    REGISTRANT_NOT_FOUND: 'Pendaftar tidak ditemukan',
    ROLLBACK_FAILED: 'Gagal melakukan rollback akun siswa',
    REPORT_GENERATION_FAILED: 'Gagal membuat laporan progres pembelajaran',
    PDF_EXPORT_FAILED: 'Gagal membuat ekspor PDF. Silakan coba lagi.',
    CSV_EXPORT_FAILED: 'Gagal membuat ekspor CSV. Silakan coba lagi.',
    DATA_FETCH_FAILED: 'Gagal mengambil data',
    DATA_SAVE_FAILED: 'Gagal menyimpan data',
    DATA_DELETE_FAILED: 'Gagal menghapus data',
    NETWORK_ERROR: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
    UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
} as const;

// Notification template strings
export const NOTIFICATION_TEMPLATE_STRINGS = {
    GENERAL_TITLE: '📢 {title}',
    GRADE_UPDATE_TITLE: '📊 Update Nilai: {subject}',
    PPDB_STATUS_TITLE: '🎓 Status PPDB: {status}',
    EVENT_TITLE: '🎉 Kegiatan Baru: {title}',
    MATERIAL_TITLE: '📚 Materi Baru: {title}',
    SYSTEM_TITLE: '⚙️ {title}',
    OCR_VALIDATION_TITLE: '📄 OCR Validation {severity}',
    OCR_COMPLETE_TITLE: '🔍 OCR Validation Complete',
} as const;

// Animation and timeout constants
export const TIMEOUT_CONFIG = {
    UI_ANIMATION_DURATION: 300,
    PASSWORD_REQUIREMENTS_HIDE_DELAY: 3000,
    TOAST_DEFAULT_DURATION: 3000,
    SCREEN_READER_TIMEOUT: 1000,
    REDIRECT_DELAY: 3000,
    DEBOUNCE_SHORT: 200,
    DEBOUNCE_DEFAULT: 1000,
} as const;

// Table and pagination constants
export const TABLE_CONFIG = {
    DEFAULT_SKELETON_ROWS: 10,
    DEFAULT_PAGE_SIZE: 20,
    MAX_VISIBLE_PAGES: 5,
} as const;

// Category validation constants
export const CATEGORY_CONFIG = {
    SIMILARITY_THRESHOLD: 0.6,
    MAX_SUGGESTIONS: 5,
    MIN_DESCRIPTION_LENGTH: 10,
    CACHE_TTL_MINUTES: 30,
} as const;

// OCR enhancement constants
export const OCR_ENHANCEMENT_CONFIG = {
    MAX_SUMMARY_LENGTH: 150,
    SIMILARITY_THRESHOLD: 0.8,
} as const;

// Permission service constants
export const PERMISSION_CONFIG = {
    MAX_AUDIT_LOGS: 1000,
} as const;

// Email template styles - Flexy: Never hardcode styles in email templates!
export const EMAIL_TEMPLATE_STYLES = {
    CONTAINER: '.container { max-width: 600px; margin: 0 auto; padding: 20px; }',
    CONTAINER_MAX_WIDTH: '600px',
    CONTAINER_MARGIN: '0 auto',
    CONTAINER_PADDING: '20px',
} as const;

// Email template colors - Flexy: Never hardcode colors in email templates!
export const EMAIL_COLORS = {
    PRIMARY: '#2563eb',
    SUCCESS: '#059669',
    SUCCESS_LIGHT: '#dcfce7',
    WARNING: '#dc2626',
    INFO: '#dbeafe',
    LIBRARY: '#7c3aed',
    PPDB: '#ea580c',
    BACKGROUND: '#f9fafb',
    TEXT_PRIMARY: '#333',
    TEXT_DARK: '#1f2937',
    HIGHLIGHT: '#dbeafe',
    STATUS_SUCCESS: '#d1fae5',
    STATUS_WARNING: '#fef3c7',
    STATUS_INFO: '#dbeafe',
    STATUS_ERROR: '#fee2e2',
    GRAY_BG: '#f3f4f6',
    GREEN_SUCCESS: '#10b981',
    // Additional email colors - Flexy: Centralized from hardcoded values
    BORDER: '#e5e7eb',
    TEXT_SUCCESS_DARK: '#065f46',
    TEXT_WARNING_DARK: '#92400e',
    TEXT_INFO_DARK: '#1e40af',
    TEXT_ERROR_DARK: '#991b1b',
    MATERIAL_BG: '#ede9fe',
    STATUS_BG: '#ffedd5',
} as const;

// Phone format constants - Flexy: Never hardcode phone formats!
export const PHONE_FORMAT = {
    INDONESIA_PREFIX: '628',
    INDONESIA_LOCAL_PREFIX: '0',
    INDONESIA_MIN_LENGTH: 10,
    INDONESIA_MAX_LENGTH: 15,
} as const;

// Input mask patterns - Flexy: Never hardcode mask patterns!
export const INPUT_MASKS = {
    NISN: '9999999999',
    PHONE: '999-9999-99999',
    DATE: '99-99-9999',
    YEAR: '9999',
    NIS: '9999999999',
} as const;

// ID Prefixes - Flexy: Never hardcode ID prefixes!
export const ID_PREFIXES = {
    TEMPLATE: 'template',
    NOTIFICATION: 'notif',
    AUDIT: 'audit',
    EMAIL: 'email',
    STUDY_PLAN: 'study_plan',
    SESSION: 'session',
    USER: 'user',
    GRADE: 'grade',
    MATERIAL: 'material',
    ANNOUNCEMENT: 'announcement',
    OFFLINE: 'offline',
} as const;

// Academic subjects - Flexy: Never hardcode subject names!
export const ACADEMIC_SUBJECTS = {
    MATHEMATICS: 'Matematika',
    INDONESIAN: 'Bahasa Indonesia',
    ENGLISH: 'Bahasa Inggris',
    PHYSICS: 'Fisika',
    CHEMISTRY: 'Kimia',
    BIOLOGY: 'Biologi',
    HISTORY: 'Sejarah',
    GEOGRAPHY: 'Geografi',
    ECONOMICS: 'Ekonomi',
    SOCIOLOGY: 'Sosiologi',
    CIVICS: 'PPKn',
    RELIGION: 'Pendidikan Agama',
    ARTS: 'Seni Budaya',
    PE: 'Penjasorkes',
    ENTREPRENEURSHIP: 'Kewirausahaan',
} as const;

// Student Performance Thresholds - Flexy: Never hardcode performance thresholds!
export const STUDENT_PERFORMANCE_THRESHOLDS = {
    // GPA thresholds for motivational messages
    GPA: {
        EXCELLENT: 85,  // GPA >= 85: "Luar biasa!"
        GOOD: 75,       // GPA >= 75: "Prestasi baik!"
        MINIMUM: 60,    // GPA >= 60: "Menunjukkan perbaikan"
    },
    // Attendance percentage thresholds
    ATTENDANCE: {
        EXCELLENT: 95,  // Attendance >= 95%: Excellent
        GOOD: 90,       // Attendance >= 90%: Good
    },
    // Study recommendation thresholds
    STUDY: {
        FAILING: 70,    // Score < 70: Failing, needs high priority
        DECLINING: 80,  // Score < 80: Declining, needs medium priority
    },
} as const;

// Indonesian month names - Flexy: Never hardcode locale-specific data!
export const DATE_LOCALE = {
    INDONESIAN_MONTHS: [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ] as const,
    INDONESIAN_SHORT_MONTHS: [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ] as const,
    INDONESIAN_DAYS: [
        'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ] as const,
    // Month name to number mapping (lowercase) - Flexy: Never hardcode month mappings!
    INDONESIAN_MONTHS_MAP: {
        'januari': '01',
        'februari': '02',
        'maret': '03',
        'april': '04',
        'mei': '05',
        'juni': '06',
        'juli': '07',
        'agustus': '08',
        'september': '09',
        'oktober': '10',
        'november': '11',
        'desember': '12'
    } as const,
} as const;

// Default class configuration for new students
export const DEFAULT_CLASS_CONFIG = {
    NEW_STUDENT_CODE: '10',
    NEW_STUDENT_NAME: 'Kelas 10',
} as const;

// Email domain constants
export const EMAIL_DOMAINS = {
    ADMIN: 'admin@malnu-kananga.sch.id',
    INFO: 'info@ma-malnukananga.sch.id',
    TEACHER: 'guru.staff@malnu.sch.id',
    STUDENT: 'siswa.osis@malnu.sch.id',
} as const;

// Demo user data - Flexy: Demo data should be centralized!
export const DEMO_USERS = {
    ADMIN: {
        name: 'Ahmad Dahlan',
        email: EMAIL_DOMAINS.ADMIN,
    },
    TEACHER: {
        name: 'Siti Aminah, S.Pd.',
        email: EMAIL_DOMAINS.TEACHER,
    },
    STUDENT: {
        name: 'Budi Santoso',
        email: 'budi.santoso@malnu.sch.id',
    },
} as const;

// PPDB Committee configuration
export const PPDB_CONFIG = {
    COMMITTEE_NAME: `Panitia PPDB ${APP_CONFIG.SCHOOL_NAME}`,
    DEFAULT_STATUS_COLORS: {
        PENDING: EMAIL_COLORS.STATUS_WARNING,
        APPROVED: EMAIL_COLORS.STATUS_SUCCESS,
        REJECTED: EMAIL_COLORS.STATUS_ERROR,
    },
    // NIS Generation - Flexy: Never hardcode ID formatting rules!
    NIS_PADDING_LENGTH: 4,
    NIS_COUNTER_RADIX: 10,
    NIS_INITIAL_COUNTER: 0,
} as const;

// Quiz configuration constants
export const QUIZ_CONFIG = {
    DEFAULT_DURATION_MINUTES: 30,
    PASSING_SCORE: 70,
} as const;

// Study plan configuration constants
export const STUDY_PLAN_CONFIG = {
    DEFAULT_DURATION_WEEKS: 4,
} as const;

// Parent notification configuration constants
export const PARENT_NOTIFICATION_CONFIG = {
    DEFAULT_GRADE_THRESHOLD: 70,
    MISSING_GRADE_DAYS: 7,
    DEFAULT_QUIET_HOURS: {
        START: '22:00',
        END: '07:00',
    },
} as const;

// Grade frequency constants
export const GRADE_FREQUENCY = {
    MAJOR_EXAM_DAYS: 30,
    QUIZ_DAYS: 14,
    HOMEWORK_DAYS: 7,
} as const;

// Document types mapping
export const DOCUMENT_TYPES = {
    AKTA_KELAHIRAN: { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
    KARTU_KELUARGA: { key: 'kartu_keluarga', label: 'Kartu Keluarga' },
    IJAZAH: { key: 'ijazah', label: 'Ijazah' },
    SKHU: { key: 'skhu', label: 'SKHU' },
    PAS_FOTO: { key: 'pas_foto', label: 'Pas Foto' },
    RAPORT: { key: 'raport', label: 'Raport' },
    KIP: { key: 'kip', label: 'KIP' },
    KPS: { key: 'kps', label: 'KPS' },
    KKS: { key: 'kks', label: 'KKS' },
    PKH: { key: 'pkh', label: 'PKH' },
} as const;

// AI Prompts - Centralized prompts for consistency
export const AI_PROMPTS = {
    CHAT_SYSTEM_INSTRUCTION: `Kamu adalah asisten AI untuk MA Malnu Kananga, sebuah madrasah aliyah di Indonesia. 
Berikan respons yang:
1. Sopan dan profesional
2. Menggunakan Bahasa Indonesia yang baik dan benar
3. Islami dan edukatif
4. Terkait dengan dunia pendidikan dan kemadrasahan`,
} as const;

// Alert thresholds for monitoring
export const ALERT_THRESHOLDS = {
    ERROR_RATE_PERCENT: 10,
    RESPONSE_TIME_MS: 5000,
    SLOW_CONNECTION_MS: 3000,
} as const;

// Backoff configuration
export const BACKOFF_CONFIG = {
    DEFAULT_MULTIPLIER: 2,
    DEFAULT_INITIAL_DELAY_MS: 1000,
    DEFAULT_MAX_DELAY_MS: 5000,
} as const;

// Voice Service Configuration - Centralized retry and circuit breaker settings
// Flexy: Never hardcode voice service config!
export const VOICE_SERVICE_CONFIG = {
    RECOGNITION: {
        MAX_START_ATTEMPTS: 3,
        MAX_STOP_ATTEMPTS: 3,
    },
    SYNTHESIS: {
        MAX_SPEAK_ATTEMPTS: 3,
    },
    CIRCUIT_BREAKER: {
        FAILURE_THRESHOLD: 5,
        RESET_TIMEOUT_MS: 60000,
        MONITORING_PERIOD_MS: 10000,
    },
    RETRY: {
        INITIAL_DELAY_MS: 1000,
        MAX_DELAY_MS: 5000,
        BACKOFF_MULTIPLIER: 2,
    },
} as const;

// Number word mappings for voice input - Flexy: Never hardcode number words!
export const NUMBER_WORDS = {
    DIGITS: {
        INDONESIAN: {
            'nol': '0', 'satu': '1', 'dua': '2', 'tiga': '3', 'empat': '4',
            'lima': '5', 'enam': '6', 'tujuh': '7', 'delapan': '8', 'sembilan': '9'
        },
        ENGLISH: {
            'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
            'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
        },
    },
    TEENS: {
        ENGLISH: {
            'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14',
            'fifteen': '15', 'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19'
        },
    },
    TENS: {
        ENGLISH: {
            'twenty': '20', 'thirty': '30', 'forty': '40', 'fifty': '50',
            'sixty': '60', 'seventy': '70', 'eighty': '80', 'ninety': '90'
        },
    },
    COMPOUND_INDONESIAN: {
        'sebelas': '11', 'dua belas': '12', 'tiga belas': '13', 'empat belas': '14',
        'lima belas': '15', 'enam belas': '16', 'tujuh belas': '17', 'delapan belas': '18', 'sembilan belas': '19',
        'dua puluh': '20', 'tiga puluh': '30', 'empat puluh': '40', 'lima puluh': '50',
        'enam puluh': '60', 'tujuh puluh': '70', 'delapan puluh': '80', 'sembilan puluh': '90'
    },
    SCALE: {
        ENGLISH: {
            'hundred': '100'
        },
        INDONESIAN: {
            'seratus': '100'
        },
    },
} as const;

// OCR Service Configuration - Flexy: Never hardcode OCR limits!
export const OCR_SERVICE_CONFIG = {
    MAX_CACHED_EVENTS: 100,
    VALIDATION_LOG_MAX: 100,
    QUALITY: {
        HIGH_THRESHOLD: 70,
        MEDIUM_THRESHOLD: 50,
    },
    ATTENDANCE: {
        MIN_CONFIDENCE_THRESHOLD: 60,
    },
} as const;

// Voice Command Parser Configuration - Flexy: Never hardcode command thresholds!
export const VOICE_COMMAND_CONFIG = {
    SIMILARITY: {
        MATCH_THRESHOLD: 0.7,
        HIGH_THRESHOLD: 0.8,
    },
    QUERY: {
        MIN_LENGTH: 2,
    },
    NAME: {
        MIN_LENGTH: 2,
    },
} as const;

// Storage Key Patterns - Flexy: Use these for filtered searches!
export const STORAGE_KEY_PATTERNS = {
    STUDY_PLAN_RECOMMENDATIONS: 'malnu_study_plan_material_recommendations_',
    QUIZ_ATTEMPTS: 'malnu_quiz_attempts_',
} as const;

// Grade Color Thresholds - Flexy: Never hardcode grade colors!
export const GRADE_COLOR_THRESHOLDS = {
    EXCELLENT: { min: 90, color: 'text-green-600' },
    GOOD: { min: 80, color: 'text-blue-600' },
    AVERAGE: { min: 70, color: 'text-yellow-600' },
    BELOW_AVERAGE: { min: 60, color: 'text-orange-600' },
    POOR: { min: 0, color: 'text-red-600' },
} as const;

// Notification emojis for template strings
export const NOTIFICATION_EMOJIS = {
    GENERAL: '📢',
    GRADE: '📊',
    PPDB: '🎓',
    EVENT: '🎉',
    MATERIAL: '📚',
    SYSTEM: '⚙️',
    OCR: '📄',
    SEARCH: '🔍',
    ANNOUNCEMENT: '📢',
    WARNING: '⚠️',
    SUCCESS: '✅',
    ERROR: '❌',
    INFO: 'ℹ️',
} as const;

// PPDB Pipeline Status - Flexy: Never hardcode status strings!
export const PPDB_STATUS = {
    REGISTERED: 'registered',
    DOCUMENT_REVIEW: 'document_review',
    INTERVIEW_SCHEDULED: 'interview_scheduled',
    INTERVIEW_COMPLETED: 'interview_completed',
    ACCEPTED: 'accepted',
    ENROLLED: 'enrolled',
    REJECTED: 'rejected',
} as const;

export type PPDBPipelineStatus = typeof PPDB_STATUS[keyof typeof PPDB_STATUS];

// Design System Tokens - Centralized for consistency
export const DESIGN_TOKENS = {
    // Responsive Breakpoints
    BREAKPOINTS: {
        sm: '640px',   // Phone landscape
        md: '768px',   // Tablet portrait  
        lg: '1024px',  // Tablet landscape/Desktop
        xl: '1280px',  // Desktop
        '2xl': '1536px' // Large desktop
    } as const,
    
    // Spacing Scale
    SPACING: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
    } as const,
    
    // Border Radius
    BORDER_RADIUS: {
        sm: '0.25rem',   // 4px
        md: '0.5rem',    // 8px
        lg: '1rem',      // 16px
        xl: '1.5rem',    // 24px
        full: '9999px'
    } as const,
    
    // Shadows
    SHADOWS: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    } as const,
    
    // Animations
    ANIMATIONS: {
        micro: 'transition-all duration-150 ease-out',
        base: 'transition-all duration-200 ease-out',
        smooth: 'transition-all duration-300 ease-out',
        slow: 'transition-all duration-500 ease-out',
    } as const,
    
    // Button Sizing
    BUTTON_SIZES: {
        sm: { min: 'h-9', px: 'px-3', text: 'text-sm', radius: 'rounded-md' },
        md: { min: 'h-10', px: 'px-4', text: 'text-sm', radius: 'rounded-md' },
        lg: { min: 'h-12', px: 'px-6', text: 'text-base', radius: 'rounded-lg' },
        xl: { min: 'h-14', px: 'px-8', text: 'text-lg', radius: 'rounded-lg' }
    } as const,
    
    // Typography Scale
    TYPOGRAPHY: {
        xs: 'text-xs',    // 12px
        sm: 'text-sm',    // 14px
        base: 'text-base', // 16px
        lg: 'text-lg',    // 18px
        xl: 'text-xl',    // 20px
        '2xl': 'text-2xl', // 24px
        '3xl': 'text-3xl', // 30px
        '4xl': 'text-4xl', // 36px
    } as const,
    
    // Touch Targets (Mobile-First)
    TOUCH_TARGETS: {
        min: 'min-h-11 min-w-11', // 44px minimum
        sm: 'min-h-12 min-w-12',  // 48px comfortable
        md: 'min-h-14 min-w-14',  // 56px large
        lg: 'min-h-16 min-w-16',  // 64px extra large
        padding: {
            tight: 'p-2',   // 8px
            normal: 'p-3',  // 12px
            loose: 'p-4',   // 16px
        }
    } as const,
    
    // Focus Management
    FOCUS: {
        ring: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        ringPrimary: 'focus-visible:ring-primary-500',
        ringOffset: 'focus-visible:ring-offset-background',
        enhanced: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
    } as const,
    
    // Z-Index Scale
    Z_INDEX: {
        base: 0,
        raised: 10,
        dropdown: 20,
        sticky: 30,
        modal: 40,
        notification: 50,
        tooltip: 60,
        maximum: 9999,
    } as const,
} as const;

// Enhanced Animation Constants
export const ENHANCED_ANIMATIONS = {
    // Micro-interactions
    SCALE_SUBTLE: 'hover:scale-[1.02] active:scale-[0.98]',
    SCALE_MEDIUM: 'hover:scale-[1.05] active:scale-[0.95]',
    LIFT_SUBTLE: 'hover:-translate-y-1 active:translate-y-0',
    LIFT_MEDIUM: 'hover:-translate-y-2 active:-translate-y-1',
    
    // State transitions
    FADE_IN: 'animate-fade-in',
    SLIDE_UP: 'animate-fade-in-up',
    SCALE_IN: 'animate-scale-in',
    
    // Loading states
    PULSE_SLOW: 'animate-pulse-slow',
    SHIMMER: 'animate-shimmer skeleton-enhanced',
    
    // Interactive elements
    BUTTON_HOVER: 'hover-lift btn-hover-primary',
    CARD_HOVER: 'card-hover-enhanced hover-lift',
    ICON_HOVER: 'icon-hover',
    
    // Accessibility
    REDUCED_MOTION: 'motion-reduce:transition-none motion-reduce:transform-none',
} as const;

// Mobile-First Responsive Patterns
export const RESPONSIVE_PATTERNS = {
    // Grid patterns
    GRID_SINGLE: 'grid grid-cols-1',
    GRID_SM: 'grid grid-cols-1 sm:grid-cols-2',
    GRID_MD: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    GRID_LG: 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4',
    
    // Text responsive patterns
    TEXT_RESPONSIVE: 'text-sm sm:text-base',
    TITLE_RESPONSIVE: 'text-xl sm:text-2xl lg:text-3xl',
    
    // Spacing responsive
    PADDING_RESPONSIVE: 'p-4 sm:p-6 lg:p-8',
    GAP_RESPONSIVE: 'gap-2 sm:gap-4 lg:gap-6',
    
    // Component sizing
    CONTAINER_RESPONSIVE: 'w-full max-w-md sm:max-w-lg lg:max-w-xl',
    
    // Navigation patterns
    NAV_MOBILE: 'flex flex-col sm:flex-row',
    NAV_STACKED: 'space-y-2 sm:space-y-0 sm:space-x-4',
} as const;

// Accessibility Enhancements
export const ACCESSIBILITY_ENHANCEMENTS = {
    // Screen reader utilities
    SCREEN_READER_ONLY: 'sr-only',
    SCREEN_READER_FOCUSABLE: 'sr-only focus:not-sr-only focus:absolute focus:z-50',
    
    // Focus management
    FOCUS_VISIBLE: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    FOCUS_TRAP: 'focus-trap',
    
    // High contrast support
    HIGH_CONTRAST: 'enhanced-contrast',
    
    // Reduced motion
    REDUCED_MOTION: 'motion-reduce:transition-none motion-reduce:animate-none',
    
    // Touch enhancements
    TOUCH_OPTIMIZED: 'touch-manipulation safe-area-padding',
    TOUCH_TARGET: 'touch-target',
    
    // Skip links
    SKIP_LINK: 'absolute top-4 left-4 z-50 -translate-y-full focus:translate-y-0 bg-primary-500 text-white px-4 py-2 rounded-md',
} as const;

// PPDB Status Display Labels
export const PPDB_STATUS_LABELS = {
    [PPDB_STATUS.REGISTERED]: 'Terdaftar',
    [PPDB_STATUS.DOCUMENT_REVIEW]: 'Review Dokumen',
    [PPDB_STATUS.INTERVIEW_SCHEDULED]: 'Jadwal Wawancara',
    [PPDB_STATUS.INTERVIEW_COMPLETED]: 'Wawancara Selesai',
    [PPDB_STATUS.ACCEPTED]: 'Diterima',
    [PPDB_STATUS.ENROLLED]: 'Terdaftar sebagai Siswa',
    [PPDB_STATUS.REJECTED]: 'Ditolak',
} as const;

// Theme Color Palette - Flexy: Never hardcode theme colors!
export const THEME_COLOR_PALETTE = {
    PINK: '#db2777',
    CYAN: '#06b6d4',
    EMERALD: '#10b981',
    SKY: '#0ea5e9',
    AMBER: '#f59e0b',
    TEAL: '#14b8a6',
    ROSE: '#f43f5e',
    VIOLET: '#8b5cf6',
    INDIGO: '#6366f1',
    FUCHSIA: '#d946ef',
    LIME: '#84cc16',
    ORANGE: '#f97316',
} as const;

// Z-Index Scale - Flexy: Never hardcode z-index values!
export const Z_INDEX = {
    MODAL_OVERLAY: 50,
    MODAL_CONTENT: 51,
    HEADER: 40,
    NOTIFICATION_CENTER: 45,
    DROPDOWN: 30,
    TOOLTIP: 35,
    STICKY_HEADER: 20,
    STICKY_TABLE: 10,
    BASE: 0,
    BEHIND: -1,
} as const;

// API Endpoints - Flexy: Centralize all API endpoints!
export const API_ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        VERIFY_RESET_TOKEN: '/api/auth/verify-reset-token',
        RESET_PASSWORD: '/api/auth/reset-password',
        REFRESH_TOKEN: '/api/auth/refresh',
    },
    // Users
    USERS: {
        BASE: '/api/users',
        PASSWORD: (userId: string) => `/api/users/${userId}/password`,
        PROFILE: '/api/users/profile',
    },
    // Students
    STUDENTS: {
        BASE: '/api/students',
        BY_ID: (id: string) => `/api/students/${id}`,
    },
    // Teachers
    TEACHERS: {
        BASE: '/api/teachers',
        BY_ID: (id: string) => `/api/teachers/${id}`,
    },
    // Academic
    ACADEMIC: {
        SUBJECTS: '/api/subjects',
        CLASSES: '/api/classes',
        SCHEDULES: '/api/schedules',
        GRADES: '/api/grades',
        GRADE_BY_ID: (id: string) => `/api/grades/${id}`,
        ATTENDANCE: '/api/attendance',
    },
    // Events
    EVENTS: {
        BASE: '/api/school_events',
        REGISTRATIONS: '/api/event_registrations',
    },
    // PPDB
    PPDB: {
        REGISTRANTS: '/api/ppdb_registrants',
        PIPELINE: '/api/ppdb/pipeline',
        METRICS: '/api/ppdb/metrics',
    },
    // Library
    LIBRARY: {
        MATERIALS: '/api/e_library',
        CATEGORIES: '/api/e_library/categories',
        FAVORITES: '/api/e_library/favorites',
    },
    // Inventory
    INVENTORY: {
        BASE: '/api/inventory',
        CATEGORIES: '/api/inventory/categories',
    },
    // Announcements
    ANNOUNCEMENTS: {
        BASE: '/api/announcements',
        BY_ID: (id: string) => `/api/announcements/${id}`,
    },
    // Payments
    PAYMENTS: {
        CREATE: '/api/payments/create',
        STATUS: (paymentId: string) => `/api/payments/${paymentId}/status`,
        HISTORY: (studentId: string) => `/api/payments/history?student_id=${studentId}`,
        CANCEL: (paymentId: string) => `/api/payments/${paymentId}/cancel`,
    },
    // Files
    FILES: {
        UPLOAD: '/api/files/upload',
        DOWNLOAD: (key: string) => `/api/files/download?key=${encodeURIComponent(key)}`,
        DELETE: (key: string) => `/api/files/delete?key=${encodeURIComponent(key)}`,
        LIST: (prefix?: string) => `/api/files/list${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`,
    },
    // Messaging
    MESSAGING: {
        PARENT_CHILDREN: '/api/parent/children',
        MESSAGES: '/api/messages',
        CONVERSATIONS: '/api/conversations',
    },
    // AI
    AI: {
        CHAT: '/api/chat',
        STUDENT_ANALYSIS: '/api/ai/student-analysis',
        GRADE_PREDICTION: '/api/ai/grade-prediction',
    },
    // Email
    EMAIL: {
        SEND: '/api/email/send',
        TEMPLATES: '/api/email/templates',
        QUEUE: '/api/email/queue',
    },
    // OCR
    OCR: {
        PROCESS: '/api/ocr/process',
        VALIDATE: '/api/ocr/validate',
    },
    // Quiz
    QUIZ: {
        BASE: '/api/quizzes',
        ATTEMPTS: '/api/quiz/attempts',
        GENERATE: '/api/quiz/generate',
    },
    // WebSocket
    WEBSOCKET: {
        CONNECT: '/ws',
        UPDATES: '/api/updates',
    },
    // Download
    DOWNLOAD: {
        VERSION: (versionId: string) => `/api/download/version/${versionId}`,
        TEMPLATE: (templateId: string) => `/api/templates/download/${templateId}`,
    },
} as const;

// Attendance Status Labels - Flexy: Use these for display!
export const ATTENDANCE_STATUS_LABELS = {
    [ACADEMIC.ATTENDANCE_STATUSES.PRESENT]: 'Hadir',
    [ACADEMIC.ATTENDANCE_STATUSES.SICK]: 'Sakit',
    [ACADEMIC.ATTENDANCE_STATUSES.PERMITTED]: 'Izin',
    [ACADEMIC.ATTENDANCE_STATUSES.ABSENT]: 'Alpa',
} as const;

// SVG Namespaces - Flexy: Never hardcode XML namespaces!
export const XML_NAMESPACES = {
    SVG: 'http://www.w3.org/2000/svg',
    XLINK: 'http://www.w3.org/1999/xlink',
    XML: 'http://www.w3.org/XML/1998/namespace',
} as const;

// User Status - Flexy: Never hardcode status strings!
export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Queue Status for offline actions - Flexy: Never hardcode status strings!
export const QUEUE_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    RETRYING: 'retrying',
} as const;

export type QueueStatus = typeof QUEUE_STATUS[keyof typeof QUEUE_STATUS];

// Inventory Status - Flexy: Never hardcode status strings!
export const INVENTORY_STATUS = {
    ACTIVE: 'active',
    MAINTENANCE: 'maintenance',
    DISPOSED: 'disposed',
    LOST: 'lost',
} as const;

export type InventoryStatus = typeof INVENTORY_STATUS[keyof typeof INVENTORY_STATUS];

// Payment Status - Flexy: Never hardcode status strings!
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
    PARTIAL: 'partial',
    CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Announcement Status - Flexy: Never hardcode status strings!
export const ANNOUNCEMENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SCHEDULED: 'scheduled',
    EXPIRED: 'expired',
} as const;

export type AnnouncementStatus = typeof ANNOUNCEMENT_STATUS[keyof typeof ANNOUNCEMENT_STATUS];

// Role Display Names - Flexy: Centralize display labels!
export const ROLE_DISPLAY_NAMES = {
    [USER_ROLES.ADMIN]: 'Administrator',
    [USER_ROLES.TEACHER]: 'Guru',
    [USER_ROLES.STUDENT]: 'Siswa',
    [USER_ROLES.PARENT]: 'Wali Murid',
    [USER_ROLES.STAFF]: 'Guru (Staff)',
    [USER_ROLES.OSIS]: 'Siswa (OSIS)',
    [USER_ROLES.WAKASEK]: 'Wakasek',
    [USER_ROLES.KEPSEK]: 'Kepala Sekolah',
} as const;

// User Status Display Labels
export const USER_STATUS_LABELS = {
    [USER_STATUS.ACTIVE]: 'Aktif',
    [USER_STATUS.INACTIVE]: 'Non-Aktif',
    [USER_STATUS.PENDING]: 'Pending',
    [USER_STATUS.SUSPENDED]: 'Ditangguhkan',
} as const;

// Inventory Status Display Labels
export const INVENTORY_STATUS_LABELS = {
    [INVENTORY_STATUS.ACTIVE]: 'Aktif',
    [INVENTORY_STATUS.MAINTENANCE]: 'Dalam Perbaikan',
    [INVENTORY_STATUS.DISPOSED]: 'Dihapuskan',
    [INVENTORY_STATUS.LOST]: 'Hilang',
} as const;

// Payment Status Display Labels
export const PAYMENT_STATUS_LABELS = {
    [PAYMENT_STATUS.PENDING]: 'Pending',
    [PAYMENT_STATUS.PAID]: 'Lunas',
    [PAYMENT_STATUS.OVERDUE]: 'Terlambat',
    [PAYMENT_STATUS.PARTIAL]: 'Sebagian',
    [PAYMENT_STATUS.CANCELLED]: 'Dibatalkan',
} as const;

// Announcement Status Display Labels
export const ANNOUNCEMENT_STATUS_LABELS = {
    [ANNOUNCEMENT_STATUS.ACTIVE]: 'Aktif',
    [ANNOUNCEMENT_STATUS.INACTIVE]: 'Non-Aktif',
    [ANNOUNCEMENT_STATUS.SCHEDULED]: 'Terjadwal',
    [ANNOUNCEMENT_STATUS.EXPIRED]: 'Kadaluarsa',
} as const;

// Placeholder Images - Using local placeholders to avoid external dependencies
export const PLACEHOLDER_IMAGES = {
    SCHOOL: '/images/placeholder.svg',
    STUDENT: '/images/placeholder.svg',
    TEACHER: '/images/placeholder.svg',
    CLASS: '/images/placeholder.svg',
    EVENT: '/images/placeholder.svg',
    MATERIAL: '/images/placeholder.svg',
} as const;

// Input Mask Placeholders - Flexy: Never hardcode mask placeholders!
export const INPUT_MASK_PLACEHOLDERS = {
    NISN: 'NISN 10 digit',
    PHONE: '081-2345-67890',
    DATE: 'DD-MM-YYYY',
    YEAR: '2024',
    GRADE: '0-100',
    CLASS: 'XII RPL 1',
} as const;

// Date Validation Constants - Flexy: Never hardcode date ranges!
export const DATE_VALIDATION = {
    MIN_YEAR: 1900,
    MAX_YEAR_OFFSET: 1, // current year + 1
} as const;

// Days in Month - Flexy: Use this for date validation!
export const DAYS_IN_MONTH = [
    31, // Jan
    28, // Feb (non-leap year)
    31, // Mar
    30, // Apr
    31, // May
    30, // Jun
    31, // Jul
    31, // Aug
    30, // Sep
    31, // Oct
    30, // Nov
    31  // Dec
] as const;

// Gender Options - Flexy: Never hardcode gender values!
export const GENDER_OPTIONS = {
    MALE: 'L',
    FEMALE: 'P',
} as const;

// Class Configuration - Flexy: Never hardcode class limits!
export const CLASS_CONFIG = {
    MAX_CAPACITY: 30,
} as const;

// Rate Limiting - Flexy: Never hardcode rate limits!
export const RATE_LIMITING = {
    MAX_REQUESTS_PER_MINUTE: 10,
    MAX_PROGRAMS_ADDITION: 10,
    MAX_NEWS_ADDITION: 20,
} as const;

// AI Editor Limits - Flexy: Never hardcode content limits!
export const AI_EDITOR_LIMITS = {
    MAX_PROGRAMS: 20,
    MAX_NEWS: 50,
    MAX_AUDIT_ENTRIES: 100,
} as const;

// OCR Configuration - Flexy: Never hardcode OCR settings!
export const OCR_SERVICE_CONFIG_EXTRA = {
    LANGUAGE: 'ind',
    WORKER_COUNT: 1,
    NAME_WORD_MIN: 2,
    NAME_WORD_MAX: 4,
    NISN_DIGIT_COUNT: 10,
    SHORT_TEXT_PENALTY: 0.8,
    SUSPICIOUS_NUMBERS_PENALTY: 0.9,
} as const;

// Voice Bounds - Flexy: Never hardcode voice validation ranges!
export const VOICE_BOUNDS = {
    MAX_ALTERNATIVES: { MIN: 1, MAX: 10 },
    CONFIDENCE: { MIN: 0, MAX: 1 },
} as const;

// WebSocket Constants - Flexy: Never hardcode WebSocket values!
export const WEBSOCKET_CONSTANTS = {
    READY_STATE_OPEN: 1, // WebSocket.OPEN
} as const;

// Batch Configuration - Flexy: Never hardcode batch limits!
export const BATCH_CONFIG = {
    MAX_STUDENTS: 50,
} as const;

// Test Configuration - Flexy: Never hardcode test defaults!
export const TEST_CONFIG = {
    DEFAULT_ACADEMIC_YEAR: '2024-2025',
    DEFAULT_STUDENT_NIS: '12345',
    DEFAULT_USER_ID: 'user-1',
    DEFAULT_CLASS_ID: 'class-1',
} as const;

// AI Model Names - Flexy: Never hardcode AI model names!
export const AI_MODELS = {
    FLASH: 'gemini-2.5-flash',
    PRO_THINKING: 'gemini-3-pro-preview',
    PRO: 'gemini-3-pro',
    DEFAULT: 'gemini-2.5-flash',
} as const;

// Time conversion factors - Flexy: Never hardcode time math!
export const TIME_CONVERSION = {
    MS_PER_SECOND: 1000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
} as const;

// HTTP Status Code Ranges - Flexy: Never hardcode status checks!
export const HTTP_STATUS_RANGES = {
    SUCCESS_MIN: 200,
    SUCCESS_MAX: 300,
    CLIENT_ERROR_MIN: 400,
    CLIENT_ERROR_MAX: 500,
    REDIRECT_MIN: 300,
    REDIRECT_MAX: 400,
} as const;

// Color RGB Values - Flexy: Never hardcode RGB values!
export const RGB_VALUES = {
    WHITE: 255,
    BLACK: 0,
} as const;

// Common delay values in milliseconds - Flexy: Never hardcode delays!
export const DELAY_MS = {
    TINY: 10,
    SHORT: 50,
    MEDIUM: 100,
    STANDARD: 200,
    LONG: 500,
    VERY_LONG: 1000,
    DEBOUNCE: 300,
} as const;

// Text truncation lengths - Flexy: Never hardcode truncation!
export const TEXT_TRUNCATION = {
    PREVIEW: 200,
    SHORT_PREVIEW: 150,
    MEDIUM_PREVIEW: 500,
    LONG_PREVIEW: 1000,
    COMPARISON_TEXT: 200,
    SEARCH_RESULT: 200,
} as const;

// PDF Export Colors (RGB arrays) - Flexy: Never hardcode PDF colors!
// Note: Not using 'as const' because jsPDF requires mutable arrays
export const PDF_COLORS = {
    HEADER_BG: [37, 99, 235] as [number, number, number], // Primary blue
    HEADER_TEXT: 255, // White
    ALTERNATE_ROW: [249, 250, 251] as [number, number, number], // Light gray
};

// Text processing limits - Flexy: Never hardcode text limits!
export const TEXT_LIMITS = {
    MIN_SEARCH_LENGTH: 2,
    MIN_NAME_LENGTH: 2,
} as const;

// Password generation constants - Flexy: Never hardcode password generation!
export const PASSWORD_GENERATION = {
    CHARACTER_SET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    DEFAULT_LENGTH: 8,
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
} as const;

// Message sender types for messaging system - Flexy: Never hardcode sender types!
export const MESSAGE_SENDER = {
    PARENT: 'parent',
    TEACHER: 'teacher',
    STUDENT: 'student',
    ADMIN: 'admin',
    SYSTEM: 'system',
} as const;

export type MessageSenderType = typeof MESSAGE_SENDER[keyof typeof MESSAGE_SENDER];

// Component-specific delays in milliseconds - Flexy: Never hardcode delays!
export const COMPONENT_DELAYS = {
    AUTO_SAVE_INDICATOR: 1000,
    AUTO_SAVE_SIMPLE: 1000,
    INSIGHTS_REFRESH: 2000,
    REALTIME_EVENTS_CHECK: 1000,
    WEBSOCKET_HEALTH_CHECK: 1000,
    NOTIFICATION_SETTINGS_INDICATOR: 1500,
    PPDB_REGISTRATION_INDICATOR: 2000,
    PROGRESS_ANIMATION: 100,
    FORM_FEEDBACK_ANIMATION: 50,
} as const;

// PPDB Legacy Status (for backward compatibility) - Flexy: Centralize status strings!
export const PPDB_LEGACY_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
} as const;

export type PPDBLegacyStatus = typeof PPDB_LEGACY_STATUS[keyof typeof PPDB_LEGACY_STATUS];

// Student prefix for ID generation
export const STUDENT_ID_PREFIX = 'student_';

// Storage Migration Constants - Flexy: Never hardcode migration keys!
export const STORAGE_MIGRATION = {
    VERSION_KEY: 'malnu_storage_migration_version',
    CURRENT_VERSION: '1.0.0',
} as const;

// Legacy Storage Keys - Flexy: Centralize legacy keys for migration cleanup!
export const LEGACY_STORAGE_KEYS = {
    STUDENT_GRADES_CACHE: 'malnu_student_grades_cache',
    STUDENT_ATTENDANCE_CACHE: 'malnu_student_attendance_cache',
    PARENT_CHILDREN_CACHE: 'malnu_parent_children_cache',
} as const;

// Number formatting constants - Flexy: Never hardcode decimal places!
export const NUMBER_FORMAT = {
    DECIMAL_PLACES_GRADE: 1,
    DECIMAL_PLACES_GPA: 2,
    DECIMAL_PLACES_PERCENTAGE: 1,
    DECIMAL_PLACES_FILE_SIZE: 2,
    DECIMAL_PLACES_VOICE: 1,
    DECIMAL_PLACES_STATS: 2,
} as const;

// Animation delays in milliseconds - Flexy: Never hardcode animation timing!
export const ANIMATION_DELAYS = {
    TYPING_INDICATOR: [0, 200, 400] as const, // in ms
    STAGGER_DELAY: 100, // ms between staggered items
    FADE_IN_DURATION: 300,
    SLIDE_DURATION: 300,
} as const;

// Component-specific limits - Flexy: Never hardcode component limits!
export const COMPONENT_LIMITS = {
    SEARCH_MAX_SUGGESTIONS: 8,
    IMPORT_ERROR_MAX_DISPLAY: 5,
    MATERIAL_RECOMMENDATIONS_MAX: 6,
    OCR_COMPARISON_MAX_MATERIALS: 5,
    COMMUNICATION_LOG_MAX_PREVIEW: 5,
    PERMISSIONS_MAX_DISPLAY: 3,
    SITE_EDITOR_MAX_LOGS: 100,
} as const;

// AI Cache sizes - Flexy: Never hardcode cache sizes!
export const AI_CACHE_SIZES = {
    DEFAULT: 100,
    CHAT: 50,
    ANALYSIS: 30,
    EDITOR: 20,
    OCR: 40,
} as const;

// Timeline Configuration - Flexy: Never hardcode timeline values!
export const TIMELINE_CONFIG = {
    CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
    CONTENT_TRUNCATION_LENGTH: 150,
    ATTENDANCE_ICONS: {
        HADIR: '✅',
        SAKIT: '🤒',
        IZIN: '📋',
        ALPA: '❌',
    } as const,
    ATTENDANCE_COLORS: {
        HADIR: 'text-green-600',
        SAKIT: 'text-blue-600',
        IZIN: 'text-yellow-600',
        ALPA: 'text-red-600',
    } as const,
    TIMELINE_ICONS: {
        GRADE: '📊',
        ASSIGNMENT: '📝',
        SUBMISSION: '📤',
        MATERIAL_ACCESS: '📖',
        MATERIAL_DOWNLOAD: '⬇️',
        BOOKMARK: '🔖',
        RATING: '⭐',
        MESSAGE_SENT: '✉️',
        MESSAGE_RECEIVED: '📨',
        ANNOUNCEMENT: '📢',
        EVENT: '🎉',
    } as const,
} as const;

// Progress Report Configuration - Flexy: Never hardcode report values!
export const PROGRESS_REPORT_CONFIG = {
    CACHE_TTL_DAYS: 7,
    MAX_REPORTS_PER_STUDENT: 10,
    GRADE_TREND_THRESHOLD: 5, // Difference threshold for trend calculation
    LETTER_GRADE_THRESHOLDS: {
        A: 90,
        B: 80,
        C: 70,
        D: 60,
    } as const,
    DEFAULT_SETTINGS: {
        frequency: 'weekly' as const,
        enableNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
    },
} as const;

// Pagination Options - Flexy: Never hardcode page sizes!
export const PAGINATION_OPTIONS = [10, 25, 50, 100] as const;

// Micro-interactions Configuration - Flexy: Never hardcode interaction values!
export const MICRO_INTERACTIONS_CONFIG = {
    VIBRATION_PATTERNS: {
        light: [10],
        medium: [20],
        heavy: [30],
    } as const,
    ANIMATION_DURATIONS: {
        success: 0.6,
        error: 0.5,
        warning: 0.5,
        info: 0.3,
    } as const,
    ANIMATION_EASING: {
        success: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        error: 'ease-in-out',
        warning: 'ease-in-out',
        info: 'ease-in-out',
    } as const,
    INTERACTION_RESET_DELAY_MS: 300,
    HOVER_DELAY_MS: 100,
    HOVER_TRANSFORM: 'translateY(-2px) scale(1.02)',
    FOCUS_OUTLINE_WIDTH: '2px',
    FOCUS_OUTLINE_COLOR: 'hsl(var(--color-primary-500))',
    FOCUS_OUTLINE_OFFSET: '2px',
} as const;

// Offline Indicator Configuration - Flexy: Never hardcode UI timeouts!
export const OFFLINE_INDICATOR_CONFIG = {
    SYNC_STATUS_AUTO_HIDE_MS: 3000,
    MIN_CARD_WIDTH_PX: 120,
    STATUS_INDICATOR_SIZE: 3, // w-3 h-3
} as const;

// DataTable Configuration - Flexy: Never hardcode table values!
export const DATATABLE_CONFIG = {
    MOBILE_BREAKPOINT_PX: 640,
    DEFAULT_MOBILE_LAYOUT: 'cards' as const,
    SELECTION_ANIMATION_DURATION_MS: 300,
    VIBRATION_PATTERNS: {
        CARD_TAP: [5, 2, 5],
        SELECTION_CHECK: [15, 5, 15],
        SELECTION_UNCHECK: [10],
        TOUCH_LIGHT: 3,
    } as const,
} as const;

// Responsive Breakpoints (numeric values for JS comparisons) - Flexy: Never hardcode breakpoint values!
export const BREAKPOINTS = {
    SM: 640,    // Phone landscape
    MD: 768,    // Tablet portrait
    LG: 1024,   // Tablet landscape/Desktop
    XL: 1280,   // Desktop
    XXL: 1536,  // Large desktop
} as const;

// Development Thresholds - Flexy: Never hardcode development-specific values!
// These values are used for development environment configurations
export const DEVELOPMENT_THRESHOLDS = {
    // Error rate thresholds (percentage)
    ERROR_RATE: {
        WARNING: 10,   // Production warning threshold
        DEV: 20,       // Development threshold (more permissive)
        CRITICAL: 20,  // Critical alert threshold
    },
    // Memory thresholds (percentage)
    MEMORY: {
        WARNING: 80,
        CRITICAL: 90,
    },
    // Consecutive failures threshold
    CONSECUTIVE_FAILURES: {
        WARNING: 5,    // Production warning
        CRITICAL: 10,  // Critical alert
    },
    // Cache/PWA size thresholds (MB)
    CACHE_SIZE: {
        WARNING: 50,   // 50 MB warning
    },
    // WebSocket reconnect attempts
    WEBSOCKET: {
        MAX_RECONNECT_ATTEMPTS: 10,
    },
    // Max metrics to store
    MAX_METRICS: 1000,
    // Alert retention
    ALERT_RETENTION: {
        MAX_ALERTS: 100,
    },
} as const;

// ============================================================================
// UI Dimensions - Flexy: Never hardcode pixel values!
// Centralized dimension constants for consistent sizing across components
// ============================================================================
export const UI_DIMENSIONS = {
    // Skeleton dimensions
    SKELETON: {
        AVATAR: { width: '48px', height: '48px' },
        AVATAR_SMALL: { width: '40px', height: '40px' },
        BUTTON_SMALL: { width: '80px', height: '32px' },
        BUTTON_MEDIUM: { width: '120px', height: '40px' },
        INPUT_HEIGHT: '48px',
        CHART_HEIGHT: '300px',
        LINE_HEIGHT_SMALL: '12px',
        LINE_HEIGHT_MEDIUM: '16px',
        LINE_HEIGHT_LARGE: '24px',
        HEADER_LINE_WIDTH: '60%',
        SUBHEADER_LINE_WIDTH: '40%',
    },

    // Textarea dimensions
    TEXTAREA: {
        MIN_HEIGHT: '40px',
        MAX_HEIGHT: '120px',
    },

    // Common component dimensions
    COMPONENTS: {
        ICON_SIZE_SMALL: '16px',
        ICON_SIZE_MEDIUM: '20px',
        ICON_SIZE_LARGE: '24px',
        TOUCH_TARGET_MIN: '44px',
        TOUCH_TARGET_COMFORTABLE: '48px',
        CARD_BORDER_RADIUS: '8px',
        BUTTON_BORDER_RADIUS: '6px',
        AVATAR_BORDER_RADIUS: '9999px',
    },

    // Loading and progress
    LOADING: {
        SPINNER_SIZE_SMALL: '16px',
        SPINNER_SIZE_MEDIUM: '24px',
        SPINNER_SIZE_LARGE: '32px',
        PROGRESS_HEIGHT: '4px',
        SKELETON_SHIMMER_WIDTH: '200%',
    },

    // Modal and overlay
    MODAL: {
        MAX_WIDTH_SMALL: '400px',
        MAX_WIDTH_MEDIUM: '600px',
        MAX_WIDTH_LARGE: '800px',
        BACKDROP_BLUR: '8px',
    },

    // Accessibility
    ACCESSIBILITY: {
        OFFSCREEN_POSITION: '-9999px',
        SCREEN_READER_ANNOUNCEMENT_CLEAR_DELAY: 1000,
        FOCUS_RING_WIDTH: '2px',
        FOCUS_RING_OFFSET: '2px',
    },
} as const;

// Test Constants - Flexy: Never hardcode test data!
export const TEST_CONSTANTS = {
    IDS: {
        // User IDs
        USER_1: 'user_1',
        USER_2: 'user_2',
        USER_001: 'user-001',

        // Student IDs
        STUDENT_1: 'student_1',
        STUDENT_2: 'student_2',
        STUDENT_001: 'student-001',
        STUDENT_002: 'student-002',
        STU_001: 'STU-001',

        // Teacher IDs
        TEACHER_1: 'teacher_1',
        TEACHER_2: 'teacher_2',

        // Parent IDs
        PARENT_1: 'parent_1',
        PARENT_2: 'parent_2',

        // Message IDs
        MSG_1: 'msg_1',
        MSG_2: 'msg_2',
        MSG_3: 'msg_3',
        MSG_4: 'msg_4',
        MSG_5: 'msg_5',

        // Meeting IDs
        MEETING_1: 'meeting_1',
        MEETING_2: 'meeting_2',
        MEETING_3: 'meeting_3',

        // Grade IDs
        GRADE_1: 'grade-1',
        GRADE_2: 'grade-2',
        GRADE_001: 'grade-001',
        GRADE_002: 'grade-002',
        GRADE_123: 'grade-123',
        GRADE_NEW: 'grade-new',

        // Quiz IDs
        QUIZ_001: 'quiz-001',
        QUIZ_002: 'quiz-002',

        // Attempt IDs
        ATTEMPT_001: 'attempt-001',
        ATTEMPT_002: 'attempt-002',

        // Subject IDs
        SUBJECT_001: 'subject-001',
        SUBJECT_1: 'subject-1',
        SUBJECT_2: 'subject-2',

        // Class IDs
        CLASS_001: 'class-001',
        CLASS_1: 'class-1',

        // Teacher IDs (hyphenated format)
        TEACHER_001: 'teacher-001',

        // Registration IDs
        REG_001: 'reg-001',
        REG_002: 'reg-002',
        REG_003: 'reg-003',
        REG_123: 'reg-123',

        // Generic IDs
        TEST_123: 'test-123',
        TEST_SESSION: 'test-session',
        TEST_USER: 'test-user',
        BATCH_1: 'batch-1',
        BATCH_2: 'batch-2',
        VOICE_1: 'voice-1',
        OCR_EVENT_1: 'ocr-event-1',
        ACTION_1: 'action-1',
        ANN_1: 'ann-1',

        // Material IDs
        MAT_1: 'mat-1',
        MAT_2: 'mat-2',
        M1: 'm1',
        M2: 'm2',
        M3: 'm3',

        // Subject IDs
        SUB1: 'sub1',
        SUB2: 'sub2',
        SUB3: 'sub3',

        // Plan IDs
        PLAN_123: 'plan123',

        // Event IDs
        TEST_EVENT_1: 'test-event-1',
    },

    NAMES: {
        // Student names
        ALICE_DOE: 'Alice Doe',
        BOB_SMITH: 'Bob Smith',
        BUDI_SANTOSO: 'Budi Santoso',
        JANE_DOE: 'Jane Doe',

        // Parent names
        JOHN_DOE: 'John Doe',

        // Teacher names
        JANE_SMITH: 'Jane Smith',
        SITI_AMINAH: 'Siti Aminah, S.Pd.',

        // Admin names
        AHMAD_DAHLAN: 'Ahmad Dahlan',

        // Subject names
        MATHEMATICS: 'Mathematics',
    },

    TIMESTAMPS: {
        JAN_31_10AM: '2026-01-31T10:00:00Z',
        JAN_31_11AM: '2026-01-31T11:00:00Z',
        JAN_31_12PM: '2026-01-31T12:00:00Z',
        JAN_31_1PM: '2026-01-31T13:00:00Z',
    },

    DATES: {
        FEB_1_2026: '2026-02-01',
        JAN_30_2026: '2026-01-30',
        JAN_15_2024: '2024-01-15',
        JAN_16_2024: '2024-01-16',
    },

    NUMBERS: {
        ZERO: 0,
        ONE: 1,
        TWO: 2,
        FIVE: 5,
        TEN: 10,
        SIXTY: 60,
        SEVENTY: 70,
        EIGHTY: 80,
        EIGHTY_FIVE: 85,
        NINETY: 90,
        NINETY_FIVE: 95,
        ONE_HUNDRED: 100,
    },

    SUBJECT_CODES: {
        MATH: 'MATH',
        PHYS: 'PHYS',
        BIO: 'BIO',
    },
} as const;

// Gesture Configuration - Flexy: Never hardcode gesture values!
export const GESTURE_CONFIG = {
    SWIPE: {
        THRESHOLD: 100,           // Minimum distance for swipe detection (pixels)
        RESTRAINT: 100,           // Maximum perpendicular distance allowed
        ALLOWED_TIME: 300,        // Maximum time for swipe gesture (milliseconds)
    },
    LONG_PRESS: {
        DELAY: 500,               // Time before long press triggers (milliseconds)
    },
    PULL_TO_REFRESH: {
        THRESHOLD: 80,            // Distance needed to trigger refresh (pixels)
    },
    SWIPE_TO_DELETE: {
        THRESHOLD: 100,           // Distance needed to trigger delete (pixels)
        ACTION_WIDTH: 80,         // Width of delete action area (pixels)
    },
} as const;

// Progressive Loading Configuration - Flexy: Never hardcode loading values!
export const PROGRESSIVE_LOADING_CONFIG = {
    DEFAULT_DELAY: DELAY_MS.STANDARD,           // 200ms minimum loading time
    DEFAULT_TIMEOUT: TIME_MS.TEN_SECONDS,       // 10 seconds maximum loading time
    PROGRESS_INTERVAL: 100,                     // Progress update interval (milliseconds)
    RESET_DELAY: 200,                           // Delay before resetting state (milliseconds)
} as const;

// ============================================================================
// Comprehensive UI String Constants
// ============================================================================

// Notification Messages - Flexy: Never hardcode toast/snackbar messages!
export const NOTIFICATION_MESSAGES = {
    // Success messages
    SUCCESS: {
        SAVED: 'Data berhasil disimpan',
        UPDATED: 'Data berhasil diperbarui',
        DELETED: 'Data berhasil dihapus',
        SUBMITTED: 'Data berhasil dikirim',
        UPLOADED: 'File berhasil diunggah',
        DOWNLOADED: 'File berhasil diunduh',
        COPIED: 'Berhasil disalin ke clipboard',
        SYNCED: 'Sinkronisasi berhasil',
        SETTINGS_SAVED: 'Pengaturan berhasil disimpan',
        SETTINGS_RESET: 'Pengaturan telah diatur ke pengaturan awal',
        BACKUP_CREATED: 'Backup berhasil dibuat',
        BACKUP_RESTORED: 'Backup berhasil dipulihkan',
        EXPORTED: 'Data berhasil diekspor',
        IMPORTED: 'Data berhasil diimpor',
        PASSWORD_CHANGED: 'Password berhasil diubah',
        PROFILE_UPDATED: 'Profil berhasil diperbarui',
        LOGIN_SUCCESS: 'Login berhasil',
        LOGOUT_SUCCESS: 'Logout berhasil',
        CONNECTION_RESTORED: 'Koneksi terpulihkan',
    },

    // Error messages
    ERROR: {
        GENERIC: 'Terjadi kesalahan',
        SAVE_FAILED: 'Gagal menyimpan data',
        UPDATE_FAILED: 'Gagal memperbarui data',
        DELETE_FAILED: 'Gagal menghapus data',
        UPLOAD_FAILED: 'Gagal mengunggah file',
        DOWNLOAD_FAILED: 'Gagal mengunduh file',
        SYNC_FAILED: 'Gagal sinkronisasi',
        SETTINGS_SAVE_FAILED: 'Gagal menyimpan pengaturan',
        SETTINGS_RESET_FAILED: 'Gagal mengatur ulang pengaturan',
        SETTINGS_BACKUP_FAILED: 'Gagal membackup pengaturan',
        SETTINGS_RESTORE_FAILED: 'Gagal memulihkan pengaturan',
        EXPORT_FAILED: 'Gagal mengekspor data',
        IMPORT_FAILED: 'Gagal mengimpor data',
        LOAD_FAILED: 'Gagal memuat data',
        CONNECTION_FAILED: 'Gagal terhubung ke server',
        NETWORK_ERROR: 'Terjadi kesalahan jaringan',
        OFFLINE_ERROR: 'Tidak dapat melakukan aksi saat offline',
        TIMEOUT_ERROR: 'Waktu tunggu habis',
        UNAUTHORIZED: 'Anda tidak memiliki akses',
        SESSION_EXPIRED: 'Sesi telah berakhir, silakan login kembali',
        VALIDATION_ERROR: 'Data tidak valid',
        NOT_FOUND: 'Data tidak ditemukan',
    },

    // Info messages
    INFO: {
        LOADING: 'Memuat data...',
        SAVING: 'Menyimpan data...',
        UPLOADING: 'Mengunggah...',
        SYNCING: 'Menyinkronkan...',
        PROCESSING: 'Memproses...',
        SEARCHING: 'Mencari...',
        CONNECTING: 'Menghubungkan...',
        RECONNECTING: 'Menyambungkan kembali...',
        PLEASE_WAIT: 'Mohon tunggu...',
        NO_CHANGES: 'Tidak ada perubahan',
        ALREADY_UP_TO_DATE: 'Data sudah terbaru',
        ALREADY_EXISTS: 'Data sudah ada',
        NO_DATA: 'Tidak ada data',
        NO_RESULTS: 'Tidak ada hasil',
        NO_CONNECTION: 'Tidak ada koneksi internet',
        OFFLINE_MODE: 'Mode offline aktif',
        CHANGES_UNSAVED: 'Anda memiliki perubahan yang belum disimpan',
    },

    // Warning messages
    WARNING: {
        UNSAVED_CHANGES: 'Perubahan belum disimpan, yakin ingin keluar?',
        DELETE_CONFIRMATION: 'Data yang dihapus tidak dapat dikembalikan',
        LARGE_FILE: 'File terlalu besar',
        INVALID_FORMAT: 'Format file tidak valid',
        BROWSER_UNSUPPORTED: 'Browser tidak mendukung fitur ini',
        FEATURE_LIMITED: 'Fitur terbatas dalam mode offline',
    },
} as const;

// Form Labels - Flexy: Never hardcode form field labels!
export const FORM_LABELS = {
    // Personal info
    PERSONAL: {
        FULL_NAME: 'Nama Lengkap',
        FIRST_NAME: 'Nama Depan',
        LAST_NAME: 'Nama Belakang',
        NICKNAME: 'Nama Panggilan',
        GENDER: 'Jenis Kelamin',
        BIRTH_DATE: 'Tanggal Lahir',
        BIRTH_PLACE: 'Tempat Lahir',
        NISN: 'NISN',
        NIS: 'NIS',
        NIK: 'NIK',
    },

    // Contact info
    CONTACT: {
        EMAIL: 'Email',
        PHONE: 'Nomor Telepon',
        WHATSAPP: 'Nomor WhatsApp',
        ADDRESS: 'Alamat Lengkap',
        CITY: 'Kota/Kabupaten',
        PROVINCE: 'Provinsi',
        POSTAL_CODE: 'Kode Pos',
    },

    // Education info
    EDUCATION: {
        SCHOOL_NAME: 'Nama Sekolah',
        SCHOOL_ADDRESS: 'Alamat Sekolah',
        GRADUATION_YEAR: 'Tahun Lulus',
        PREVIOUS_SCHOOL: 'Sekolah Asal',
        MAJOR: 'Jurusan',
        CLASS: 'Kelas',
        ACADEMIC_YEAR: 'Tahun Ajaran',
        SEMESTER: 'Semester',
    },

    // Parent info
    PARENT: {
        FATHER_NAME: 'Nama Ayah',
        MOTHER_NAME: 'Nama Ibu',
        PARENT_PHONE: 'Nomor Telepon Orang Tua',
        GUARDIAN_NAME: 'Nama Wali',
        GUARDIAN_PHONE: 'Nomor Telepon Wali',
        PARENT_OCCUPATION: 'Pekerjaan Orang Tua',
        PARENT_ADDRESS: 'Alamat Orang Tua',
    },

    // Account info
    ACCOUNT: {
        USERNAME: 'Username',
        PASSWORD: 'Password',
        NEW_PASSWORD: 'Password Baru',
        CONFIRM_PASSWORD: 'Konfirmasi Password',
        CURRENT_PASSWORD: 'Password Saat Ini',
        ROLE: 'Peran',
    },

    // Common
    COMMON: {
        TITLE: 'Judul',
        DESCRIPTION: 'Deskripsi',
        CONTENT: 'Konten',
        CATEGORY: 'Kategori',
        STATUS: 'Status',
        DATE: 'Tanggal',
        TIME: 'Waktu',
        REMARKS: 'Keterangan',
        NOTES: 'Catatan',
    },
} as const;

// Status Labels - Flexy: Never hardcode status display text!
export const STATUS_LABELS = {
    // Connection status
    CONNECTION: {
        ONLINE: 'Online',
        OFFLINE: 'Offline',
        CONNECTING: 'Menghubungkan...',
        RECONNECTING: 'Menyambungkan kembali...',
        CONNECTED: 'Terhubung',
        DISCONNECTED: 'Terputus',
    },

    // Real-time status
    REALTIME: {
        ACTIVE: 'Real-time Aktif',
        INACTIVE: 'Real-time Nonaktif',
        SYNCING: 'Sinkronisasi...',
        SYNCED: 'Tersinkron',
        PENDING_SYNC: 'Menunggu sinkronisasi',
    },

    // Data status
    DATA: {
        LOADING: 'Memuat data...',
        LOADED: 'Data Terkini',
        UPDATING: 'Memperbarui...',
        SAVED: 'Tersimpan',
        MODIFIED: 'Diubah',
        DIRTY: 'Belum disimpan',
    },

    // Feature status
    FEATURE: {
        ENABLED: 'Aktif',
        DISABLED: 'Nonaktif',
        AVAILABLE: 'Tersedia',
        UNAVAILABLE: 'Tidak Tersedia',
        SUPPORTED: 'Didukung',
        UNSUPPORTED: 'Tidak Didukung',
    },
} as const;

// Tab Labels - Flexy: Never hardcode tab navigation labels!
export const TAB_LABELS = {
    // Academic tabs
    ACADEMIC: {
        SCHEDULE: 'Jadwal Pelajaran',
        ASSIGNMENTS: 'Tugas Saya',
        MATERIALS: 'Materi Pelajaran',
        GRADES: 'Nilai Akademik',
        ATTENDANCE: 'Kehadiran',
        REPORTS: 'Laporan',
    },

    // Communication tabs
    COMMUNICATION: {
        DISCUSSION: 'Grup Diskusi',
        MESSAGES: 'Pesan',
        ANNOUNCEMENTS: 'Pengumuman',
        MEETINGS: 'Jadwal Meeting',
    },

    // PPDB tabs
    PPDB: {
        OVERVIEW: 'Ringkasan',
        REGISTRATIONS: 'Pendaftaran',
        STATISTICS: 'Statistik',
        SETTINGS: 'Pengaturan',
    },

    // Profile tabs
    PROFILE: {
        OVERVIEW: 'Ringkasan',
        EDIT: 'Edit Profil',
        SETTINGS: 'Pengaturan',
        SECURITY: 'Keamanan',
        NOTIFICATIONS: 'Notifikasi',
    },

    // Admin tabs
    ADMIN: {
        DASHBOARD: 'Dashboard',
        USERS: 'Pengguna',
        CLASSES: 'Kelas',
        SUBJECTS: 'Mata Pelajaran',
        REPORTS: 'Laporan',
        SETTINGS: 'Pengaturan',
    },
} as const;

// Toolbar Labels - Flexy: Never hardcode toolbar button labels!
export const TOOLBAR_LABELS = {
    // Actions
    ACTIONS: {
        ADD: 'Tambah',
        EDIT: 'Edit',
        DELETE: 'Hapus',
        VIEW: 'Lihat',
        SAVE: 'Simpan',
        CANCEL: 'Batal',
        SUBMIT: 'Kirim',
        RESET: 'Reset',
        REFRESH: 'Refresh',
        SEARCH: 'Cari',
        FILTER: 'Filter',
        SORT: 'Urutkan',
        EXPORT: 'Ekspor',
        IMPORT: 'Impor',
        DOWNLOAD: 'Unduh',
        UPLOAD: 'Unggah',
        PRINT: 'Cetak',
        SHARE: 'Bagikan',
        COPY: 'Salin',
    },

    // Navigation
    NAVIGATION: {
        BACK: 'Kembali',
        NEXT: 'Selanjutnya',
        PREVIOUS: 'Sebelumnya',
        FIRST: 'Pertama',
        LAST: 'Terakhir',
        HOME: 'Beranda',
        DASHBOARD: 'Dashboard',
        PROFILE: 'Profil',
        SETTINGS: 'Pengaturan',
        LOGOUT: 'Logout',
    },

    // Quick actions
    QUICK_ACTIONS: {
        OPEN_DASHBOARD: 'Buka Dashboard',
        VIEW_WEBSITE: 'Lihat Website',
        SEND_MESSAGE: 'Kirim Pesan',
        NEW_REGISTRATION: 'Pendaftaran Baru',
        SAVE_ALL: 'Simpan Semua',
        SELECT_ALL: 'Pilih Semua',
        DESELECT_ALL: 'Batal Pilih Semua',
    },
} as const;

// Empty State Messages - Flexy: Never hardcode empty state text!
export const EMPTY_STATE_MESSAGES = {
    // Generic
    GENERIC: {
        TITLE: 'Tidak Ada Data',
        DESCRIPTION: 'Belum ada data yang tersedia',
        ACTION: 'Tambah Data',
    },

    // Specific contexts
    LIBRARY: {
        TITLE: 'Perpustakaan Kosong',
        DESCRIPTION: 'Anda sudah berada di perpustakaan, tapi belum ada materi',
        ACTION: 'Jelajahi Materi',
    },

    ASSIGNMENTS: {
        TITLE: 'Tidak Ada Tugas',
        DESCRIPTION: 'Belum ada tugas yang diberikan',
        ACTION: 'Lihat Jadwal',
    },

    MESSAGES: {
        TITLE: 'Tidak Ada Pesan',
        DESCRIPTION: 'Belum ada pesan masuk',
        ACTION: 'Kirim Pesan',
    },

    NOTIFICATIONS: {
        TITLE: 'Tidak Ada Notifikasi',
        DESCRIPTION: 'Belum ada notifikasi baru',
        ACTION: 'Pengaturan Notifikasi',
    },

    SEARCH: {
        TITLE: 'Tidak Ada Hasil',
        DESCRIPTION: 'Pencarian tidak menemukan hasil',
        ACTION: 'Ubah Pencarian',
    },

    OFFLINE: {
        TITLE: 'Mode Offline',
        DESCRIPTION: 'Anda sedang offline. Beberapa fitur terbatas.',
        ACTION: 'Coba Lagi',
    },
} as const;

// Confirmation Messages - Flexy: Never hardcode confirmation dialog text!
export const CONFIRMATION_MESSAGES = {
    // Delete confirmations
    DELETE: {
        TITLE: 'Konfirmasi Hapus',
        MESSAGE: 'Apakah Anda yakin ingin menghapus data ini?',
        WARNING: 'Tindakan ini tidak dapat dibatalkan.',
        CONFIRM: 'Ya, Hapus',
        CANCEL: 'Batal',
    },

    // Save confirmations
    SAVE: {
        TITLE: 'Simpan Perubahan',
        MESSAGE: 'Apakah Anda ingin menyimpan perubahan?',
        CONFIRM: 'Ya, Simpan',
        CANCEL: 'Batal',
        DISCARD: 'Buang Perubahan',
    },

    // Cancel confirmations
    CANCEL: {
        TITLE: 'Batal Perubahan',
        MESSAGE: 'Perubahan belum disimpan. Yakin ingin keluar?',
        CONFIRM: 'Ya, Keluar',
        CANCEL: 'Lanjutkan Edit',
    },

    // Logout confirmation
    LOGOUT: {
        TITLE: 'Konfirmasi Logout',
        MESSAGE: 'Apakah Anda yakin ingin keluar?',
        CONFIRM: 'Ya, Logout',
        CANCEL: 'Batal',
    },

    // Reset confirmations
    RESET: {
        TITLE: 'Reset Pengaturan',
        MESSAGE: 'Ini akan mengembalikan semua pengaturan ke default. Lanjutkan?',
        CONFIRM: 'Ya, Reset',
        CANCEL: 'Batal',
    },
} as const;

// Loading Messages - Flexy: Never hardcode loading state text!
export const LOADING_MESSAGES = {
    // Generic
    GENERIC: 'Memuat...',
    PLEASE_WAIT: 'Mohon tunggu...',

    // Specific contexts
    AUTH: {
        LOGIN: 'Sedang login...',
        LOGOUT: 'Sedang logout...',
        VERIFYING: 'Memverifikasi...',
    },

    DATA: {
        LOADING: 'Memuat data...',
        SAVING: 'Menyimpan data...',
        SYNCING: 'Menyinkronkan data...',
        FETCHING: 'Mengambil data...',
        UPDATING: 'Memperbarui data...',
        DELETING: 'Menghapus data...',
    },

    FILE: {
        UPLOADING: 'Mengunggah file...',
        DOWNLOADING: 'Mengunduh file...',
        PROCESSING: 'Memproses file...',
        CONVERTING: 'Mengkonversi file...',
    },

    NETWORK: {
        CONNECTING: 'Menghubungkan...',
        RECONNECTING: 'Menyambungkan kembali...',
        SYNCING: 'Sinkronisasi...',
    },

    AI: {
        THINKING: 'AI sedang berpikir...',
        PROCESSING: 'AI sedang memproses...',
        GENERATING: 'AI sedang menghasilkan...',
        ANALYZING: 'AI sedang menganalisis...',
    },
} as const;

// Voice Feature Strings - Flexy: Never hardcode voice UI text!
export const VOICE_UI_STRINGS = {
    // Status
    STATUS: {
        LISTENING: 'Mendengarkan...',
        PROCESSING: 'Memproses...',
        SPEAKING: 'Bicara...',
        IDLE: 'Ketuk untuk bicara',
        ERROR: 'Terjadi kesalahan',
    },

    // Hints
    HINTS: {
        TAP_TO_SPEAK: 'Ketuk mikrofon untuk mulai bicara',
        TAP_TO_STOP: 'Ketuk lagi untuk berhenti',
        SPEAK_NOW: 'Silakan bicara sekarang',
    },

    // Errors
    ERRORS: {
        NO_SPEECH: 'Tidak ada suara terdeteksi',
        NOT_SUPPORTED: 'Browser tidak mendukung fitur suara',
        PERMISSION_DENIED: 'Izin mikrofon ditolak',
        NETWORK_ERROR: 'Kesalahan jaringan saat memproses suara',
    },
} as const;

// ============================================================================
// End of UI String Constants
// ============================================================================

// Error Message Auto-Dismiss Configuration
export const ERROR_MESSAGE_CONFIG = {
    DEFAULT_DELAY_MS: 5000,
    EXTENDED_DELAY_MS: 8000,
    MIN_DELAY_MS: 3000,
} as const;

// Site Editor Limits
export const SITE_EDITOR_LIMITS = {
    MAX_INPUT_LENGTH: 1000,
    MIN_INPUT_LENGTH: 3,
    MAX_SITE_NAME_LENGTH: 100,
} as const;
