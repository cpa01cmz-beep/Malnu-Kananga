import {
  PushNotification,
  NotificationHistoryItem,
} from '../../types';
import { STORAGE_KEYS, NOTIFICATION_CONFIG } from '../../constants';
import { logger } from '../../utils/logger';

export class NotificationHistoryHandler {
  private history: NotificationHistoryItem[] = [];

  constructor() {
    this.loadHistory();
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
        if (this.history.length > NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
          this.history = this.history.slice(-NOTIFICATION_CONFIG.MAX_HISTORY_SIZE);
        }
      }
    } catch (error) {
      logger.error('Failed to load notification history:', error);
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.NOTIFICATION_HISTORY_KEY,
        JSON.stringify(this.history)
      );
    } catch (error) {
      logger.error('Failed to save notification history:', error);
    }
  }

  addToHistory(notification: PushNotification): void {
    try {
      const historyItem: NotificationHistoryItem = {
        id: notification.id,
        notification,
        clicked: false,
        dismissed: false,
        deliveredAt: new Date().toISOString(),
      };

      this.history.push(historyItem);

      if (this.history.length > NOTIFICATION_CONFIG.MAX_HISTORY_SIZE) {
        this.history.shift();
      }

      this.saveHistory();
    } catch (error) {
      logger.error('Failed to add notification to history:', error);
    }
  }

  getUnifiedHistory(limit: number = 20): NotificationHistoryItem[] {
    try {
      return this.history.slice(-limit);
    } catch (error) {
      logger.error('Failed to get notification history:', error);
      return [];
    }
  }

  markAsRead(notificationId: string): void {
    try {
      const updatedHistory = this.history.map((item) => {
        if (item.id === notificationId) {
          return {
            ...item,
            notification: {
              ...item.notification,
              read: true,
            },
          };
        }
        return item;
      });

      this.history = updatedHistory;
      this.saveHistory();
      logger.info('Notification marked as read:', notificationId);
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
    }
  }

  deleteFromHistory(notificationId: string): void {
    try {
      this.history = this.history.filter((item) => item.id !== notificationId);
      this.saveHistory();
      logger.info('Notification deleted from history:', notificationId);
    } catch (error) {
      logger.error('Failed to delete notification from history:', error);
    }
  }

  clearUnifiedHistory(): void {
    try {
      this.history = [];
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_HISTORY_KEY);
      logger.info('Notification history cleared');
    } catch (error) {
      logger.error('Failed to clear notification history:', error);
    }
  }

  cleanup(): void {
    this.history = [];
    this.clearUnifiedHistory();
    logger.info('Notification history handler cleaned up');
  }
}
