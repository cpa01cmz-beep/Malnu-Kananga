import type { Grade } from '../types';

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
      errors.push('Deadline must be in future');
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

export function getGradeStatus(targetGrade: string, currentGrade: string): 'achieved' | 'not-achieved' | 'in-progress' {
  const gradeValue: Record<string, number> = { A: 4, B: 3, C: 2, D: 1 };
  const currentValue = gradeValue[currentGrade];
  const targetValue = gradeValue[targetGrade];

  if (currentValue === undefined || targetValue === undefined) {
    return 'in-progress';
  }

  return currentValue >= targetValue ? 'achieved' : 'not-achieved';
}
