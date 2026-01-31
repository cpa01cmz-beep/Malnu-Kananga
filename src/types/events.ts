export interface SchoolEvent {
  id: string;
  eventName: string;
  date: string;
  location: string;
  description: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  organizer?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface GradeFormData {
  studentId: string;
  assignment: number;
  midExam: number;
  finalExam: number;
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  class?: string;
  room?: string;
}

export interface GradeBatchOperation {
  studentIds: string[];
  operation: 'reset' | 'bulk_fill' | 'delete';
  data?: Partial<GradeFormData>;
}

export interface ClassBatchOperation {
  studentIds: string[];
  operation: 'mark_present' | 'mark_absent' | 'move_class';
  targetClass?: string;
  notes?: string;
}

export interface MaterialBatchOperation {
  materialIds: string[];
  operation: 'move_folder' | 'change_category' | 'delete' | 'archive';
  targetFolder?: string;
  targetCategory?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  registrationDate: string;
  attendanceStatus: 'registered' | 'attended' | 'absent';
  notes?: string;
}

export interface EventBudget {
  id: string;
  eventId: string;
  category: 'Food' | 'Decoration' | 'Equipment' | 'Venue' | 'Marketing' | 'Other';
  itemName: string;
  estimatedCost: number;
  actualCost?: number;
  quantity: number;
  status: 'planned' | 'approved' | 'purchased' | 'completed';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface EventPhoto {
  id: string;
  eventId: string;
  photoUrl: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface EventFeedback {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  overallRating: number;
  organizationRating: number;
  contentRating: number;
  comments?: string;
  wouldRecommend: boolean;
  submittedAt: string;
}
