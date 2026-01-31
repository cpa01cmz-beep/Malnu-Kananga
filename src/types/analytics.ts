export interface Goal {
  id: string;
  studentId: string;
  subject: string;
  targetGrade: string;
  currentGrade: number;
  deadline: string;
  status: 'in-progress' | 'achieved' | 'not-achieved';
  createdAt: string;
}

export interface GradeTrendData {
  date: string;
  subject: string;
  score: number;
  assignmentType: string;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  assignment: number;
  midExam: number;
  finalExam: number;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  targetGrade?: string;
}

export interface AttendanceGradeCorrelation {
  attendancePercentage: number;
  averageGrade: number;
  correlationScore: number;
  insights: string[];
}

export interface ClassGradeAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  gradeDistribution: GradeDistribution;
  submissionRate: number;
  subjectBreakdown: SubjectAnalytics[];
  topPerformers: StudentPerformance[];
  needsAttention: StudentPerformance[];
  studentPerformances: StudentPerformance[];
  lastUpdated: string;
}

export interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  averageScore: number;
  totalAssignments: number;
  totalSubmissions: number;
  submissionRate: number;
  averageCompletionTime: number;
  gradeDistribution: GradeDistribution;
  trend: 'improving' | 'declining' | 'stable';
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  averageScore: number;
  totalAssignments: number;
  completedAssignments: number;
  submissionRate: number;
  gradeDistribution: GradeDistribution;
  trend: 'improving' | 'declining' | 'stable';
  lastSubmission?: string;
}

export interface AssignmentAnalytics {
  assignmentId: string;
  assignmentTitle: string;
  subjectName: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  averageScore: number;
  maxScore: number;
  gradeDistribution: GradeDistribution;
  submissionRate: number;
  gradingProgress: number;
  averageFeedbackLength: number;
  lateSubmissions: number;
}

import type { UserRole } from './common';

export interface OCRValidationEvent {
  id: string;
  type: 'validation-failure' | 'validation-warning' | 'validation-success';
  documentId: string;
  documentType: string;
  confidence: number;
  issues: string[];
  timestamp: string;
  userId: string;
  userRole: UserRole;
  actionUrl?: string;
}

export interface OCRValidationNotificationData extends OCRValidationEvent {
  requiresReview: boolean;
  automatedRetryCount?: number;
  nextAction?: 'review' | 'reprocess' | 'manual-entry';
}
