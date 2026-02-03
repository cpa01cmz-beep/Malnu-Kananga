export type PPDBPipelineStatus =
  | 'registered'
  | 'document_review'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'accepted'
  | 'enrolled'
  | 'rejected'
  | 'pending'
  | 'approved';

export interface PPDBRegistrant {
  id: string;
  userId?: string;
  fullName: string;
  nisn: string;
  originSchool: string;
  parentName: string;
  phoneNumber: string;
  email: string;
  address: string;
  registrationDate: string;
  status: PPDBPipelineStatus;
  documentUrl?: string;
  score?: number;
  rubricScores?: Record<string, number>;
  documentPreviews?: DocumentPreview[];
  ocrMetadata?: {
    extractedGrades?: Record<string, number>;
    extractedFullName?: string;
    extractedNisn?: string;
    extractedSchoolName?: string;
    confidence?: number;
    quality?: {
      isSearchable: boolean;
      isHighQuality: boolean;
      estimatedAccuracy: number;
      wordCount: number;
      characterCount: number;
      hasMeaningfulContent: boolean;
      documentType: 'unknown' | 'academic' | 'administrative' | 'form' | 'certificate';
    };
    processedAt?: string;
  };
}

export interface DocumentPreview {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document';
  size: number;
}

export interface PPDBFilterOptions {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  dateRange: 'all' | 'today' | 'week' | 'month';
  scoreRange: 'all' | 'high' | 'medium' | 'low';
  schoolFilter: string;
}

export interface PPDBSortOptions {
  field: 'registrationDate' | 'fullName' | 'score' | 'status';
  direction: 'asc' | 'desc';
}

export interface PPDBTemplate {
  id: string;
  name: string;
  type: 'approval' | 'rejection';
  subject: string;
  body: string;
  variables: string[];
}

export interface PPDBRubric {
  id: string;
  name: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
    maxScore: number;
    description: string;
  }[];
}

export interface PPDBAutoCreationConfig {
  enabled: boolean;
  autoCreateOnApproval: boolean;
  requireEnrollmentConfirmation: boolean;
  createParentAccount: boolean;
  sendWelcomeEmail: boolean;
}

export interface PPDBAutoCreationAudit {
  id: string;
  registrantId: string;
  studentId?: string;
  parentAccountId?: string;
  nis?: string;
  status: 'success' | 'failed' | 'rolled_back';
  reason?: string;
  timestamp: string;
  createdBy?: string;
}
