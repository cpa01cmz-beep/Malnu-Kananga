import type {
  EmailData,
  EmailRecipient,
  EmailSendOptions,
  EmailDeliveryStatus,
  EmailAnalytics,
  EmailNotificationSettings,
  EmailAttachment
} from '../types/email.types';
import { emailTemplatesService } from './emailTemplates';
import { emailQueueService } from './emailQueueService';
import { request } from './apiService';
import { logger } from '../utils/logger';
import { isNetworkError } from '../utils/networkStatus';
import { STORAGE_KEYS, STORAGE_LIMITS, EMAIL_CONFIG, TIME_MS } from '../constants';
import { communicationLogService } from './communicationLogService';

class EmailService {
  private storageKey = STORAGE_KEYS.EMAIL_NOTIFICATION_SETTINGS || 'malnu_email_notification_settings';
  private analyticsKey = STORAGE_KEYS.EMAIL_ANALYTICS || 'malnu_email_analytics';
  private deliveryHistoryKey = STORAGE_KEYS.EMAIL_DELIVERY_HISTORY || 'malnu_email_delivery_history';
  private apiEndpoint = '/api/email/send';

  constructor() {
    logger.info('EmailService initialized');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private formatRecipient(recipient: EmailRecipient): { email: string; name: string } {
    return {
      email: recipient.email,
      name: recipient.name || recipient.email.split('@')[0]
    };
  }

  private getNotificationSettings(): EmailNotificationSettings | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      logger.error('Failed to load email notification settings:', error);
      return null;
    }
  }

  private saveNotificationSettings(settings: EmailNotificationSettings): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(settings));
    } catch (error) {
      logger.error('Failed to save email notification settings:', error);
    }
  }

  public recordDelivery(status: EmailDeliveryStatus): void {
    try {
      const history = this.loadDeliveryHistory();
      history.push(status);

      if (history.length > STORAGE_LIMITS.EMAIL_HISTORY_MAX) {
        history.splice(0, history.length - STORAGE_LIMITS.EMAIL_HISTORY_MAX);
      }

      localStorage.setItem(this.deliveryHistoryKey, JSON.stringify(history));
      this.updateAnalytics();
    } catch (error) {
      logger.error('Failed to record email delivery:', error);
    }
  }

  private loadDeliveryHistory(): EmailDeliveryStatus[] {
    try {
      const stored = localStorage.getItem(this.deliveryHistoryKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load delivery history:', error);
      return [];
    }
  }

  private updateAnalytics(): void {
    try {
      const history = this.loadDeliveryHistory();
      const now = new Date();
      const analyticsStartDate = new Date(now.getTime() - EMAIL_CONFIG.ANALYTICS_DAYS * TIME_MS.ONE_DAY);

      const recentDeliveries = history.filter(
        d => new Date(d.timestamp) >= analyticsStartDate
      );

      const totalSent = recentDeliveries.length;
      const totalDelivered = recentDeliveries.filter(d => d.status === 'delivered').length;
      const totalBounced = recentDeliveries.filter(d => d.status === 'bounced').length;
      const totalOpened = recentDeliveries.filter(d => d.status === 'opened').length;
      const totalClicked = recentDeliveries.filter(d => d.status === 'clicked').length;

      const analytics: EmailAnalytics = {
        totalSent,
        totalDelivered,
        totalBounced,
        totalOpened,
        totalClicked,
        deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
        openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
        clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
        dateRange: {
          from: analyticsStartDate.toISOString(),
          to: now.toISOString()
        }
      };

      localStorage.setItem(this.analyticsKey, JSON.stringify(analytics));
    } catch (error) {
      logger.error('Failed to update email analytics:', error);
    }
  }

  async sendEmail(
    emailData: EmailData,
    options: EmailSendOptions = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const {
      queueOffline = true,
      trackDelivery = true,
      scheduleAt,
      priority = 'normal'
    } = options;

    try {
      const to = Array.isArray(emailData.to) ? emailData.to : [emailData.to];

      for (const recipient of to) {
        if (recipient && !this.isValidEmail(recipient.email)) {
          logger.error(`Invalid email address: ${recipient.email}`);
          return { success: false, error: `Invalid email address: ${recipient.email}` };
        }
      }

      if (emailData.cc) {
        const cc = Array.isArray(emailData.cc) ? emailData.cc : [emailData.cc];
        for (const recipient of cc) {
          if (recipient && !this.isValidEmail(recipient.email)) {
            logger.error(`Invalid CC email address: ${recipient.email}`);
            return { success: false, error: `Invalid CC email address: ${recipient.email}` };
          }
        }
      }

      if (scheduleAt && new Date(scheduleAt) < new Date()) {
        return { success: false, error: 'Scheduled time must be in the future' };
      }

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      if (!isOnline && queueOffline) {
        const queueItem = emailQueueService.enqueue(emailData, scheduleAt ? new Date(scheduleAt) : undefined);
        logger.info(`Email queued for offline: ${queueItem.id}`);
        return { success: true, messageId: queueItem.id };
      }

      if (scheduleAt) {
        const queueItem = emailQueueService.enqueue(emailData, new Date(scheduleAt));
        logger.info(`Email scheduled: ${queueItem.id} for ${scheduleAt}`);
        return { success: true, messageId: queueItem.id };
      }

      const response = await request<{ messageId: string }>(
        this.apiEndpoint,
        {
          method: 'POST',
          body: JSON.stringify({
            to: emailData.to,
            cc: emailData.cc,
            bcc: emailData.bcc,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
            attachments: emailData.attachments,
            trackDelivery,
            priority
          })
        }
      );

      if (response.success && response.data?.messageId) {
        if (trackDelivery) {
          this.recordDelivery({
            messageId: response.data.messageId,
            status: 'queued',
            timestamp: new Date().toISOString()
          });
        }

        logger.info(`Email sent successfully: ${response.data.messageId}`);

        const toRecipient = emailData.to;
        if (toRecipient) {
          const recipient = Array.isArray(toRecipient) ? toRecipient[0] : toRecipient;
          const hasAttachment = (emailData.attachments && emailData.attachments.length > 0) || false;

          communicationLogService.logEmail({
            messageId: response.data.messageId,
            recipientEmail: recipient.email,
            subject: emailData.subject,
            bodyPreview: this.createBodyPreview(emailData.html || '', emailData.text || ''),
            deliveryStatus: 'sent',
            hasAttachment,
            sender: 'system',
            timestamp: new Date().toISOString(),
          });
        }

        return { success: true, messageId: response.data.messageId };
      } else {
        const error = response.error || 'Failed to send email';
        logger.error(`Failed to send email: ${error}`);

        if (queueOffline && isNetworkError(new Error(error))) {
          const queueItem = emailQueueService.enqueue(emailData);
          logger.info(`Email queued due to error: ${queueItem.id}`);
          return { success: true, messageId: queueItem.id };
        }

        return { success: false, error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Error sending email: ${errorMessage}`);

      if (queueOffline && isNetworkError(error)) {
        const queueItem = emailQueueService.enqueue(emailData);
        logger.info(`Email queued due to error: ${queueItem.id}`);
        return { success: true, messageId: queueItem.id };
      }

      return { success: false, error: errorMessage };
    }
  }

  async sendTemplateEmail(
    templateId: string,
    to: EmailRecipient | EmailRecipient[],
    context: Record<string, string | number> = {},
    options: EmailSendOptions = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const rendered = emailTemplatesService.renderTemplate(templateId, context);

    if (!rendered) {
      return { success: false, error: `Template not found: ${templateId}` };
    }

    const template = emailTemplatesService.getTemplate(templateId);
    if (!template) {
      return { success: false, error: `Template not found: ${templateId}` };
    }

    const emailData: EmailData = {
      to,
      subject: this.interpolate(template.subject, context),
      html: rendered.html,
      text: rendered.text
    };

    return await this.sendEmail(emailData, options);
  }

  async sendEmailWithAttachment(
    emailData: EmailData,
    attachment: EmailAttachment,
    options: EmailSendOptions = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailWithAttachment: EmailData = {
      ...emailData,
      attachments: [...(emailData.attachments || []), attachment]
    };

    return await this.sendEmail(emailWithAttachment, options);
  }

  async sendBulkEmail(
    recipients: EmailRecipient[],
    baseEmailData: Omit<EmailData, 'to'>,
    options: EmailSendOptions = {}
  ): Promise<{ success: boolean; sent: number; failed: number; messageIds: string[] }> {
    const messageIds: string[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const result = await this.sendEmail(
        { ...baseEmailData, to: recipient },
        options
      );

      if (result.success && result.messageId) {
        messageIds.push(result.messageId);
        sent++;
      } else {
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return {
      success: failed === 0,
      sent,
      failed,
      messageIds
    };
  }

  getAnalytics(): EmailAnalytics | null {
    try {
      const stored = localStorage.getItem(this.analyticsKey);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Generate analytics if not exists
      this.updateAnalytics();
      const updated = localStorage.getItem(this.analyticsKey);
      return updated ? JSON.parse(updated) : null;
    } catch (error) {
      logger.error('Failed to load email analytics:', error);
      return null;
    }
  }

  getDeliveryHistory(limit: number = 50): EmailDeliveryStatus[] {
    const history = this.loadDeliveryHistory();
    return history.slice(-limit).reverse();
  }

  getNotificationSettingsForUser(_userId: string): EmailNotificationSettings {
    const globalSettings = this.getNotificationSettings();

    if (!globalSettings) {
      return {
        enabled: false,
        email: '',
        notifications: {
          grades: false,
          attendance: false,
          reports: false,
          announcements: false,
          events: false
        }
      };
    }

    return globalSettings;
  }

  setNotificationSettings(userId: string, settings: EmailNotificationSettings): void {
    this.saveNotificationSettings(settings);
    logger.info(`Email notification settings updated for user: ${userId}`);
  }

  async processQueue(): Promise<{ processed: number; failed: number }> {
    return await emailQueueService.processQueue(async (emailData) => {
      const result = await this.sendEmail(emailData, { queueOffline: false });
      return result.success;
    });
  }

  getQueueStatus() {
    return emailQueueService.getQueueStatus();
  }

  private interpolate(template: string, context: Record<string, string | number>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = context[key];
      return value !== undefined ? String(value) : match;
    });
  }

  private createBodyPreview(html: string, text: string): string {
    if (text) {
      return text.length > 200 ? text.substring(0, 200) + '...' : text;
    }

    if (html) {
      const plainText = html.replace(/<[^>]+>/g, '');
      return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
    }

    return '';
  }
}

export const emailService = new EmailService();
export default EmailService;
