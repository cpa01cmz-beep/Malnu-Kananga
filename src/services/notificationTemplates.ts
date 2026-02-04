import { NotificationType, UserRole, PushNotification } from '../types';
import { logger } from '../utils/logger';

export interface NotificationTemplate {
  type: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  targetRoles: UserRole[];
  priority: 'low' | 'normal' | 'high';
  data?: Record<string, unknown>;
}

export interface NotificationTemplateContext {
  [key: string]: string | number | boolean;
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  announcement: {
    type: 'announcement',
    titleTemplate: '📢 {title}',
    bodyTemplate: '{content}',
    targetRoles: ['admin', 'teacher', 'student', 'parent'],
    priority: 'normal',
    data: { category: 'announcement' },
  },
  grade: {
    type: 'grade',
    titleTemplate: '📊 Update Nilai: {subject}',
    bodyTemplate: 'Nilai {assignment} untuk {studentName} telah diperbarui: {score}/{maxScore}',
    targetRoles: ['student', 'parent', 'teacher'],
    priority: 'normal',
    data: { category: 'grade' },
  },
  ppdb: {
    type: 'ppdb',
    titleTemplate: '🎓 Status PPDB: {status}',
    bodyTemplate: 'Pendaftaran PPDB untuk {studentName} sekarang berstatus: {status}. Silakan cek portal untuk informasi lebih lanjut.',
    targetRoles: ['admin', 'student', 'parent'],
    priority: 'high',
    data: { category: 'ppdb' },
  },
  event: {
    type: 'event',
    titleTemplate: '🎉 Kegiatan Baru: {title}',
    bodyTemplate: '{description}\nTanggal: {date}\nLokasi: {location}',
    targetRoles: ['admin', 'teacher', 'student', 'parent'],
    priority: 'normal',
    data: { category: 'event' },
  },
  library: {
    type: 'library',
    titleTemplate: '📚 Materi Baru: {title}',
    bodyTemplate: 'Materi baru telah ditambahkan: {description}\nKategori: {category}',
    targetRoles: ['teacher', 'student'],
    priority: 'low',
    data: { category: 'library' },
  },
  system: {
    type: 'system',
    titleTemplate: '⚙️ {title}',
    bodyTemplate: '{message}',
    targetRoles: ['admin', 'teacher', 'student', 'parent'],
    priority: 'high',
    data: { category: 'system' },
  },
  ocr: {
    type: 'ocr',
    titleTemplate: '📄 OCR Validation {severity}',
    bodyTemplate: 'Document "{documentType}" validation {result}. Confidence: {confidence}%. Issues: {issues}',
    targetRoles: ['admin', 'teacher'],
    priority: 'normal',
    data: { category: 'ocr' },
  },
  ocr_validation: {
    type: 'ocr_validation',
    titleTemplate: '🔍 OCR Validation Complete',
    bodyTemplate: 'Document "{documentType}" validation {status}. {message}',
    targetRoles: ['parent', 'admin', 'teacher'],
    priority: 'normal',
    data: { category: 'ocr_validation' },
  },
  missing_grades: {
    type: 'missing_grades',
    titleTemplate: '⚠️ Missing Grades Alert',
    bodyTemplate: '{studentName} has potentially missing grades in {missingCount} subject(s): {subjects}',
    targetRoles: ['parent'],
    priority: 'high',
    data: { category: 'missing_grades' },
  },
  progress_report: {
    type: 'progress_report',
    titleTemplate: '📊 Laporan Progres Belajar Baru',
    bodyTemplate: 'Laporan progres belajar untuk {studentName} telah tersedia. Rata-rata nilai: {averageScore}, Kehadiran: {attendancePercentage}%',
    targetRoles: ['parent'],
    priority: 'normal',
    data: { category: 'progress_report' },
  },
};

export class NotificationTemplateService {
  static generateNotification(
    type: NotificationType,
    context: NotificationTemplateContext,
    userRole?: UserRole
  ): PushNotification | null {
    const template = NOTIFICATION_TEMPLATES[type];

    if (!template) {
      logger.error(`No template found for notification type: ${type}`);
      return null;
    }

    if (userRole && !template.targetRoles.includes(userRole)) {
      logger.info(
        `Notification type ${type} is not relevant for role ${userRole}. Skipping.`
      );
      return null;
    }

    const title = this.interpolate(template.titleTemplate, context);
    const body = this.interpolate(template.bodyTemplate, context);

    return {
      id: `notif-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      priority: template.priority,
      data: {
        ...template.data,
        ...context,
      },
    };
  }

  private static interpolate(template: string, context: NotificationTemplateContext): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = context[key];
      if (value === undefined || value === null) {
        logger.warn(`Missing context value for key: ${key} in template: ${template}`);
        return match;
      }
      return String(value);
    });
  }

  static getTemplatesByRole(userRole: UserRole): NotificationTemplate[] {
    return Object.values(NOTIFICATION_TEMPLATES).filter((template) =>
      template.targetRoles.includes(userRole)
    );
  }

  static getRelevantNotificationTypes(userRole: UserRole): NotificationType[] {
    return Object.entries(NOTIFICATION_TEMPLATES)
      .filter(([_, template]) => template.targetRoles.includes(userRole))
      .map(([type]) => type as NotificationType);
  }
}

export default NotificationTemplateService;
