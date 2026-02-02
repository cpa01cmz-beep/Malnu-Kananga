import {
  NotificationAnalytics,
  UserRole,
} from '../../types';
import { STORAGE_KEYS } from '../../constants';
import { logger } from '../../utils/logger';

export class NotificationAnalyticsHandler {
  private analytics: Map<string, NotificationAnalytics> = new Map();

  constructor() {
    this.loadAnalytics();
  }

  private saveAnalytics(): void {
    try {
      const analytics = Array.from(this.analytics.values());
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS, JSON.stringify(analytics));
    } catch (error) {
      logger.error('Failed to save notification analytics:', error);
    }
  }

  private loadAnalytics(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS);
      if (stored) {
        const analytics: NotificationAnalytics[] = JSON.parse(stored);
        analytics.forEach(analytic => this.analytics.set(analytic.notificationId, analytic));
      }
    } catch (error) {
      logger.error('Failed to load notification analytics:', error);
    }
  }

  recordAnalytics(
    notificationId: string,
    action: 'delivered' | 'read' | 'clicked' | 'dismissed',
    currentUser: { role: UserRole } | null
  ): void {
    const existing = this.analytics.get(notificationId);

    if (existing) {
      switch (action) {
        case 'delivered':
          existing.delivered++;
          break;
        case 'read':
          existing.read++;
          break;
        case 'clicked':
          existing.clicked++;
          break;
        case 'dismissed':
          existing.dismissed++;
          break;
      }
      if (currentUser) {
        const userRole = currentUser.role;
        existing.roleBreakdown[userRole] = (existing.roleBreakdown[userRole] || 0) + 1;
      }
    } else {
      const analytics: NotificationAnalytics = {
        id: `analytics-${notificationId}`,
        notificationId,
        delivered: action === 'delivered' ? 1 : 0,
        read: action === 'read' ? 1 : 0,
        clicked: action === 'clicked' ? 1 : 0,
        dismissed: action === 'dismissed' ? 1 : 0,
        timestamp: new Date().toISOString(),
        roleBreakdown: currentUser ? { [currentUser.role]: 1 } : {},
      };
      this.analytics.set(notificationId, analytics);
    }

    this.saveAnalytics();
  }

  getAnalytics(): NotificationAnalytics[] {
    try {
      return Array.from(this.analytics.values());
    } catch (error) {
      logger.error('Failed to get notification analytics:', error);
      return [];
    }
  }

  clearAnalytics(): void {
    try {
      this.analytics.clear();
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATION_ANALYTICS);
      logger.info('Notification analytics cleared');
    } catch (error) {
      logger.error('Failed to clear notification analytics:', error);
    }
  }

  cleanup(): void {
    this.analytics.clear();
    this.clearAnalytics();
    logger.info('Notification analytics handler cleaned up');
  }
}
