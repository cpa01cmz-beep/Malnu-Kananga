import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotificationTemplateService,
  NotificationTemplateContext,
  NOTIFICATION_TEMPLATES,
} from '../notificationTemplates';
import { NotificationType } from '../../types';
import { logger } from '../../utils/logger';

describe('notificationTemplates', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('NOTIFICATION_TEMPLATES constant', () => {
    it('should have 10 notification templates', () => {
      const templateCount = Object.keys(NOTIFICATION_TEMPLATES).length;
      expect(templateCount).toBe(10);
    });

    it('should have all required notification types', () => {
      const expectedTypes: NotificationType[] = [
        'announcement',
        'grade',
        'ppdb',
        'event',
        'library',
        'system',
        'ocr',
        'ocr_validation',
        'missing_grades',
        'progress_report',
      ];

      expectedTypes.forEach(type => {
        expect(NOTIFICATION_TEMPLATES[type]).toBeDefined();
        expect(NOTIFICATION_TEMPLATES[type].type).toBe(type);
      });
    });

    it('should have valid template structure for all types', () => {
      Object.values(NOTIFICATION_TEMPLATES).forEach(template => {
        expect(template).toHaveProperty('type');
        expect(template).toHaveProperty('titleTemplate');
        expect(template).toHaveProperty('bodyTemplate');
        expect(template).toHaveProperty('targetRoles');
        expect(template).toHaveProperty('priority');
        expect(Array.isArray(template.targetRoles)).toBe(true);
      });
    });
  });

  describe('NotificationTemplateService.generateNotification', () => {
    it('should generate announcement notification', () => {
      const context: NotificationTemplateContext = {
        title: 'School Closed',
        content: 'School will be closed tomorrow due to maintenance.',
      };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('📢 School Closed');
      expect(notification?.body).toBe('School will be closed tomorrow due to maintenance.');
      expect(notification?.type).toBe('announcement');
      expect(notification?.priority).toBe('normal');
    });

    it('should generate grade notification', () => {
      const context: NotificationTemplateContext = {
        subject: 'Mathematics',
        assignment: 'Midterm Exam',
        studentName: 'John Doe',
        score: 85,
        maxScore: 100,
      };

      const notification = NotificationTemplateService.generateNotification('grade', context, 'student');

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('📊 Update Nilai: Mathematics');
      expect(notification?.body).toBe('Nilai Midterm Exam untuk John Doe telah diperbarui: 85/100');
      expect(notification?.data?.subject).toBe('Mathematics');
    });

    it('should generate PPDB notification', () => {
      const context: NotificationTemplateContext = {
        status: 'Approved',
        studentName: 'Jane Smith',
      };

      const notification = NotificationTemplateService.generateNotification('ppdb', context, 'parent');

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('🎓 Status PPDB: Approved');
      expect(notification?.body).toContain('Jane Smith');
      expect(notification?.body).toContain('Approved');
      expect(notification?.priority).toBe('high');
    });

    it('should generate event notification', () => {
      const context: NotificationTemplateContext = {
        title: 'Sports Day',
        description: 'Annual sports competition',
        date: '2026-02-15',
        location: 'School Field',
      };

      const notification = NotificationTemplateService.generateNotification('event', context);

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('🎉 Kegiatan Baru: Sports Day');
      expect(notification?.body).toContain('Annual sports competition');
      expect(notification?.body).toContain('2026-02-15');
      expect(notification?.body).toContain('School Field');
    });

    it('should generate library notification', () => {
      const context: NotificationTemplateContext = {
        title: 'Advanced Calculus',
        description: 'Comprehensive calculus textbook',
        category: 'Mathematics',
      };

      const notification = NotificationTemplateService.generateNotification('library', context, 'student');

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('📚 Materi Baru: Advanced Calculus');
      expect(notification?.priority).toBe('low');
    });

    it('should generate system notification', () => {
      const context: NotificationTemplateContext = {
        title: 'Maintenance Scheduled',
        message: 'System maintenance will occur at 10 PM',
      };

      const notification = NotificationTemplateService.generateNotification('system', context);

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('⚙️ Maintenance Scheduled');
      expect(notification?.body).toBe('System maintenance will occur at 10 PM');
      expect(notification?.priority).toBe('high');
    });

    it('should generate OCR notification', () => {
      const context: NotificationTemplateContext = {
        severity: 'Warning',
        documentType: 'Attendance Sheet',
        result: 'failed',
        confidence: 45,
        issues: 'Low confidence in student names',
      };

      const notification = NotificationTemplateService.generateNotification('ocr', context, 'teacher');

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('📄 OCR Validation Warning');
      expect(notification?.body).toContain('Attendance Sheet');
      expect(notification?.body).toContain('45');
    });

    it('should generate OCR validation notification', () => {
      const context: NotificationTemplateContext = {
        documentType: 'PPDB Form',
        status: 'completed',
        message: 'All fields validated successfully',
      };

      const notification = NotificationTemplateService.generateNotification('ocr_validation', context);

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('🔍 OCR Validation Complete');
      expect(notification?.body).toContain('PPDB Form');
      expect(notification?.body).toContain('completed');
    });

    it('should generate missing grades notification', () => {
      const context: NotificationTemplateContext = {
        studentName: 'Alice Johnson',
        missingCount: 3,
        subjects: 'Mathematics, Physics, Chemistry',
      };

      const notification = NotificationTemplateService.generateNotification('missing_grades', context, 'parent');

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('⚠️ Missing Grades Alert');
      expect(notification?.body).toContain('Alice Johnson');
      expect(notification?.body).toContain('3');
      expect(notification?.priority).toBe('high');
    });

    it('should return null for invalid notification type', () => {
      const context: NotificationTemplateContext = { title: 'Test' };

      const notification = NotificationTemplateService.generateNotification(
        'invalid_type' as NotificationType,
        context
      );

      expect(notification).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return null if user role is not in target roles', () => {
      const context: NotificationTemplateContext = { title: 'Test' };

      const notification = NotificationTemplateService.generateNotification('library', context, 'parent');

      expect(notification).toBeNull();
      expect(logger.info).toHaveBeenCalled();
    });

    it('should generate notification without user role filter', () => {
      const context: NotificationTemplateContext = {
        title: 'School Closed',
        content: 'School closed tomorrow',
      };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification).not.toBeNull();
    });

    it('should handle missing context values gracefully', () => {
      const context: NotificationTemplateContext = {
        title: 'School Closed',
      };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('📢 School Closed');
      expect(notification?.body).toBe('{content}');
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should generate unique notification ID', () => {
      const context: NotificationTemplateContext = { title: 'Test', content: 'Test content' };

      const notification1 = NotificationTemplateService.generateNotification('announcement', context);
      const notification2 = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification1?.id).not.toBe(notification2?.id);
      expect(notification1?.id).toMatch(/^notif-announcement-\d+-[a-z0-9]+$/);
    });

    it('should include timestamp in generated notification', () => {
      const context: NotificationTemplateContext = { title: 'Test', content: 'Test' };
      const beforeTime = new Date().toISOString();

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification?.timestamp).toBeDefined();
      expect(new Date(notification?.timestamp || '').getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      );
    });

    it('should mark notification as unread', () => {
      const context: NotificationTemplateContext = { title: 'Test', content: 'Test' };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification?.read).toBe(false);
    });

    it('should merge template data with context data', () => {
      const context: NotificationTemplateContext = {
        title: 'School Closed',
        content: 'Maintenance',
        extraField: 'custom value',
      };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification?.data?.category).toBe('announcement');
      expect(notification?.data?.extraField).toBe('custom value');
    });
  });

  describe('NotificationTemplateService.getTemplatesByRole', () => {
    it('should return all templates for admin role', () => {
      const templates = NotificationTemplateService.getTemplatesByRole('admin');

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.targetRoles.includes('admin'))).toBe(true);
    });

    it('should return teacher-specific templates', () => {
      const templates = NotificationTemplateService.getTemplatesByRole('teacher');

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.targetRoles.includes('teacher'))).toBe(true);
    });

    it('should return student-specific templates', () => {
      const templates = NotificationTemplateService.getTemplatesByRole('student');

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.targetRoles.includes('student'))).toBe(true);
    });

    it('should return parent-specific templates', () => {
      const templates = NotificationTemplateService.getTemplatesByRole('parent');

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.targetRoles.includes('parent'))).toBe(true);
    });

    it('should not include templates not relevant to role', () => {
      const templates = NotificationTemplateService.getTemplatesByRole('parent');

      expect(templates.find(t => t.type === 'library')).toBeUndefined();
    });
  });

  describe('NotificationTemplateService.getRelevantNotificationTypes', () => {
    it('should return all notification types for admin', () => {
      const types = NotificationTemplateService.getRelevantNotificationTypes('admin');

      expect(types.length).toBeGreaterThan(0);
      expect(types).toContain('announcement');
      expect(types).toContain('ppdb');
      expect(types).toContain('event');
      expect(types).toContain('system');
      expect(types).toContain('ocr');
      expect(types).toContain('ocr_validation');
    });

    it('should return teacher-specific notification types', () => {
      const types = NotificationTemplateService.getRelevantNotificationTypes('teacher');

      expect(types).toContain('announcement');
      expect(types).toContain('grade');
      expect(types).toContain('library');
      expect(types).not.toContain('missing_grades');
    });

    it('should return student-specific notification types', () => {
      const types = NotificationTemplateService.getRelevantNotificationTypes('student');

      expect(types).toContain('announcement');
      expect(types).toContain('grade');
      expect(types).toContain('ppdb');
      expect(types).toContain('event');
      expect(types).toContain('library');
    });

    it('should return parent-specific notification types', () => {
      const types = NotificationTemplateService.getRelevantNotificationTypes('parent');

      expect(types).toContain('announcement');
      expect(types).toContain('grade');
      expect(types).toContain('ppdb');
      expect(types).toContain('missing_grades');
      expect(types).not.toContain('library');
    });
  });

  describe('template interpolation', () => {
    it('should interpolate all context values', () => {
      const context: NotificationTemplateContext = {
        title: 'Test Title',
        content: 'Test Content',
        studentName: 'John',
        subject: 'Math',
      };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification?.title).toBe('📢 Test Title');
      expect(notification?.body).toBe('Test Content');
    });

    it('should handle numeric context values', () => {
      const context: NotificationTemplateContext = {
        title: 'Grade Update',
        subject: 'Math',
        assignment: 'Final Exam',
        studentName: 'Jane',
        score: 95,
        maxScore: 100,
      };

      const notification = NotificationTemplateService.generateNotification('grade', context);

      expect(notification?.body).toContain('95/100');
    });

    it('should handle boolean context values', () => {
      const context: NotificationTemplateContext = {
        title: 'Test',
        content: 'Test',
        important: true,
      };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification?.data?.important).toBe(true);
    });

    it('should preserve unmatched placeholders', () => {
      const context: NotificationTemplateContext = {
        title: 'Test',
      };

      const notification = NotificationTemplateService.generateNotification('announcement', context);

      expect(notification?.body).toBe('{content}');
    });

    it('should handle empty context object', () => {
      const notification = NotificationTemplateService.generateNotification('announcement', {});

      expect(notification).not.toBeNull();
      expect(notification?.title).toContain('{title}');
      expect(notification?.body).toContain('{content}');
    });
  });
});
