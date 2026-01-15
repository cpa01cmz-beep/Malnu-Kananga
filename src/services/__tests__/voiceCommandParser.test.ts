import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import VoiceCommandParser from '../voiceCommandParser';
import type { VoiceCommand } from '../../types';
import { VOICE_COMMANDS } from '../../constants';

describe('VoiceCommandParser', () => {
  let parser: VoiceCommandParser;

  beforeEach(() => {
    parser = new VoiceCommandParser();
  });

  afterEach(() => {
    parser.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize all voice commands', () => {
      const commands = parser.getCommands();
      expect(commands.length).toBeGreaterThan(28);
    });

    it('should have command IDs for all registered commands', () => {
      const commands = parser.getCommands();
      commands.forEach((cmd) => {
        expect(cmd.id).toBeDefined();
        expect(cmd.action).toBeDefined();
        expect(cmd.patterns).toBeDefined();
        expect(cmd.patterns.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Common Commands', () => {
    it('should parse "buka pengaturan" as OPEN_SETTINGS', () => {
      const result = parser.parse('buka pengaturan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_SETTINGS');
    });

    it('should parse "open settings" as OPEN_SETTINGS', () => {
      const result = parser.parse('open settings');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_SETTINGS');
    });

    it('should parse "hentikan bicara" as STOP_SPEAKING', () => {
      const result = parser.parse('hentikan bicara');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('STOP_SPEAKING');
    });

    it('should parse "stop speaking" as STOP_SPEAKING', () => {
      const result = parser.parse('stop speaking');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('STOP_SPEAKING');
    });

    it('should parse "pulang" as GO_HOME', () => {
      const result = parser.parse('pulang');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('GO_HOME');
    });

    it('should parse "go home" as GO_HOME', () => {
      const result = parser.parse('go home');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('GO_HOME');
    });

    it('should parse "keluar" as LOGOUT', () => {
      const result = parser.parse('keluar');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('LOGOUT');
    });

    it('should parse "logout" as LOGOUT', () => {
      const result = parser.parse('logout');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('LOGOUT');
    });

    it('should parse "bantuan" as HELP', () => {
      const result = parser.parse('bantuan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('HELP');
    });

    it('should parse "help" as HELP', () => {
      const result = parser.parse('help');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('HELP');
    });

    it('should parse "ubah tema" as TOGGLE_THEME', () => {
      const result = parser.parse('ubah tema');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('TOGGLE_THEME');
    });

    it('should parse "toggle theme" as TOGGLE_THEME', () => {
      const result = parser.parse('toggle theme');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('TOGGLE_THEME');
    });

    it('should parse "ubah bahasa" as CHANGE_LANGUAGE', () => {
      const result = parser.parse('ubah bahasa');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('CHANGE_LANGUAGE');
    });

    it('should parse "refresh" as REFRESH_PAGE', () => {
      const result = parser.parse('refresh');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('REFRESH_PAGE');
    });

    it('should parse "perbesar" as ZOOM_IN', () => {
      const result = parser.parse('perbesar');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('ZOOM_IN');
    });

    it('should parse "perkecil" as ZOOM_OUT', () => {
      const result = parser.parse('perkecil');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('ZOOM_OUT');
    });

    it('should parse "buka dokumentasi" as OPEN_DOCUMENTATION', () => {
      const result = parser.parse('buka dokumentasi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_DOCUMENTATION');
    });
  });

  describe('Admin Dashboard Commands', () => {
    it('should parse "tampilkan ppdb" as SHOW_PPDB', () => {
      const result = parser.parse('tampilkan ppdb');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_PPDB');
    });

    it('should parse "show ppdb" as SHOW_PPDB', () => {
      const result = parser.parse('show ppdb');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_PPDB');
    });

    it('should parse "lihat nilai" as VIEW_GRADES_OVERVIEW', () => {
      const result = parser.parse('lihat nilai');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_GRADES_OVERVIEW');
    });

    it('should parse "view grades" as VIEW_GRADES_OVERVIEW', () => {
      const result = parser.parse('view grades');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_GRADES_OVERVIEW');
    });

    it('should parse "buka perpustakaan" as OPEN_LIBRARY', () => {
      const result = parser.parse('buka perpustakaan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_LIBRARY');
    });

    it('should parse "open library" as OPEN_LIBRARY', () => {
      const result = parser.parse('open library');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_LIBRARY');
    });

    it('should parse "cari materi matematika" as SEARCH_LIBRARY with query', () => {
      const result = parser.parse('cari materi matematika');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SEARCH_LIBRARY');
      expect(result?.data?.query).toBe('matematika');
    });

    it('should parse "search materials physics" as SEARCH_LIBRARY with query', () => {
      const result = parser.parse('search materials physics');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SEARCH_LIBRARY');
      expect(result?.data?.query).toBe('physics');
    });

    it('should parse "kalender" as GO_TO_CALENDAR', () => {
      const result = parser.parse('kalender');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('GO_TO_CALENDAR');
    });

    it('should parse "calendar" as GO_TO_CALENDAR', () => {
      const result = parser.parse('calendar');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('GO_TO_CALENDAR');
    });

    it('should parse "tampilkan statistik" as SHOW_STATISTICS', () => {
      const result = parser.parse('tampilkan statistik');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_STATISTICS');
    });

    it('should parse "show statistics" as SHOW_STATISTICS', () => {
      const result = parser.parse('show statistics');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_STATISTICS');
    });

    it('should parse "kelola pengguna" as MANAGE_USERS', () => {
      const result = parser.parse('kelola pengguna');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MANAGE_USERS');
    });

    it('should parse "manage users" as MANAGE_USERS', () => {
      const result = parser.parse('manage users');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MANAGE_USERS');
    });

    it('should parse "kelola izin" as MANAGE_PERMISSIONS', () => {
      const result = parser.parse('kelola izin');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MANAGE_PERMISSIONS');
    });

    it('should parse "cache ai" as AI_CACHE', () => {
      const result = parser.parse('cache ai');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('AI_CACHE');
    });

    it('should parse "editor situs" as SITE_EDITOR', () => {
      const result = parser.parse('editor situs');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SITE_EDITOR');
    });

    it('should parse "dashboard performa" as PERFORMANCE_DASHBOARD', () => {
      const result = parser.parse('dashboard performa');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('PERFORMANCE_DASHBOARD');
    });
  });

  describe('Teacher Dashboard Commands', () => {
    it('should parse "kelas saya" as SHOW_MY_CLASSES', () => {
      const result = parser.parse('kelas saya');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_MY_CLASSES');
    });

    it('should parse "show my classes" as SHOW_MY_CLASSES', () => {
      const result = parser.parse('show my classes');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_MY_CLASSES');
    });

    it('should parse "nilai" as OPEN_GRADING', () => {
      const result = parser.parse('nilai');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_GRADING');
    });

    it('should parse "grading" as OPEN_GRADING', () => {
      const result = parser.parse('grading');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_GRADING');
    });

    it('should parse "absensi" as VIEW_ATTENDANCE', () => {
      const result = parser.parse('absensi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_ATTENDANCE');
    });

    it('should parse "buat pengumuman" as CREATE_ANNOUNCEMENT', () => {
      const result = parser.parse('buat pengumuman');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('CREATE_ANNOUNCEMENT');
    });

    it('should parse "jadwal" as VIEW_SCHEDULE', () => {
      const result = parser.parse('jadwal');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_SCHEDULE');
    });

    it('should parse "upload materi" as MATERIAL_UPLOAD', () => {
      const result = parser.parse('upload materi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MATERIAL_UPLOAD');
    });

    it('should parse "inventaris sekolah" as SCHOOL_INVENTORY', () => {
      const result = parser.parse('inventaris sekolah');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SCHOOL_INVENTORY');
    });

    it('should parse "rencana pelajaran" as LESSON_PLANNING', () => {
      const result = parser.parse('rencana pelajaran');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('LESSON_PLANNING');
    });

    it('should parse "buat rencana pelajaran" as GENERATE_LESSON_PLAN', () => {
      const result = parser.parse('buat rencana pelajaran');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('GENERATE_LESSON_PLAN');
    });

    it('should parse "simpan rencana pelajaran" as SAVE_LESSON_PLAN', () => {
      const result = parser.parse('simpan rencana pelajaran');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SAVE_LESSON_PLAN');
    });

    it('should parse "ekspor rencana pelajaran" as EXPORT_LESSON_PLAN', () => {
      const result = parser.parse('ekspor rencana pelajaran');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('EXPORT_LESSON_PLAN');
    });
  });

  describe('Student Dashboard Commands', () => {
    it('should parse "nilai saya" as SHOW_MY_GRADES', () => {
      const result = parser.parse('nilai saya');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_MY_GRADES');
    });

    it('should parse "show my grades" as SHOW_MY_GRADES', () => {
      const result = parser.parse('show my grades');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SHOW_MY_GRADES');
    });

    it('should parse "cek absensi" as CHECK_ATTENDANCE', () => {
      const result = parser.parse('cek absensi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('CHECK_ATTENDANCE');
    });

    it('should parse "insight" as VIEW_INSIGHTS', () => {
      const result = parser.parse('insight');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_INSIGHTS');
    });

    it('should parse "kegiatan osis" as OSIS_EVENTS', () => {
      const result = parser.parse('kegiatan osis');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OSIS_EVENTS');
    });

    it('should parse "modul pembelajaran" as LEARNING_MODULES', () => {
      const result = parser.parse('modul pembelajaran');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('LEARNING_MODULES');
    });
  });

  describe('Parent Dashboard Commands', () => {
    it('should parse "nilai anak" as VIEW_CHILD_GRADES', () => {
      const result = parser.parse('nilai anak');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_CHILD_GRADES');
    });

    it('should parse "view child grades" as VIEW_CHILD_GRADES', () => {
      const result = parser.parse('view child grades');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_CHILD_GRADES');
    });

    it('should parse "absensi anak" as VIEW_CHILD_ATTENDANCE', () => {
      const result = parser.parse('absensi anak');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_CHILD_ATTENDANCE');
    });

    it('should parse "jadwal anak" as VIEW_CHILD_SCHEDULE', () => {
      const result = parser.parse('jadwal anak');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_CHILD_SCHEDULE');
    });

    it('should parse "notifikasi" as SEE_NOTIFICATIONS', () => {
      const result = parser.parse('notifikasi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SEE_NOTIFICATIONS');
    });

    it('should parse "lihat kegiatan" as VIEW_EVENTS', () => {
      const result = parser.parse('lihat kegiatan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_EVENTS');
    });

    it('should parse "pesan" as MESSAGING', () => {
      const result = parser.parse('pesan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MESSAGING');
    });

    it('should parse "pembayaran" as PAYMENTS', () => {
      const result = parser.parse('pembayaran');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('PAYMENTS');
    });

    it('should parse "pertemuan" as MEETINGS', () => {
      const result = parser.parse('pertemuan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MEETINGS');
    });

    it('should parse "laporan" as REPORTS', () => {
      const result = parser.parse('laporan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('REPORTS');
    });

    it('should parse "profil anak" as CHILD_PROFILE', () => {
      const result = parser.parse('profil anak');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('CHILD_PROFILE');
    });
  });

  describe('ELibrary Commands', () => {
    it('should parse "jelajahi materi" as BROWSE_MATERIALS', () => {
      const result = parser.parse('jelajahi materi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('BROWSE_MATERIALS');
    });

    it('should parse "browse materials" as BROWSE_MATERIALS', () => {
      const result = parser.parse('browse materials');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('BROWSE_MATERIALS');
    });

    it('should parse "unduh materi" as DOWNLOAD_MATERIAL', () => {
      const result = parser.parse('unduh materi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('DOWNLOAD_MATERIAL');
    });

    it('should parse "buka materi" as OPEN_MATERIAL', () => {
      const result = parser.parse('buka materi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('OPEN_MATERIAL');
    });
  });

  describe('Chat/Messaging Commands', () => {
    it('should parse "balas pesan" as REPLY_MESSAGE', () => {
      const result = parser.parse('balas pesan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('REPLY_MESSAGE');
    });

    it('should parse "riwayat pesan" as VIEW_MESSAGE_HISTORY', () => {
      const result = parser.parse('riwayat pesan');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_MESSAGE_HISTORY');
    });
  });

  describe('Notification Commands', () => {
    it('should parse "pengaturan notifikasi" as VIEW_NOTIFICATION_SETTINGS', () => {
      const result = parser.parse('pengaturan notifikasi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_NOTIFICATION_SETTINGS');
    });

    it('should parse "hapus notifikasi" as CLEAR_NOTIFICATIONS', () => {
      const result = parser.parse('hapus notifikasi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('CLEAR_NOTIFICATIONS');
    });

    it('should parse "riwayat notifikasi" as VIEW_NOTIFICATION_HISTORY', () => {
      const result = parser.parse('riwayat notifikasi');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('VIEW_NOTIFICATION_HISTORY');
    });
  });

  describe('Fuzzy Matching', () => {
    it('should recognize commands with slight variations', () => {
      const result1 = parser.parse('buka pengaturan sekarang');
      const result2 = parser.parse('tampilkan semua kelas');

      expect(result1?.action).toBe('OPEN_SETTINGS');
      expect(result2?.action).toBe('SHOW_MY_CLASSES');
    });

    it('should handle mixed Indonesian and English', () => {
      const result = parser.parse('open library untuk materi matematika');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('SEARCH_LIBRARY');
      expect(result?.data?.query).toBe('matematika');
    });

    it('should have confidence score for recognized commands', () => {
      const result = parser.parse('show my grades');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Invalid Commands', () => {
    it('should return null for empty string', () => {
      const result = parser.parse('');
      expect(result).toBeNull();
    });

    it('should return null for whitespace only', () => {
      const result = parser.parse('   ');
      expect(result).toBeNull();
    });

    it('should return null for unrecognized text', () => {
      const result = parser.parse('random text that is not a command');
      expect(result).toBeNull();
    });

    it('should return null for gibberish', () => {
      const result = parser.parse('asdf ghjkl qwerty');
      expect(result).toBeNull();
    });
  });

  describe('Command Management', () => {
    it('should allow adding custom commands', () => {
      parser.addCustomCommand({
        id: 'custom_test',
        patterns: ['custom command test', 'tes custom'],
        action: 'CUSTOM_TEST',
        language: 'indonesian' as any,
      });

      const result = parser.parse('custom command test');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('CUSTOM_TEST');
    });

    it('should allow removing commands', () => {
      const removed = parser.removeCommand('help');
      expect(removed).toBe(true);

      const result = parser.parse('help');
      expect(result).toBeNull();
    });

    it('should return false when removing non-existent command', () => {
      const removed = parser.removeCommand('non_existent_command');
      expect(removed).toBe(false);
    });

    it('should provide command by ID', () => {
      const command = parser.getCommandById('help');
      expect(command).toBeDefined();
      expect(command?.action).toBe('HELP');
    });

    it('should return undefined for non-existent command ID', () => {
      const command = parser.getCommandById('non_existent');
      expect(command).toBeUndefined();
    });
  });

  describe('isCommand Check', () => {
    it('should return true for valid commands', () => {
      expect(parser.isCommand('buka pengaturan')).toBe(true);
      expect(parser.isCommand('show my grades')).toBe(true);
      expect(parser.isCommand('help')).toBe(true);
    });

    it('should return false for invalid commands', () => {
      expect(parser.isCommand('')).toBe(false);
      expect(parser.isCommand('random text')).toBe(false);
      expect(parser.isCommand('not a command')).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should clear all commands on cleanup', () => {
      parser.cleanup();
      const commands = parser.getCommands();
      expect(commands.length).toBe(0);
    });
  });
});
