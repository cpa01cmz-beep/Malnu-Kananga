export enum AssignmentType {
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  QUIZ = 'quiz',
  EXAM = 'exam',
  LAB_WORK = 'lab_work',
  PRESENTATION = 'presentation',
  HOMEWORK = 'homework',
  OTHER = 'other',
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  creditHours: number;
}

export interface Class {
  id: string;
  name: string;
  homeroomTeacherId: string;
  academicYear: string;
  semester: '1' | '2';
}

export interface Schedule {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  startTime: string;
  endTime: string;
  room: string;
  subjectName?: string;
  teacherName?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  classId: string;
  academicYear: string;
  semester: string;
  assignmentType: string;
  assignmentName: string;
  score: number;
  maxScore: number;
  assignment?: number;
  midExam?: number;
  finalExam?: number;
  createdBy: string;
  createdAt: string;
  subjectName?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  type: AssignmentType;
  subjectId: string;
  classId: string;
  teacherId: string;
  academicYear: string;
  semester: string;
  maxScore: number;
  dueDate: string;
  status: AssignmentStatus;
  attachments?: AssignmentAttachment[];
  rubric?: AssignmentRubric;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
}

export interface AssignmentAttachment {
  id: string;
  assignmentId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AssignmentRubric {
  id: string;
  assignmentId: string;
  criteria: RubricCriteria[];
  totalScore: number;
  createdAt: string;
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionText?: string;
  attachments: SubmissionAttachment[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  status: 'draft' | 'submitted' | 'late' | 'graded';
}

export interface SubmissionAttachment {
  id: string;
  submissionId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface AIFeedback {
  id: string;
  assignmentId: string;
  submissionId: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedScore?: number;
  generatedAt: string;
  aiModel: string;
  confidence: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  notes: string;
  recordedBy: string;
  createdAt: string;
  className?: string;
}
