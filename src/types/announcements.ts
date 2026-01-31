export enum AnnouncementCategory {
  UMUM = 'umum',
  AKADEMIK = 'akademik',
  KEGIATAN = 'kegiatan',
  KEUANGAN = 'keuangan',
}

export enum AnnouncementTargetType {
  ALL = 'all',
  ROLES = 'roles',
  CLASSES = 'classes',
  SPECIFIC = 'specific',
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  targetType: AnnouncementTargetType;
  targetAudience?: string;
  targetRoles?: string[];
  targetClasses?: string[];
  targetUsers?: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  updatedAt?: string;
  readBy?: string[];
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  category: AnnouncementCategory;
  targetType: AnnouncementTargetType;
  targetAudience?: string;
  targetRoles?: string[];
  targetClasses?: string[];
  targetUsers?: string[];
  expiresAt?: string;
  sendNotification?: boolean;
}

export interface AnnouncementAnalytics {
  totalSent: number;
  readCount: number;
  clickCount: number;
  byRole: Record<string, number>;
  byClass: Record<string, number>;
}
