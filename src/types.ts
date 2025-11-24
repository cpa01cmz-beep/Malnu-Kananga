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
  title: string;
  description: string;
  imageUrl: string;
}

// Latest news data structure
export interface LatestNews {
  title: string;
  date: string;
  category: string;
  imageUrl: string;
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
