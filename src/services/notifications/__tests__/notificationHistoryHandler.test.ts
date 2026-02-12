import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationHistoryHandler } from '../notificationHistoryHandler';
import { STORAGE_KEYS, NOTIFICATION_CONFIG } from '../../../constants';
import { PushNotification } from '../../../types';

vi.mock('../../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('NotificationHistoryHandler', () => {
  let handler: NotificationHistoryHandler;

  const createMockNotification = (id: string): PushNotification => ({
    id,
    type: 'announcement',
    title: `Test Notification ${id}`,
    body: 'Test body',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'normal',
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    handler = new NotificationHistoryHandler();
  });

  afterEach(() => {
    handler.cleanup();
    vi.restoreAllMocks();
  });

  describe('addToHistory', () => {
    it('should add notification to history', () => {
      const notification = createMockNotification('notif-1');
      handler.addToHistory(notification);
      
      const history = handler.getUnifiedHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('notif-1');
    });

    it('should limit history size', () => {
      const maxSize = NOTIFICATION_CONFIG.MAX_HISTORY_SIZE;
      
      for (let i = 0; i <= maxSize; i++) {
        handler.addToHistory(createMockNotification(`notif-${i}`));
      }
      
      const history = handler.getUnifiedHistory();
      expect(history.length).toBeLessThanOrEqual(maxSize);
    });

    it('should maintain notification properties', () => {
      const notification = createMockNotification('notif-1');
      handler.addToHistory(notification);
      
      const history = handler.getUnifiedHistory();
      expect(history[0].notification).toEqual(notification);
      expect(history[0].clicked).toBe(false);
      expect(history[0].dismissed).toBe(false);
    });
  });

  describe('getUnifiedHistory', () => {
    it('should return empty array when no history', () => {
      const history = handler.getUnifiedHistory();
      expect(history).toEqual([]);
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        handler.addToHistory(createMockNotification(`notif-${i}`));
      }
      
      const history = handler.getUnifiedHistory(5);
      expect(history.length).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      const notification = createMockNotification('notif-1');
      handler.addToHistory(notification);
      
      handler.markAsRead('notif-1');
      
      const history = handler.getUnifiedHistory();
      expect(history[0].notification.read).toBe(true);
    });
  });

  describe('deleteFromHistory', () => {
    it('should delete notification from history', () => {
      handler.addToHistory(createMockNotification('notif-1'));
      handler.addToHistory(createMockNotification('notif-2'));
      
      handler.deleteFromHistory('notif-1');
      
      const history = handler.getUnifiedHistory();
      expect(history.length).toBe(1);
      expect(history[0].id).toBe('notif-2');
    });
  });

  describe('clearUnifiedHistory', () => {
    it('should clear all history', () => {
      handler.addToHistory(createMockNotification('notif-1'));
      handler.addToHistory(createMockNotification('notif-2'));
      
      handler.clearUnifiedHistory();
      
      const history = handler.getUnifiedHistory();
      expect(history).toEqual([]);
      
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY);
      expect(stored).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should clear history', () => {
      handler.addToHistory(createMockNotification('notif-1'));
      handler.cleanup();
      
      const history = handler.getUnifiedHistory();
      expect(history).toEqual([]);
    });
  });
});
