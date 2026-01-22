/**
 * Centralized error message constants
 * Single source of truth for all user-facing error messages
 */

export const ERROR_MESSAGES = {
  // Error Type Messages (from ErrorType enum)
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.',
  TIMEOUT_ERROR: 'Waktu habis saat memproses permintaan. Silakan coba lagi.',
  RATE_LIMIT_ERROR: 'Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.',
  API_KEY_ERROR: 'Konfigurasi API tidak valid. Hubungi administrator.',
  QUOTA_EXCEEDED_ERROR: 'Kuota API telah habis. Silakan coba lagi nanti.',
  CONTENT_FILTER_ERROR: 'Permintaan Anda tidak dapat diproses karena kebijakan konten.',
  SERVER_ERROR: 'Server sedang mengalami gangguan. Silakan coba sesaat lagi.',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
  OCR_ERROR: 'Gagal memproses dokumen. Silakan pastikan gambar jelas dan coba lagi.',
  NOTIFICATION_ERROR: 'Tidak dapat mengirim notifikasi. Periksa pengaturan perangkat Anda.',
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid. Silakan periksa kembali.',
  PERMISSION_ERROR: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
  OFFLINE_ERROR: 'Tidak dapat melakukan operasi saat offline. Data akan disinkronkan saat online.',
  CONFLICT_ERROR: 'Data telah diubah oleh pengguna lain. Silakan refresh dan coba lagi.',
} as const;

export const VALIDATION_MESSAGES = {
  // Field-specific validation messages
  REQUIRED_FIELD: (fieldName: string): string => `${fieldName} wajib diisi`,
  MIN_LENGTH: (fieldName: string, minLength: number): string => `${fieldName} minimal ${minLength} karakter`,
  MAX_LENGTH: (fieldName: string, maxLength: number): string => `${fieldName} maksimal ${maxLength} karakter`,
  INVALID_EMAIL: 'Format email tidak valid',
  INVALID_PHONE: 'Format nomor telepon tidak valid',
  INVALID_NUMBER: (fieldName: string): string => `${fieldName} harus berupa angka`,
  INVALID_RANGE: (fieldName: string, min: number, max: number): string => `${fieldName} harus antara ${min} dan ${max}`,
  INVALID_FORMAT: 'Format data tidak valid. Hubungi administrator jika masalah berlanjut.',

  // PPDB validation messages
  FULL_NAME_REQUIRED: 'Nama lengkap wajib diisi',
  FULL_NAME_MIN_LENGTH: 'Nama lengkap minimal 3 karakter',
  FULL_NAME_INVALID_CHARS: 'Nama hanya boleh berisi huruf, spasi, tanda hubung, dan tanda kutip',
  NISN_REQUIRED: 'NISN wajib diisi',
  NISN_INVALID: 'NISN harus 10 digit',
  ORIGIN_SCHOOL_REQUIRED: 'Asal sekolah wajib diisi',
  ORIGIN_SCHOOL_MIN_LENGTH: 'Nama sekolah minimal 5 karakter',
  PARENT_NAME_REQUIRED: 'Nama orang tua/wali wajib diisi',
  PARENT_NAME_MIN_LENGTH: 'Nama orang tua/wali minimal 3 karakter',
  PHONE_REQUIRED: 'Nomor telepon wajib diisi',
  PHONE_INVALID: 'Format nomor telepon tidak valid',
  EMAIL_REQUIRED: 'Email wajib diisi',
  EMAIL_INVALID: 'Format email tidak valid',
  ADDRESS_REQUIRED: 'Alamat wajib diisi',
  ADDRESS_MIN_LENGTH: 'Alamat minimal 10 karakter',

  // Grade validation messages
  GRADE_REQUIRED: 'Nilai wajib diisi',
  GRADE_INVALID_TYPE: 'Nilai harus berupa angka',
  GRADE_INVALID_RANGE: 'Nilai harus antara 0 dan 100',
  GRADE_LOW_WARNING: (gradeType: string): string => `Nilai ${gradeType} rendah, pertimbangkan remedial`,
  GRADE_MUST_HAVE_ONE: 'Setidaknya satu nilai harus diisi',
  CLASS_INCOMPLETE: 'Tidak semua siswa memiliki nilai. Mohon lengkapi data sebelum menyimpan.',

  // Assignment validation messages
  TITLE_REQUIRED: 'Judul tugas harus diisi',
  TITLE_MIN_LENGTH: 'Judul minimal 5 karakter',
  DESCRIPTION_REQUIRED: 'Deskripsi harus diisi',
  DESCRIPTION_MIN_LENGTH: 'Deskripsi minimal 10 karakter',
  SUBJECT_REQUIRED: 'Mata pelajaran harus dipilih',
  CLASS_REQUIRED: 'Kelas harus dipilih',
  MAX_SCORE_REQUIRED: 'Nilai maksimal harus diisi',
  MAX_SCORE_INVALID: 'Nilai maksimal harus lebih dari 0',
  DUE_DATE_REQUIRED: 'Tanggal tenggat harus diisi',
  DUE_DATE_PAST: 'Tanggal tenggat tidak boleh di masa lalu',
  RUBRIC_NAME_REQUIRED: (index: number): string => `Kriteria ${index + 1}: Nama harus diisi`,
  RUBRIC_MAX_SCORE_INVALID: (index: number): string => `Kriteria ${index + 1}: Nilai maksimal harus lebih dari 0`,
  RUBRIC_WEIGHT_INVALID: (index: number): string => `Kriteria ${index + 1}: Bobot harus antara 0-100`,
  RUBRIC_TOTAL_WEIGHT: (total: number): string => `Total bobot rubrik harus 100% (saat ini: ${total}%)`,
  SCORE_RANGE: (maxScore: number): string => `Nilai harus antara 0 dan ${maxScore}`,

  // Material validation messages
  MATERIAL_TITLE_REQUIRED: 'Judul materi wajib diisi',
  MATERIAL_TITLE_MIN_LENGTH: 'Judul materi minimal 5 karakter',
  MATERIAL_DESCRIPTION_REQUIRED: 'Deskripsi materi wajib diisi',
  MATERIAL_CATEGORY_REQUIRED: 'Kategori materi wajib dipilih',
  MATERIAL_FILE_REQUIRED: 'File materi wajib diunggah',
  MATERIAL_FILE_TYPE_INVALID: (types: string): string => `Tipe file tidak valid. Harap unggah: ${types}`,
  MATERIAL_FILE_TOO_LARGE: (maxSize: string): string => `Ukuran file terlalu besar. Maksimal: ${maxSize}`,

  // Announcement validation messages
  ANNOUNCEMENT_TITLE_REQUIRED: 'Judul dan konten harus diisi',
  ANNOUNCEMENT_CONTENT_REQUIRED: 'Judul dan konten harus diisi',

  // Class/Student validation messages
  STUDENT_NAME_REQUIRED: 'Nama siswa tidak boleh kosong',
  STUDENT_NAME_MIN_LENGTH: 'Nama siswa minimal 3 karakter',
  STUDENT_NAME_MAX_LENGTH: 'Nama siswa maksimal 100 karakter',
  STUDENT_NAME_UNUSUAL_CHARS: 'Nama siswa mengandung karakter tidak biasa',
  NIS_REQUIRED: 'NIS wajib diisi',
  NIS_INVALID: 'Format NIS tidak valid',

  // Category validation messages
  CATEGORY_NAME_REQUIRED: 'Nama kategori wajib diisi',
  CATEGORY_NAME_MIN_LENGTH: 'Nama kategori minimal 3 karakter',
  CATEGORY_NAME_MAX_LENGTH: 'Nama kategori maksimal 50 karakter',
  CATEGORY_INVALID_CHARS: 'Nama kategori hanya boleh berisi huruf, angka, dan spasi',
} as const;

export const API_ERROR_MESSAGES = {
  // HTTP status codes
  BAD_REQUEST: 'Data yang dikirim tidak valid. Periksa kembali input Anda.',
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk melakukan operasi ini.',
  NOT_FOUND: 'Data tidak ditemukan. Mungkin telah dihapus atau dipindahkan.',
  CONFLICT: 'Konflik data. Mungkin ada perubahan yang dilakukan oleh pengguna lain.',
  UNPROCESSABLE_ENTITY: 'Validasi gagal. Periksa kembali input Anda.',
  TOO_MANY_REQUESTS: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.',
  INTERNAL_SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba lagi beberapa saat.',
  BAD_GATEWAY: 'Server sedang dalam pemeliharaan. Silakan coba lagi nanti.',
  SERVICE_UNAVAILABLE: 'Layanan tidak tersedia sementara. Silakan coba lagi nanti.',
  GATEWAY_TIMEOUT: 'Server terlalu lama merespons. Silakan coba lagi.',

  // Network errors
  NETWORK_ERROR: 'Koneksi Internet gagal. Periksa koneksi Anda dan coba lagi.',
  ABORT_ERROR: 'Operasi dibatalkan karena terlalu lama. Coba lagi.',

  // Generic errors
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
  OPERATION_FAILED: 'Terjadi kesalahan. Silakan coba lagi.',

  // API-specific errors
  JSON_PARSE_ERROR: 'Format data tidak valid. Hubungi administrator jika masalah berlanjut.',
} as const;

export const USER_GUIDANCE = {
  // Action guidance messages
  RETRY: 'Coba Lagi',
  REFRESH: 'Refresh Halaman',
  CONTACT_ADMIN: 'Hubungi Administrator',
  SELECT_DIFFERENT_FILE: 'Pilih Gambar Lain',
  CHECK_CONNECTION: 'Periksa koneksi internet Anda',
  TRY_AGAIN_LATER: 'Silakan coba lagi nanti',

  // Success messages
  SAVE_SUCCESS: 'Data berhasil disimpan',
  DELETE_SUCCESS: 'Data berhasil dihapus',
  UPDATE_SUCCESS: 'Data berhasil diperbarui',
  UPLOAD_SUCCESS: 'File berhasil diunggah',
  OPERATION_SUCCESS: 'Operasi berhasil',

  // Info messages
  OFFLINE_MODE: 'Anda sedang offline. Data akan disimpan dan disinkronkan saat koneksi tersedia.',
  SYNCING: 'Menyinkronkan data...',
  SYNC_COMPLETE: 'Sinkronisasi selesai',
  SYNC_FAILED: 'Sinkronisasi gagal. Data akan dicoba disinkronkan lagi nanti.',

  // Warning messages
  UNSAVED_CHANGES: 'Ada perubahan yang belum disimpan. Yakin ingin keluar?',
  CONFIRM_DELETE: 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  CONFIRM_RESET: 'Apakah Anda yakin ingin mereset formulir? Semua data yang telah diisi akan hilang.',
} as const;

export const SUCCESS_MESSAGES = {
  // Registration success
  PPDB_REGISTRATION_SUCCESS: 'Pendaftaran PPDB berhasil dikirim. Tunggu email konfirmasi.',
  PPDB_REGISTRATION_SAVED: 'Pendaftaran PPDB berhasil disimpan sebagai draft.',

  // Academic success
  GRADE_SAVED: 'Nilai berhasil disimpan',
  GRADE_BATCH_SAVED: 'Nilai batch berhasil disimpan',
  ASSIGNMENT_CREATED: 'Tugas berhasil dibuat',
  ASSIGNMENT_UPDATED: 'Tugas berhasil diperbarui',
  ASSIGNMENT_DELETED: 'Tugas berhasil dihapus',
  ASSIGNMENT_SUBMITTED: 'Tugas berhasil dikirim',

  // Material success
  MATERIAL_UPLOADED: 'Materi berhasil diunggah',
  MATERIAL_UPDATED: 'Materi berhasil diperbarui',
  MATERIAL_DELETED: 'Materi berhasil dihapus',

  // Announcement success
  ANNOUNCEMENT_CREATED: 'Pengumuman berhasil dibuat',
  ANNOUNCEMENT_UPDATED: 'Pengumuman berhasil diperbarui',
  ANNOUNCEMENT_DELETED: 'Pengumuman berhasil dihapus',
  ANNOUNCEMENT_PUBLISHED: 'Pengumuman berhasil dipublikasikan',

  // Class success
  CLASS_CREATED: 'Kelas berhasil dibuat',
  CLASS_UPDATED: 'Kelas berhasil diperbarui',
  CLASS_DELETED: 'Kelas berhasil dihapus',

  // Student success
  STUDENT_ADDED: 'Siswa berhasil ditambahkan',
  STUDENT_UPDATED: 'Data siswa berhasil diperbarui',
  STUDENT_DELETED: 'Siswa berhasil dihapus',

  // User management success
  USER_CREATED: 'Pengguna berhasil dibuat',
  USER_UPDATED: 'Pengguna berhasil diperbarui',
  USER_DELETED: 'Pengguna berhasil dihapus',
} as const;

export const VOICE_ERROR_MESSAGES = {
  NOT_ALLOWED: 'Izin mikrofon ditolak. Silakan periksa pengaturan browser Anda dan beri izin mikrofon.',
  NO_SPEECH_DETECTED: 'Tidak ada suara terdeteksi. Silakan coba lagi.',
  AUDIO_CAPTURE: 'Tidak dapat mengakses mikrofon. Pastikan mikrofon terhubung dan tidak digunakan aplikasi lain.',
  NETWORK_ERROR: 'Gagal menghubungkan ke layanan pengenalan suara. Periksa koneksi internet Anda.',
  SERVICE_NOT_SUPPORTED: 'Browser Anda tidak mendukung fitur pengenalan suara. Gunakan Chrome, Edge, atau Safari.',
  UNKNOWN_ERROR: 'Terjadi kesalahan pada pengenalan suara. Silakan coba lagi.',
} as const;

export const VOICE_SUCCESS_MESSAGES = {
  TRANSCRIPTION_SUCCESS: 'Suara berhasil dikenali',
  VOICE_COMMAND_EXECUTED: 'Perintah suara berhasil dijalankan',
  VOICE_SETTINGS_SAVED: 'Pengaturan suara berhasil disimpan',
} as const;

export const FILE_ERROR_MESSAGES = {
  FILE_TOO_LARGE: (maxSize: string): string => `Ukuran file terlalu besar. Maksimal: ${maxSize}`,
  INVALID_FILE_TYPE: (allowedTypes: string): string => `Tipe file tidak valid. Harap unggah: ${allowedTypes}`,
  FILE_UPLOAD_FAILED: 'Gagal mengunggah file. Silakan coba lagi.',
  FILE_CORRUPTED: 'File rusak atau tidak dapat dibaca.',
  FILE_READ_ERROR: 'Gagal membaca file.',
  MULTIPLE_FILES_NOT_ALLOWED: 'Hanya satu file yang diperbolehkan.',
} as const;

export const NOTIFICATION_ERROR_MESSAGES = {
  PERMISSION_DENIED: 'Notifikasi dinonaktifkan. Silakan aktifkan di pengaturan browser.',
  FAILED_TO_SEND: 'Gagal mengirim notifikasi. Periksa pengaturan perangkat Anda.',
  FAILED_TO_REGISTER: 'Gagal mendaftarkan notifikasi. Silakan coba lagi.',
} as const;

export const PDF_ERROR_MESSAGES = {
  GENERATION_FAILED: 'Gagal menghasilkan PDF. Silakan coba lagi.',
} as const;

export const DATA_MESSAGES = {
  NO_DATA_AVAILABLE: (dataType: string): string => `Belum ada data ${dataType} tersedia`,
  DATA_FROM_CACHE: 'Data dari cache. Perubahan akan disinkronkan saat online.',
  FETCH_FAILED: (dataType: string): string => `Gagal memuat data ${dataType}`,
} as const;

export const SYNC_MESSAGES = {
  PROCESSING_QUEUED_CHANGES: (count: number): string => `Memproses ${count} perubahan yang tertunda...`,
  SYNC_CHANGES: (count: number): string => `Menyinkronkan ${count} perubahan nilai...`,
  SYNC_SUCCESS: (count: number, dataType: string): string => `${count} ${dataType} berhasil disinkronkan`,
  SYNC_FAILED: (count: number, dataType: string): string => `${count} ${dataType} gagal disinkronkan`,
  OFFLINE_NO_CACHE: 'Tidak ada data tersimpan di cache. Memerlukan koneksi internet.',
  OFFLINE_USING_CACHE: (dataType: string): string => `Data ${dataType} dari cache. Perubahan akan disinkronkan saat online.`,
  QUEUED_OFFLINE: (count: number, dataType: string, status: string): string => `${status}: ${count} ${dataType} diantarkan untuk sinkronisasi`,
  SYNC_COMPLETE: 'Sinkronisasi selesai',
} as const;

export const CSV_MESSAGES = {
  IMPORT_SUCCESS: (count: number): string => `${count} nilai berhasil diimpor`,
  IMPORT_BATCH_SUCCESS: (count: number): string => `CSV import berhasil! ${count} nilai diperbarui.`,
  IMPORT_FAILED: 'Gagal impor CSV. Mohon periksa format file.',
  PARSE_FAILED: 'Gagal parsing CSV. Mohon periksa format file.',
  EXPORT_SUCCESS: 'Grades exported to CSV successfully',
  NO_DATA_TO_EXPORT: 'Tidak ada data untuk diexport',
  VALIDATION_SUMMARY: 'Terdapat kesalahan validasi:\n\n{errors}\n\nPerbaiki kesalahan tersebut sebelum menyimpan.',
} as const;

export const AI_MESSAGES = {
  OCR_FAILED: 'OCR gagal membaca dokumen. Coba dengan kualitas gambar yang lebih baik.',
  OCR_PROCESS_FAILED: 'Gagal memproses dokumen. Silakan coba lagi.',
  ANALYSIS_FAILED: 'Gagal menganalisis data. Silakan coba lagi.',
  PROCESSING: 'Memproses dengan AI...',
} as const;

export const EXPORT_MESSAGES = {
  PDF_SUCCESS: 'Laporan nilai berhasil diexport ke PDF',
  PDF_FAILED: 'Gagal melakukan export PDF',
  NO_DATA_AVAILABLE: 'Tidak ada data untuk diexport',
} as const;

export const AUTO_SAVE_MESSAGES = {
  SUCCESS: 'Nilai otomatis disimpan',
  FAILED: 'Gagal menyimpan nilai otomatis',
} as const;

// Type exports
export type ErrorMessageType = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type ValidationMessageType = typeof VALIDATION_MESSAGES[keyof typeof VALIDATION_MESSAGES];
export type APIErrorMessageType = typeof API_ERROR_MESSAGES[keyof typeof API_ERROR_MESSAGES];
export type UserGuidanceMessageType = typeof USER_GUIDANCE[keyof typeof USER_GUIDANCE];
export type SuccessMessageType = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];
