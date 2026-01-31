import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import ActivityFeed from '../ActivityFeed';
import { unifiedNotificationManager } from '../../services/unifiedNotificationManager';
import { STORAGE_KEYS, ACTIVITY_NOTIFICATION_CONFIG } from '../../constants';
import type { RealTimeEvent } from '../../services/webSocketService';

vi.mock('../../utils/logger', async (importActual: any) => {
  const actual = await importActual();
  return {
    ...actual,
    logger: {
      ...actual.logger,
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});

vi.mock('../../services/unifiedNotificationManager', async (importActual: any) => {
  const actual = await importActual();
  return {
    ...actual,
    unifiedNotificationManager: {
      ...actual.unifiedNotificationManager,
      getUnifiedSettings: vi.fn(() => ({
        enabled: true,
        grades: true,
        announcements: true,
        events: true,
        library: true,
        system: true,
        ppdbStatus: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        voiceNotifications: {
          enabled: true,
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
      })),
      showNotification: vi.fn().mockResolvedValue(undefined),
    },
  };
});

vi.mock('../../constants', async (importActual: any) => {
  const actual = await importActual();
  return {
    ...actual,
    STORAGE_KEYS: {
      ...actual.STORAGE_KEYS,
      ACTIVITY_FEED: 'malnu_activity_feed',
    },
  };
});

const mockWebSocketEvent = (type: string, entity: string, entityId: string): RealTimeEvent => ({
  type: type as any,
  entity,
  entityId,
  data: {},
  timestamp: new Date().toISOString(),
  userRole: 'teacher',
  userId: 'user-1',
});

describe('ActivityFeed with Notification Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Notification Triggering', () => {
    it('should trigger notification for high-priority event (grade_created)', async () => {
      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['grade_created']}
        />
      );

      const mockEvent = mockWebSocketEvent('grade_created', 'Grade', 'grade-1');
      const event = new CustomEvent('grade_created', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(unifiedNotificationManager.getUnifiedSettings).toHaveBeenCalled();
        expect(unifiedNotificationManager.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'grade',
            priority: 'high',
          })
        );
      });
    });

    it('should trigger notification for normal-priority event (library_material_added)', async () => {
      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['library_material_added']}
        />
      );

      const mockEvent = mockWebSocketEvent('library_material_added', 'Material', 'material-1');
      const event = new CustomEvent('library_material_added', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(unifiedNotificationManager.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'library',
            priority: 'normal',
          })
        );
      });
    });

    it('should trigger notification for low-priority event (announcement_updated)', async () => {
      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['announcement_updated']}
        />
      );

      const mockEvent = mockWebSocketEvent('announcement_updated', 'Announcement', 'announcement-1');
      const event = new CustomEvent('announcement_updated', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(unifiedNotificationManager.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'announcement',
            priority: 'low',
          })
        );
      });
    });
  });

  describe('Notification Filtering', () => {
    it('should not trigger notification when disabled in settings', async () => {
      vi.mocked(unifiedNotificationManager).getUnifiedSettings.mockReturnValue({
        enabled: false,
        grades: true,
        announcements: true,
        events: true,
        library: true,
        system: true,
        ppdbStatus: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        voiceNotifications: {
          enabled: true,
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
      });

      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['grade_created']}
        />
      );

      const mockEvent = mockWebSocketEvent('grade_created', 'Grade', 'grade-1');
      const event = new CustomEvent('grade_created', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(unifiedNotificationManager.getUnifiedSettings).toHaveBeenCalled();
        expect(unifiedNotificationManager.showNotification).not.toHaveBeenCalled();
      });
    });

    it('should not trigger notification for specific type when disabled in settings', async () => {
      vi.mocked(unifiedNotificationManager).getUnifiedSettings.mockReturnValue({
        enabled: true,
        grades: false,
        announcements: true,
        events: true,
        library: true,
        system: true,
        ppdbStatus: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        voiceNotifications: {
          enabled: true,
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
      });

      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['grade_created']}
        />
      );

      const mockEvent = mockWebSocketEvent('grade_created', 'Grade', 'grade-1');
      const event = new CustomEvent('grade_created', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(unifiedNotificationManager.getUnifiedSettings).toHaveBeenCalled();
        expect(unifiedNotificationManager.showNotification).not.toHaveBeenCalled();
      });
    });
  });

  describe('Notification Content', () => {
    it('should generate correct notification title for grade event', async () => {
      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['grade_created']}
        />
      );

      const mockEvent = mockWebSocketEvent('grade_created', 'Grade', 'grade-1');
      const event = new CustomEvent('grade_created', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(unifiedNotificationManager.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Nilai Baru',
          })
        );
      });
    });

    it('should generate correct notification body for grade event', async () => {
      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['grade_created']}
        />
      );

      const mockEvent = mockWebSocketEvent('grade_created', 'Grade', 'grade-1');
      const event = new CustomEvent('grade_created', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        expect(unifiedNotificationManager.showNotification).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.stringContaining('teacher - Grade'),
          })
        );
      });
    });
  });

  describe('ACTIVITY_NOTIFICATION_CONFIG', () => {
    it('should classify grade_created as high priority', () => {
      const priority = ACTIVITY_NOTIFICATION_CONFIG.getPriority('grade_created');
      expect(priority).toBe('high');
    });

    it('should classify library_material_added as normal priority', () => {
      const priority = ACTIVITY_NOTIFICATION_CONFIG.getPriority('library_material_added');
      expect(priority).toBe('normal');
    });

    it('should classify announcement_updated as low priority', () => {
      const priority = ACTIVITY_NOTIFICATION_CONFIG.getPriority('announcement_updated');
      expect(priority).toBe('low');
    });

    it('should map grade events to notification type "grade"', () => {
      const notificationType = ACTIVITY_NOTIFICATION_CONFIG.getNotificationType('grade_created');
      expect(notificationType).toBe('grade');
    });

    it('should map attendance events to notification type "system"', () => {
      const notificationType = ACTIVITY_NOTIFICATION_CONFIG.getNotificationType('attendance_updated');
      expect(notificationType).toBe('system');
    });

    it('should check notification settings correctly', () => {
      const settings = {
        enabled: true,
        grades: true,
        announcements: false,
        events: true,
        library: true,
        system: true,
        ppdbStatus: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        voiceNotifications: {
          enabled: true,
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

      const shouldTrigger = ACTIVITY_NOTIFICATION_CONFIG.shouldTriggerNotification('grade_created', settings);
      expect(shouldTrigger).toBe(true);

      const shouldNotTrigger = ACTIVITY_NOTIFICATION_CONFIG.shouldTriggerNotification('announcement_created', settings);
      expect(shouldNotTrigger).toBe(false);
    });
  });

  describe('Integration with ActivityFeed', () => {
    it('should store activities with isRead: false', async () => {
      render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['grade_created']}
        />
      );

      const mockEvent = mockWebSocketEvent('grade_created', 'Grade', 'grade-1');
      const event = new CustomEvent('grade_created', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_FEED);
        const activities = stored ? JSON.parse(stored) : [];
        expect(activities.length).toBeGreaterThan(0);
        expect(activities[0]).toHaveProperty('isRead', false);
      });
    });

    it('should update activities list on new event', async () => {
      const { container } = render(
        <ActivityFeed
          userId="user-1"
          userRole="teacher"
          eventTypes={['grade_created']}
        />
      );

      const mockEvent = mockWebSocketEvent('grade_created', 'Grade', 'grade-1');
      const event = new CustomEvent('grade_created', { detail: mockEvent });
      window.dispatchEvent(event);

      await waitFor(() => {
        const activityItems = container.querySelectorAll('[data-testid="activity-item"]');
        expect(activityItems.length).toBeGreaterThan(0);
      });
    });
  });
});
