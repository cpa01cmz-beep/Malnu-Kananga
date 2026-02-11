/**
 * Academic Configuration - Flexy: Never hardcode academic options!
 * Centralized academic-related dropdowns, status values, and options
 */

export const ASSIGNMENT_TYPES = {
    HOMEWORK: 'homework',
    QUIZ: 'quiz',
    PROJECT: 'project',
    EXAM: 'exam',
    REMEDIAL: 'remedial',
} as const;

export const ASSIGNMENT_TYPE_LABELS: Record<string, string> = {
    [ASSIGNMENT_TYPES.HOMEWORK]: 'Tugas',
    [ASSIGNMENT_TYPES.QUIZ]: 'Kuis',
    [ASSIGNMENT_TYPES.PROJECT]: 'Proyek',
    [ASSIGNMENT_TYPES.EXAM]: 'Ujian',
    [ASSIGNMENT_TYPES.REMEDIAL]: 'Remedial',
} as const;

export const INVENTORY_CONDITIONS = {
    GOOD: 'Baik',
    LIGHT_DAMAGE: 'Rusak Ringan',
    HEAVY_DAMAGE: 'Rusak Berat',
    LOST: 'Hilang',
} as const;

export const INVENTORY_CONDITION_OPTIONS = [
    { value: INVENTORY_CONDITIONS.GOOD, label: 'Baik', color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: INVENTORY_CONDITIONS.LIGHT_DAMAGE, label: 'Rusak Ringan', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { value: INVENTORY_CONDITIONS.HEAVY_DAMAGE, label: 'Rusak Berat', color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: INVENTORY_CONDITIONS.LOST, label: 'Hilang', color: 'text-gray-600', bgColor: 'bg-gray-50' },
] as const;

export const ANNOUNCEMENT_TYPES = {
    GENERAL: 'general',
    ACADEMIC: 'academic',
    EVENT: 'event',
    URGENT: 'urgent',
} as const;

export const ANNOUNCEMENT_TYPE_LABELS: Record<string, string> = {
    [ANNOUNCEMENT_TYPES.GENERAL]: 'Umum',
    [ANNOUNCEMENT_TYPES.ACADEMIC]: 'Akademik',
    [ANNOUNCEMENT_TYPES.EVENT]: 'Kegiatan',
    [ANNOUNCEMENT_TYPES.URGENT]: 'Penting',
} as const;

export const ANNOUNCEMENT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    SCHEDULED: 'scheduled',
    ARCHIVED: 'archived',
} as const;

export const ANNOUNCEMENT_STATUS_LABELS: Record<string, string> = {
    [ANNOUNCEMENT_STATUS.DRAFT]: 'Draft',
    [ANNOUNCEMENT_STATUS.PUBLISHED]: 'Dipublikasikan',
    [ANNOUNCEMENT_STATUS.SCHEDULED]: 'Terjadwal',
    [ANNOUNCEMENT_STATUS.ARCHIVED]: 'Diarsipkan',
} as const;

export const TEMPLATE_TYPES = {
    EMAIL: 'email',
    NOTIFICATION: 'notification',
    SMS: 'sms',
    WHATSAPP: 'whatsapp',
} as const;

export const TEMPLATE_TYPE_LABELS: Record<string, string> = {
    [TEMPLATE_TYPES.EMAIL]: 'Email',
    [TEMPLATE_TYPES.NOTIFICATION]: 'Notifikasi',
    [TEMPLATE_TYPES.SMS]: 'SMS',
    [TEMPLATE_TYPES.WHATSAPP]: 'WhatsApp',
} as const;

export const USER_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending',
} as const;

export const USER_STATUS_LABELS: Record<string, string> = {
    [USER_STATUS.ACTIVE]: 'Aktif',
    [USER_STATUS.INACTIVE]: 'Nonaktif',
    [USER_STATUS.SUSPENDED]: 'Ditangguhkan',
    [USER_STATUS.PENDING]: 'Menunggu',
} as const;

export const DATE_RANGE_OPTIONS = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'semester', label: 'Semester Ini' },
    { value: 'year', label: 'Tahun Ini' },
    { value: 'all', label: 'Semua Waktu' },
] as const;

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'name_asc', label: 'Nama (A-Z)' },
    { value: 'name_desc', label: 'Nama (Z-A)' },
] as const;

export const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

export const FEEDBACK_TYPES = {
    SUGGESTION: 'suggestion',
    COMPLAINT: 'complaint',
    APPRECIATION: 'appreciation',
    QUESTION: 'question',
} as const;

export const FEEDBACK_TYPE_LABELS: Record<string, string> = {
    [FEEDBACK_TYPES.SUGGESTION]: 'Saran',
    [FEEDBACK_TYPES.COMPLAINT]: 'Keluhan',
    [FEEDBACK_TYPES.APPRECIATION]: 'Apresiasi',
    [FEEDBACK_TYPES.QUESTION]: 'Pertanyaan',
} as const;

export const NOTIFICATION_CHANNELS = [
    { value: 'push', label: 'Push Notification' },
    { value: 'email', label: 'Email' },
    { value: 'voice', label: 'Voice' },
] as const;

export const TAB_OPTIONS = {
    OVERVIEW: 'overview',
    DETAILS: 'details',
    ANALYTICS: 'analytics',
    SETTINGS: 'settings',
} as const;
