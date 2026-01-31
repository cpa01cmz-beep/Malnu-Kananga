export interface StudyPlan {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  subjects: StudyPlanSubject[];
  schedule: StudyPlanSchedule[];
  recommendations: StudyPlanRecommendation[];
  createdAt: string;
  validUntil: string;
  status: 'active' | 'completed' | 'expired';
}

export interface StudyPlanSubject {
  subjectName: string;
  currentGrade: number;
  targetGrade: string;
  priority: 'high' | 'medium' | 'low';
  weeklyHours: number;
  focusAreas: string[];
  resources: string[];
}

export interface StudyPlanSchedule {
  dayOfWeek: string;
  timeSlot: string;
  subject: string;
  activity: 'study' | 'practice' | 'review' | 'assignment';
  duration: number;
}

export interface StudyPlanRecommendation {
  category: 'study_tips' | 'time_management' | 'subject_advice' | 'general';
  title: string;
  description: string;
  priority: number;
}

export interface StudyPlanAnalytics {
  planId: string;
  studentId: string;
  studentName: string;
  planTitle: string;
  overallProgress: number;
  completionRate: number;
  adherenceRate: number;
  performanceImprovement: PerformanceImprovement;
  subjectProgress: SubjectProgress[];
  weeklyActivity: WeeklyActivity[];
  effectivenessScore: number;
  recommendations: AnalyticsRecommendation[];
  lastUpdated: string;
}

export interface PerformanceImprovement {
  averageGradeChange: number;
  subjectsImproved: number;
  subjectsDeclined: number;
  subjectsMaintained: number;
  topImprovements: SubjectImprovement[];
}

export interface SubjectImprovement {
  subjectName: string;
  previousGrade: number;
  currentGrade: number;
  improvement: number;
}

export interface SubjectProgress {
  subjectName: string;
  targetGrade: number;
  currentGrade: number;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  sessionsCompleted: number;
  sessionsTotal: number;
  averageSessionDuration: number;
}

export interface WeeklyActivity {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalStudyHours: number;
  scheduledHours: number;
  adherenceRate: number;
  subjectsStudied: string[];
  activitiesCompleted: number;
  activitiesTotal: number;
}

export interface AnalyticsRecommendation {
  type: 'improvement' | 'maintenance' | 'warning' | 'success';
  category: 'schedule' | 'subject' | 'habits' | 'goals';
  title: string;
  description: string;
  actionable: boolean;
}

export interface StudyPlanHistory {
  planId: string;
  planTitle: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
  completedAt?: string;
  effectivenessScore?: number;
  overallProgress: number;
}
