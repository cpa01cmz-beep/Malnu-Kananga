import type { Grade, Student, Subject, Class, Attendance, MaterialFolder, ELibrary, MaterialVersion } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
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
  data?: any;
  error?: string;
  canRetry?: boolean;
}

export function validateGrade(
  grade: Grade,
  options: GradeValidationOptions = {}
): ValidationResult {
  const errors: string[] = [];
  const { allowZero = false, maxScore = 100, requireMinScore = 0 } = options;

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

  if (!grade.semester || !['1', '2'].includes(grade.semester)) {
    errors.push('Semester must be either "1" or "2"');
  }

  if (typeof grade.assignment !== 'number' || isNaN(grade.assignment)) {
    errors.push('Assignment score must be a valid number');
  } else if (grade.assignment < 0) {
    errors.push('Assignment score cannot be negative');
  } else if (grade.assignment > maxScore) {
    errors.push(`Assignment score cannot exceed ${maxScore}`);
  } else if (!allowZero && grade.assignment === 0) {
    errors.push('Assignment score is required');
  } else if (grade.assignment < requireMinScore) {
    errors.push(`Assignment score must be at least ${requireMinScore}`);
  }

  if (typeof grade.midExam !== 'number' || isNaN(grade.midExam)) {
    errors.push('Mid exam score must be a valid number');
  } else if (grade.midExam < 0) {
    errors.push('Mid exam score cannot be negative');
  } else if (grade.midExam > maxScore) {
    errors.push(`Mid exam score cannot exceed ${maxScore}`);
  } else if (!allowZero && grade.midExam === 0) {
    errors.push('Mid exam score is required');
  } else if (grade.midExam < requireMinScore) {
    errors.push(`Mid exam score must be at least ${requireMinScore}`);
  }

  if (typeof grade.finalExam !== 'number' || isNaN(grade.finalExam)) {
    errors.push('Final exam score must be a valid number');
  } else if (grade.finalExam < 0) {
    errors.push('Final exam score cannot be negative');
  } else if (grade.finalExam > maxScore) {
    errors.push(`Final exam score cannot exceed ${maxScore}`);
  } else if (!allowZero && grade.finalExam === 0) {
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
    errors
  };
}

export function validateStudent(student: Student): ValidationResult {
  const errors: string[] = [];

  if (!student.id || student.id.trim() === '') {
    errors.push('Student ID is required');
  }

  if (!student.nisn || student.nisn.trim() === '') {
    errors.push('NISN is required');
  } else if (student.nisn.length !== 10) {
    errors.push('NISN must be exactly 10 digits');
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
      const age = Math.floor((new Date().getTime() - dob.getTime()) / 31557600000);
      if (age < 6 || age > 25) {
        errors.push('Student age must be between 6 and 25 years old');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateSubject(subject: Subject): ValidationResult {
  const errors: string[] = [];

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
  } else if (subject.creditHours < 1 || subject.creditHours > 6) {
    errors.push('Credit hours must be between 1 and 6');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateClass(classData: Class): ValidationResult {
  const errors: string[] = [];

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

  if (!classData.semester || !['1', '2'].includes(classData.semester)) {
    errors.push('Semester must be either "1" or "2"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAttendance(attendance: Attendance): ValidationResult {
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
    errors
  };
}

export function validateMaterialFolder(folder: MaterialFolder): ValidationResult {
  const errors: string[] = [];

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
    errors
  };
}

export function validateELibrary(material: ELibrary): ValidationResult {
  const errors: string[] = [];

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
  } else if (material.fileSize > 100 * 1024 * 1024) { // 100MB
    errors.push('Material file size cannot exceed 100MB');
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
    errors
  };
}

export function validateMaterialVersion(version: MaterialVersion): ValidationResult {
  const errors: string[] = [];

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
    errors
  };
}

export function validateGradeInput(score: number, fieldName: string, options: GradeValidationOptions = {}): ValidationResult {
  const errors: string[] = [];
  const { allowZero = false, maxScore = 100, requireMinScore = 0 } = options;

  if (typeof score !== 'number' || isNaN(score)) {
    errors.push(`${fieldName} must be a valid number`);
  } else if (score < 0) {
    errors.push(`${fieldName} cannot be negative`);
  } else if (score > maxScore) {
    errors.push(`${fieldName} cannot exceed ${maxScore}`);
  } else if (!allowZero && score === 0) {
    errors.push(`${fieldName} is required`);
  } else if (score < requireMinScore) {
    errors.push(`${fieldName} must be at least ${requireMinScore}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function calculateGradeLetter(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

export function calculateFinalGrade(assignment: number, midExam: number, finalExam: number): number {
  return (assignment * 0.3) + (midExam * 0.3) + (finalExam * 0.4);
}

export function sanitizeGradeInput(input: string | number): number {
  const numValue = typeof input === 'string' ? parseFloat(input) : input;
  return isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue));
}

export function validateBatchGradeUpdate(grades: Grade[], options: GradeValidationOptions = {}): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(grades)) {
    errors.push('Grades must be an array');
    return { isValid: false, errors };
  }

  grades.forEach((grade, index) => {
    const validation = validateGrade(grade, options);
    if (!validation.isValid) {
      errors.push(`Grade at index ${index}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMaterialData(data: MaterialFormData): ValidationResult {
  const errors: string[] = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Material title is required');
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('Material description is required');
  }

  if (!data.category || data.category.trim() === '') {
    errors.push('Material category is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateClassData(data: ClassFormData): ValidationResult {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Student name is required');
  }

  if (!data.nis || data.nis.trim() === '') {
    errors.push('NIS is required');
  }

  if (!data.gender || !['L', 'P'].includes(data.gender)) {
    errors.push('Gender must be L or P');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
