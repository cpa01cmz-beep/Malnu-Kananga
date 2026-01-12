export type EmailProvider = 'sendgrid' | 'mailgun' | 'aws-ses' | 'cloudflare-email';

export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: string | ArrayBuffer;
  size: number;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailData {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  templateData?: Record<string, string | number>;
}

export interface EmailDeliveryStatus {
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'bounced' | 'complained' | 'opened' | 'clicked';
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface EmailQueueItem {
  id: string;
  emailData: EmailData;
  attempts: number;
  lastAttemptAt: string | null;
  nextAttemptAt: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  error?: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: 'grades' | 'attendance' | 'reports' | 'announcements' | 'notifications' | 'system';
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  language: 'id' | 'en';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplateContext {
  studentName?: string;
  studentId?: string;
  className?: string;
  subjectName?: string;
  grade?: number;
  attendanceDate?: string;
  attendanceStatus?: string;
  reportPeriod?: string;
  reportUrl?: string;
  schoolName?: string;
  recipientName?: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  teacherName?: string;
  semester?: string;
  academicYear?: string;
}

export interface EmailSendOptions {
  priority?: 'low' | 'normal' | 'high';
  scheduleAt?: string;
  trackDelivery?: boolean;
  queueOffline?: boolean;
}

export interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface EmailNotificationSettings {
  enabled: boolean;
  email: string;
  notifications: {
    grades: boolean;
    attendance: boolean;
    reports: boolean;
    announcements: boolean;
    events: boolean;
  };
}
