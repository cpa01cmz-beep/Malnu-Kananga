export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
}

// Featured program data structure
export interface FeaturedProgram {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

// Latest news data structure
export interface LatestNews {
  id: number;
  title: string;
  date: string;
  category: string;
  imageUrl: string;
}

// Student data types
export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  nis: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  semester: string;
  academicYear: string;
}

export interface ScheduleItem {
  id: string;
  studentId: string;
  subject: string;
  teacher: string;
  day: string;
  time: string;
  room: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subject?: string;
}

// Student Progress types
export interface StudentProgress {
  gpa: number;
  gradeTrend: 'declining' | 'improving' | 'stable';
  attendanceRate: number;
  assignmentCompletion: number;
  subjectPerformance?: Record<string, number>;
  riskFactors?: string[];
  recommendations?: string[];
}

// Student Engagement types
export interface StudentEngagement {
  loginFrequency: number;
  resourceAccess: number;
  supportRequests: number;
  participationScore: number;
  lastActiveDate?: string;
  featureUsage?: Record<string, number>;
}

// Support Resource types
export interface SupportResource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'document' | 'tool';
  url?: string;
}
