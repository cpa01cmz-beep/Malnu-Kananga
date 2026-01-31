import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getEmailNotificationService } from '../emailNotificationService';
import type { PushNotification, NotificationType } from '../../types';
import { emailService } from '../emailService';
import { emailTemplatesService } from '../emailTemplates';

vi.mock('../emailService');
vi.mock('../emailTemplates');

describe('EmailNotificationService', () => {
  let emailNotificationService: ReturnType<typeof getEmailNotificationService>;
  const mockUserId = 'test-user-123';
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    vi.clearAllMocks();
    emailNotificationService = getEmailNotificationService(mockUserId);
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    emailNotificationService.destroy();
  });

  describe('getPreferences', () => {
    it('should return default preferences when none exist', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId);

      expect(preferences).not.toBeNull();
      expect(preferences?.userId).toBe(mockUserId);
      expect(preferences?.enabled).toBe(false);
      expect(preferences?.email).toBe('');
      expect(preferences?.notifications).toEqual({
        grade: true,
        announcement: true,
        ppdb: false,
        event: true,
        library: false,
        system: true,
        ocr: false,
        ocr_validation: false,
        missing_grades: true
      });
      expect(preferences?.quietHours).toEqual({
        enabled: false,
        start: '22:00',
        end: '07:00'
      });
      expect(preferences?.digestMode).toEqual({
        enabled: false,
        frequency: 'daily',
        time: '08:00'
      });
    });

    it('should return saved preferences', () => {
      const customPreferences = {
        userId: mockUserId,
        enabled: true,
        email: mockEmail,
        notifications: {
          grade: true,
          announcement: false,
          ppdb: true,
          event: true,
          library: true,
          system: false,
          ocr: false,
          ocr_validation: false,
          missing_grades: true
        },
        quietHours: {
          enabled: true,
          start: '21:00',
          end: '08:00'
        },
        digestMode: {
          enabled: true,
          frequency: 'daily' as const,
          time: '09:00'
        }
      };

      emailNotificationService.setPreferences(mockUserId, customPreferences);
      const retrieved = emailNotificationService.getPreferences(mockUserId);

      expect(retrieved).toEqual(customPreferences);
    });
  });

  describe('setPreferences', () => {
    it('should save preferences to localStorage', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = true;
      preferences.email = mockEmail;

      emailNotificationService.setPreferences(mockUserId, preferences);

      const retrieved = emailNotificationService.getPreferences(mockUserId);
      expect(retrieved?.enabled).toBe(true);
      expect(retrieved?.email).toBe(mockEmail);
    });
  });

  describe('isNotificationEnabled', () => {
    it('should return false when email notifications are disabled', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = false;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = emailNotificationService.isNotificationEnabled(mockUserId, 'grade');
      expect(result).toBe(false);
    });

    it('should return false when notification type is disabled', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = true;
      preferences.email = mockEmail;
      preferences.notifications.grade = false;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = emailNotificationService.isNotificationEnabled(mockUserId, 'grade');
      expect(result).toBe(false);
    });

    it('should return true when enabled and email is set', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = true;
      preferences.email = mockEmail;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = emailNotificationService.isNotificationEnabled(mockUserId, 'grade');
      expect(result).toBe(true);
    });
  });

  describe('isQuietHours', () => {
    it('should return false when quiet hours are disabled', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.quietHours!.enabled = false;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = emailNotificationService.isQuietHours(mockUserId);
      expect(result).toBe(false);
    });

    it('should return true during quiet hours (same day)', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.quietHours!.enabled = true;
      preferences.quietHours!.start = '22:00';
      preferences.quietHours!.end = '06:00';
      emailNotificationService.setPreferences(mockUserId, preferences);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-30T23:00:00'));

      const result = emailNotificationService.isQuietHours(mockUserId);
      expect(result).toBe(true);

      vi.useRealTimers();
    });

    it('should return false outside quiet hours', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.quietHours!.enabled = true;
      preferences.quietHours!.start = '22:00';
      preferences.quietHours!.end = '06:00';
      emailNotificationService.setPreferences(mockUserId, preferences);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-30T10:00:00'));

      const result = emailNotificationService.isQuietHours(mockUserId);
      expect(result).toBe(false);

      vi.useRealTimers();
    });

    it('should handle overnight quiet hours', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.quietHours!.enabled = true;
      preferences.quietHours!.start = '22:00';
      preferences.quietHours!.end = '06:00';
      emailNotificationService.setPreferences(mockUserId, preferences);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-30T03:00:00'));

      const result = emailNotificationService.isQuietHours(mockUserId);
      expect(result).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('shouldUseDigest', () => {
    it('should return true when digest mode is enabled', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.digestMode!.enabled = true;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = emailNotificationService.shouldUseDigest(mockUserId);
      expect(result).toBe(true);
    });

    it('should return false when digest mode is disabled', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.digestMode!.enabled = false;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = emailNotificationService.shouldUseDigest(mockUserId);
      expect(result).toBe(false);
    });
  });

  describe('sendNotificationEmail', () => {
    const mockNotification: PushNotification = {
      id: 'test-notif-123',
      type: 'grade',
      title: 'Test Grade Update',
      body: 'Student received a new grade',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      targetRoles: ['parent'],
      data: {
        type: 'grade_update',
        studentName: 'John Doe',
        subject: 'Math'
      }
    };

    beforeEach(() => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = true;
      preferences.email = mockEmail;
      emailNotificationService.setPreferences(mockUserId, preferences);

      vi.mocked(emailTemplatesService).getTemplate.mockReturnValue({
        id: 'grade-update-notification',
        name: 'Test Template',
        description: 'Test description',
        category: 'grades',
        subject: 'Grade Update',
        htmlContent: '<p>Test</p>',
        textContent: 'Test',
        variables: [],
        language: 'id',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      vi.mocked(emailTemplatesService).renderTemplate.mockReturnValue({
        html: '<p>Test HTML</p>',
        text: 'Test Text'
      });
    });

    it('should return success false when email notifications are disabled', async () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = false;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = await emailNotificationService.sendNotificationEmail(
        mockNotification,
        mockEmail,
        'Test User',
        mockUserId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Notification type disabled');
    });

    it('should send email via emailService', async () => {
      vi.mocked(emailService.sendTemplateEmail).mockResolvedValue({
        success: true,
        messageId: 'msg-123'
      });

      const result = await emailNotificationService.sendNotificationEmail(
        mockNotification,
        mockEmail,
        'Test User',
        mockUserId
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('msg-123');
      expect(emailService.sendTemplateEmail).toHaveBeenCalled();
    });

    it('should add to digest queue when digest mode is enabled', async () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.digestMode!.enabled = true;
      emailNotificationService.setPreferences(mockUserId, preferences);

      const result = await emailNotificationService.sendNotificationEmail(
        mockNotification,
        mockEmail,
        'Test User',
        mockUserId
      );

      expect(result.success).toBe(true);
      expect(result.error).toBe('Added to digest queue');
    });

    it('should return success false during quiet hours', async () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.quietHours!.enabled = true;
      preferences.quietHours!.start = '22:00';
      preferences.quietHours!.end = '06:00';
      emailNotificationService.setPreferences(mockUserId, preferences);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-30T23:00:00'));

      const result = await emailNotificationService.sendNotificationEmail(
        mockNotification,
        mockEmail,
        'Test User',
        mockUserId
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Quiet hours active');

      vi.useRealTimers();
    });
  });

  describe('getDeliveryHistory', () => {
    it('should return empty array initially', () => {
      const history = emailNotificationService.getDeliveryHistory(mockUserId);
      expect(history).toEqual([]);
    });

    it('should return delivery history', () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = true;
      preferences.email = mockEmail;
      emailNotificationService.setPreferences(mockUserId, preferences);

      localStorage.setItem(
        `malnu_email_notification_delivery_${mockUserId}`,
        JSON.stringify([
          {
            notificationId: 'notif-1',
            notificationType: 'grade',
            userId: mockUserId,
            email: mockEmail,
            messageId: 'msg-1',
            status: 'sent',
            timestamp: new Date().toISOString()
          }
        ])
      );

      const history = emailNotificationService.getDeliveryHistory(mockUserId);
      expect(history).toHaveLength(1);
      expect(history[0].notificationId).toBe('notif-1');
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics for delivery history', () => {
      const history = [
        {
          notificationId: 'notif-1',
          notificationType: 'grade' as NotificationType,
          userId: mockUserId,
          email: mockEmail,
          messageId: 'msg-1',
          status: 'delivered' as const,
          timestamp: new Date().toISOString()
        },
        {
          notificationId: 'notif-2',
          notificationType: 'grade' as NotificationType,
          userId: mockUserId,
          email: mockEmail,
          messageId: 'msg-2',
          status: 'sent' as const,
          timestamp: new Date().toISOString()
        },
        {
          notificationId: 'notif-3',
          notificationType: 'announcement' as NotificationType,
          userId: mockUserId,
          email: mockEmail,
          messageId: 'msg-3',
          status: 'failed' as const,
          timestamp: new Date().toISOString()
        }
      ];

      localStorage.setItem(
        `malnu_email_notification_delivery_${mockUserId}`,
        JSON.stringify(history)
      );

      const analytics = emailNotificationService.getAnalytics(mockUserId);
      expect(analytics.totalSent).toBe(3);
      expect(analytics.totalDelivered).toBe(1);
      expect(analytics.totalFailed).toBe(1);
      expect(analytics.deliveryRate).toBeCloseTo(33.33, 1);
      expect(analytics.byType).toEqual({
        grade: 2,
        announcement: 1
      });
    });
  });

  describe('testEmailNotification', () => {
    it('should send test notification', async () => {
      const preferences = emailNotificationService.getPreferences(mockUserId)!;
      preferences.enabled = true;
      preferences.email = mockEmail;
      emailNotificationService.setPreferences(mockUserId, preferences);

      vi.mocked(emailService.sendTemplateEmail).mockResolvedValue({
        success: true,
        messageId: 'test-msg-123'
      });

      const result = await emailNotificationService.testEmailNotification(
        mockUserId,
        mockEmail
      );

      expect(result.success).toBe(true);
      expect(emailService.sendTemplateEmail).toHaveBeenCalled();
    });
  });
});
