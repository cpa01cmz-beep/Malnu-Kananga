export interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  objectives: string[];
  materials: string[];
  duration: number; // in minutes
  activities: LessonActivity[];
  assessment: LessonAssessment;
  homework?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  templateId?: string;
}

export interface LessonActivity {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  type: 'introduction' | 'main' | 'group-work' | 'discussion' | 'individual' | 'conclusion';
  materials?: string[];
}

export interface LessonAssessment {
  type: 'formative' | 'summative';
  method: string;
  criteria: string[];
  rubric?: string;
}

export interface LessonPlanTemplate {
  id: string;
  name: string;
  description: string;
  subject?: string;
  grade?: string;
  structure: {
    activities: Omit<LessonActivity, 'id'>[];
    assessmentType: LessonAssessment['type'];
  };
  isDefault: boolean;
  createdAt: string;
}

export interface LessonPlanGenerationRequest {
  subject: string;
  grade: string;
  topic: string;
  duration: number;
  learningObjectives?: string[];
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
  specialRequirements?: string[];
  templateId?: string;
  includeMaterials: boolean;
  includeHomework: boolean;
}

export interface LessonPlanGenerationResponse {
  success: boolean;
  lessonPlan?: LessonPlan;
  error?: string;
  suggestions?: string[];
}

export interface LessonPlanFilters {
  subject?: string;
  grade?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  createdBy?: string;
}

export interface LessonPlanExportOptions {
  format: 'pdf' | 'docx';
  includeNotes: boolean;
  includeAssessment: boolean;
  includeMaterials: boolean;
}
