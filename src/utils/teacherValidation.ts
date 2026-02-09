import type { Grade, Student, Subject, Class, Attendance, MaterialFolder, ELibrary, MaterialVersion } from '../types';
import { VALIDATION_MESSAGES } from './errorMessages';
import { FILE_SIZE_LIMITS, VALIDATION_PATTERNS, ACADEMIC, FILE_VALIDATION, VALIDATION_LIMITS, GRADE_LIMITS, TIME_MS, bytesToMb } from '../constants';

export interface StudentGrade {
  id: string;
  name: string;
  nis: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

/**
 * Validation utilities for teacher workflow components
 */

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
  message?: string;
  canRetry?: boolean;
}

/**
 * Validates grade input values
 */
export const validateGradeInput = (grade: GradeInput): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate assignment score
  if (grade.assignment !== undefined) {
    if (typeof grade.assignment !== 'number') {
      errors.push(VALIDATION_MESSAGES.INVALID_NUMBER('Nilai tugas'));
    } else if (isNaN(grade.assignment)) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_TYPE);
    } else if (grade.assignment < GRADE_LIMITS.MIN) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_RANGE.replace('${0}', String(GRADE_LIMITS.MIN)).replace('${1}', String(GRADE_LIMITS.MAX)));
    } else if (grade.assignment > GRADE_LIMITS.MAX) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_RANGE.replace('${0}', String(GRADE_LIMITS.MIN)).replace('${1}', String(GRADE_LIMITS.MAX)));
    } else if (grade.assignment < ACADEMIC.GRADE_THRESHOLDS.MIN_PASS && grade.assignment > 0) {
      warnings.push(VALIDATION_MESSAGES.GRADE_LOW_WARNING('tugas'));
    }
  }

  // Validate mid exam score
  if (grade.midExam !== undefined) {
    if (typeof grade.midExam !== 'number') {
      errors.push(VALIDATION_MESSAGES.INVALID_NUMBER('Nilai UTS'));
    } else if (isNaN(grade.midExam)) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_TYPE);
    } else if (grade.midExam < GRADE_LIMITS.MIN) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_RANGE.replace('${0}', String(GRADE_LIMITS.MIN)).replace('${1}', String(GRADE_LIMITS.MAX)));
    } else if (grade.midExam > GRADE_LIMITS.MAX) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_RANGE.replace('${0}', String(GRADE_LIMITS.MIN)).replace('${1}', String(GRADE_LIMITS.MAX)));
    } else if (grade.midExam < ACADEMIC.GRADE_THRESHOLDS.MIN_PASS && grade.midExam > 0) {
      warnings.push(VALIDATION_MESSAGES.GRADE_LOW_WARNING('UTS'));
    }
  }

  // Validate final exam score
  if (grade.finalExam !== undefined) {
    if (typeof grade.finalExam !== 'number') {
      errors.push(VALIDATION_MESSAGES.INVALID_NUMBER('Nilai UAS'));
    } else if (isNaN(grade.finalExam)) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_TYPE);
    } else if (grade.finalExam < GRADE_LIMITS.MIN) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_RANGE.replace('${0}', String(GRADE_LIMITS.MIN)).replace('${1}', String(GRADE_LIMITS.MAX)));
    } else if (grade.finalExam > GRADE_LIMITS.MAX) {
      errors.push(VALIDATION_MESSAGES.GRADE_INVALID_RANGE.replace('${0}', String(GRADE_LIMITS.MIN)).replace('${1}', String(GRADE_LIMITS.MAX)));
    } else if (grade.finalExam < ACADEMIC.GRADE_THRESHOLDS.MIN_PASS && grade.finalExam > 0) {
      warnings.push(VALIDATION_MESSAGES.GRADE_LOW_WARNING('UAS'));
    }
  }

  // Check if at least one score is provided
  const hasAnyScore = grade.assignment !== undefined || grade.midExam !== undefined || grade.finalExam !== undefined;
  if (!hasAnyScore) {
    errors.push(VALIDATION_MESSAGES.GRADE_MUST_HAVE_ONE);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates class/student data
 */
export const validateClassData = (data: Partial<ClassFormData>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate name
  if (!data.name || data.name.trim().length === 0) {
    errors.push(VALIDATION_MESSAGES.STUDENT_NAME_REQUIRED);
  } else if (data.name.trim().length < FILE_VALIDATION.MATERIAL_TITLE_MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.STUDENT_NAME_MIN_LENGTH);
  } else if (data.name.trim().length > FILE_VALIDATION.FILENAME_MAX_LENGTH) {
    errors.push(VALIDATION_MESSAGES.STUDENT_NAME_MAX_LENGTH);
  } else if (!VALIDATION_PATTERNS.NAME.test(data.name.trim())) {
    warnings.push(VALIDATION_MESSAGES.STUDENT_NAME_UNUSUAL_CHARS);
  }

  // Validate NIS
  if (!data.nis || data.nis.trim().length === 0) {
    errors.push('NIS tidak boleh kosong');
  } else if (!VALIDATION_PATTERNS.NIS.test(data.nis.trim())) {
    errors.push('NIS hanya boleh berisi angka');
  } else if (data.nis.length < ACADEMIC.NIS_LENGTH.MIN || data.nis.length > ACADEMIC.NIS_LENGTH.MAX) {
    errors.push(`NIS harus antara ${ACADEMIC.NIS_LENGTH.MIN}-${ACADEMIC.NIS_LENGTH.MAX} digit`);
  }

  // Validate gender
  if (data.gender && !['L', 'P'].includes(data.gender)) {
    errors.push('Jenis kelamin tidak valid');
  }

  // Validate address
  if (data.address && data.address.trim().length > FILE_VALIDATION.ADDRESS_MAX_LENGTH) {
    errors.push(`Alamat maksimal ${FILE_VALIDATION.ADDRESS_MAX_LENGTH} karakter`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates material data
 */
export const validateMaterialData = (data: Partial<MaterialFormData>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate title
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Judul materi tidak boleh kosong');
  } else if (data.title.trim().length < FILE_VALIDATION.MATERIAL_TITLE_MIN_LENGTH) {
    errors.push(`Judul materi minimal ${FILE_VALIDATION.MATERIAL_TITLE_MIN_LENGTH} karakter`);
  } else if (data.title.trim().length > FILE_VALIDATION.MATERIAL_TITLE_MAX_LENGTH) {
    errors.push(`Judul materi maksimal ${FILE_VALIDATION.MATERIAL_TITLE_MAX_LENGTH} karakter`);
  }

  // Validate description
  if (!data.description || data.description.trim().length === 0) {
    warnings.push('Deskripsi materi kosong, pertimbangkan menambahkannya');
  } else if (data.description.length > VALIDATION_LIMITS.DESCRIPTION_MAX) {
    errors.push(`Deskripsi materi maksimal ${VALIDATION_LIMITS.DESCRIPTION_MAX} karakter`);
  }

  // Validate category
  if (!data.category || data.category.trim().length === 0) {
    errors.push('Kategori materi tidak boleh kosong');
  }

  // Validate file
  if (data.fileUrl && data.fileSize) {
    const maxSize = FILE_SIZE_LIMITS.MATERIAL_DEFAULT; // 50MB
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

/**
 * Validates batch operations
 */
export const validateBatchOperation = (studentIds: string[], operation: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (studentIds.length === 0) {
    errors.push('Tidak ada siswa yang dipilih');
  }

  if (studentIds.length > 50) {
    warnings.push('Memproses banyak siswa dapat memakan waktu lama');
  }

  if (operation === 'delete' || operation === 'archive') {
    errors.push(`Konfirmasi diperlukan untuk operasi ${operation}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates search input
 */
export const validateSearchInput = (searchTerm: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (searchTerm.length > FILE_VALIDATION.SEARCH_MAX_LENGTH) {
    errors.push(`Kata pencarian maksimal ${FILE_VALIDATION.SEARCH_MAX_LENGTH} karakter`);
  }

  if (searchTerm && !VALIDATION_PATTERNS.SEARCH_TERM.test(searchTerm)) {
    warnings.push('Gunakan kata pencarian yang lebih sederhana');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates attendance data
 */
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

  if (!ACADEMIC.ATTENDANCE_STATUS_LIST.includes(attendance.status as typeof ACADEMIC.ATTENDANCE_STATUS_LIST[number])) {
    errors.push('Invalid attendance status');
  }

  if (!attendance.recordedBy || attendance.recordedBy.trim() === '') {
    errors.push('Recorded by is required');
  }

  if (!Object.values(ACADEMIC.ATTENDANCE_STATUSES).includes(attendance.status)) {
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

/**
 * Calculates final grade from components
 */
export const calculateFinalGrade = (assignment: number, midExam: number, finalExam: number): number => {
  return Math.round(((assignment * ACADEMIC.GRADE_WEIGHTS.ASSIGNMENT) + (midExam * ACADEMIC.GRADE_WEIGHTS.MID_EXAM) + (finalExam * ACADEMIC.GRADE_WEIGHTS.FINAL_EXAM)) * 10) / 10;
};

/**
 * Gets grade letter from numeric score
 */
export const getGradeLetter = (score: number): string => {
  if (score >= ACADEMIC.GRADE_THRESHOLDS.A) return 'A';
  if (score >= ACADEMIC.GRADE_THRESHOLDS.B) return 'B';
  if (score >= ACADEMIC.GRADE_THRESHOLDS.C) return 'C';
  return 'D';
};

/**
 * Validates grade composition
 */
export const validateGradeComposition = (grade: GradeInput): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const hasAllScores = grade.assignment !== undefined && 
                      grade.midExam !== undefined && 
                      grade.finalExam !== undefined;

  if (hasAllScores) {
    const finalScore = calculateFinalGrade(grade.assignment!, grade.midExam!, grade.finalExam!);
    if (finalScore < ACADEMIC.GRADE_THRESHOLDS.MIN_PASS) {
      warnings.push(`Nilai akhir dibawah standar kelulusan (${ACADEMIC.GRADE_THRESHOLDS.MIN_PASS})`);
    }
  } else {
    const providedScores = Object.values(grade).filter(v => v !== undefined).length;
    if (providedScores === 1) {
      warnings.push('Hanya satu nilai yang diisi, hasil mungkin tidak representatif');
    } else if (providedScores === 2) {
      warnings.push('Dua nilai yang diisi, pertimbangkan melengkapi nilai yang tersisa');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export function sanitizeGradeInput(input: string | number): number {
  const numValue = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(numValue) ? GRADE_LIMITS.MIN : Math.min(GRADE_LIMITS.MAX, Math.max(GRADE_LIMITS.MIN, numValue));
}

/**
 * Legacy function names for backward compatibility
 */
export const calculateGradeLetter = getGradeLetter;

// Legacy function for backward compatibility
export function validateGradeInputLegacy(score: number, fieldName: string, options: GradeValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  const { allowZero = false, maxScore = GRADE_LIMITS.MAX, requireMinScore = GRADE_LIMITS.MIN } = options;

  if (typeof score !== 'number' || isNaN(score)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (score < GRADE_LIMITS.MIN) {
    errors.push(`${fieldName} cannot be less than ${GRADE_LIMITS.MIN}`);
  } else if (score > maxScore) {
    errors.push(`${fieldName} cannot exceed ${maxScore}`);
  } else if (!allowZero && score === 0) {
    errors.push(`${fieldName} is required`);
  } else if (score < requireMinScore) {
    errors.push(`${fieldName} must be at least ${requireMinScore}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

export function validateGrade(
  grade: Grade,
  options: GradeValidationOptions = {}
): ValidationResult {
  const errors: string[] = [];
  const { allowZero = false, maxScore = GRADE_LIMITS.MAX, requireMinScore = GRADE_LIMITS.MIN } = options;

  if (!grade.studentId || grade.studentId.trim() === '') {
    errors.push('Student ID is required');
  }

  if (!grade.subjectId || grade.subjectId.trim() === '') {
    errors.push('Subject ID is required');
  }

  if (!grade.classId || grade.classId.trim() === '') {
    errors.push('Class ID is required');
  }

  if (!grade.academicYear || grade.academicYear.trim() === '') {
    errors.push('Academic year is required');
  }

  if (!grade.semester || !ACADEMIC.SEMESTERS.includes(grade.semester as typeof ACADEMIC.SEMESTERS[number])) {
    errors.push('Semester must be either "1" or "2"');
  }

  if (typeof grade.assignment !== 'number' || isNaN(grade.assignment)) {
    errors.push('Assignment score must be a valid number');
  } else if (grade.assignment < GRADE_LIMITS.MIN) {
    errors.push(`Assignment score cannot be less than ${GRADE_LIMITS.MIN}`);
  } else if (grade.assignment > maxScore) {
    errors.push(`Assignment score cannot exceed ${maxScore}`);
  } else if (!allowZero && grade.assignment === GRADE_LIMITS.MIN) {
    errors.push('Assignment score is required');
  } else if (grade.assignment < requireMinScore) {
    errors.push(`Assignment score must be at least ${requireMinScore}`);
  }

  if (typeof grade.midExam !== 'number' || isNaN(grade.midExam)) {
    errors.push('Mid exam score must be a valid number');
  } else if (grade.midExam < GRADE_LIMITS.MIN) {
    errors.push(`Mid exam score cannot be less than ${GRADE_LIMITS.MIN}`);
  } else if (grade.midExam > maxScore) {
    errors.push(`Mid exam score cannot exceed ${maxScore}`);
  } else if (!allowZero && grade.midExam === GRADE_LIMITS.MIN) {
    errors.push('Mid exam score is required');
  } else if (grade.midExam < requireMinScore) {
    errors.push(`Mid exam score must be at least ${requireMinScore}`);
  }

  if (typeof grade.finalExam !== 'number' || isNaN(grade.finalExam)) {
    errors.push('Final exam score must be a valid number');
  } else if (grade.finalExam < GRADE_LIMITS.MIN) {
    errors.push(`Final exam score cannot be less than ${GRADE_LIMITS.MIN}`);
  } else if (grade.finalExam > maxScore) {
    errors.push(`Final exam score cannot exceed ${maxScore}`);
  } else if (!allowZero && grade.finalExam === GRADE_LIMITS.MIN) {
    errors.push('Final exam score is required');
  } else if (grade.finalExam < requireMinScore) {
    errors.push(`Final exam score must be at least ${requireMinScore}`);
  }

  if (!grade.assignmentType || grade.assignmentType.trim() === '') {
    errors.push('Assignment type is required');
  }

  if (!grade.assignmentName || grade.assignmentName.trim() === '') {
    errors.push('Assignment name is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

export function validateStudent(student: Student): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!student.id || student.id.trim() === '') {
    errors.push('Student ID is required');
  }

  if (!student.nisn || student.nisn.trim() === '') {
    errors.push('NISN is required');
  } else if (student.nisn.length !== ACADEMIC.NISN_LENGTH) {
    errors.push(`NISN must be exactly ${ACADEMIC.NISN_LENGTH} digits`);
  }

  if (!student.nis || student.nis.trim() === '') {
    errors.push('NIS is required');
  }

  if (!student.className || student.className.trim() === '') {
    errors.push('Student name is required');
  }

  if (!student.class || student.class.trim() === '') {
    errors.push('Class is required');
  }

  if (!student.address || student.address.trim() === '') {
    errors.push('Address is required');
  }

  if (!student.phoneNumber || student.phoneNumber.trim() === '') {
    errors.push('Phone number is required');
  }

  if (!student.parentName || student.parentName.trim() === '') {
    errors.push('Parent name is required');
  }

  if (!student.parentPhone || student.parentPhone.trim() === '') {
    errors.push('Parent phone number is required');
  }

  if (!student.dateOfBirth || student.dateOfBirth.trim() === '') {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(student.dateOfBirth);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date of birth');
    } else {
      const age = Math.floor((new Date().getTime() - dob.getTime()) / TIME_MS.ONE_YEAR);
      if (age < ACADEMIC.AGE_LIMITS.STUDENT_MIN || age > ACADEMIC.AGE_LIMITS.STUDENT_MAX) {
        errors.push(`Student age must be between ${ACADEMIC.AGE_LIMITS.STUDENT_MIN} and ${ACADEMIC.AGE_LIMITS.STUDENT_MAX} years old`);
      } else if (age < ACADEMIC.AGE_LIMITS.STUDENT_TYPICAL_MIN || age > ACADEMIC.AGE_LIMITS.STUDENT_TYPICAL_MAX) {
        warnings.push(`Student age outside typical range (${ACADEMIC.AGE_LIMITS.STUDENT_TYPICAL_MIN}-${ACADEMIC.AGE_LIMITS.STUDENT_TYPICAL_MAX} years)`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateSubject(subject: Subject): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!subject.id || subject.id.trim() === '') {
    errors.push('Subject ID is required');
  }

  if (!subject.name || subject.name.trim() === '') {
    errors.push('Subject name is required');
  }

  if (!subject.code || subject.code.trim() === '') {
    errors.push('Subject code is required');
  }

  if (!subject.description || subject.description.trim() === '') {
    errors.push('Subject description is required');
  }

  if (typeof subject.creditHours !== 'number' || isNaN(subject.creditHours)) {
    errors.push('Credit hours must be a valid number');
  } else if (subject.creditHours < ACADEMIC.CREDIT_HOURS.MIN || subject.creditHours > ACADEMIC.CREDIT_HOURS.MAX) {
    errors.push(`Credit hours must be between ${ACADEMIC.CREDIT_HOURS.MIN} and ${ACADEMIC.CREDIT_HOURS.MAX}`);
  } else if (subject.creditHours < ACADEMIC.CREDIT_HOURS.TYPICAL_MIN || subject.creditHours > ACADEMIC.CREDIT_HOURS.TYPICAL_MAX) {
    warnings.push(`Credit hours outside typical range (${ACADEMIC.CREDIT_HOURS.TYPICAL_MIN}-${ACADEMIC.CREDIT_HOURS.TYPICAL_MAX} hours)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateClass(classData: Class): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!classData.id || classData.id.trim() === '') {
    errors.push('Class ID is required');
  }

  if (!classData.name || classData.name.trim() === '') {
    errors.push('Class name is required');
  }

  if (!classData.homeroomTeacherId || classData.homeroomTeacherId.trim() === '') {
    errors.push('Homeroom teacher ID is required');
  }

  if (!classData.academicYear || classData.academicYear.trim() === '') {
    errors.push('Academic year is required');
  }

  if (!classData.semester || !ACADEMIC.SEMESTERS.includes(classData.semester as typeof ACADEMIC.SEMESTERS[number])) {
    errors.push('Semester must be either "1" or "2"');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateAttendanceTyped(attendance: Attendance): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

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

  if (!Object.values(ACADEMIC.ATTENDANCE_STATUSES).includes(attendance.status)) {
    errors.push('Invalid attendance status');
  }

  if (!attendance.recordedBy || attendance.recordedBy.trim() === '') {
    errors.push('Recorded by is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateMaterialFolder(folder: MaterialFolder): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!folder.id || folder.id.trim() === '') {
    errors.push('Folder ID is required');
  }

  if (!folder.name || folder.name.trim() === '') {
    errors.push('Folder name is required');
  }

  if (!folder.path || folder.path.trim() === '') {
    errors.push('Folder path is required');
  }

  if (!folder.createdBy || folder.createdBy.trim() === '') {
    errors.push('Created by is required');
  }

  if (!folder.createdAt || folder.createdAt.trim() === '') {
    errors.push('Created at is required');
  } else {
    const date = new Date(folder.createdAt);
    if (isNaN(date.getTime())) {
      errors.push('Invalid created at date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateELibrary(material: ELibrary): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!material.id || material.id.trim() === '') {
    errors.push('Material ID is required');
  }

  if (!material.title || material.title.trim() === '') {
    errors.push('Material title is required');
  }

  if (!material.description || material.description.trim() === '') {
    errors.push('Material description is required');
  }

  if (!material.category || material.category.trim() === '') {
    errors.push('Material category is required');
  }

  if (!material.fileUrl || material.fileUrl.trim() === '') {
    errors.push('Material file URL is required');
  }

  if (!material.fileType || material.fileType.trim() === '') {
    errors.push('Material file type is required');
  }

  if (typeof material.fileSize !== 'number' || isNaN(material.fileSize)) {
    errors.push('Material file size must be a valid number');
  } else if (material.fileSize <= 0) {
    errors.push('Material file size must be greater than 0');
  } else if (material.fileSize > FILE_SIZE_LIMITS.TEACHER_MATERIAL_MAX) {
    errors.push(`Material file size cannot exceed ${bytesToMb(FILE_SIZE_LIMITS.TEACHER_MATERIAL_MAX)}MB`);
  }

  if (!material.subjectId || material.subjectId.trim() === '') {
    errors.push('Subject ID is required');
  }

  if (!material.uploadedBy || material.uploadedBy.trim() === '') {
    errors.push('Uploaded by is required');
  }

  if (!material.uploadedAt || material.uploadedAt.trim() === '') {
    errors.push('Uploaded at is required');
  } else {
    const date = new Date(material.uploadedAt);
    if (isNaN(date.getTime())) {
      errors.push('Invalid uploaded at date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateMaterialVersion(version: MaterialVersion): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!version.id || version.id.trim() === '') {
    errors.push('Version ID is required');
  }

  if (!version.materialId || version.materialId.trim() === '') {
    errors.push('Material ID is required');
  }

  if (!version.version || version.version.trim() === '') {
    errors.push('Version number is required');
  }

  if (!version.title || version.title.trim() === '') {
    errors.push('Version title is required');
  }

  if (!version.fileUrl || version.fileUrl.trim() === '') {
    errors.push('Version file URL is required');
  }

  if (!version.fileType || version.fileType.trim() === '') {
    errors.push('Version file type is required');
  }

  if (typeof version.fileSize !== 'number' || isNaN(version.fileSize)) {
    errors.push('Version file size must be a valid number');
  } else if (version.fileSize <= 0) {
    errors.push('Version file size must be greater than 0');
  }

  if (!version.createdBy || version.createdBy.trim() === '') {
    errors.push('Created by is required');
  }

  if (!version.createdAt || version.createdAt.trim() === '') {
    errors.push('Created at is required');
  } else {
    const date = new Date(version.createdAt);
    if (isNaN(date.getTime())) {
      errors.push('Invalid created at date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateBatchGradeUpdate(grades: Grade[], options: GradeValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(grades)) {
    errors.push('Grades must be an array');
    return { isValid: false, errors, warnings };
  }

  if (grades.length === 0) {
    errors.push('No grades to validate');
  } else if (grades.length > 50) {
    warnings.push('Validating many grades may take longer');
  }

  grades.forEach((grade, index) => {
    const validation = validateGrade(grade, options);
    if (!validation.isValid) {
      errors.push(`Grade at index ${index}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export interface GradeHistoryEntry {
  studentId: string;
  studentName: string;
  field: 'assignment' | 'midExam' | 'finalExam';
  oldValue: number;
  newValue: number;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface GradeImportResult {
  successfulImports: number;
  failedImports: number;
  successDetails: Array<{
    studentName: string;
    nis: string;
    assignment: number;
    midExam: number;
    finalExam: number;
  }>;
  errorDetails: Array<{
    studentName: string;
    nis: string;
    errors: string[];
  }>;
}

export interface ClassValidationResult {
  isValid: boolean;
  totalStudents: number;
  studentsWithGrades: number;
  studentsWithoutGrades: number;
  studentsWithoutGradesList: string[];
  warnings: string[];
}

export function validateClassCompletion(grades: StudentGrade[]): ClassValidationResult {
  const warnings: string[] = [];
  const studentsWithoutGradesList: string[] = [];

  grades.forEach(grade => {
    const hasAnyGrade = grade.assignment > 0 || grade.midExam > 0 || grade.finalExam > 0;
    if (!hasAnyGrade) {
      studentsWithoutGradesList.push(grade.name);
    }
  });

  const studentsWithGrades = grades.length - studentsWithoutGradesList.length;

  if (studentsWithoutGradesList.length > 0) {
      warnings.push(
      `${studentsWithoutGradesList.length} siswa belum memiliki nilai: ${studentsWithoutGradesList.slice(0, VALIDATION_LIMITS.MAX_DISPLAY_ITEMS).join(', ')}${studentsWithoutGradesList.length > VALIDATION_LIMITS.MAX_DISPLAY_ITEMS ? '...' : ''}`
    );
  }

  if (studentsWithGrades === grades.length) {
    warnings.push('Semua siswa memiliki nilai. Siap untuk dipublikasikan.');
  }

  return {
    isValid: studentsWithoutGradesList.length === 0,
    totalStudents: grades.length,
    studentsWithGrades,
    studentsWithoutGrades: studentsWithoutGradesList.length,
    studentsWithoutGradesList,
    warnings
  };
}

export function validateCSVImport(
  csvData: Record<string, string>[],
  existingGrades: StudentGrade[]
): GradeImportResult {
  const successfulImports: GradeImportResult['successDetails'] = [];
  const failedImports: GradeImportResult['errorDetails'] = [];

  existingGrades.forEach(existingGrade => {
    const csvRow = csvData.find(
      row =>
        row.nis === existingGrade.nis ||
        row.name?.toLowerCase() === existingGrade.name.toLowerCase()
    );

    if (csvRow) {
      const assignment = sanitizeGradeInput(csvRow.assignment || csvRow.tugas || existingGrade.assignment);
      const midExam = sanitizeGradeInput(csvRow.midExam || csvRow.uts || existingGrade.midExam);
      const finalExam = sanitizeGradeInput(csvRow.finalExam || csvRow.uas || existingGrade.finalExam);

      const assignmentValidation = validateGradeInput({ assignment });
      const midExamValidation = validateGradeInput({ midExam });
      const finalExamValidation = validateGradeInput({ finalExam });

      const allErrors = [
        ...assignmentValidation.errors,
        ...midExamValidation.errors,
        ...finalExamValidation.errors
      ];

      if (allErrors.length === 0) {
        successfulImports.push({
          studentName: existingGrade.name,
          nis: existingGrade.nis,
          assignment,
          midExam,
          finalExam
        });
      } else {
        failedImports.push({
          studentName: existingGrade.name,
          nis: existingGrade.nis,
          errors: allErrors
        });
      }
    }
  });

  return {
    successfulImports: successfulImports.length,
    failedImports: failedImports.length,
    successDetails: successfulImports,
    errorDetails: failedImports
  };
}

export function getInlineValidationMessage(
  value: number,
  _fieldName: string
): { isValid: boolean; message?: string; severity: 'error' | 'warning' | 'info' } {
  if (isNaN(value)) {
    return { isValid: false, message: 'Nilai tidak valid', severity: 'error' };
  }

  if (value < GRADE_LIMITS.MIN) {
    return { isValid: false, message: `Nilai tidak boleh negatif`, severity: 'error' };
  }

  if (value > GRADE_LIMITS.MAX) {
    return { isValid: false, message: `Nilai maksimal ${GRADE_LIMITS.MAX}`, severity: 'error' };
  }

  if (value === GRADE_LIMITS.MIN) {
    return { isValid: true, message: 'Nilai belum diisi', severity: 'info' };
  }

  if (value < ACADEMIC.GRADE_THRESHOLDS.MIN_PASS && value > 0) {
    return { isValid: true, message: 'Nilai rendah', severity: 'warning' };
  }

  return { isValid: true, message: undefined, severity: 'info' };
}
