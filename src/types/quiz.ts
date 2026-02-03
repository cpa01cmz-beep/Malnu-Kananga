export enum QuizDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum QuizQuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_BLANK = 'fill_blank',
  MATCHING = 'matching',
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  difficulty: QuizDifficulty;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  materialReference?: string;
  tags?: string[];
}

export interface QuizAutoIntegrationConfig {
  enabled: boolean;
  minPassingScore?: number;
  includeEssays?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  academicYear: string;
  semester: string;
  questions: QuizQuestion[];
  totalPoints: number;
  duration: number;
  passingScore: number;
  attempts: number;
  status: 'draft' | 'published' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
  materialIds?: string[];
  aiGenerated: boolean;
  aiConfidence?: number;
  autoIntegration?: QuizAutoIntegrationConfig;
}

export interface QuizGenerationOptions {
  materialIds: string[];
  questionCount: number;
  questionTypes: QuizQuestionType[];
  difficulty: QuizDifficulty;
  totalPoints?: number;
  focusAreas?: string[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: Record<string, string | string[]>;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
  timeSpent: number;
  attemptNumber: number;
}

export interface QuizAnalytics {
  quizId: string;
  title: string;
  totalAttempts: number;
  averageScore: number;
  averagePercentage: number;
  passRate: number;
  averageTimeSpent: number;
  averageDuration: number;
  questionPerformance: Array<{
    questionId: string;
    question: string;
    correctRate: number;
    averageScore: number;
  }>;
}
