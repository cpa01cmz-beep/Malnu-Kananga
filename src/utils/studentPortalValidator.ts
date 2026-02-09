// studentPortalValidator.ts - Validation utilities for Student Portal data
// Validates grades, schedules, materials, attendance, and offline data consistency

import type { Grade, Schedule, Attendance, Student, Bookmark } from '../types';
import { VALID_ATTENDANCE_STATUSES } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: Record<string, string | number>;
}

export interface CacheFreshnessInfo {
  isFresh: boolean;
  age: number;
  lastUpdated: Date;
  expiresAt: Date;
  isExpired: boolean;
  timeToExpiry: number;
  message: string;
}

export interface DataConsistencyResult {
  isConsistent: boolean;
  mismatches: {
    field: string;
    onlineValue: unknown;
    offlineValue: unknown;
    severity: 'error' | 'warning';
  }[];
}

export interface FavoriteItem {
  id: string;
  addedAt?: string;
}

const GRADE_WEIGHTS = { assignment: 0.3, mid: 0.3, final: 0.4 };
const MIN_SCORE = 0;
const MAX_SCORE = 100;

export class StudentPortalValidator {
  static validateGradeDisplay(grade: Grade | { [key: string]: unknown }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!grade || typeof grade !== 'object') {
      return {
        isValid: false,
        errors: ['Data nilai tidak valid atau kosong'],
        warnings: []
      };
    }

    const { score, assignmentType, subjectId, studentId, createdAt } = grade;

    if (typeof score !== 'number') {
      errors.push('Nilai harus berupa angka');
    } else {
      if (score < MIN_SCORE || score > MAX_SCORE) {
        errors.push(`Nilai ${score} di luar rentang yang valid (${MIN_SCORE}-${MAX_SCORE})`);
      }
    }

    if (!assignmentType || typeof assignmentType !== 'string') {
      errors.push('Tipe tugas tidak valid');
    } else {
      const validTypes = ['tugas', 'uts', 'uas', 'assignment', 'mid', 'final'];
      if (!validTypes.includes(assignmentType.toLowerCase())) {
        warnings.push(`Tipe tugas "${assignmentType}" tidak dikenali`);
      }
    }

    if (!subjectId || typeof subjectId !== 'string') {
      errors.push('ID mata pelajaran tidak valid');
    }

    if (!studentId || typeof studentId !== 'string') {
      errors.push('ID siswa tidak valid');
    }

    if (!createdAt) {
      warnings.push('Tanggal nilai tidak tersedia');
    } else {
      const createdDate = new Date(createdAt as string | number | Date);
      if (isNaN(createdDate.getTime())) {
        errors.push('Format tanggal nilai tidak valid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateGradeCalculation(grades: Grade[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(grades)) {
      return {
        isValid: false,
        errors: ['Data nilai harus berupa array'],
        warnings: []
      };
    }

    if (grades.length === 0) {
      return {
        isValid: true,
        errors: [],
        warnings: ['Tidak ada data nilai untuk dikalkulasi']
      };
    }

    const gradesBySubject = new Map<string, Grade[]>();

    grades.forEach(grade => {
      const validation = this.validateGradeDisplay(grade as unknown as Record<string, unknown>);
      if (!validation.isValid) {
        errors.push(`Nilai untuk mata pelajaran ${grade.subjectId}: ${validation.errors.join(', ')}`);
      }
      warnings.push(...validation.warnings);

      if (!gradesBySubject.has(grade.subjectId)) {
        gradesBySubject.set(grade.subjectId, []);
      }
      gradesBySubject.get(grade.subjectId)!.push(grade);
    });

    gradesBySubject.forEach((subjectGrades, subjectId) => {
      const assignmentScores = subjectGrades
        .filter(g => ['tugas', 'assignment'].includes(g.assignmentType.toLowerCase()))
        .map(g => g.score);
      const midScores = subjectGrades
        .filter(g => ['uts', 'mid'].includes(g.assignmentType.toLowerCase()))
        .map(g => g.score);
      const finalScores = subjectGrades
        .filter(g => ['uas', 'final'].includes(g.assignmentType.toLowerCase()))
        .map(g => g.score);

      const avgAssignment = assignmentScores.length > 0
        ? assignmentScores.reduce((a, b) => a + b, 0) / assignmentScores.length
        : 0;
      const avgMid = midScores.length > 0
        ? midScores.reduce((a, b) => a + b, 0) / midScores.length
        : 0;
      const avgFinal = finalScores.length > 0
        ? finalScores.reduce((a, b) => a + b, 0) / finalScores.length
        : 0;

      if (assignmentScores.length === 0) {
        warnings.push(`Mata pelajaran ${subjectId}: Tidak ada nilai tugas`);
      }
      if (midScores.length === 0) {
        warnings.push(`Mata pelajaran ${subjectId}: Tidak ada nilai UTS`);
      }
      if (finalScores.length === 0) {
        warnings.push(`Mata pelajaran ${subjectId}: Tidak ada nilai UAS`);
      }

      const finalScore = avgAssignment * GRADE_WEIGHTS.assignment +
                       avgMid * GRADE_WEIGHTS.mid +
                       avgFinal * GRADE_WEIGHTS.final;

      if (finalScore < MIN_SCORE || finalScore > MAX_SCORE) {
        errors.push(`Nilai akhir untuk ${subjectId} (${finalScore.toFixed(1)}) di luar rentang valid`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: {
        totalGrades: grades.length,
        subjectsCount: gradesBySubject.size
      }
    };
  }

  static validateScheduleConflict(schedule1: Schedule, schedule2: Schedule): boolean {
    if (schedule1.dayOfWeek !== schedule2.dayOfWeek) {
      return false;
    }

    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1 = parseTime(schedule1.startTime);
    const end1 = parseTime(schedule1.endTime);
    const start2 = parseTime(schedule2.startTime);
    const end2 = parseTime(schedule2.endTime);

    return !(end1 <= start2 || end2 <= start1);
  }

  static validateScheduleDisplay(schedule: Schedule | { [key: string]: unknown }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!schedule || typeof schedule !== 'object') {
      return {
        isValid: false,
        errors: ['Data jadwal tidak valid atau kosong'],
        warnings: []
      };
    }

    const { dayOfWeek, startTime, endTime, subjectId, room } = schedule;

    const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    if (!dayOfWeek || !validDays.includes(dayOfWeek as string)) {
      errors.push(`Hari "${dayOfWeek}" tidak valid`);
    }

    if (!startTime || !/^\d{2}:\d{2}$/.test(startTime as string)) {
      errors.push('Format waktu mulai tidak valid (harus HH:MM)');
    }

    if (!endTime || !/^\d{2}:\d{2}$/.test(endTime as string)) {
      errors.push('Format waktu selesai tidak valid (harus HH:MM)');
    }

    if (startTime && endTime && (startTime as string) >= (endTime as string)) {
      errors.push('Waktu selesai harus setelah waktu mulai');
    }

    if (!subjectId || typeof subjectId !== 'string') {
      errors.push('ID mata pelajaran tidak valid');
    }

    if (!room || typeof room !== 'string' || room.trim().length === 0) {
      warnings.push('Informasi ruangan tidak tersedia');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateScheduleConflicts(schedules: Schedule[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(schedules)) {
      return {
        isValid: false,
        errors: ['Data jadwal harus berupa array'],
        warnings: []
      };
    }

    const conflicts: { schedule1: Schedule; schedule2: Schedule; day: string; time: string }[] = [];

    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        if (this.validateScheduleConflict(schedules[i], schedules[j])) {
          conflicts.push({
            schedule1: schedules[i],
            schedule2: schedules[j],
            day: schedules[i].dayOfWeek,
            time: `${schedules[i].startTime}-${schedules[i].endTime}`
          });
        }
      }
    }

    if (conflicts.length > 0) {
      errors.push(`Ditemukan ${conflicts.length} konflik jadwal`);
      conflicts.forEach(conflict => {
        warnings.push(
          `Konflik pada hari ${conflict.day} jam ${conflict.time}: ` +
          `${conflict.schedule1.subjectId} dan ${conflict.schedule2.subjectId}`
        );
      });
    }

    return {
      isValid: conflicts.length === 0,
      errors,
      warnings,
      data: {
        totalSchedules: schedules.length,
        conflictsFound: conflicts.length
      }
    };
  }

  static validateAttendanceRecord(attendance: Attendance | { [key: string]: unknown }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!attendance || typeof attendance !== 'object') {
      return {
        isValid: false,
        errors: ['Data kehadiran tidak valid atau kosong'],
        warnings: []
      };
    }

    const { date, status, studentId, recordedBy } = attendance;

    if (!date || typeof date !== 'string') {
      errors.push('Tanggal kehadiran tidak valid');
    } else {
      const attendanceDate = new Date(date);
      if (isNaN(attendanceDate.getTime())) {
        errors.push('Format tanggal kehadiran tidak valid');
      }
    }

    if (!status || typeof status !== 'string' || !VALID_ATTENDANCE_STATUSES.includes(status.toLowerCase() as typeof VALID_ATTENDANCE_STATUSES[number])) {
      errors.push(`Status kehadiran "${status}" tidak valid. Status yang valid: ${VALID_ATTENDANCE_STATUSES.join(', ')}`);
    }

    if (!studentId || typeof studentId !== 'string') {
      errors.push('ID siswa tidak valid');
    }

    if (!recordedBy) {
      warnings.push('Kehadiran belum direkam');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateAttendanceConfirmation(attendance: Attendance, _teacherId: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!attendance.recordedBy) {
      errors.push('Kehadiran belum direkam');
      return { isValid: false, errors, warnings };
    }

    const recordedDate = attendance.createdAt
      ? new Date(attendance.createdAt)
      : null;

    if (!recordedDate || isNaN(recordedDate.getTime())) {
      errors.push('Tanggal perekaman tidak valid');
    } else {
      const attendanceDate = new Date(attendance.date);
      const daysDiff = Math.abs(recordedDate.getTime() - attendanceDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        warnings.push(`Perekaman kehadiran dilambatkan ${Math.floor(daysDiff)} hari setelah tanggal kehadiran`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validatePersonalInformation(student: Student): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!student || typeof student !== 'object') {
      return {
        isValid: false,
        errors: ['Data siswa tidak valid'],
        warnings: []
      };
    }

    if (!student.nisn || typeof student.nisn !== 'string' || student.nisn.trim().length === 0) {
      errors.push('NISN tidak valid');
    }

    if (!student.nis || typeof student.nis !== 'string' || student.nis.trim().length === 0) {
      errors.push('NIS tidak valid');
    }

    if (!student.className || typeof student.className !== 'string') {
      warnings.push('Informasi kelas tidak tersedia');
    }

    if (student.phoneNumber && !/^[\d\s+-]+$/.test(student.phoneNumber)) {
      errors.push('Format nomor telepon tidak valid');
    }

    if (student.address && student.address.length < 10) {
      warnings.push('Alamat terlalu pendek atau tidak lengkap');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static getCacheFreshnessInfo(cacheTimestamp: number, expiryTimestamp: number): CacheFreshnessInfo {
    const now = Date.now();
    const age = now - cacheTimestamp;
    const timeToExpiry = expiryTimestamp - now;
    const isExpired = now > expiryTimestamp;
    const isFresh = !isExpired && age < 12 * 60 * 60 * 1000;

    let message = '';

    if (isExpired) {
      message = 'Data offline kadaluarsa. Silakan sinkronkan.';
    } else if (timeToExpiry < 60 * 60 * 1000) {
      message = 'Data offline akan kadaluarsa dalam kurang dari 1 jam.';
    } else if (timeToExpiry < 6 * 60 * 60 * 1000) {
      message = 'Data offline akan kadaluarsa dalam beberapa jam.';
    } else if (isFresh) {
      message = 'Data offline masih segar.';
    } else {
      message = 'Data offline tersedia.';
    }

    return {
      isFresh,
      age,
      lastUpdated: new Date(cacheTimestamp),
      expiresAt: new Date(expiryTimestamp),
      isExpired,
      timeToExpiry,
      message
    };
  }

  static validateDataConsistency(onlineData: Record<string, unknown>, offlineData: Record<string, unknown>, fields: string[]): DataConsistencyResult {
    const mismatches: DataConsistencyResult['mismatches'] = [];

    fields.forEach(field => {
      const onlineValue = onlineData?.[field];
      const offlineValue = offlineData?.[field];

      if (JSON.stringify(onlineValue) !== JSON.stringify(offlineValue)) {
        const isDateField = field.toLowerCase().includes('date') || field.toLowerCase().includes('at');
        const isNumericField = typeof onlineValue === 'number' && typeof offlineValue === 'number';

        let severity: 'error' | 'warning' = 'warning';

        if (isNumericField) {
          const diff = Math.abs(onlineValue - offlineValue);
          const threshold = Math.abs(onlineValue) * 0.1;
          severity = diff > threshold ? 'error' : 'warning';
        } else if (isDateField) {
          const onlineDate = new Date(onlineValue as string | number | Date);
          const offlineDate = new Date(offlineValue as string | number | Date);
          const hoursDiff = Math.abs(onlineDate.getTime() - offlineDate.getTime()) / (1000 * 60 * 60);
          severity = hoursDiff > 24 ? 'error' : 'warning';
        }

        mismatches.push({
          field,
          onlineValue,
          offlineValue,
          severity
        });
      }
    });

    return {
      isConsistent: mismatches.length === 0,
      mismatches
    };
  }

  static validateBookmarkSync(bookmarks: Bookmark[] | { [key: string]: unknown }[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(bookmarks)) {
      return {
        isValid: false,
        errors: ['Data bookmark harus berupa array'],
        warnings: []
      };
    }

    const duplicateCheck = new Set<string>();
    const invalidBookmarks: number[] = [];

    bookmarks.forEach((bookmark, index) => {
      if (!bookmark || typeof bookmark !== 'object') {
        invalidBookmarks.push(index);
        return;
      }

      if (!bookmark.materialId || typeof bookmark.materialId !== 'string') {
        errors.push(`Bookmark ke-${index + 1}: ID materi tidak valid`);
      }

      if (!bookmark.userId || typeof bookmark.userId !== 'string') {
        errors.push(`Bookmark ke-${index + 1}: ID pengguna tidak valid`);
      }

      if (!bookmark.createdAt) {
        warnings.push(`Bookmark ke-${index + 1}: Tidak ada timestamp`);
      }

      const key = `${bookmark.userId}_${bookmark.materialId}`;
      if (duplicateCheck.has(key)) {
        warnings.push(`Duplikasi bookmark ditemukan: materi ${bookmark.materialId}`);
      }
      duplicateCheck.add(key);
    });

    if (invalidBookmarks.length > 0) {
      errors.push(`${invalidBookmarks.length} bookmark tidak valid akan dihapus`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: {
        totalBookmarks: bookmarks.length,
        validBookmarks: bookmarks.length - invalidBookmarks.length,
        duplicates: duplicateCheck.size - bookmarks.length
      }
    };
  }

  static validateFavoritesSync(favorites: (string | FavoriteItem)[] | { [key: string]: unknown }[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(favorites)) {
      return {
        isValid: false,
        errors: ['Data favorit harus berupa array'],
        warnings: []
      };
    }

    const duplicateCheck = new Set<string>();

    favorites.forEach((favorite, index) => {
      if (typeof favorite !== 'string' && (typeof favorite !== 'object' || !favorite.id)) {
        errors.push(`Favorit ke-${index + 1}: Format tidak valid`);
        return;
      }

      const id = typeof favorite === 'string' ? favorite : favorite.id;

      if (!id || typeof id !== 'string') {
        errors.push(`Favorit ke-${index + 1}: ID materi tidak valid`);
      } else if (duplicateCheck.has(id)) {
        warnings.push(`Duplikasi favorit ditemukan: ${id}`);
      } else {
        duplicateCheck.add(id);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: {
        totalFavorites: favorites.length,
        uniqueFavorites: duplicateCheck.size
      }
    };
  }
}

export default StudentPortalValidator;
