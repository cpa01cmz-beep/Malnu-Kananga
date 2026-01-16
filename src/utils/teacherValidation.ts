import type { Attendance } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface GradeValidationOptions {
  allowZero?: boolean;
  maxScore?: number;
  requireMinScore?: number;
}

export interface GradeInput {
  assignment?: number;
  midExam?: number;
  finalExam?: number;
}

export interface GradeFormData {
  studentId: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

export interface ClassFormData {
  studentId: string;
  name: string;
  nis: string;
  gender: 'L' | 'P';
  address?: string;
}

export interface MaterialFormData {
  title: string;
  description: string;
  category: string;
  subjectId?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export interface OperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
  canRetry?: boolean;
}

export const validateGradeInput = (grade: GradeInput): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (grade.assignment !== undefined) {
    if (typeof grade.assignment !== 'number') {
      errors.push('Nilai tugas harus berupa angka');
    } else if (isNaN(grade.assignment)) {
      errors.push('Nilai tugas tidak valid');
    } else if (grade.assignment < 0) {
      errors.push('Nilai tugas tidak boleh kurang dari 0');
    } else if (grade.assignment > 100) {
      errors.push('Nilai tugas tidak boleh lebih dari 100');
    } else if (grade.assignment < 60 && grade.assignment > 0) {
      warnings.push('Nilai tugas rendah, pertimbangkan remedial');
    }
  }

  if (grade.midExam !== undefined) {
    if (typeof grade.midExam !== 'number') {
      errors.push('Nilai UTS harus berupa angka');
    } else if (isNaN(grade.midExam)) {
      errors.push('Nilai UTS tidak valid');
    } else if (grade.midExam < 0) {
      errors.push('Nilai UTS tidak boleh kurang dari 0');
    } else if (grade.midExam > 100) {
      errors.push('Nilai UTS tidak boleh lebih dari 100');
    } else if (grade.midExam < 60 && grade.midExam > 0) {
      warnings.push('Nilai UTS rendah, pertimbangkan remedial');
    }
  }

  if (grade.finalExam !== undefined) {
    if (typeof grade.finalExam !== 'number') {
      errors.push('Nilai UAS harus berupa angka');
    } else if (isNaN(grade.finalExam)) {
      errors.push('Nilai UAS tidak valid');
    } else if (grade.finalExam < 0) {
      errors.push('Nilai UAS tidak boleh kurang dari 0');
    } else if (grade.finalExam > 100) {
      errors.push('Nilai UAS tidak boleh lebih dari 100');
    } else if (grade.finalExam < 60 && grade.finalExam > 0) {
      warnings.push('Nilai UAS rendah, pertimbangkan remedial');
    }
  }

  const hasAnyScore = grade.assignment !== undefined || grade.midExam !== undefined || grade.finalExam !== undefined;
  if (!hasAnyScore) {
    errors.push('Setidaknya satu nilai harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateMaterialData = (data: Partial<MaterialFormData>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Judul materi tidak boleh kosong');
  } else if (data.title.trim().length < 3) {
    errors.push('Judul materi minimal 3 karakter');
  } else if (data.title.trim().length > 200) {
    errors.push('Judul materi maksimal 200 karakter');
  }

  if (!data.description || data.description.trim().length === 0) {
    warnings.push('Deskripsi materi kosong, pertimbangkan menambahkannya');
  } else if (data.description.length > 1000) {
    errors.push('Deskripsi materi maksimal 1000 karakter');
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Kategori materi tidak boleh kosong');
  }

  if (data.fileUrl && data.fileSize) {
    const maxSize = 50 * 1024 * 1024;
    if (data.fileSize > maxSize) {
      errors.push('Ukuran file maksimal 50MB');
    }

    if (!data.fileType) {
      warnings.push('Tipe file tidak terdeteksi');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const calculateFinalGrade = (assignment: number, midExam: number, finalExam: number): number => {
  return Math.round(((assignment * 0.3) + (midExam * 0.3) + (finalExam * 0.4)) * 10) / 10;
};

export const getGradeLetter = (score: number): string => {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
};

export const calculateGradeLetter = getGradeLetter;

export function sanitizeGradeInput(input: string | number): number {
  const numValue = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue));
}

export const validateAttendance = (attendance: Attendance): ValidationResult => {
  const errors: string[] = [];

  if (!attendance.studentId || attendance.studentId.trim() === '') {
    errors.push('Student ID is required');
  }

  if (!attendance.classId || attendance.classId.trim() === '') {
    errors.push('Class ID is required');
  }

  if (!attendance.date || attendance.date.trim() === '') {
    errors.push('Attendance date is required');
  } else {
    const date = new Date(attendance.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid attendance date');
    }
  }

  if (!['hadir', 'sakit', 'izin', 'alpa'].includes(attendance.status)) {
    errors.push('Invalid attendance status');
  }

  if (!attendance.recordedBy || attendance.recordedBy.trim() === '') {
    errors.push('Recorded by is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
};
