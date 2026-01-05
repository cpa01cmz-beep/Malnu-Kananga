
// Centralized Storage Keys to prevent typo and ensure consistency
export const STORAGE_KEYS = {
    SITE_CONTENT: 'malnu_site_content',
    USERS: 'malnu_users',
    GRADES: 'malnu_grades',
    CLASS_DATA: 'malnu_class_data',
    PPDB_REGISTRANTS: 'malnu_ppdb_registrants',
    MATERIALS: 'malnu_materials',
    INVENTORY: 'malnu_inventory',
    EVENTS: 'malnu_events',
    AUTH_SESSION: 'malnu_auth_session',
    THEME: 'malnu_theme',
    VOICE_STORAGE_KEY: 'malnu_voice_settings',
} as const;

export const APP_CONFIG = {
    SCHOOL_NAME: 'MA Malnu Kananga',
    SCHOOL_NPSN: '69881502',
};

export const VOICE_CONFIG = {
    DEFAULT_RECOGNITION_CONFIG: {
        language: 'id-ID',
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
} as const;
