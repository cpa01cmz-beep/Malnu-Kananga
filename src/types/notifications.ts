import type { UserRole, UserExtraRole } from './common';

export type NotificationType = 'announcement' | 'grade' | 'ppdb' | 'event' | 'library' | 'system' | 'ocr' | 'ocr_validation' | 'missing_grades' | 'progress_report';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
  targetRoles?: UserRole[];
  targetExtraRoles?: UserExtraRole[];
  targetUsers?: string[];
  batchSize?: number;
  batchId?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  announcements: boolean;
  grades: boolean;
  ppdbStatus: boolean;
  events: boolean;
  library: boolean;
  system: boolean;
  ocr: boolean;
  roleBasedFiltering: boolean;
  batchNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  voiceNotifications: VoiceNotificationSettings;
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermission {
  granted: boolean;
  state: 'default' | 'granted' | 'denied';
}

export interface PushSubscriptionOptions {
  userVisibleOnly: boolean;
  applicationServerKey: string | null;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  variables: string[];
  targetRoles?: UserRole[];
  targetExtraRoles?: UserExtraRole[];
  priority: NotificationPriority;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationBatch {
  id: string;
  name: string;
  notifications: PushNotification[];
  scheduledFor: string;
  deliveryMethod: 'immediate' | 'scheduled' | 'manual';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  sentAt?: string;
  failureReason?: string;
}

export interface NotificationAnalytics {
  id: string;
  notificationId: string;
  delivered: number;
  read: number;
  clicked: number;
  dismissed: number;
  timestamp: string;
  roleBreakdown: Partial<Record<UserRole, number>>;
}

export interface NotificationCenterItem {
  id: string;
  notification: PushNotification;
  status: 'delivered' | 'read' | 'clicked' | 'dismissed';
  deliveredAt: string;
  readAt?: string;
  clickedAt?: string;
  dismissedAt?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  vibrate?: number[];
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationHistoryItem {
  id: string;
  notification: PushNotification;
  clicked: boolean;
  dismissed: boolean;
  deliveredAt: string;
}

export interface VoiceNotificationSettings {
  enabled: boolean;
  highPriorityOnly: boolean;
  respectQuietHours: boolean;
  voiceSettings: {
    rate: number;
    pitch: number;
    volume: number;
  };
  categories: {
    grades: boolean;
    attendance: boolean;
    system: boolean;
    meetings: boolean;
  };
}

export interface VoiceNotification {
  id: string;
  notificationId: string;
  text: string;
  priority: NotificationPriority;
  category: VoiceNotificationCategory;
  timestamp: string;
  isSpeaking: boolean;
  wasSpoken: boolean;
}

export type VoiceNotificationCategory = 'grade' | 'attendance' | 'system' | 'meeting';
