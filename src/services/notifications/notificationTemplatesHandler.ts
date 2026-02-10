import {
  NotificationType,
  UserRole,
  UserExtraRole,
} from '../../types';
import { STORAGE_KEYS, USER_ROLES } from '../../constants';
import { logger } from '../../utils/logger';

export interface UnifiedNotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  variables: string[];
  priority: 'low' | 'normal' | 'high';
  isActive: boolean;
  targetRoles?: UserRole[];
  targetExtraRoles?: UserExtraRole[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export class NotificationTemplatesHandler {
  private templates: Map<string, UnifiedNotificationTemplate> = new Map();
  private defaultTemplates: Map<NotificationType, UnifiedNotificationTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
    this.loadTemplates();
  }

  private initializeDefaultTemplates(): void {
    const defaults: Record<NotificationType, UnifiedNotificationTemplate> = {
      announcement: {
        id: 'default-announcement',
        name: 'Default Announcement',
        type: 'announcement',
        title: '📢 {{title}}',
        body: '{{content}}',
        variables: ['title', 'content'],
        priority: 'normal',
        isActive: true,
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT, USER_ROLES.PARENT],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      grade: {
        id: 'default-grade',
        name: 'Default Grade Update',
        type: 'grade',
        title: '📊 Update Nilai: {{subject}}',
        body: 'Nilai {{assignment}} untuk {{studentName}} telah diperbarui: {{score}}/{{maxScore}}',
        variables: ['subject', 'assignment', 'studentName', 'score', 'maxScore'],
        priority: 'normal',
        isActive: true,
        targetRoles: [USER_ROLES.STUDENT, USER_ROLES.PARENT, USER_ROLES.TEACHER],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ppdb: {
        id: 'default-ppdb',
        name: 'Default PPDB Status',
        type: 'ppdb',
        title: '🎓 Status PPDB: {{status}}',
        body: 'Pendaftaran PPDB untuk {{studentName}} sekarang berstatus: {{status}}. Silakan cek portal untuk informasi lebih lanjut.',
        variables: ['status', 'studentName'],
        priority: 'high',
        isActive: true,
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.STUDENT, USER_ROLES.PARENT],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      event: {
        id: 'default-event',
        name: 'Default Event',
        type: 'event',
        title: '🎉 Kegiatan Baru: {{title}}',
        body: '{{description}}\\nTanggal: {{date}}\\nLokasi: {{location}}',
        variables: ['title', 'description', 'date', 'location'],
        priority: 'normal',
        isActive: true,
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT, USER_ROLES.PARENT],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      library: {
        id: 'default-library',
        name: 'Default Library Update',
        type: 'library',
        title: '📚 Materi Baru: {{title}}',
        body: 'Materi baru telah ditambahkan: {{description}}\\nKategori: {{category}}',
        variables: ['title', 'description', 'category'],
        priority: 'low',
        isActive: true,
        targetRoles: [USER_ROLES.TEACHER, USER_ROLES.STUDENT],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      system: {
        id: 'default-system',
        name: 'Default System',
        type: 'system',
        title: '⚙️ {{title}}',
        body: '{{message}}',
        variables: ['title', 'message'],
        priority: 'high',
        isActive: true,
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.STUDENT, USER_ROLES.PARENT],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ocr: {
        id: 'default-ocr',
        name: 'Default OCR Validation',
        type: 'ocr',
        title: '📄 OCR Validation {{severity}}',
        body: 'Document "{{documentType}}" validation {{result}}. Confidence: {{confidence}}%. Issues: {{issues}}',
        variables: ['severity', 'documentType', 'result', 'confidence', 'issues'],
        priority: 'normal',
        isActive: true,
        targetRoles: [USER_ROLES.ADMIN, USER_ROLES.TEACHER],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ocr_validation: {
        id: 'default-ocr-validation',
        name: 'Default OCR Validation Complete',
        type: 'ocr_validation',
        title: '🔍 OCR Validation Complete',
        body: 'Document "{{documentType}}" validation {{status}}. {{message}}',
        variables: ['documentType', 'status', 'message'],
        priority: 'normal',
        isActive: true,
        targetRoles: [USER_ROLES.PARENT, USER_ROLES.ADMIN, USER_ROLES.TEACHER],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      missing_grades: {
        id: 'default-missing-grades',
        name: 'Default Missing Grades Alert',
        type: 'missing_grades',
        title: '⚠️ Missing Grades Alert',
        body: '{{studentName}} has potentially missing grades in {{missingCount}} subject(s): {{subjects}}',
        variables: ['studentName', 'missingCount', 'subjects'],
        priority: 'high',
        isActive: true,
        targetRoles: [USER_ROLES.PARENT],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      progress_report: {
        id: 'default-progress-report',
        name: 'Default Progress Report',
        type: 'progress_report',
        title: '📊 Laporan Progres Belajar Baru',
        body: 'Laporan progres belajar untuk {{studentName}} telah tersedia. Rata-rata nilai: {{averageScore}}, Kehadiran: {{attendancePercentage}}%',
        variables: ['studentName', 'averageScore', 'attendancePercentage'],
        priority: 'normal',
        isActive: true,
        targetRoles: [USER_ROLES.PARENT],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    Object.values(defaults).forEach(template => {
      this.defaultTemplates.set(template.type, template);
      this.templates.set(template.id, template);
    });
  }

  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_TEMPLATES, JSON.stringify(templates));
    } catch (error) {
      logger.error('Failed to save notification templates:', error);
    }
  }

  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_TEMPLATES);
      if (stored) {
        const templates: UnifiedNotificationTemplate[] = JSON.parse(stored);
        templates.forEach(template => this.templates.set(template.id, template));
      }
    } catch (error) {
      logger.error('Failed to load notification templates:', error);
    }
  }

  createTemplate(
    name: string,
    type: NotificationType,
    title: string,
    body: string,
    currentUser: { id: string } | null,
    variables: string[] = [],
    targetRoles?: UserRole[],
    targetExtraRoles?: UserExtraRole[]
  ): UnifiedNotificationTemplate {
    const template: UnifiedNotificationTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      type,
      title,
      body,
      variables,
      priority: 'normal',
      isActive: true,
      targetRoles,
      targetExtraRoles,
      createdBy: currentUser?.id || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(template.id, template);
    this.saveTemplates();
    logger.info('Notification template created:', template.id);
    return template;
  }

  getTemplate(templateId: string): UnifiedNotificationTemplate | null {
    return this.templates.get(templateId) || this.defaultTemplates.get(templateId as NotificationType) || null;
  }

  setTemplate(template: UnifiedNotificationTemplate): void {
    this.templates.set(template.id, template);
    this.saveTemplates();
    logger.info('Notification template updated:', template.id);
  }

  deleteTemplate(templateId: string): boolean {
    const existed = this.templates.delete(templateId);
    if (existed) {
      this.saveTemplates();
      logger.info('Notification template deleted:', templateId);
    }
    return existed;
  }

  getTemplates(): UnifiedNotificationTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }

  createNotificationFromTemplate(
    templateId: string,
    variables: Record<string, string | number> = {}
  ) {
    const template = this.getTemplate(templateId);
    if (!template || !template.isActive) {
      logger.error('Template not found or inactive:', templateId);
      return null;
    }

    let title = template.title;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), String(value));
      body = body.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: template.type,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false,
      priority: template.priority,
      targetRoles: template.targetRoles,
      targetExtraRoles: template.targetExtraRoles,
      data: { templateId, variables },
    };
  }

  cleanup(): void {
    this.templates.clear();
    this.defaultTemplates.clear();
    this.saveTemplates();
    logger.info('Notification templates handler cleaned up');
  }
}
