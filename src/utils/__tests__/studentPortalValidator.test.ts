import { describe, it, expect } from 'vitest';
import { StudentPortalValidator } from '../studentPortalValidator';
import type { Grade, Schedule, Attendance, Student } from '../../types';

describe('StudentPortalValidator', () => {
  describe('validateGradeDisplay', () => {
    it('should validate a correct grade', () => {
      const grade: Grade = {
        id: '1',
        studentId: 'student-1',
        subjectId: 'subject-1',
        classId: 'class-1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher-1',
        createdAt: '2024-01-15T10:00:00Z'
      };

      const result = StudentPortalValidator.validateGradeDisplay(grade);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject grades with invalid score', () => {
      const grade = {
        id: '1',
        studentId: 'student-1',
        subjectId: 'subject-1',
        classId: 'class-1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 150,
        maxScore: 100,
        createdBy: 'teacher-1',
        createdAt: '2024-01-15T10:00:00Z'
      };

      const result = StudentPortalValidator.validateGradeDisplay(grade);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nilai 150 di luar rentang yang valid (0-100)');
    });

    it('should reject grades with negative score', () => {
      const grade = {
        id: '1',
        studentId: 'student-1',
        subjectId: 'subject-1',
        classId: 'class-1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: -10,
        maxScore: 100,
        createdBy: 'teacher-1',
        createdAt: '2024-01-15T10:00:00Z'
      };

      const result = StudentPortalValidator.validateGradeDisplay(grade);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nilai -10 di luar rentang yang valid (0-100)');
    });

    it('should warn for unknown assignment types', () => {
      const grade = {
        id: '1',
        studentId: 'student-1',
        subjectId: 'subject-1',
        classId: 'class-1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'unknown',
        assignmentName: 'Unknown',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher-1',
        createdAt: '2024-01-15T10:00:00Z'
      };

      const result = StudentPortalValidator.validateGradeDisplay(grade);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Tipe tugas "unknown" tidak dikenali');
    });

    it('should reject grades without required fields', () => {
      const grade = {};

      const result = StudentPortalValidator.validateGradeDisplay(grade);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject grades with invalid date', () => {
      const grade = {
        id: '1',
        studentId: 'student-1',
        subjectId: 'subject-1',
        classId: 'class-1',
        academicYear: '2024-2025',
        semester: '1',
        assignmentType: 'tugas',
        assignmentName: 'Tugas 1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher-1',
        createdAt: 'invalid-date'
      };

      const result = StudentPortalValidator.validateGradeDisplay(grade);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format tanggal nilai tidak valid');
    });
  });

  describe('validateGradeCalculation', () => {
    it('should validate correct grade calculation', () => {
      const grades: Grade[] = [
        { id: '1', studentId: 's1', subjectId: 'subj1', classId: 'class-1', academicYear: '2024-2025', semester: '1', assignmentType: 'tugas', assignmentName: 'Tugas', score: 80, maxScore: 100, createdBy: 'teacher-1', createdAt: '2024-01-15T10:00:00Z' },
        { id: '2', studentId: 's1', subjectId: 'subj1', classId: 'class-1', academicYear: '2024-2025', semester: '1', assignmentType: 'uts', assignmentName: 'UTS', score: 85, maxScore: 100, createdBy: 'teacher-1', createdAt: '2024-01-15T10:00:00Z' },
        { id: '3', studentId: 's1', subjectId: 'subj1', classId: 'class-1', academicYear: '2024-2025', semester: '1', assignmentType: 'uas', assignmentName: 'UAS', score: 90, maxScore: 100, createdBy: 'teacher-1', createdAt: '2024-01-15T10:00:00Z' }
      ];

      const result = StudentPortalValidator.validateGradeCalculation(grades);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data?.totalGrades).toBe(3);
    });

    it('should warn when assignment type is missing', () => {
      const grades: Grade[] = [
        { id: '1', studentId: 's1', subjectId: 'subj1', classId: 'class-1', academicYear: '2024-2025', semester: '1', assignmentType: 'uts', assignmentName: 'UTS', score: 85, maxScore: 100, createdBy: 'teacher-1', createdAt: '2024-01-15T10:00:00Z' },
        { id: '2', studentId: 's1', subjectId: 'subj1', classId: 'class-1', academicYear: '2024-2025', semester: '1', assignmentType: 'uas', assignmentName: 'UAS', score: 90, maxScore: 100, createdBy: 'teacher-1', createdAt: '2024-01-15T10:00:00Z' }
      ];

      const result = StudentPortalValidator.validateGradeCalculation(grades);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Mata pelajaran subj1: Tidak ada nilai tugas');
    });

    it('should warn when UTS is missing', () => {
      const grades: Grade[] = [
        { id: '1', studentId: 's1', subjectId: 'subj1', classId: 'class-1', academicYear: '2024-2025', semester: '1', assignmentType: 'tugas', assignmentName: 'Tugas', score: 80, maxScore: 100, createdBy: 'teacher-1', createdAt: '2024-01-15T10:00:00Z' },
        { id: '2', studentId: 's1', subjectId: 'subj1', classId: 'class-1', academicYear: '2024-2025', semester: '1', assignmentType: 'uas', assignmentName: 'UAS', score: 90, maxScore: 100, createdBy: 'teacher-1', createdAt: '2024-01-15T10:00:00Z' }
      ];

      const result = StudentPortalValidator.validateGradeCalculation(grades);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Mata pelajaran subj1: Tidak ada nilai UTS');
    });

    it('should handle empty grades array', () => {
      const result = StudentPortalValidator.validateGradeCalculation([]);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Tidak ada data nilai untuk dikalkulasi');
    });

    it('should reject non-array grades', () => {
      const result = StudentPortalValidator.validateGradeCalculation({} as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data nilai harus berupa array');
    });
  });

  describe('validateScheduleConflict', () => {
    it('should detect conflicting schedules on same day', () => {
      const schedule1: Schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'Senin',
        startTime: '08:00',
        endTime: '09:30',
        room: 'R101'
      };

      const schedule2: Schedule = {
        id: '2',
        classId: 'class-1',
        subjectId: 'subj2',
        teacherId: 'teacher-2',
        dayOfWeek: 'Senin',
        startTime: '09:00',
        endTime: '10:30',
        room: 'R102'
      };

      const result = StudentPortalValidator.validateScheduleConflict(schedule1, schedule2);

      expect(result).toBe(true);
    });

    it('should not detect conflict for non-overlapping times', () => {
      const schedule1: Schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'Senin',
        startTime: '08:00',
        endTime: '09:30',
        room: 'R101'
      };

      const schedule2: Schedule = {
        id: '2',
        classId: 'class-1',
        subjectId: 'subj2',
        teacherId: 'teacher-2',
        dayOfWeek: 'Senin',
        startTime: '09:30',
        endTime: '11:00',
        room: 'R102'
      };

      const result = StudentPortalValidator.validateScheduleConflict(schedule1, schedule2);

      expect(result).toBe(false);
    });

    it('should not detect conflict for different days', () => {
      const schedule1: Schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'Senin',
        startTime: '08:00',
        endTime: '09:30',
        room: 'R101'
      };

      const schedule2: Schedule = {
        id: '2',
        classId: 'class-1',
        subjectId: 'subj2',
        teacherId: 'teacher-2',
        dayOfWeek: 'Selasa',
        startTime: '08:00',
        endTime: '09:30',
        room: 'R102'
      };

      const result = StudentPortalValidator.validateScheduleConflict(schedule1, schedule2);

      expect(result).toBe(false);
    });
  });

  describe('validateScheduleDisplay', () => {
    it('should validate a correct schedule', () => {
      const schedule: Schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'Senin',
        startTime: '08:00',
        endTime: '09:30',
        room: 'R101'
      };

      const result = StudentPortalValidator.validateScheduleDisplay(schedule);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid day', () => {
      const schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'HariInvalid',
        startTime: '08:00',
        endTime: '09:30',
        room: 'R101'
      };

      const result = StudentPortalValidator.validateScheduleDisplay(schedule);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Hari "HariInvalid" tidak valid');
    });

    it('should reject invalid time format', () => {
      const schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'Senin',
        startTime: '8:00',
        endTime: '09:30',
        room: 'R101'
      };

      const result = StudentPortalValidator.validateScheduleDisplay(schedule);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format waktu mulai tidak valid (harus HH:MM)');
    });

    it('should reject end time before start time', () => {
      const schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'Senin',
        startTime: '09:30',
        endTime: '08:00',
        room: 'R101'
      };

      const result = StudentPortalValidator.validateScheduleDisplay(schedule);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Waktu selesai harus setelah waktu mulai');
    });

    it('should warn when room is missing', () => {
      const schedule = {
        id: '1',
        classId: 'class-1',
        subjectId: 'subj1',
        teacherId: 'teacher-1',
        dayOfWeek: 'Senin',
        startTime: '08:00',
        endTime: '09:30',
        room: ''
      };

      const result = StudentPortalValidator.validateScheduleDisplay(schedule);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Informasi ruangan tidak tersedia');
    });
  });

  describe('validateScheduleConflicts', () => {
    it('should detect multiple conflicts', () => {
      const schedules: Schedule[] = [
        { id: '1', classId: 'c1', subjectId: 's1', teacherId: 't1', dayOfWeek: 'Senin', startTime: '08:00', endTime: '09:30', room: 'R101' },
        { id: '2', classId: 'c1', subjectId: 's2', teacherId: 't2', dayOfWeek: 'Senin', startTime: '09:00', endTime: '10:30', room: 'R102' },
        { id: '3', classId: 'c1', subjectId: 's3', teacherId: 't3', dayOfWeek: 'Senin', startTime: '08:30', endTime: '10:00', room: 'R103' }
      ];

      const result = StudentPortalValidator.validateScheduleConflicts(schedules);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ditemukan 3 konflik jadwal');
      expect(result.data?.conflictsFound).toBe(3);
    });

    it('should pass without conflicts', () => {
      const schedules: Schedule[] = [
        { id: '1', classId: 'c1', subjectId: 's1', teacherId: 't1', dayOfWeek: 'Senin', startTime: '08:00', endTime: '09:30', room: 'R101' },
        { id: '2', classId: 'c1', subjectId: 's2', teacherId: 't2', dayOfWeek: 'Senin', startTime: '09:30', endTime: '11:00', room: 'R102' },
        { id: '3', classId: 'c1', subjectId: 's3', teacherId: 't3', dayOfWeek: 'Senin', startTime: '11:00', endTime: '12:30', room: 'R103' }
      ];

      const result = StudentPortalValidator.validateScheduleConflicts(schedules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAttendanceRecord', () => {
    it('should validate a correct attendance record', () => {
      const attendance: Attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: '2024-01-15',
        status: 'hadir',
        notes: 'Hadir di kelas',
        recordedBy: 'teacher-1',
        createdAt: '2024-01-15T17:00:00Z'
      };

      const result = StudentPortalValidator.validateAttendanceRecord(attendance);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid status', () => {
      const attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: '2024-01-15',
        status: 'unknown',
        notes: '',
        recordedBy: 'teacher-1',
        createdAt: '2024-01-15T17:00:00Z'
      };

      const result = StudentPortalValidator.validateAttendanceRecord(attendance);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Status kehadiran "unknown" tidak valid. Status yang valid:');
    });

    it('should reject invalid date', () => {
      const attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: 'invalid-date',
        status: 'hadir',
        notes: '',
        recordedBy: 'teacher-1',
        createdAt: '2024-01-15T17:00:00Z'
      };

      const result = StudentPortalValidator.validateAttendanceRecord(attendance);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format tanggal kehadiran tidak valid');
    });

    it('should warn when attendance is not confirmed', () => {
      const attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: '2024-01-15',
        status: 'hadir',
        notes: '',
        createdAt: '2024-01-15T17:00:00Z'
      };

      const result = StudentPortalValidator.validateAttendanceRecord(attendance);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Kehadiran belum direkam');
    });
  });

  describe('validateAttendanceConfirmation', () => {
    it('should validate timely confirmation', () => {
      const attendance: Attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: '2024-01-15',
        status: 'hadir',
        notes: 'Hadir di kelas',
        recordedBy: 'teacher-1',
        createdAt: '2024-01-15T18:00:00Z'
      };

      const result = StudentPortalValidator.validateAttendanceConfirmation(attendance, 'teacher-1');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn when recorded by different teacher', () => {
      const attendance: Attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: '2024-01-15',
        status: 'hadir',
        notes: 'Hadir di kelas',
        recordedBy: 'teacher-2',
        createdAt: '2024-01-15T18:00:00Z'
      };

      const result = StudentPortalValidator.validateAttendanceConfirmation(attendance, 'teacher-1');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn for delayed recording', () => {
      const attendance: Attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: '2024-01-01',
        status: 'hadir',
        notes: 'Hadir di kelas',
        recordedBy: 'teacher-1',
        createdAt: '2024-01-15T18:00:00Z'
      };

      const result = StudentPortalValidator.validateAttendanceConfirmation(attendance, 'teacher-1');

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('dilambatkan'))).toBe(true);
    });

    it('should reject attendance without recording', () => {
      const attendance = {
        id: '1',
        studentId: 'student-1',
        classId: 'class-1',
        date: '2024-01-15',
        status: 'hadir',
        notes: '',
        createdAt: '2024-01-15T18:00:00Z'
      } as Attendance;

      const result = StudentPortalValidator.validateAttendanceConfirmation(attendance, 'teacher-1');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Kehadiran belum direkam');
    });
  });

  describe('validatePersonalInformation', () => {
    it('should validate correct student information', () => {
      const student: Student = {
        id: '1',
        userId: 'user-1',
        nisn: '1234567890',
        nis: '12345',
        class: 'X',
        className: 'X IPA 1',
        address: 'Jl. Contoh No. 1',
        phoneNumber: '08123456789',
        parentName: 'Budi Santoso',
        parentPhone: '08123456789',
        dateOfBirth: '2008-01-01',
        enrollmentDate: '2024-07-15'
      };

      const result = StudentPortalValidator.validatePersonalInformation(student);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid NISN', () => {
      const student = {
        id: '1',
        userId: 'user-1',
        nisn: '',
        nis: '12345',
        class: 'X',
        className: 'X IPA 1',
        address: 'Jl. Contoh No. 1',
        phoneNumber: '08123456789',
        parentName: 'Budi Santoso',
        parentPhone: '08123456789',
        dateOfBirth: '2008-01-01',
        enrollmentDate: '2024-07-15'
      };

      const result = StudentPortalValidator.validatePersonalInformation(student);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('NISN tidak valid');
    });

    it('should reject invalid phone number', () => {
      const student = {
        id: '1',
        userId: 'user-1',
        nisn: '1234567890',
        nis: '12345',
        class: 'X',
        className: 'X IPA 1',
        address: 'Jl. Contoh No. 1',
        phoneNumber: 'abc',
        parentName: 'Budi Santoso',
        parentPhone: '08123456789',
        dateOfBirth: '2008-01-01',
        enrollmentDate: '2024-07-15'
      };

      const result = StudentPortalValidator.validatePersonalInformation(student);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format nomor telepon tidak valid');
    });

    it('should warn for short address', () => {
      const student = {
        id: '1',
        userId: 'user-1',
        nisn: '1234567890',
        nis: '12345',
        class: 'X',
        className: 'X IPA 1',
        address: 'Short',
        phoneNumber: '08123456789',
        parentName: 'Budi Santoso',
        parentPhone: '08123456789',
        dateOfBirth: '2008-01-01',
        enrollmentDate: '2024-07-15'
      };

      const result = StudentPortalValidator.validatePersonalInformation(student);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Alamat terlalu pendek atau tidak lengkap');
    });

    it('should reject student without NISN', () => {
      const student = {
        id: '1',
        userId: 'user-1',
        nisn: '',
        nis: '12345',
        class: 'X',
        className: 'X IPA 1',
        address: 'Jl. Contoh No. 1',
        phoneNumber: '08123456789',
        parentName: 'Budi Santoso',
        parentPhone: '08123456789',
        dateOfBirth: '2008-01-01',
        enrollmentDate: '2024-07-15'
      };

      const result = StudentPortalValidator.validatePersonalInformation(student);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('NISN tidak valid');
    });
  });

  describe('getCacheFreshnessInfo', () => {
    it('should indicate fresh cache', () => {
      const now = Date.now();
      const cacheTimestamp = now - 30 * 60 * 1000;
      const expiryTimestamp = now + 23 * 60 * 60 * 1000;

      const result = StudentPortalValidator.getCacheFreshnessInfo(cacheTimestamp, expiryTimestamp);

      expect(result.isFresh).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.message).toContain('segar');
    });

    it('should indicate expired cache', () => {
      const now = Date.now();
      const cacheTimestamp = now - 25 * 60 * 60 * 1000;
      const expiryTimestamp = now - 1 * 60 * 60 * 1000;

      const result = StudentPortalValidator.getCacheFreshnessInfo(cacheTimestamp, expiryTimestamp);

      expect(result.isFresh).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.message).toContain('kadaluarsa');
    });

    it('should indicate cache expiring soon', () => {
      const now = Date.now();
      const cacheTimestamp = now - 23 * 60 * 60 * 1000;
      const expiryTimestamp = now + 30 * 60 * 1000;

      const result = StudentPortalValidator.getCacheFreshnessInfo(cacheTimestamp, expiryTimestamp);

      expect(result.isFresh).toBe(false);
      expect(result.isExpired).toBe(false);
      expect(result.timeToExpiry).toBeLessThan(60 * 60 * 1000);
      expect(result.message).toContain('kurang dari 1 jam');
    });
  });

  describe('validateDataConsistency', () => {
    it('should detect consistent data', () => {
      const onlineData = { score: 85, name: 'John', date: '2024-01-15' };
      const offlineData = { score: 85, name: 'John', date: '2024-01-15' };

      const result = StudentPortalValidator.validateDataConsistency(
        onlineData,
        offlineData,
        ['score', 'name', 'date']
      );

      expect(result.isConsistent).toBe(true);
      expect(result.mismatches).toHaveLength(0);
    });

    it('should detect inconsistent numeric values', () => {
      const onlineData = { score: 85, name: 'John' };
      const offlineData = { score: 75, name: 'John' };

      const result = StudentPortalValidator.validateDataConsistency(
        onlineData,
        offlineData,
        ['score', 'name']
      );

      expect(result.isConsistent).toBe(false);
      expect(result.mismatches.length).toBe(1);
      expect(result.mismatches[0].field).toBe('score');
      expect(result.mismatches[0].onlineValue).toBe(85);
      expect(result.mismatches[0].offlineValue).toBe(75);
    });

    it('should detect inconsistent dates', () => {
      const onlineData = { date: '2024-01-15', name: 'John' };
      const offlineData = { date: '2024-01-10', name: 'John' };

      const result = StudentPortalValidator.validateDataConsistency(
        onlineData,
        offlineData,
        ['date', 'name']
      );

      expect(result.isConsistent).toBe(false);
      expect(result.mismatches.length).toBe(1);
      expect(result.mismatches[0].field).toBe('date');
    });
  });

  describe('validateBookmarkSync', () => {
    it('should validate correct bookmarks', () => {
      const bookmarks = [
        { id: '1', materialId: 'mat-1', userId: 'user-1', createdAt: '2024-01-15T10:00:00Z' },
        { id: '2', materialId: 'mat-2', userId: 'user-1', createdAt: '2024-01-15T11:00:00Z' }
      ];

      const result = StudentPortalValidator.validateBookmarkSync(bookmarks);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data?.totalBookmarks).toBe(2);
    });

    it('should warn for duplicate bookmarks', () => {
      const bookmarks = [
        { id: '1', materialId: 'mat-1', userId: 'user-1', createdAt: '2024-01-15T10:00:00Z' },
        { id: '2', materialId: 'mat-1', userId: 'user-1', createdAt: '2024-01-15T11:00:00Z' }
      ];

      const result = StudentPortalValidator.validateBookmarkSync(bookmarks);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Duplikasi bookmark ditemukan: materi mat-1');
    });

    it('should reject invalid bookmark', () => {
      const bookmarks = [
        { id: '1' }
      ];

      const result = StudentPortalValidator.validateBookmarkSync(bookmarks);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject non-array bookmarks', () => {
      const result = StudentPortalValidator.validateBookmarkSync({} as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data bookmark harus berupa array');
    });
  });

  describe('validateFavoritesSync', () => {
    it('should validate correct favorites', () => {
      const favorites = ['mat-1', 'mat-2', 'mat-3'];

      const result = StudentPortalValidator.validateFavoritesSync(favorites);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data?.uniqueFavorites).toBe(3);
    });

    it('should validate object-based favorites', () => {
      const favorites = [
        { id: 'mat-1', addedAt: '2024-01-15' },
        { id: 'mat-2', addedAt: '2024-01-16' }
      ];

      const result = StudentPortalValidator.validateFavoritesSync(favorites);

      expect(result.isValid).toBe(true);
      expect(result.data?.uniqueFavorites).toBe(2);
    });

    it('should warn for duplicate favorites', () => {
      const favorites = ['mat-1', 'mat-2', 'mat-1'];

      const result = StudentPortalValidator.validateFavoritesSync(favorites);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Duplikasi favorit ditemukan: mat-1');
      expect(result.data?.uniqueFavorites).toBe(2);
    });

    it('should reject invalid favorite format', () => {
      const favorites = [{ id: 123 }];

      const result = StudentPortalValidator.validateFavoritesSync(favorites);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
