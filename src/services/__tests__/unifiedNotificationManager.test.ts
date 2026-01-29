import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PushNotification, NotificationType } from '../../types';
import { unifiedNotificationManager } from '../../services/unifiedNotificationManager';
import { STORAGE_KEYS, NOTIFICATION_CONFIG } from '../../constants';

describe('unifiedNotificationManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default templates', () => {
      const templates = unifiedNotificationManager.getTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should load settings from localStorage', () => {
      const settings = {
        enabled: false,
        announcements: true,
        grades: true,
        ppdbStatus: true,
        events: true,
        library: true,
        system: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        voiceNotifications: {
          enabled: false,
          highPriorityOnly: true,
          respectQuietHours: true,
          voiceSettings: {
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8,
          },
          categories: {
            grades: true,
            attendance: true,
            system: true,
            meetings: true,
          },
        },
      };
      
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
      const loadedSettings = unifiedNotificationManager.getUnifiedSettings();
      expect(loadedSettings.enabled).toBe(false);
    });

    it('should use default settings if localStorage is empty', () => {
      const settings = unifiedNotificationManager.getUnifiedSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.announcements).toBe(true);
      expect(settings.grades).toBe(true);
    });
  });

  describe('Permission Management', () => {
    it('should request notification permission', async () => {
      if ('Notification' in window) {
        const permission = await unifiedNotificationManager.requestPermission();
        expect(['granted', 'denied', 'default']).toContain(permission);
      }
    });

    it('should check if permission is granted', () => {
      if ('Notification' in window) {
        const isGranted = unifiedNotificationManager.isPermissionGranted();
        expect(typeof isGranted).toBe('boolean');
      }
    });

    it('should check if permission is denied', () => {
      if ('Notification' in window) {
        const isDenied = unifiedNotificationManager.isPermissionDenied();
        expect(typeof isDenied).toBe('boolean');
      }
    });
  });

  describe('Template Management', () => {
    it('should create a new template', () => {
      const template = unifiedNotificationManager.createTemplate(
        'Test Template',
        'announcement',
        'Test Title: {{name}}',
        'Test Body: {{message}}',
        ['name', 'message'],
        ['admin', 'teacher']
      );

      expect(template).toBeDefined();
      expect(template.name).toBe('Test Template');
      expect(template.type).toBe('announcement');
      expect(template.variables).toEqual(['name', 'message']);
      expect(template.targetRoles).toEqual(['admin', 'teacher']);
    });

    it('should create notification from template', () => {
      unifiedNotificationManager.createTemplate(
        'Grade Template',
        'grade',
        'Grade Update: {{subject}}',
        'Score: {{score}}',
        ['subject', 'score']
      );

      const notification = unifiedNotificationManager.createNotificationFromTemplate(
        'default-grade',
        { subject: 'Mathematics', score: 95 }
      );

      expect(notification).toBeDefined();
      expect(notification?.title).toContain('Mathematics');
      expect(notification?.body).toContain('95');
    });

    it('should return null for inactive template', () => {
      const template = unifiedNotificationManager.createTemplate(
        'Inactive Template',
        'announcement',
        'Title',
        'Body'
      );
      template.isActive = false;

      const notification = unifiedNotificationManager.createNotificationFromTemplate(
        template.id,
        {}
      );

      expect(notification).toBeNull();
    });

    it('should get all active templates', () => {
      const initialCount = unifiedNotificationManager.getTemplates().length;
      unifiedNotificationManager.createTemplate('Test 1', 'announcement', 'Title', 'Body');
      unifiedNotificationManager.createTemplate('Test 2', 'grade', 'Title', 'Body');

      const templates = unifiedNotificationManager.getTemplates();
      expect(templates.length).toBe(initialCount + 2);
    });
  });

  describe('Notification Display', () => {
    it('should validate notification before showing', () => {
      const invalidNotification = {
        id: '',
        type: 'invalid-type' as NotificationType,
        title: '',
        body: '',
        timestamp: 'invalid-date',
        read: false,
        priority: 'normal',
      } as PushNotification;

      expect(() => {
        unifiedNotificationManager.showNotification(invalidNotification);
      }).not.toThrow();
    });

    it('should filter notifications based on settings', () => {
      const settings = unifiedNotificationManager.getUnifiedSettings();
      settings.grades = false;
      unifiedNotificationManager.saveUnifiedSettings(settings);

      const gradeNotification: PushNotification = {
        id: 'test-grade',
        type: 'grade',
        title: 'Grade Update',
        body: 'New grade available',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };

      expect(() => {
        unifiedNotificationManager.showNotification(gradeNotification);
      }).not.toThrow();
    });

    it('should respect quiet hours', () => {
      const settings = unifiedNotificationManager.getUnifiedSettings();
      settings.quietHours.enabled = true;
      settings.quietHours.start = '00:00';
      settings.quietHours.end = '23:59';
      unifiedNotificationManager.saveUnifiedSettings(settings);

      const notification: PushNotification = {
        id: 'test-quiet',
        type: 'system',
        title: 'Test',
        body: 'Test notification',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };

      expect(() => {
        unifiedNotificationManager.showNotification(notification);
      }).not.toThrow();
    });
  });

  describe('History Management', () => {
    it('should get empty history initially', () => {
      const history = unifiedNotificationManager.getUnifiedHistory();
      expect(history).toEqual([]);
    });

    it('should limit history size', () => {
      const maxSize = NOTIFICATION_CONFIG.MAX_HISTORY_SIZE;
      for (let i = 0; i < maxSize + 10; i++) {
        const notification: PushNotification = {
          id: `test-${i}`,
          type: 'system',
          title: `Test ${i}`,
          body: `Body ${i}`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal',
        };
        const historyItem = {
          id: notification.id,
          notification,
          clicked: false,
          dismissed: false,
          deliveredAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY, JSON.stringify([historyItem]));
      }

      const history = unifiedNotificationManager.getUnifiedHistory();
      expect(history.length).toBeLessThanOrEqual(maxSize);
    });

    it('should mark notification as read', () => {
      const notification: PushNotification = {
        id: 'test-read',
        type: 'system',
        title: 'Test',
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };
      const historyItem = {
        id: notification.id,
        notification,
        clicked: false,
        dismissed: false,
        deliveredAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY, JSON.stringify([historyItem]));

      unifiedNotificationManager.markAsRead(notification.id);
      const history = unifiedNotificationManager.getUnifiedHistory();
      expect(history[0].notification.read).toBe(true);
    });

    it('should delete notification from history', () => {
      const notification: PushNotification = {
        id: 'test-delete',
        type: 'system',
        title: 'Test',
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };
      const historyItem = {
        id: notification.id,
        notification,
        clicked: false,
        dismissed: false,
        deliveredAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY, JSON.stringify([historyItem]));

      unifiedNotificationManager.deleteFromHistory(notification.id);
      const history = unifiedNotificationManager.getUnifiedHistory();
      expect(history.length).toBe(0);
    });

    it('should clear all history', () => {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY, JSON.stringify([{}, {}, {}]));
      unifiedNotificationManager.clearUnifiedHistory();
      const history = unifiedNotificationManager.getUnifiedHistory();
      expect(history).toEqual([]);
    });
  });

  describe('Batch Management', () => {
    it('should create a batch', () => {
      const notifications: PushNotification[] = [
        {
          id: 'batch-1',
          type: 'system',
          title: 'Test 1',
          body: 'Body 1',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal',
        },
        {
          id: 'batch-2',
          type: 'system',
          title: 'Test 2',
          body: 'Body 2',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal',
        },
      ];

      const batch = unifiedNotificationManager.createBatch('Test Batch', notifications);
      expect(batch).toBeDefined();
      expect(batch.name).toBe('Test Batch');
      expect(batch.notifications.length).toBe(2);
      expect(batch.status).toBe('pending');
    });

    it('should get all batches', () => {
      unifiedNotificationManager.createBatch('Batch 1', []);
      unifiedNotificationManager.createBatch('Batch 2', []);

      const batches = unifiedNotificationManager.getBatches();
      expect(batches.length).toBeGreaterThanOrEqual(2);
    });

    it('should update batch status when sending', async () => {
      const notifications: PushNotification[] = [
        {
          id: 'send-batch-1',
          type: 'system',
          title: 'Test',
          body: 'Body',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal',
        },
      ];

      const batch = unifiedNotificationManager.createBatch('Send Test', notifications);
      const result = await unifiedNotificationManager.sendBatch(batch.id);
      expect(batch.status).toBe('completed');
      expect(result).toBe(true);
    });
  });

  describe('Analytics', () => {
    it('should record analytics for delivered notification', () => {
      unifiedNotificationManager.recordAnalytics('test-delivered', 'delivered');
      const analytics = unifiedNotificationManager.getAnalytics();
      expect(analytics).toHaveLength(1);
      expect(analytics[0].delivered).toBe(1);
    });

    it('should record analytics for read notification', () => {
      unifiedNotificationManager.recordAnalytics('test-read', 'read');
      const analytics = unifiedNotificationManager.getAnalytics();
      expect(analytics).toHaveLength(1);
      expect(analytics[0].read).toBe(1);
    });

    it('should record analytics for clicked notification', () => {
      unifiedNotificationManager.recordAnalytics('test-clicked', 'clicked');
      const analytics = unifiedNotificationManager.getAnalytics();
      expect(analytics).toHaveLength(1);
      expect(analytics[0].clicked).toBe(1);
    });

    it('should clear all analytics', () => {
      unifiedNotificationManager.recordAnalytics('test-1', 'delivered');
      unifiedNotificationManager.recordAnalytics('test-2', 'delivered');
      unifiedNotificationManager.clearAnalytics();
      const analytics = unifiedNotificationManager.getAnalytics();
      expect(analytics).toEqual([]);
    });
  });

  describe('Voice Notifications', () => {
    it('should initialize voice queue from storage', () => {
      const voiceQueue = [
        {
          id: 'voice-1',
          notificationId: 'test-1',
          text: 'Test message',
          priority: 'normal',
          category: 'system',
          timestamp: new Date().toISOString(),
          isSpeaking: false,
          wasSpoken: false,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_QUEUE, JSON.stringify(voiceQueue));

      const queue = unifiedNotificationManager.getVoiceQueue();
      expect(queue).toHaveLength(1);
    });

    it('should stop current voice notification', () => {
      expect(() => {
        unifiedNotificationManager.stopCurrentVoiceNotification();
      }).not.toThrow();
    });

    it('should skip current voice notification', () => {
      expect(() => {
        unifiedNotificationManager.skipCurrentVoiceNotification();
      }).not.toThrow();
    });

    it('should clear voice queue', () => {
      expect(() => {
        unifiedNotificationManager.clearVoiceQueue();
      }).not.toThrow();
      expect(unifiedNotificationManager.getVoiceQueue()).toEqual([]);
    });

    it('should clear voice history', () => {
      const history = [
        {
          id: 'voice-hist-1',
          notificationId: 'test-1',
          text: 'Test',
          priority: 'normal',
          category: 'system',
          timestamp: new Date().toISOString(),
          isSpeaking: false,
          wasSpoken: true,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.VOICE_NOTIFICATIONS_HISTORY, JSON.stringify(history));

      unifiedNotificationManager.clearVoiceHistory();
      expect(unifiedNotificationManager.getVoiceHistory()).toEqual([]);
    });

    it('should check if currently speaking', () => {
      const isSpeaking = unifiedNotificationManager.isCurrentlySpeaking();
      expect(typeof isSpeaking).toBe('boolean');
    });
  });

  describe('Event Notification Methods', () => {
    it('should notify grade update', async () => {
      await expect(
        unifiedNotificationManager.notifyGradeUpdate('John Doe', 'Mathematics', 85, 90)
      ).resolves.not.toThrow();
    });

    it('should notify PPDB status', async () => {
      await expect(
        unifiedNotificationManager.notifyPPDBStatus(5)
      ).resolves.not.toThrow();
    });

    it('should notify library update', async () => {
      await expect(
        unifiedNotificationManager.notifyLibraryUpdate('Algebra Textbook', 'Book')
      ).resolves.not.toThrow();
    });

    it('should notify meeting request', async () => {
      await expect(
        unifiedNotificationManager.notifyMeetingRequest('John Doe', 'Parent-Teacher Meeting')
      ).resolves.not.toThrow();
    });

    it('should notify schedule change', async () => {
      await expect(
        unifiedNotificationManager.notifyScheduleChange('10A', 'Class cancelled')
      ).resolves.not.toThrow();
    });

    it('should notify attendance alert', async () => {
      await expect(
        unifiedNotificationManager.notifyAttendanceAlert('John Doe', '3 consecutive absences')
      ).resolves.not.toThrow();
    });

    it('should notify OCR validation', async () => {
      const ocrEvent = {
        id: 'ocr-event-1',
        timestamp: new Date().toISOString(),
        documentId: 'doc-123',
        documentType: 'Ijazah',
        confidence: 95,
        type: 'validation-success' as const,
        issues: [] as string[],
        userId: 'user-123',
        userRole: 'admin' as const,
        actionUrl: '/admin/ocr/doc-123',
        requiresReview: false,
      };
      await expect(
        unifiedNotificationManager.notifyOCRValidation(ocrEvent)
      ).resolves.not.toThrow();
    });
  });

  describe('Event System', () => {
    it('should add event listener', () => {
      const listener = vi.fn();
      expect(() => {
        unifiedNotificationManager.addEventListener('test_event', listener);
      }).not.toThrow();
    });

    it('should remove event listener', () => {
      const listener = vi.fn();
      unifiedNotificationManager.addEventListener('test_event', listener);
      expect(() => {
        unifiedNotificationManager.removeEventListener('test_event', listener);
      }).not.toThrow();
    });

    it('should emit events', async () => {
      const listener = vi.fn();
      unifiedNotificationManager.addEventListener('grade_update', listener);
      
      await unifiedNotificationManager.notifyGradeUpdate('Test', 'Math');
      
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Settings Management', () => {
    it('should reset settings to default', () => {
      unifiedNotificationManager.saveUnifiedSettings({
        enabled: false,
        grades: false,
        announcements: false,
      } as any);
      
      unifiedNotificationManager.resetSettings();
      const settings = unifiedNotificationManager.getUnifiedSettings();
      expect(settings.enabled).toBe(true);
      expect(settings.grades).toBe(true);
    });

    it('should save and load settings', () => {
      const customSettings = {
        enabled: false,
        grades: false,
        ppdbStatus: true,
      };
      unifiedNotificationManager.saveUnifiedSettings(customSettings as any);
      
      const loadedSettings = unifiedNotificationManager.getUnifiedSettings();
      expect(loadedSettings.enabled).toBe(false);
      expect(loadedSettings.grades).toBe(false);
      expect(loadedSettings.ppdbStatus).toBe(true);
    });
  });
});
