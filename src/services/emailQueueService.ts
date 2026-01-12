import type { EmailData, EmailQueueItem } from '../types/email.types';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

class EmailQueueService {
  private storageKey = STORAGE_KEYS.EMAIL_QUEUE || 'malnu_email_queue';
  private maxRetryAttempts = 3;
  private retryDelays = [60000, 300000, 900000];

  constructor() {
    logger.info('EmailQueueService initialized');
  }

  private getQueue(): EmailQueueItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load email queue:', error);
      return [];
    }
  }

  private saveQueue(queue: EmailQueueItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      logger.error('Failed to save email queue:', error);
    }
  }

  private generateId(): string {
    return `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  enqueue(emailData: EmailData, scheduledFor?: Date): EmailQueueItem {
    const queue = this.getQueue();
    const queueItem: EmailQueueItem = {
      id: this.generateId(),
      emailData,
      attempts: 0,
      lastAttemptAt: null,
      nextAttemptAt: (scheduledFor || new Date()).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    queue.push(queueItem);
    this.saveQueue(queue);

    logger.info(`Email enqueued: ${queueItem.id}, scheduled for ${queueItem.nextAttemptAt}`);

    return queueItem;
  }

  dequeue(): EmailQueueItem | null {
    const queue = this.getQueue();
    const now = new Date().toISOString();

    const itemIndex = queue.findIndex(
      item => item.status === 'pending' && item.nextAttemptAt <= now
    );

    if (itemIndex === -1) {
      return null;
    }

    const item = queue[itemIndex];
    queue.splice(itemIndex, 1);
    this.saveQueue(queue);

    return item;
  }

  markAsProcessing(itemId: string): boolean {
    const queue = this.getQueue();
    const item = queue.find(i => i.id === itemId);

    if (!item) {
      return false;
    }

    item.status = 'processing';
    item.lastAttemptAt = new Date().toISOString();
    item.attempts += 1;

    this.saveQueue(queue);

    return true;
  }

  markAsSent(itemId: string): boolean {
    const queue = this.getQueue();
    const itemIndex = queue.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      return false;
    }

    queue[itemIndex].status = 'sent';
    queue.splice(itemIndex, 1);
    this.saveQueue(queue);

    logger.info(`Email sent successfully: ${itemId}`);

    return true;
  }

  markAsFailed(itemId: string, error: string): boolean {
    const queue = this.getQueue();
    const item = queue.find(i => i.id === itemId);

    if (!item) {
      return false;
    }

    if (item.attempts >= this.maxRetryAttempts) {
      item.status = 'failed';
      item.error = error;
      logger.error(`Email failed permanently: ${itemId}, error: ${error}`);
    } else {
      item.status = 'pending';
      item.error = error;
      const delayIndex = Math.min(item.attempts - 1, this.retryDelays.length - 1);
      const nextAttempt = new Date(Date.now() + this.retryDelays[delayIndex]);
      item.nextAttemptAt = nextAttempt.toISOString();
      logger.warn(`Email retry scheduled: ${itemId}, attempt ${item.attempts + 1}, next at ${item.nextAttemptAt}`);
    }

    this.saveQueue(queue);

    return true;
  }

  getQueueSize(): number {
    return this.getQueue().length;
  }

  getPendingCount(): number {
    return this.getQueue().filter(item => item.status === 'pending').length;
  }

  getProcessingCount(): number {
    return this.getQueue().filter(item => item.status === 'processing').length;
  }

  getFailedCount(): number {
    return this.getQueue().filter(item => item.status === 'failed').length;
  }

  getQueueStatus(): { pending: number; processing: number; failed: number; total: number } {
    const queue = this.getQueue();
    return {
      pending: queue.filter(item => item.status === 'pending').length,
      processing: queue.filter(item => item.status === 'processing').length,
      failed: queue.filter(item => item.status === 'failed').length,
      total: queue.length
    };
  }

  getQueueItems(status?: EmailQueueItem['status']): EmailQueueItem[] {
    const queue = this.getQueue();
    return status ? queue.filter(item => item.status === status) : queue;
  }

  removeItem(itemId: string): boolean {
    const queue = this.getQueue();
    const itemIndex = queue.findIndex(i => i.id === itemId);

    if (itemIndex === -1) {
      return false;
    }

    queue.splice(itemIndex, 1);
    this.saveQueue(queue);

    logger.info(`Email queue item removed: ${itemId}`);

    return true;
  }

  clearQueue(): void {
    localStorage.removeItem(this.storageKey);
    logger.info('Email queue cleared');
  }

  async processQueue(sendEmail: (emailData: EmailData) => Promise<boolean>): Promise<{ processed: number; failed: number }> {
    let processed = 0;
    let failed = 0;

    while (true) {
      const item = this.dequeue();
      if (!item) {
        break;
      }

      this.markAsProcessing(item.id);

      try {
        const success = await sendEmail(item.emailData);

        if (success) {
          this.markAsSent(item.id);
          processed++;
        } else {
          this.markAsFailed(item.id, 'Email sending failed');
          failed++;
        }
      } catch (error) {
        this.markAsFailed(item.id, error instanceof Error ? error.message : 'Unknown error');
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { processed, failed };
  }
}

export const emailQueueService = new EmailQueueService();
export default EmailQueueService;
