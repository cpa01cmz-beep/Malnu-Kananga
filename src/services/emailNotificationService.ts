import type {
  EmailRecipient,
  EmailSendOptions,
  EmailTemplateContext
} from '../types/email.types';
import type {
  NotificationType,
  PushNotification
} from '../types';
import { emailService } from './emailService';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';

export interface EmailNotificationPreferences {
  userId: string;
  enabled: boolean;
  email: string;
  notifications: {
    grade: boolean;
    announcement: boolean;
    ppdb: boolean;
    event: boolean;
    library: boolean;
    system: boolean;
    ocr: boolean;
    ocr_validation: boolean;
    missing_grades: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  digestMode?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    time: string; // HH:MM format
  };
}

export interface EmailDigestItem {
  notification: PushNotification;
  timestamp: string;
  templateId: string;
  context: EmailTemplateContext;
}

export interface EmailNotificationDelivery {
  notificationId: string;
  notificationType: NotificationType;
  userId: string;
  email: string;
  messageId: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  timestamp: string;
  error?: string;
}

const NOTIFICATION_TEMPLATE_MAP: Record<NotificationType, string> = {
  'announcement': 'announcement-notification',
  'grade': 'grade-update-notification',
  'ppdb': 'ppdb-notification',
  'event': 'event-reminder',
  'library': 'library-notification',
  'system': 'system-notification',
  'ocr': 'system-notification',
  'ocr_validation': 'system-notification',
  'missing_grades': 'missing-grades-notification'
};

class EmailNotificationService {
  private preferencesKey: string;
  private deliveryHistoryKey: string;
  private digestQueueKey: string;
  private digestQueue: Map<string, EmailDigestItem[]> = new Map();
  private digestInterval: number | null = null;

  constructor(userId?: string) {
    this.preferencesKey = userId 
      ? `malnu_email_notification_prefs_${userId}`
      : STORAGE_KEYS.EMAIL_NOTIFICATION_SETTINGS;
    this.deliveryHistoryKey = userId
      ? `malnu_email_notification_delivery_${userId}`
      : 'malnu_email_notification_delivery_history';
    this.digestQueueKey = userId
      ? `malnu_email_digest_queue_${userId}`
      : 'malnu_email_digest_queue';
    
    this.loadDigestQueue();
    this.initializeDigestScheduler();
  }

  private loadDigestQueue(): void {
    try {
      const stored = localStorage.getItem(this.digestQueueKey);
      if (stored) {
        const queues = JSON.parse(stored);
        Object.entries(queues).forEach(([userId, items]) => {
          this.digestQueue.set(userId, items as EmailDigestItem[]);
        });
        logger.info(`Loaded email digest queue for ${this.digestQueue.size} users`);
      }
    } catch (error) {
      logger.error('Failed to load email digest queue:', error);
    }
  }

  private saveDigestQueue(): void {
    try {
      const queues = Object.fromEntries(this.digestQueue);
      localStorage.setItem(this.digestQueueKey, JSON.stringify(queues));
    } catch (error) {
      logger.error('Failed to save email digest queue:', error);
    }
  }

  private initializeDigestScheduler(): void {
    const interval = 5 * 60 * 1000; // Check every 5 minutes
    
    this.digestInterval = window.setInterval(() => {
      this.processDigestQueues();
    }, interval);

    logger.info('Email digest scheduler initialized');
  }

  public destroy(): void {
    if (this.digestInterval !== null) {
      clearInterval(this.digestInterval);
      this.digestInterval = null;
      logger.info('Email digest scheduler destroyed');
    }
  }

  public getPreferences(userId: string): EmailNotificationPreferences | null {
    try {
      const key = `malnu_email_notification_prefs_${userId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }

      const defaults = this.getDefaultPreferences(userId);
      this.setPreferences(userId, defaults);
      return defaults;
    } catch (error) {
      logger.error(`Failed to load email preferences for user ${userId}:`, error);
      return null;
    }
  }

  private getDefaultPreferences(userId: string): EmailNotificationPreferences {
    return {
      userId,
      enabled: false,
      email: '',
      notifications: {
        grade: true,
        announcement: true,
        ppdb: false,
        event: true,
        library: false,
        system: true,
        ocr: false,
        ocr_validation: false,
        missing_grades: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      },
      digestMode: {
        enabled: false,
        frequency: 'daily',
        time: '08:00'
      }
    };
  }

  public setPreferences(userId: string, preferences: EmailNotificationPreferences): void {
    try {
      const key = `malnu_email_notification_prefs_${userId}`;
      localStorage.setItem(key, JSON.stringify(preferences));
      logger.info(`Email preferences saved for user ${userId}`);
    } catch (error) {
      logger.error(`Failed to save email preferences for user ${userId}:`, error);
    }
  }

  public isNotificationEnabled(
    userId: string,
    notificationType: NotificationType
  ): boolean {
    const preferences = this.getPreferences(userId);
    
    if (!preferences || !preferences.enabled || !preferences.email) {
      return false;
    }

    const typeKey = notificationType as keyof typeof preferences.notifications;
    return preferences.notifications[typeKey] ?? false;
  }

  public isQuietHours(userId: string): boolean {
    const preferences = this.getPreferences(userId);
    
    if (!preferences?.quietHours?.enabled) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const { start, end } = preferences.quietHours;
    
    if (start <= end) {
      return currentTime >= start && currentTime <= end;
    } else {
      return currentTime >= start || currentTime <= end;
    }
  }

  public shouldUseDigest(userId: string): boolean {
    const preferences = this.getPreferences(userId);
    return preferences?.digestMode?.enabled ?? false;
  }

  public async sendNotificationEmail(
    notification: PushNotification,
    recipientEmail: string,
    recipientName: string,
    userId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const notificationType = notification.type;
    
    if (!this.isNotificationEnabled(userId, notificationType)) {
      logger.info(`Email notification disabled for type ${notificationType} and user ${userId}`);
      return { success: false, error: 'Notification type disabled' };
    }

    if (this.isQuietHours(userId)) {
      logger.info(`Quiet hours active for user ${userId}, queuing email`);
      return { success: false, error: 'Quiet hours active' };
    }

    if (this.shouldUseDigest(userId)) {
      this.addToDigestQueue(userId, notification, recipientEmail, recipientName);
      return { success: true, error: 'Added to digest queue' };
    }

    return await this.sendImmediateEmail(notification, recipientEmail, recipientName, userId);
  }

  private async sendImmediateEmail(
    notification: PushNotification,
    recipientEmail: string,
    recipientName: string,
    userId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const templateId = NOTIFICATION_TEMPLATE_MAP[notification.type];
      
      const context: EmailTemplateContext = {
        recipientName,
        schoolName: 'MA Malnu Kananga',
        ...notification.data as Record<string, string | number>
      };

      const recipient: EmailRecipient = {
        email: recipientEmail,
        name: recipientName
      };

      const options: EmailSendOptions = {
        queueOffline: true,
        trackDelivery: true,
        priority: notification.priority
      };

      const result = await emailService.sendTemplateEmail(
        templateId,
        recipient,
        context as Record<string, string | number>,
        options
      );

      if (result.success) {
        this.recordDelivery({
          notificationId: notification.id,
          notificationType: notification.type,
          userId,
          email: recipientEmail,
          messageId: result.messageId || '',
          status: 'sent',
          timestamp: new Date().toISOString()
        });

        logger.info(`Email notification sent: ${notification.id} to ${recipientEmail}`);
      }

      return result;
    } catch (error) {
      logger.error('Failed to send notification email:', error);
      return { success: false, error: String(error) };
    }
  }

  private addToDigestQueue(
    userId: string,
    notification: PushNotification,
    recipientEmail: string,
    recipientName: string
  ): void {
    const templateId = NOTIFICATION_TEMPLATE_MAP[notification.type];

    const digestItem: EmailDigestItem = {
      notification,
      timestamp: new Date().toISOString(),
      templateId,
      context: {
        recipientName,
        schoolName: 'MA Malnu Kananga',
        ...notification.data as Record<string, string | number>
      }
    };

    if (!this.digestQueue.has(userId)) {
      this.digestQueue.set(userId, []);
    }

    this.digestQueue.get(userId)!.push(digestItem);
    this.saveDigestQueue();
    logger.info(`Added notification to digest queue for user ${userId}: ${notification.id}`);
  }

  private async processDigestQueues(): Promise<void> {
    for (const [userId, items] of this.digestQueue.entries()) {
      const preferences = this.getPreferences(userId);
      
      if (!preferences?.digestMode?.enabled) {
        continue;
      }

      const { frequency, time } = preferences.digestMode;
      const shouldSend = this.shouldSendDigestNow(frequency, time);

      if (shouldSend && items.length > 0) {
        await this.sendDigestEmail(userId, items);
        this.digestQueue.set(userId, []);
        this.saveDigestQueue();
      }
    }
  }

  private shouldSendDigestNow(frequency: 'daily' | 'weekly', time: string): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    if (frequency === 'daily') {
      return currentTime === time;
    } else if (frequency === 'weekly') {
      return currentDay === 1 && currentTime === time; // Monday at specified time
    }

    return false;
  }

  private async sendDigestEmail(userId: string, items: EmailDigestItem[]): Promise<void> {
    try {
      const preferences = this.getPreferences(userId);
      if (!preferences?.email) {
        return;
      }

      const groupedByType = this.groupNotificationsByType(items);
      
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Email Notifikasi - ${new Date().toLocaleDateString('id-ID')}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .section { margin: 15px 0; padding: 10px; background: #e0f2fe; border-radius: 5px; }
            .notification { margin: 10px 0; padding: 8px; background: white; border-left: 3px solid #2563eb; }
            .footer { background: #1f2937; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Ringkasan Notifikasi</h1>
              <p>${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="content">
      `;

      for (const [type, typeItems] of Object.entries(groupedByType)) {
        htmlContent += `
          <div class="section">
            <h3>${this.getTypeLabel(type as NotificationType)}</h3>
        `;

        for (const item of typeItems) {
          htmlContent += `
            <div class="notification">
              <p><strong>${item.notification.title}</strong></p>
              <p>${item.notification.body}</p>
              <small>${new Date(item.timestamp).toLocaleTimeString('id-ID')}</small>
            </div>
          `;
        }

        htmlContent += '</div>';
      }

      htmlContent += `
            </div>
            <div class="footer">
              <p>Email ini dikirim secara otomatis, jangan balas ke email ini.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailData = {
        to: { email: preferences.email },
        subject: `Ringkasan Notifikasi - ${new Date().toLocaleDateString('id-ID')}`,
        html: htmlContent,
        text: `Ringkasan Notifikasi - ${new Date().toLocaleDateString('id-ID')}\n\n${items.map(i => `- ${i.notification.title}: ${i.notification.body}`).join('\n')}`
      };

      await emailService.sendEmail(emailData, { queueOffline: true, trackDelivery: true });
      logger.info(`Digest email sent to user ${userId} with ${items.length} notifications`);
    } catch (error) {
      logger.error(`Failed to send digest email to user ${userId}:`, error);
    }
  }

  private groupNotificationsByType(items: EmailDigestItem[]): Record<string, EmailDigestItem[]> {
    const grouped: Record<string, EmailDigestItem[]> = {};
    
    for (const item of items) {
      const type = item.notification.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    }

    return grouped;
  }

  private getTypeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      'announcement': 'Pengumuman',
      'grade': 'Nilai',
      'ppdb': 'PPDB',
      'event': 'Acara',
      'library': 'Materi',
      'system': 'Sistem',
      'ocr': 'OCR',
      'ocr_validation': 'Validasi OCR',
      'missing_grades': 'Nilai Belum Ada'
    };

    return labels[type] || type;
  }

  private recordDelivery(delivery: EmailNotificationDelivery): void {
    try {
      const history = this.loadDeliveryHistory();
      history.push(delivery);

      const maxHistorySize = 1000;
      if (history.length > maxHistorySize) {
        history.splice(0, history.length - maxHistorySize);
      }

      localStorage.setItem(this.deliveryHistoryKey, JSON.stringify(history));
    } catch (error) {
      logger.error('Failed to record email notification delivery:', error);
    }
  }

  private loadDeliveryHistory(): EmailNotificationDelivery[] {
    try {
      const stored = localStorage.getItem(this.deliveryHistoryKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load delivery history:', error);
      return [];
    }
  }

  public getDeliveryHistory(userId?: string): EmailNotificationDelivery[] {
    const key = userId
      ? `malnu_email_notification_delivery_${userId}`
      : this.deliveryHistoryKey;
    
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load delivery history:', error);
      return [];
    }
  }

  public getAnalytics(userId?: string): {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    byType: Record<string, number>;
    dateRange: { from: string; to: string };
  } {
    const history = this.getDeliveryHistory(userId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recent = history.filter(
      d => new Date(d.timestamp) >= thirtyDaysAgo
    );

    const totalSent = recent.length;
    const totalFailed = recent.filter(d => d.status === 'failed').length;
    const totalDelivered = recent.filter(d => d.status === 'delivered').length;

    const byType: Record<string, number> = {};
    for (const delivery of recent) {
      const type = delivery.notificationType;
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      totalSent,
      totalDelivered,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      byType,
      dateRange: {
        from: thirtyDaysAgo.toISOString(),
        to: now.toISOString()
      }
    };
  }

  public testEmailNotification(userId: string, recipientEmail: string): Promise<{ success: boolean; error?: string }> {
    const testNotification: PushNotification = {
      id: `test-${Date.now()}`,
      type: 'system',
      title: 'Test Email Notifikasi',
      body: 'Ini adalah email notifikasi tes. Jika Anda menerima email ini, berarti konfigurasi email Anda sudah benar.',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'normal',
      targetRoles: [],
      data: { type: 'test' }
    };

    return this.sendNotificationEmail(testNotification, recipientEmail, 'User', userId);
  }
}

let emailNotificationServiceInstance: EmailNotificationService | null = null;

export const getEmailNotificationService = (userId?: string): EmailNotificationService => {
  if (!emailNotificationServiceInstance) {
    emailNotificationServiceInstance = new EmailNotificationService(userId);
  }
  return emailNotificationServiceInstance;
};

export default getEmailNotificationService();
