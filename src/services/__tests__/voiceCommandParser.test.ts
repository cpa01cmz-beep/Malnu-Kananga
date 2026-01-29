import { describe, it, expect, beforeEach, vi } from 'vitest';
import VoiceCommandParser from '../voiceCommandParser';
import { VoiceLanguage } from '../../types';

vi.mock('../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VoiceCommandParser', () => {
  let parser: VoiceCommandParser;

  beforeEach(() => {
    parser = new VoiceCommandParser();
  });

  describe('Attendance Commands', () => {
    describe('mark_present', () => {
      it('should recognize "hadir John"', () => {
        const result = parser.parse('hadir John');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_PRESENT');
        expect(result?.data?.studentName).toBe('John');
      });

      it('should recognize "set hadir Jane"', () => {
        const result = parser.parse('set hadir Jane');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_PRESENT');
        expect(result?.data?.studentName).toBe('Jane');
      });

      it('should recognize "mark present Bob"', () => {
        const result = parser.parse('mark present Bob');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_PRESENT');
        expect(result?.data?.studentName).toBe('Bob');
      });

      it('should recognize "set present Alice"', () => {
        const result = parser.parse('set present Alice');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_PRESENT');
        expect(result?.data?.studentName).toBe('Alice');
      });
    });

    describe('mark_absent', () => {
      it('should recognize "absen John"', () => {
        const result = parser.parse('absen John');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_ABSENT');
        expect(result?.data?.studentName).toBe('John');
      });

      it('should recognize "mark absent Jane"', () => {
        const result = parser.parse('mark absent Jane');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_ABSENT');
        expect(result?.data?.studentName).toBe('Jane');
      });
    });

    describe('mark_late', () => {
      it('should recognize "terlambat John"', () => {
        const result = parser.parse('terlambat John');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_LATE');
        expect(result?.data?.studentName).toBe('John');
      });

      it('should recognize "mark late Jane"', () => {
        const result = parser.parse('mark late Jane');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_LATE');
        expect(result?.data?.studentName).toBe('Jane');
      });
    });

    describe('mark_permitted', () => {
      it('should recognize "izin John"', () => {
        const result = parser.parse('izin John');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_PERMITTED');
        expect(result?.data?.studentName).toBe('John');
      });

      it('should recognize "mark permitted Jane"', () => {
        const result = parser.parse('mark permitted Jane');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_PERMITTED');
        expect(result?.data?.studentName).toBe('Jane');
      });
    });

    describe('submit_attendance', () => {
      it('should recognize "kirim kehadiran"', () => {
        const result = parser.parse('kirim kehadiran');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SUBMIT_ATTENDANCE');
      });

      it('should recognize "submit attendance"', () => {
        const result = parser.parse('submit attendance');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SUBMIT_ATTENDANCE');
      });
    });

    describe('show_attendance', () => {
      it('should recognize "tampilkan kehadiran"', () => {
        const result = parser.parse('tampilkan kehadiran');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SHOW_ATTENDANCE');
      });

      it('should recognize "show attendance"', () => {
        const result = parser.parse('show attendance');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SHOW_ATTENDANCE');
      });
    });

    describe('export_attendance', () => {
      it('should recognize "ekspor kehadiran"', () => {
        const result = parser.parse('ekspor kehadiran');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('EXPORT_ATTENDANCE');
      });

      it('should recognize "export attendance"', () => {
        const result = parser.parse('export attendance');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('EXPORT_ATTENDANCE');
      });
    });

    describe('mark_all_present', () => {
      it('should recognize "semua hadir"', () => {
        const result = parser.parse('semua hadir');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_ALL_PRESENT');
      });

      it('should recognize "all present"', () => {
        const result = parser.parse('all present');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_ALL_PRESENT');
      });

      it('should recognize "set semua hadir"', () => {
        const result = parser.parse('set semua hadir');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_ALL_PRESENT');
      });
    });
  });

  describe('Grading Commands', () => {
    describe('set_grade', () => {
      it('should recognize "set John nilai 85"', () => {
        const result = parser.parse('set John nilai 85');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SET_GRADE');
        expect(result?.data?.studentName).toBe('John');
        expect(result?.data?.gradeValue).toBe('85');
      });

      it('should recognize "set Jane grade to 90"', () => {
        const result = parser.parse('set Jane grade to 90');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SET_GRADE');
        expect(result?.data?.studentName).toBe('Jane');
        expect(result?.data?.gradeValue).toBe('90');
      });

      it('should recognize "beri nilai 75 ke Bob"', () => {
        const result = parser.parse('beri nilai 75 ke Bob');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SET_GRADE');
        expect(result?.data?.studentName).toBe('Bob');
        expect(result?.data?.gradeValue).toBe('75');
      });

      it('should recognize "give Alice grade 95"', () => {
        const result = parser.parse('give Alice grade 95');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SET_GRADE');
        expect(result?.data?.studentName).toBe('Alice');
        expect(result?.data?.gradeValue).toBe('95');
      });
    });

    describe('grade_next', () => {
      it('should recognize "siswa berikutnya"', () => {
        const result = parser.parse('siswa berikutnya');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_NEXT');
      });

      it('should recognize "next student"', () => {
        const result = parser.parse('next student');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_NEXT');
      });

      it('should recognize "lanjut ke siswa"', () => {
        const result = parser.parse('lanjut ke siswa');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_NEXT');
      });
    });

    describe('grade_pass', () => {
      it('should recognize "lulus"', () => {
        const result = parser.parse('lulus');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_PASS');
      });

      it('should recognize "pass"', () => {
        const result = parser.parse('pass');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_PASS');
      });

      it('should recognize "set lulus"', () => {
        const result = parser.parse('set lulus');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_PASS');
      });
    });

    describe('grade_fail', () => {
      it('should recognize "gagal"', () => {
        const result = parser.parse('gagal');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_FAIL');
      });

      it('should recognize "fail"', () => {
        const result = parser.parse('fail');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_FAIL');
      });

      it('should recognize "set gagal"', () => {
        const result = parser.parse('set gagal');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('GRADE_FAIL');
      });
    });

    describe('mark_grade_absent', () => {
      it('should recognize "tidak ikut ujian"', () => {
        const result = parser.parse('tidak ikut ujian');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_GRADE_ABSENT');
      });

      it('should recognize "absent for exam"', () => {
        const result = parser.parse('absent for exam');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_GRADE_ABSENT');
      });

      it('should recognize "absen ujian"', () => {
        const result = parser.parse('absen ujian');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('MARK_GRADE_ABSENT');
      });
    });

    describe('bulk_grade', () => {
      it('should recognize "nilai semua"', () => {
        const result = parser.parse('nilai semua');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('BULK_GRADE');
      });

      it('should recognize "grade all"', () => {
        const result = parser.parse('grade all');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('BULK_GRADE');
      });

      it('should recognize "bulk grade"', () => {
        const result = parser.parse('bulk grade');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('BULK_GRADE');
      });
    });

    describe('submit_grades', () => {
      it('should recognize "kirim nilai"', () => {
        const result = parser.parse('kirim nilai');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SUBMIT_GRADES');
      });

      it('should recognize "submit grades"', () => {
        const result = parser.parse('submit grades');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SUBMIT_GRADES');
      });

      it('should recognize "simpan nilai"', () => {
        const result = parser.parse('simpan nilai');
        expect(result).not.toBeNull();
        expect(result?.action).toBe('SUBMIT_GRADES');
      });
    });
  });

  describe('Command Confidence', () => {
    it('should return confidence score above 0.7 for valid commands', () => {
      const result1 = parser.parse('hadir John');
      const result2 = parser.parse('set John nilai 85');
      
      expect(result1?.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result2?.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('should return null for unknown commands', () => {
      const result = parser.parse('unknown command that does not exist');
      expect(result).toBeNull();
    });

    it('should handle empty transcript', () => {
      const result = parser.parse('');
      expect(result).toBeNull();
    });

    it('should handle whitespace-only transcript', () => {
      const result = parser.parse('   ');
      expect(result).toBeNull();
    });
  });

  describe('Command Management', () => {
    it('should add custom command', () => {
      parser.addCustomCommand({
        id: 'custom_command',
        patterns: ['custom pattern'],
        action: 'CUSTOM_ACTION',
        language: VoiceLanguage.Indonesian,
      });

      const result = parser.parse('custom pattern');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('CUSTOM_ACTION');
    });

    it('should remove command', () => {
      const removed = parser.removeCommand('help');
      expect(removed).toBe(true);

      const result = parser.parse('bantuan');
      expect(result).toBeNull();
    });

    it('should return false when removing non-existent command', () => {
      const removed = parser.removeCommand('non_existent_command');
      expect(removed).toBe(false);
    });

    it('should get command by id', () => {
      const command = parser.getCommandById('help');
      expect(command).toBeDefined();
      expect(command?.id).toBe('help');
    });

    it('should return undefined for non-existent command id', () => {
      const command = parser.getCommandById('non_existent_command');
      expect(command).toBeUndefined();
    });

    it('should return all commands', () => {
      const commands = parser.getCommands();
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.some(cmd => cmd.id === 'help')).toBe(true);
    });
  });

  describe('Language Support', () => {
    it('should support Indonesian commands', () => {
      const result = parser.parse('hadir John');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MARK_PRESENT');
    });

    it('should support English commands', () => {
      const result = parser.parse('mark present John');
      expect(result).not.toBeNull();
      expect(result?.action).toBe('MARK_PRESENT');
    });

    it('should set language without throwing error', () => {
      expect(() => parser.setLanguage(VoiceLanguage.Indonesian)).not.toThrow();
      expect(() => parser.setLanguage(VoiceLanguage.English)).not.toThrow();
    });
  });

  describe('isCommand', () => {
    it('should return true for valid commands', () => {
      expect(parser.isCommand('hadir John')).toBe(true);
      expect(parser.isCommand('set John nilai 85')).toBe(true);
      expect(parser.isCommand('bantuan')).toBe(true);
    });

    it('should return false for invalid commands', () => {
      expect(parser.isCommand('this is not a command')).toBe(false);
      expect(parser.isCommand('')).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should clear all commands', () => {
      parser.cleanup();
      const commands = parser.getCommands();
      expect(commands.length).toBe(0);
    });
  });

  describe('Validation & Sanitization', () => {
    it('should sanitize malicious content in transcript', () => {
      const result = parser.parse('hadir <script>alert("xss")</script>John');
      
      expect(result).not.toBeNull();
      expect(result?.transcript).toContain('&lt;script&gt;');
      expect(result?.transcript).not.toContain('<script>');
    });

    it('should validate command structure', () => {
      const result = parser.parse('hadir John');
      
      expect(result).not.toBeNull();
      expect(result?.id).toBeTruthy();
      expect(result?.action).toBeTruthy();
      expect(result?.transcript).toBeTruthy();
      expect(result?.confidence).toBeGreaterThanOrEqual(0);
      expect(result?.confidence).toBeLessThanOrEqual(1);
    });

    it('should reject empty transcripts', () => {
      const result = parser.parse('');
      
      expect(result).toBeNull();
    });

    it('should reject whitespace-only transcripts', () => {
      const result = parser.parse('   ');
      
      expect(result).toBeNull();
    });

    it('should validate confidence score is within bounds', () => {
      const results = [
        parser.parse('hadir John'),
        parser.parse('buka pengaturan'),
        parser.parse('set John nilai 85'),
      ];

      results.forEach(result => {
        if (result) {
          expect(result.confidence).toBeGreaterThanOrEqual(0);
          expect(result.confidence).toBeLessThanOrEqual(1);
        }
      });
    });

    it('should handle XSS in search queries', () => {
      const result = parser.parse('cari materi <script>alert("xss")</script>matematika');
      
      if (result) {
        expect(result.transcript).not.toContain('<script>');
        expect(result.data?.query).not.toContain('<script>');
      }
    });

    it('should sanitize student names in attendance commands', () => {
      const result = parser.parse('hadir <script>alert("xss")</script>John');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.transcript).not.toContain('<script>');
      }
    });

    it('should sanitize data in grade commands', () => {
      const result = parser.parse('set <script>alert("xss")</script>John nilai 85');
       
      expect(result).not.toBeNull();
      if (result) {
        expect(result.transcript).toContain('&lt;script&gt;');
        expect(result.transcript).not.toContain('<script>');
        expect(result.data?.studentName).not.toContain('<script>');
      }
    });

    it('should handle special characters in transcripts', () => {
      const result = parser.parse('hadir "John & Jane"');
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.transcript).toContain('&quot;');
      }
    });

    it('should handle apostrophes in transcripts', () => {
      const result = parser.parse("hadir John's class");
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.transcript).toContain('&#x27;');
      }
    });
  });
});
