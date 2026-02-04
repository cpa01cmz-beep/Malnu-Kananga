import type { MessageType } from './chat';

export type CommunicationLogType = 'message' | 'meeting' | 'call' | 'note' | 'email';

export type CommunicationLogStatus = 'logged' | 'synced' | 'archived';

export interface CommunicationLogEntry {
  id: string;
  type: CommunicationLogType;
  status: CommunicationLogStatus;

  parentId?: string;
  parentName?: string;
  teacherId?: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;

  subject?: string;
  message?: string;
  messageType?: MessageType;
  sender?: 'parent' | 'teacher' | 'student' | 'system';

  emailMessageId?: string;
  deliveryStatus?: 'queued' | 'sent' | 'delivered' | 'bounced' | 'opened';
  recipientEmail?: string;
  hasAttachment?: boolean;

  meetingId?: string;
  meetingDate?: string;
  meetingStartTime?: string;
  meetingEndTime?: string;
  meetingAgenda?: string;
  meetingOutcome?: string;
  meetingNotes?: string;
  meetingLocation?: string;
  meetingStatus?: 'scheduled' | 'completed' | 'cancelled';

  timestamp: string;
  readAt?: string;
  deliveredAt?: string;
  archivedAt?: string;

  createdAt?: string;
  createdBy?: string;
  createdByName?: string;
  modifiedAt?: string;
  modifiedBy?: string;

  exportCount?: number;
  lastExportedAt?: string;

  metadata?: Record<string, unknown>;
}

export interface CommunicationLogFilter {
  type?: CommunicationLogType[];
  status?: CommunicationLogStatus[];
  parentId?: string;
  teacherId?: string;
  studentId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  keyword?: string;
  subject?: string;
  meetingStatus?: 'scheduled' | 'completed' | 'cancelled';
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'date' | 'sender' | 'teacher' | 'parent';
  sortOrder?: 'asc' | 'desc';
}

export interface CommunicationLogExportOptions {
  format: 'pdf' | 'csv';
  includeMetadata?: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: CommunicationLogFilter;
}

export interface CommunicationLogStats {
  totalMessages: number;
  totalMeetings: number;
  totalCalls: number;
  totalNotes: number;
  totalEmails: number;
  messageCountByParent: Record<string, number>;
  messageCountByTeacher: Record<string, number>;
  meetingCountByStatus: Record<string, number>;
  emailCountByParent: Record<string, number>;
  emailCountByTeacher: Record<string, number>;
  averageResponseTime?: number;
  mostActiveTeachers: string[];
  mostActiveParents: string[];
}
