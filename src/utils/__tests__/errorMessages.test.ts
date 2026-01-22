/**
 * Tests for centralized error message constants
 */

import { describe, it, expect } from 'vitest';
import {
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  API_ERROR_MESSAGES,
  USER_GUIDANCE,
  SUCCESS_MESSAGES,
  VOICE_ERROR_MESSAGES,
  VOICE_SUCCESS_MESSAGES,
  FILE_ERROR_MESSAGES,
  NOTIFICATION_ERROR_MESSAGES
} from '../errorMessages';

describe('errorMessages.ts - Centralized Error Messages', () => {
  describe('ERROR_MESSAGES', () => {
    it('should have all required error type messages', () => {
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBe('Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.');
      expect(ERROR_MESSAGES.TIMEOUT_ERROR).toBe('Waktu habis saat memproses permintaan. Silakan coba lagi.');
      expect(ERROR_MESSAGES.RATE_LIMIT_ERROR).toBe('Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.');
      expect(ERROR_MESSAGES.API_KEY_ERROR).toBe('Konfigurasi API tidak valid. Hubungi administrator.');
      expect(ERROR_MESSAGES.QUOTA_EXCEEDED_ERROR).toBe('Kuota API telah habis. Silakan coba lagi nanti.');
      expect(ERROR_MESSAGES.CONTENT_FILTER_ERROR).toBe('Permintaan Anda tidak dapat diproses karena kebijakan konten.');
      expect(ERROR_MESSAGES.SERVER_ERROR).toBe('Server sedang mengalami gangguan. Silakan coba sesaat lagi.');
      expect(ERROR_MESSAGES.UNKNOWN_ERROR).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
      expect(ERROR_MESSAGES.OCR_ERROR).toBe('Gagal memproses dokumen. Silakan pastikan gambar jelas dan coba lagi.');
      expect(ERROR_MESSAGES.NOTIFICATION_ERROR).toBe('Tidak dapat mengirim notifikasi. Periksa pengaturan perangkat Anda.');
      expect(ERROR_MESSAGES.VALIDATION_ERROR).toBe('Data yang dimasukkan tidak valid. Silakan periksa kembali.');
      expect(ERROR_MESSAGES.PERMISSION_ERROR).toBe('Anda tidak memiliki izin untuk melakukan tindakan ini.');
      expect(ERROR_MESSAGES.OFFLINE_ERROR).toBe('Tidak dapat melakukan operasi saat offline. Data akan disinkronkan saat online.');
      expect(ERROR_MESSAGES.CONFLICT_ERROR).toBe('Data telah diubah oleh pengguna lain. Silakan refresh dan coba lagi.');
    });

    it('should have consistent language (Indonesian)', () => {
      const messages = Object.values(ERROR_MESSAGES);
      messages.forEach(message => {
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
      });
    });

    it('should have actionable error messages', () => {
      const actionableKeywords = [
        'Silakan', 'coba lagi', 'periksa', 'hubungi', 'tunggu', 'refresh'
      ];
      const messages = Object.values(ERROR_MESSAGES);
      // Count messages with actionable keywords
      const actionableCount = messages.filter(message => {
        return actionableKeywords.some(keyword =>
          message.toLowerCase().includes(keyword.toLowerCase())
        );
      }).length;

      // At least 75% of messages should be actionable
      const actionableRatio = actionableCount / messages.length;
      expect(actionableRatio).toBeGreaterThanOrEqual(0.75);
    });
  });

  describe('VALIDATION_MESSAGES', () => {
    describe('Field-specific validation', () => {
      it('should have required field message with parameter support', () => {
        expect(VALIDATION_MESSAGES.REQUIRED_FIELD('Nama')).toBe('Nama wajib diisi');
        expect(VALIDATION_MESSAGES.REQUIRED_FIELD('Email')).toBe('Email wajib diisi');
      });

      it('should have min length message with parameter support', () => {
        expect(VALIDATION_MESSAGES.MIN_LENGTH('Nama', 3)).toBe('Nama minimal 3 karakter');
        expect(VALIDATION_MESSAGES.MIN_LENGTH('Password', 8)).toBe('Password minimal 8 karakter');
      });

      it('should have max length message with parameter support', () => {
        expect(VALIDATION_MESSAGES.MAX_LENGTH('Nama', 100)).toBe('Nama maksimal 100 karakter');
        expect(VALIDATION_MESSAGES.MAX_LENGTH('Judul', 50)).toBe('Judul maksimal 50 karakter');
      });

      it('should have invalid range message with parameter support', () => {
        expect(VALIDATION_MESSAGES.INVALID_RANGE('Nilai', 0, 100)).toBe('Nilai harus antara 0 dan 100');
      });
    });

    describe('PPDB validation messages', () => {
      it('should have all PPDB validation messages', () => {
        expect(VALIDATION_MESSAGES.FULL_NAME_REQUIRED).toBe('Nama lengkap wajib diisi');
        expect(VALIDATION_MESSAGES.FULL_NAME_MIN_LENGTH).toBe('Nama lengkap minimal 3 karakter');
        expect(VALIDATION_MESSAGES.NISN_REQUIRED).toBe('NISN wajib diisi');
        expect(VALIDATION_MESSAGES.PHONE_REQUIRED).toBe('Nomor telepon wajib diisi');
        expect(VALIDATION_MESSAGES.EMAIL_REQUIRED).toBe('Email wajib diisi');
        expect(VALIDATION_MESSAGES.ADDRESS_REQUIRED).toBe('Alamat wajib diisi');
      });
    });

    describe('Grade validation messages', () => {
      it('should have all grade validation messages', () => {
        expect(VALIDATION_MESSAGES.GRADE_REQUIRED).toBe('Nilai wajib diisi');
        expect(VALIDATION_MESSAGES.GRADE_INVALID_TYPE).toBe('Nilai harus berupa angka');
        expect(VALIDATION_MESSAGES.GRADE_INVALID_RANGE).toBe('Nilai harus antara 0 dan 100');
        expect(VALIDATION_MESSAGES.GRADE_MUST_HAVE_ONE).toBe('Setidaknya satu nilai harus diisi');
        expect(VALIDATION_MESSAGES.CLASS_INCOMPLETE).toBe('Tidak semua siswa memiliki nilai. Mohon lengkapi data sebelum menyimpan.');
      });

      it('should have grade low warning with parameter support', () => {
        expect(VALIDATION_MESSAGES.GRADE_LOW_WARNING('tugas')).toBe('Nilai tugas rendah, pertimbangkan remedial');
        expect(VALIDATION_MESSAGES.GRADE_LOW_WARNING('UTS')).toBe('Nilai UTS rendah, pertimbangkan remedial');
        expect(VALIDATION_MESSAGES.GRADE_LOW_WARNING('UAS')).toBe('Nilai UAS rendah, pertimbangkan remedial');
      });
    });

    describe('Assignment validation messages', () => {
      it('should have all assignment validation messages', () => {
        expect(VALIDATION_MESSAGES.TITLE_REQUIRED).toBe('Judul tugas harus diisi');
        expect(VALIDATION_MESSAGES.DESCRIPTION_REQUIRED).toBe('Deskripsi harus diisi');
        expect(VALIDATION_MESSAGES.SUBJECT_REQUIRED).toBe('Mata pelajaran harus dipilih');
        expect(VALIDATION_MESSAGES.CLASS_REQUIRED).toBe('Kelas harus dipilih');
        expect(VALIDATION_MESSAGES.MAX_SCORE_REQUIRED).toBe('Nilai maksimal harus diisi');
        expect(VALIDATION_MESSAGES.DUE_DATE_REQUIRED).toBe('Tanggal tenggat harus diisi');
      });

      it('should have rubric validation messages with parameter support', () => {
        expect(VALIDATION_MESSAGES.RUBRIC_NAME_REQUIRED(0)).toBe('Kriteria 1: Nama harus diisi');
        expect(VALIDATION_MESSAGES.RUBRIC_NAME_REQUIRED(2)).toBe('Kriteria 3: Nama harus diisi');
        expect(VALIDATION_MESSAGES.RUBRIC_TOTAL_WEIGHT(95)).toBe('Total bobot rubrik harus 100% (saat ini: 95%)');
        expect(VALIDATION_MESSAGES.SCORE_RANGE(100)).toBe('Nilai harus antara 0 dan 100');
      });
    });

    describe('Material validation messages', () => {
      it('should have all material validation messages', () => {
        expect(VALIDATION_MESSAGES.MATERIAL_TITLE_REQUIRED).toBe('Judul materi wajib diisi');
        expect(VALIDATION_MESSAGES.MATERIAL_DESCRIPTION_REQUIRED).toBe('Deskripsi materi wajib diisi');
        expect(VALIDATION_MESSAGES.MATERIAL_CATEGORY_REQUIRED).toBe('Kategori materi wajib dipilih');
        expect(VALIDATION_MESSAGES.MATERIAL_FILE_REQUIRED).toBe('File materi wajib diunggah');
      });

      it('should have file error messages with parameter support', () => {
        expect(VALIDATION_MESSAGES.MATERIAL_FILE_TOO_LARGE('10MB')).toBe('Ukuran file terlalu besar. Maksimal: 10MB');
        expect(VALIDATION_MESSAGES.MATERIAL_FILE_TYPE_INVALID('PDF, DOCX')).toBe('Tipe file tidak valid. Harap unggah: PDF, DOCX');
      });
    });

    describe('Class/Student validation messages', () => {
      it('should have all class/student validation messages', () => {
        expect(VALIDATION_MESSAGES.STUDENT_NAME_REQUIRED).toBe('Nama siswa tidak boleh kosong');
        expect(VALIDATION_MESSAGES.STUDENT_NAME_MIN_LENGTH).toBe('Nama siswa minimal 3 karakter');
        expect(VALIDATION_MESSAGES.STUDENT_NAME_MAX_LENGTH).toBe('Nama siswa maksimal 100 karakter');
        expect(VALIDATION_MESSAGES.NIS_REQUIRED).toBe('NIS wajib diisi');
      });
    });

    describe('Category validation messages', () => {
      it('should have all category validation messages', () => {
        expect(VALIDATION_MESSAGES.CATEGORY_NAME_REQUIRED).toBe('Nama kategori wajib diisi');
        expect(VALIDATION_MESSAGES.CATEGORY_NAME_MIN_LENGTH).toBe('Nama kategori minimal 3 karakter');
        expect(VALIDATION_MESSAGES.CATEGORY_NAME_MAX_LENGTH).toBe('Nama kategori maksimal 50 karakter');
      });
    });
  });

  describe('API_ERROR_MESSAGES', () => {
    it('should have all HTTP status error messages', () => {
      expect(API_ERROR_MESSAGES.BAD_REQUEST).toBe('Data yang dikirim tidak valid. Periksa kembali input Anda.');
      expect(API_ERROR_MESSAGES.UNAUTHORIZED).toBe('Sesi Anda telah berakhir. Silakan login kembali.');
      expect(API_ERROR_MESSAGES.FORBIDDEN).toBe('Anda tidak memiliki izin untuk melakukan operasi ini.');
      expect(API_ERROR_MESSAGES.NOT_FOUND).toBe('Data tidak ditemukan. Mungkin telah dihapus atau dipindahkan.');
      expect(API_ERROR_MESSAGES.CONFLICT).toBe('Konflik data. Mungkin ada perubahan yang dilakukan oleh pengguna lain.');
      expect(API_ERROR_MESSAGES.UNPROCESSABLE_ENTITY).toBe('Validasi gagal. Periksa kembali input Anda.');
      expect(API_ERROR_MESSAGES.TOO_MANY_REQUESTS).toBe('Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.');
      expect(API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR).toBe('Terjadi kesalahan pada server. Silakan coba lagi beberapa saat.');
      expect(API_ERROR_MESSAGES.BAD_GATEWAY).toBe('Server sedang dalam pemeliharaan. Silakan coba lagi nanti.');
      expect(API_ERROR_MESSAGES.SERVICE_UNAVAILABLE).toBe('Layanan tidak tersedia sementara. Silakan coba lagi nanti.');
      expect(API_ERROR_MESSAGES.GATEWAY_TIMEOUT).toBe('Server terlalu lama merespons. Silakan coba lagi.');
    });

    it('should have network error messages', () => {
      expect(API_ERROR_MESSAGES.NETWORK_ERROR).toBe('Koneksi Internet gagal. Periksa koneksi Anda dan coba lagi.');
      expect(API_ERROR_MESSAGES.ABORT_ERROR).toBe('Operasi dibatalkan karena terlalu lama. Coba lagi.');
    });

    it('should have generic error messages', () => {
      expect(API_ERROR_MESSAGES.UNKNOWN_ERROR).toBe('Terjadi kesalahan yang tidak diketahui');
      expect(API_ERROR_MESSAGES.OPERATION_FAILED).toBe('Terjadi kesalahan. Silakan coba lagi.');
    });

    it('should have API-specific error messages', () => {
      expect(API_ERROR_MESSAGES.JSON_PARSE_ERROR).toBe('Format data tidak valid. Hubungi administrator jika masalah berlanjut.');
    });
  });

  describe('USER_GUIDANCE', () => {
    it('should have all action guidance messages', () => {
      expect(USER_GUIDANCE.RETRY).toBe('Coba Lagi');
      expect(USER_GUIDANCE.REFRESH).toBe('Refresh Halaman');
      expect(USER_GUIDANCE.CONTACT_ADMIN).toBe('Hubungi Administrator');
      expect(USER_GUIDANCE.SELECT_DIFFERENT_FILE).toBe('Pilih Gambar Lain');
      expect(USER_GUIDANCE.CHECK_CONNECTION).toBe('Periksa koneksi internet Anda');
      expect(USER_GUIDANCE.TRY_AGAIN_LATER).toBe('Silakan coba lagi nanti');
    });

    it('should have all success messages', () => {
      expect(USER_GUIDANCE.SAVE_SUCCESS).toBe('Data berhasil disimpan');
      expect(USER_GUIDANCE.DELETE_SUCCESS).toBe('Data berhasil dihapus');
      expect(USER_GUIDANCE.UPDATE_SUCCESS).toBe('Data berhasil diperbarui');
      expect(USER_GUIDANCE.UPLOAD_SUCCESS).toBe('File berhasil diunggah');
      expect(USER_GUIDANCE.OPERATION_SUCCESS).toBe('Operasi berhasil');
    });

    it('should have all info messages', () => {
      expect(USER_GUIDANCE.OFFLINE_MODE).toBe('Anda sedang offline. Data akan disimpan dan disinkronkan saat koneksi tersedia.');
      expect(USER_GUIDANCE.SYNCING).toBe('Menyinkronkan data...');
      expect(USER_GUIDANCE.SYNC_COMPLETE).toBe('Sinkronisasi selesai');
      expect(USER_GUIDANCE.SYNC_FAILED).toBe('Sinkronisasi gagal. Data akan dicoba disinkronkan lagi nanti.');
    });

    it('should have all warning messages', () => {
      expect(USER_GUIDANCE.UNSAVED_CHANGES).toBe('Ada perubahan yang belum disimpan. Yakin ingin keluar?');
      expect(USER_GUIDANCE.CONFIRM_DELETE).toBe('Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.');
      expect(USER_GUIDANCE.CONFIRM_RESET).toBe('Apakah Anda yakin ingin mereset formulir? Semua data yang telah diisi akan hilang.');
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    describe('Registration success', () => {
      it('should have PPDB registration success messages', () => {
        expect(SUCCESS_MESSAGES.PPDB_REGISTRATION_SUCCESS).toBe('Pendaftaran PPDB berhasil dikirim. Tunggu email konfirmasi.');
        expect(SUCCESS_MESSAGES.PPDB_REGISTRATION_SAVED).toBe('Pendaftaran PPDB berhasil disimpan sebagai draft.');
      });
    });

    describe('Academic success', () => {
      it('should have academic success messages', () => {
        expect(SUCCESS_MESSAGES.GRADE_SAVED).toBe('Nilai berhasil disimpan');
        expect(SUCCESS_MESSAGES.GRADE_BATCH_SAVED).toBe('Nilai batch berhasil disimpan');
        expect(SUCCESS_MESSAGES.ASSIGNMENT_CREATED).toBe('Tugas berhasil dibuat');
        expect(SUCCESS_MESSAGES.ASSIGNMENT_UPDATED).toBe('Tugas berhasil diperbarui');
        expect(SUCCESS_MESSAGES.ASSIGNMENT_DELETED).toBe('Tugas berhasil dihapus');
        expect(SUCCESS_MESSAGES.ASSIGNMENT_SUBMITTED).toBe('Tugas berhasil dikirim');
      });
    });

    describe('Material success', () => {
      it('should have material success messages', () => {
        expect(SUCCESS_MESSAGES.MATERIAL_UPLOADED).toBe('Materi berhasil diunggah');
        expect(SUCCESS_MESSAGES.MATERIAL_UPDATED).toBe('Materi berhasil diperbarui');
        expect(SUCCESS_MESSAGES.MATERIAL_DELETED).toBe('Materi berhasil dihapus');
      });
    });

    describe('Announcement success', () => {
      it('should have announcement success messages', () => {
        expect(SUCCESS_MESSAGES.ANNOUNCEMENT_CREATED).toBe('Pengumuman berhasil dibuat');
        expect(SUCCESS_MESSAGES.ANNOUNCEMENT_UPDATED).toBe('Pengumuman berhasil diperbarui');
        expect(SUCCESS_MESSAGES.ANNOUNCEMENT_DELETED).toBe('Pengumuman berhasil dihapus');
        expect(SUCCESS_MESSAGES.ANNOUNCEMENT_PUBLISHED).toBe('Pengumuman berhasil dipublikasikan');
      });
    });

    describe('Class success', () => {
      it('should have class success messages', () => {
        expect(SUCCESS_MESSAGES.CLASS_CREATED).toBe('Kelas berhasil dibuat');
        expect(SUCCESS_MESSAGES.CLASS_UPDATED).toBe('Kelas berhasil diperbarui');
        expect(SUCCESS_MESSAGES.CLASS_DELETED).toBe('Kelas berhasil dihapus');
      });
    });

    describe('Student success', () => {
      it('should have student success messages', () => {
        expect(SUCCESS_MESSAGES.STUDENT_ADDED).toBe('Siswa berhasil ditambahkan');
        expect(SUCCESS_MESSAGES.STUDENT_UPDATED).toBe('Data siswa berhasil diperbarui');
        expect(SUCCESS_MESSAGES.STUDENT_DELETED).toBe('Siswa berhasil dihapus');
      });
    });

    describe('User management success', () => {
      it('should have user management success messages', () => {
        expect(SUCCESS_MESSAGES.USER_CREATED).toBe('Pengguna berhasil dibuat');
        expect(SUCCESS_MESSAGES.USER_UPDATED).toBe('Pengguna berhasil diperbarui');
        expect(SUCCESS_MESSAGES.USER_DELETED).toBe('Pengguna berhasil dihapus');
      });
    });
  });

  describe('VOICE_ERROR_MESSAGES', () => {
    it('should have all voice error messages', () => {
      expect(VOICE_ERROR_MESSAGES.NOT_ALLOWED).toBe('Izin mikrofon ditolak. Silakan periksa pengaturan browser Anda dan beri izin mikrofon.');
      expect(VOICE_ERROR_MESSAGES.NO_SPEECH_DETECTED).toBe('Tidak ada suara terdeteksi. Silakan coba lagi.');
      expect(VOICE_ERROR_MESSAGES.AUDIO_CAPTURE).toBe('Tidak dapat mengakses mikrofon. Pastikan mikrofon terhubung dan tidak digunakan aplikasi lain.');
      expect(VOICE_ERROR_MESSAGES.NETWORK_ERROR).toBe('Gagal menghubungkan ke layanan pengenalan suara. Periksa koneksi internet Anda.');
      expect(VOICE_ERROR_MESSAGES.SERVICE_NOT_SUPPORTED).toBe('Browser Anda tidak mendukung fitur pengenalan suara. Gunakan Chrome, Edge, atau Safari.');
      expect(VOICE_ERROR_MESSAGES.UNKNOWN_ERROR).toBe('Terjadi kesalahan pada pengenalan suara. Silakan coba lagi.');
    });
  });

  describe('VOICE_SUCCESS_MESSAGES', () => {
    it('should have all voice success messages', () => {
      expect(VOICE_SUCCESS_MESSAGES.TRANSCRIPTION_SUCCESS).toBe('Suara berhasil dikenali');
      expect(VOICE_SUCCESS_MESSAGES.VOICE_COMMAND_EXECUTED).toBe('Perintah suara berhasil dijalankan');
      expect(VOICE_SUCCESS_MESSAGES.VOICE_SETTINGS_SAVED).toBe('Pengaturan suara berhasil disimpan');
    });
  });

  describe('FILE_ERROR_MESSAGES', () => {
    it('should have all file error messages with parameter support', () => {
      expect(FILE_ERROR_MESSAGES.FILE_TOO_LARGE('10MB')).toBe('Ukuran file terlalu besar. Maksimal: 10MB');
      expect(FILE_ERROR_MESSAGES.INVALID_FILE_TYPE('PDF, DOCX')).toBe('Tipe file tidak valid. Harap unggah: PDF, DOCX');
      expect(FILE_ERROR_MESSAGES.FILE_UPLOAD_FAILED).toBe('Gagal mengunggah file. Silakan coba lagi.');
      expect(FILE_ERROR_MESSAGES.FILE_CORRUPTED).toBe('File rusak atau tidak dapat dibaca.');
      expect(FILE_ERROR_MESSAGES.FILE_READ_ERROR).toBe('Gagal membaca file.');
      expect(FILE_ERROR_MESSAGES.MULTIPLE_FILES_NOT_ALLOWED).toBe('Hanya satu file yang diperbolehkan.');
    });
  });

  describe('NOTIFICATION_ERROR_MESSAGES', () => {
    it('should have all notification error messages', () => {
      expect(NOTIFICATION_ERROR_MESSAGES.PERMISSION_DENIED).toBe('Notifikasi dinonaktifkan. Silakan aktifkan di pengaturan browser.');
      expect(NOTIFICATION_ERROR_MESSAGES.FAILED_TO_SEND).toBe('Gagal mengirim notifikasi. Periksa pengaturan perangkat Anda.');
      expect(NOTIFICATION_ERROR_MESSAGES.FAILED_TO_REGISTER).toBe('Gagal mendaftarkan notifikasi. Silakan coba lagi.');
    });
  });
});
