import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { emailService } from '../emailService';
import { emailTemplatesService } from '../emailTemplates';
import { emailQueueService } from '../emailQueueService';
import type { EmailData, EmailRecipient } from '../../types/email.types';

// Mock apiService at module level
vi.mock('../apiService', () => ({
  request: vi.fn().mockResolvedValue({ success: true, data: { messageId: 'msg-123' } })
}));

describe('EmailService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com', name: 'Test User' },
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: 'Test content'
      };

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should validate email addresses', async () => {
      const emailData: EmailData = {
        to: { email: 'invalid-email', name: 'Test User' },
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      const result = await emailService.sendEmail(emailData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle offline mode by queuing email', async () => {
      vi.mock('../utils/networkStatus', () => ({
        isNetworkError: vi.fn().mockReturnValue(true)
      }));

      const emailData: EmailData = {
        to: { email: 'test@example.com', name: 'Test User' },
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      const result = await emailService.sendEmail(emailData, { queueOffline: true });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      vi.unmock('../utils/networkStatus');
    });
  });

  describe('sendTemplateEmail', () => {
    it('should send email using template', async () => {
      const to: EmailRecipient = { email: 'parent@example.com', name: 'Parent Name' };

      const result = await emailService.sendTemplateEmail(
        'grade-update-notification',
        to,
        {
          studentName: 'John Doe',
          studentId: '12345',
          subjectName: 'Mathematics',
          grade: 85,
          semester: '1',
          academicYear: '2024-2025',
          className: 'X-A',
          teacherName: 'Teacher Name',
          recipientName: 'Parent Name'
        }
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should return error if template not found', async () => {
      const to: EmailRecipient = { email: 'test@example.com', name: 'Test User' };

      const result = await emailService.sendTemplateEmail(
        'non-existent-template',
        to
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template not found');
    });
  });

  describe('sendBulkEmail', () => {
    it('should send emails to multiple recipients', async () => {
      const recipients: EmailRecipient[] = [{ email: 'test@example.com', name: 'Test User' }];
      const baseEmailData = {
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      };

      const result = await emailService.sendBulkEmail(recipients, baseEmailData);

      expect(result.success).toBe(true);
      expect(result.messageIds).toBeDefined();
      expect(result.messageIds).toHaveLength(1);
    });
  });

  describe('getAnalytics', () => {
    it('should return email analytics', () => {
      const analytics = emailService.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics).toHaveProperty('totalSent');
      expect(analytics).toHaveProperty('totalDelivered');
      expect(analytics).toHaveProperty('deliveryRate');
      expect(analytics).toHaveProperty('openRate');
      expect(analytics).toHaveProperty('clickRate');
      expect(analytics).toHaveProperty('dateRange');
    });
  });

  describe('getDeliveryHistory', () => {
    it('should return delivery history', () => {
      const history = emailService.getDeliveryHistory(10);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('EmailTemplatesService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getTemplate', () => {
    it('should return template by id', () => {
      const template = emailTemplatesService.getTemplate('grade-update-notification');

      expect(template).toBeDefined();
      expect(template?.id).toBe('grade-update-notification');
    });

    it('should return null for non-existent template', () => {
      const template = emailTemplatesService.getTemplate('non-existent');

      expect(template).toBeNull();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', () => {
      const templates = emailTemplatesService.getAllTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('renderTemplate', () => {
    it('should render template with variables', () => {
      const rendered = emailTemplatesService.renderTemplate(
        'grade-update-notification',
        {
          studentName: 'John Doe',
          studentId: '12345',
          subjectName: 'Mathematics',
          grade: 85,
          semester: '1',
          academicYear: '2024-2025',
          className: 'X-A',
          teacherName: 'Teacher Name',
          recipientName: 'Parent Name',
          schoolName: 'MA Malnu Kananga'
        }
      );

      expect(rendered).toBeDefined();
      expect(rendered?.html).toContain('John Doe');
      expect(rendered?.html).toContain('85');
      expect(rendered?.html).toContain('Mathematics');
    });

    it('should return null for non-existent template', () => {
      const rendered = emailTemplatesService.renderTemplate(
        'non-existent',
        {}
      );

      expect(rendered).toBeNull();
    });
  });

  describe('createTemplate', () => {
    it('should create new template', () => {
      const newTemplate = emailTemplatesService.createTemplate({
        name: 'Custom Template',
        description: 'Test template',
        category: 'system',
        subject: 'Test Subject',
        htmlContent: '<p>Test</p>',
        textContent: 'Test',
        variables: ['testVar'],
        language: 'id',
        isActive: true
      });

      expect(newTemplate).toBeDefined();
      expect(newTemplate.id).toBeDefined();
      expect(newTemplate.name).toBe('Custom Template');
    });
  });

  describe('updateTemplate', () => {
    it('should update existing template', () => {
      const template = emailTemplatesService.getTemplate('grade-update-notification');
      if (!template) return;

      const updated = emailTemplatesService.updateTemplate(template.id, {
        name: 'Updated Name'
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
    });

    it('should return null for non-existent template', () => {
      const updated = emailTemplatesService.updateTemplate('non-existent', {
        name: 'Updated Name'
      });

      expect(updated).toBeNull();
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template', () => {
      const newTemplate = emailTemplatesService.createTemplate({
        name: 'To Delete',
        description: 'Test',
        category: 'system',
        subject: 'Test',
        htmlContent: '<p>Test</p>',
        variables: [],
        language: 'id',
        isActive: true
      });

      const deleted = emailTemplatesService.deleteTemplate(newTemplate.id);

      expect(deleted).toBe(true);
      expect(emailTemplatesService.getTemplate(newTemplate.id)).toBeNull();
    });

    it('should return false for non-existent template', () => {
      const deleted = emailTemplatesService.deleteTemplate('non-existent');

      expect(deleted).toBe(false);
    });
  });
});

describe('EmailQueueService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('enqueue', () => {
    it('should enqueue email', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      const item = emailQueueService.enqueue(emailData);

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.status).toBe('pending');
      expect(item.emailData).toEqual(emailData);
    });

    it('should enqueue scheduled email', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      const scheduledTime = new Date(Date.now() + 3600000);
      const item = emailQueueService.enqueue(emailData, scheduledTime);

      expect(item).toBeDefined();
      expect(item.nextAttemptAt).toBe(scheduledTime.toISOString());
    });
  });

  describe('dequeue', () => {
    it('should dequeue pending email', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      emailQueueService.enqueue(emailData);
      const item = emailQueueService.dequeue();

      expect(item).toBeDefined();
      expect(item?.status).toBe('pending');
    });

    it('should return null if no pending emails', () => {
      const item = emailQueueService.dequeue();

      expect(item).toBeNull();
    });

    it('should not dequeue scheduled email', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      const scheduledTime = new Date(Date.now() + 3600000);
      emailQueueService.enqueue(emailData, scheduledTime);
      const item = emailQueueService.dequeue();

      expect(item).toBeNull();
    });
  });

  describe('markAsProcessing', () => {
    it('should mark item as processing', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      const item = emailQueueService.enqueue(emailData);
      const marked = emailQueueService.markAsProcessing(item.id);

      expect(marked).toBe(true);
    });
  });

  describe('markAsSent', () => {
    it('should mark item as sent and remove from queue', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      const item = emailQueueService.enqueue(emailData);
      const marked = emailQueueService.markAsSent(item.id);

      expect(marked).toBe(true);
      expect(emailQueueService.getQueueItems('sent')).toHaveLength(0);
    });
  });

  describe('markAsFailed', () => {
    it('should mark item as failed after max attempts', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      const item = emailQueueService.enqueue(emailData);

      for (let i = 0; i < 4; i++) {
        emailQueueService.markAsProcessing(item.id);
        emailQueueService.markAsFailed(item.id, 'Test error');
      }

      const queueItem = emailQueueService.getQueueItems().find(i => i.id === item.id);
      expect(queueItem?.status).toBe('failed');
    });

    it('should schedule retry for failed item', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      const item = emailQueueService.enqueue(emailData);
      emailQueueService.markAsProcessing(item.id);
      emailQueueService.markAsFailed(item.id, 'Test error');

      const queueItem = emailQueueService.getQueueItems().find(i => i.id === item.id);
      expect(queueItem?.status).toBe('pending');
      expect(queueItem?.attempts).toBe(1);
    });
  });

  describe('getQueueStatus', () => {
    it('should return queue status', () => {
      const status = emailQueueService.getQueueStatus();

      expect(status).toHaveProperty('pending');
      expect(status).toHaveProperty('processing');
      expect(status).toHaveProperty('failed');
      expect(status).toHaveProperty('total');
      expect(typeof status.pending).toBe('number');
      expect(typeof status.processing).toBe('number');
      expect(typeof status.failed).toBe('number');
      expect(typeof status.total).toBe('number');
    });
  });

  describe('clearQueue', () => {
    it('should clear all items from queue', () => {
      const emailData: EmailData = {
        to: { email: 'test@example.com' },
        subject: 'Test',
        html: '<p>Test</p>'
      };

      emailQueueService.enqueue(emailData);
      emailQueueService.clearQueue();

      expect(emailQueueService.getQueueSize()).toBe(0);
    });
  });
});
