import type { UserRole } from './common';

export type TimelineEventType =
  | 'grade'
  | 'assignment'
  | 'submission'
  | 'attendance'
  | 'material_access'
  | 'material_download'
  | 'material_rating'
  | 'material_bookmark'
  | 'message_sent'
  | 'message_received'
  | 'announcement'
  | 'event'
  | 'system';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  timestamp: string;
  data: TimelineEventData;
  relatedId?: string;
  relatedType?: string;
  createdBy?: string;
  createdByRole?: UserRole;
}

export type TimelineEventData =
  | GradeEventData
  | AssignmentEventData
  | SubmissionEventData
  | AttendanceEventData
  | MaterialAccessEventData
  | MaterialDownloadEventData
  | MaterialRatingEventData
  | MaterialBookmarkEventData
  | MessageEventData
  | AnnouncementEventData
  | EventEventData
  | SystemEventData;

export interface GradeEventData {
  gradeId: string;
  subjectId: string;
  subjectName?: string;
  score: number;
  maxScore: number;
  assignmentType?: string;
  assignmentName?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface AssignmentEventData {
  assignmentId: string;
  subjectId: string;
  subjectName?: string;
  title: string;
  type: string;
  maxScore: number;
  dueDate: string;
  teacherId?: string;
  teacherName?: string;
}

export interface SubmissionEventData {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  subjectId: string;
  subjectName?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  status: string;
}

export interface AttendanceEventData {
  attendanceId: string;
  classId: string;
  className?: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  notes?: string;
  recordedBy?: string;
}

export interface MaterialAccessEventData {
  materialId: string;
  materialTitle: string;
  category?: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  position?: number;
  readTime?: number;
}

export interface MaterialDownloadEventData {
  materialId: string;
  materialTitle: string;
  category?: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface MaterialRatingEventData {
  ratingId: string;
  materialId: string;
  materialTitle: string;
  rating: number;
  review?: string;
}

export interface MaterialBookmarkEventData {
  bookmarkId: string;
  materialId: string;
  materialTitle: string;
  pageNumber?: number;
  note?: string;
}

export interface MessageEventData {
  messageId: string;
  conversationId: string;
  content: string;
  messageType: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId?: string;
  recipientName?: string;
  isOutgoing: boolean;
}

export interface AnnouncementEventData {
  announcementId: string;
  title: string;
  content: string;
  category?: string;
  priority?: string;
  authorId?: string;
  authorName?: string;
  targetAudience?: string[];
}

export interface EventEventData {
  eventId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  category?: string;
}

export interface SystemEventData {
  message: string;
  details?: string;
}

export interface TimelineFilter {
  eventTypes?: TimelineEventType[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  subjects?: string[];
  classes?: string[];
  minScore?: number;
  maxScore?: number;
}

export interface TimelineOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface TimelineExportOptions {
  format: 'pdf';
  includeFilters: boolean;
  includeDetails: boolean;
  startDate?: string;
  endDate?: string;
}

export interface TimelineStats {
  totalEvents: number;
  eventsByType: Record<TimelineEventType, number>;
  dateRange: {
    firstEvent: string;
    lastEvent: string;
  };
  averageScore?: number;
  attendanceRate?: number;
  totalMaterialsAccessed?: number;
  totalMessages?: number;
}
