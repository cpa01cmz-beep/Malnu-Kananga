import type { Grade, Subject, Attendance, Student } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface GradeValidationOptions {
  allowZero?: boolean;
  maxScore?: number;
  requireMinScore?: number;
}

export function validateStudentGrade(grade: Grade, options: GradeValidationOptions = {}): ValidationResult {
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

  if (typeof grade.score !== 'number' || isNaN(grade.score)) {
    errors.push('Grade score must be a valid number');
  } else if (grade.score < 0) {
    errors.push('Grade score cannot be negative');
  } else if (grade.score > maxScore) {
    errors.push(`Grade score cannot exceed ${maxScore}`);
  } else if (!allowZero && grade.score === 0) {
    errors.push('Grade score is required');
  } else if (grade.score < requireMinScore) {
    errors.push(`Grade score must be at least ${requireMinScore}`);
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
    errors.push('Class name is required');
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

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateStudentProgress(goal: {
  subject: string;
  targetGrade: string;
  currentGrade: number;
  deadline: string
}): ValidationResult {
  const errors: string[] = [];

  if (!goal.subject || goal.subject.trim() === '') {
    errors.push('Subject is required');
  }

  if (!['A', 'B', 'C', 'D'].includes(goal.targetGrade)) {
    errors.push('Target grade must be A, B, C, or D');
  }

  if (typeof goal.currentGrade !== 'number' || isNaN(goal.currentGrade)) {
    errors.push('Current grade must be a valid number');
  } else if (goal.currentGrade < 0 || goal.currentGrade > 100) {
    errors.push('Current grade must be between 0 and 100');
  }

  if (!goal.deadline || goal.deadline.trim() === '') {
    errors.push('Deadline is required');
  } else {
    const deadline = new Date(goal.deadline);
    if (isNaN(deadline.getTime())) {
      errors.push('Invalid deadline date');
    } else if (deadline < new Date()) {
      errors.push('Deadline must be in the future');
    }
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

export function calculateFinalScore(assignment: number, midExam: number, finalExam: number): number {
  return Math.round((assignment * 0.3) + (midExam * 0.3) + (finalExam * 0.4));
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

export function validateAndSanitizeGrade(score: string | number): number {
  const numValue = typeof score === 'string' ? parseFloat(score) : score;
  return isNaN(numValue) ? 0 : Math.min(100, Math.max(0, numValue));
}

export function getGradeMinScore(grade: string): number {
  switch (grade) {
    case 'A': return 85;
    case 'B': return 75;
    case 'C': return 60;
    case 'D': return 0;
    default: return 0;
  }
}

export function getGradeStatus(targetGrade: string, currentGrade: string): 'achieved' | 'not-achieved' | 'in-progress' {
  const gradeValue: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
  const currentValue = gradeValue[currentGrade];
  const targetValue = gradeValue[targetGrade];

  if (currentValue === undefined || targetValue === undefined) {
    return 'in-progress';
  }

  return currentValue >= targetValue ? 'achieved' : 'not-achieved';
}
