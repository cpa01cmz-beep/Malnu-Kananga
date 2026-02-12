import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationAnalyticsHandler } from '../notificationAnalyticsHandler';
import { STORAGE_KEYS } from '../../../constants';
import { USER_ROLES } from '../../../constants';

vi.mock('../../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('NotificationAnalyticsHandler', () => {
  let handler: NotificationAnalyticsHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    handler = new NotificationAnalyticsHandler();
  });

  afterEach(() => {
    handler.cleanup();
    vi.restoreAllMocks();
  });

  describe('recordAnalytics', () => {
    it('should record delivered analytics', () => {
      handler.recordAnalytics('notif-1', 'delivered', { role: USER_ROLES.STUDENT });
      
      const analytics = handler.getAnalytics();
      expect(analytics.length).toBe(1);
      expect(analytics[0].notificationId).toBe('notif-1');
      expect(analytics[0].delivered).toBe(1);
    });

    it('should record read analytics', () => {
      handler.recordAnalytics('notif-1', 'read', { role: USER_ROLES.TEACHER });
      
      const analytics = handler.getAnalytics();
      expect(analytics[0].read).toBe(1);
    });

    it('should record clicked analytics', () => {
      handler.recordAnalytics('notif-1', 'clicked', { role: USER_ROLES.PARENT });
      
      const analytics = handler.getAnalytics();
      expect(analytics[0].clicked).toBe(1);
    });

    it('should record dismissed analytics', () => {
      handler.recordAnalytics('notif-1', 'dismissed', { role: USER_ROLES.ADMIN });
      
      const analytics = handler.getAnalytics();
      expect(analytics[0].dismissed).toBe(1);
    });

    it('should increment existing analytics', () => {
      handler.recordAnalytics('notif-1', 'delivered', { role: USER_ROLES.STUDENT });
      handler.recordAnalytics('notif-1', 'read', { role: USER_ROLES.STUDENT });
      handler.recordAnalytics('notif-1', 'read', { role: USER_ROLES.TEACHER });
      
      const analytics = handler.getAnalytics();
      expect(analytics.length).toBe(1);
      expect(analytics[0].delivered).toBe(1);
      expect(analytics[0].read).toBe(2);
    });

    it('should track role breakdown', () => {
      handler.recordAnalytics('notif-1', 'read', { role: USER_ROLES.STUDENT });
      handler.recordAnalytics('notif-1', 'read', { role: USER_ROLES.STUDENT });
      handler.recordAnalytics('notif-1', 'read', { role: USER_ROLES.TEACHER });
      
      const analytics = handler.getAnalytics();
      expect(analytics[0].roleBreakdown[USER_ROLES.STUDENT]).toBe(2);
      expect(analytics[0].roleBreakdown[USER_ROLES.TEACHER]).toBe(1);
    });

    it('should handle null user', () => {
      handler.recordAnalytics('notif-1', 'delivered', null);
      
      const analytics = handler.getAnalytics();
      expect(analytics[0].delivered).toBe(1);
    });
  });

  describe('getAnalytics', () => {
    it('should return empty array when no analytics', () => {
      const analytics = handler.getAnalytics();
      expect(analytics).toEqual([]);
    });

    it('should return all analytics', () => {
      handler.recordAnalytics('notif-1', 'delivered', { role: USER_ROLES.STUDENT });
      handler.recordAnalytics('notif-2', 'delivered', { role: USER_ROLES.TEACHER });
      
      const analytics = handler.getAnalytics();
      expect(analytics.length).toBe(2);
    });
  });

  describe('clearAnalytics', () => {
    it('should clear all analytics', () => {
      handler.recordAnalytics('notif-1', 'delivered', { role: USER_ROLES.STUDENT });
      handler.clearAnalytics();
      
      const analytics = handler.getAnalytics();
      expect(analytics).toEqual([]);
      
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS);
      expect(stored).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should clear analytics and storage', () => {
      handler.recordAnalytics('notif-1', 'delivered', { role: USER_ROLES.STUDENT });
      handler.cleanup();
      
      const analytics = handler.getAnalytics();
      expect(analytics).toEqual([]);
    });
  });
});
