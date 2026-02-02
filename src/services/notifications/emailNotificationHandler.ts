import {
  PushNotification,
  UserRole,
  UserExtraRole,
  NotificationType,
} from '../../types';
import { STORAGE_KEYS } from '../../constants';
import { logger } from '../../utils/logger';
import { getEmailNotificationService } from '../emailNotificationService';

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

export class EmailNotificationHandler {
  private emailNotificationService = getEmailNotificationService();

  async sendEmailNotification(notification: PushNotification): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();

      if (!currentUser || !currentUser.email) {
        return;
      }

      const preferences = this.emailNotificationService.getPreferences(currentUser.id);

      if (!preferences || !preferences.enabled) {
        return;
      }

      await this.emailNotificationService.sendNotificationEmail(
        notification,
        currentUser.email,
        currentUser.name || currentUser.username,
        currentUser.id
      );

      logger.info('Email notification queued for:', notification.id);
    } catch (error) {
      logger.error('Failed to send email notification:', error);
    }
  }

  private getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  cleanup(): void {
    logger.info('Email notification handler cleaned up');
  }
}
