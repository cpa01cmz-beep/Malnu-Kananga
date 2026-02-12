import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationTemplatesHandler } from '../notificationTemplatesHandler';
import { STORAGE_KEYS } from '../../../constants';
import { USER_ROLES } from '../../../constants';

// Mock dependencies
vi.mock('../../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../../../utils/idGenerator', () => ({
  generateTemplateId: vi.fn(() => 'test-template-id'),
  idGenerators: {
    notification: vi.fn(() => 'test-notification-id'),
  },
}));

describe('NotificationTemplatesHandler', () => {
  let handler: NotificationTemplatesHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
    handler = new NotificationTemplatesHandler();
  });

  afterEach(() => {
    handler.cleanup();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default templates', () => {
      const templates = handler.getTemplates();
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should have all required notification types', () => {
      const templates = handler.getTemplates();
      const types = templates.map(t => t.type);
      
      expect(types).toContain('announcement');
      expect(types).toContain('grade');
      expect(types).toContain('ppdb');
      expect(types).toContain('event');
      expect(types).toContain('library');
      expect(types).toContain('system');
      expect(types).toContain('ocr');
      expect(types).toContain('ocr_validation');
      expect(types).toContain('missing_grades');
      expect(types).toContain('progress_report');
    });
  });

  describe('getTemplate', () => {
    it('should return template by id', () => {
      const template = handler.getTemplate('default-announcement');
      expect(template).not.toBeNull();
      expect(template?.type).toBe('announcement');
    });

    it('should return template by notification type', () => {
      const template = handler.getTemplate('announcement');
      expect(template).not.toBeNull();
      expect(template?.type).toBe('announcement');
    });

    it('should return null for non-existent template', () => {
      const template = handler.getTemplate('non-existent');
      expect(template).toBeNull();
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', () => {
      const template = handler.createTemplate(
        'Custom Template',
        'announcement',
        'Custom: {{title}}',
        '{{content}}',
        { id: 'user-1' },
        ['title', 'content'],
        [USER_ROLES.ADMIN]
      );

      expect(template).not.toBeNull();
      expect(template?.name).toBe('Custom Template');
      expect(template?.type).toBe('announcement');
      expect(template?.isActive).toBe(true);
      expect(template?.createdBy).toBe('user-1');
    });

    it('should save template to storage', () => {
      handler.createTemplate(
        'Test Template',
        'system',
        'Test: {{title}}',
        '{{message}}',
        { id: 'admin-1' },
        ['title', 'message'],
        [USER_ROLES.TEACHER]
      );

      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_TEMPLATES);
      expect(stored).not.toBeNull();
      
      const templates = JSON.parse(stored!);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('setTemplate', () => {
    it('should update existing template', () => {
      const original = handler.getTemplate('default-announcement');
      expect(original).not.toBeNull();

      if (original) {
        const updated = {
          ...original,
          title: 'Updated: {{title}}',
        };
        
        handler.setTemplate(updated);
        
        const result = handler.getTemplate(original.id);
        expect(result?.title).toBe('Updated: {{title}}');
      }
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template by id', () => {
      const template = handler.createTemplate(
        'To Delete',
        'announcement',
        'Delete me',
        'Content',
        { id: 'user-1' }
      );
      
      expect(template).not.toBeNull();
      
      const result = handler.deleteTemplate(template!.id);
      expect(result).toBe(true);
      
      const deleted = handler.getTemplate(template!.id);
      expect(deleted).toBeNull();
    });

    it('should return false for non-existent template', () => {
      const result = handler.deleteTemplate('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getTemplates', () => {
    it('should return only active templates', () => {
      const templates = handler.getTemplates();
      templates.forEach(template => {
        expect(template.isActive).toBe(true);
      });
    });
  });

  describe('createNotificationFromTemplate', () => {
    it('should create notification with variables replaced', () => {
      const notification = handler.createNotificationFromTemplate(
        'announcement',
        { title: 'Test Title', content: 'Test Content' }
      );

      expect(notification).not.toBeNull();
      expect(notification?.title).toBe('📢 Test Title');
      expect(notification?.body).toBe('Test Content');
    });

    it('should create notification for grade type', () => {
      const notification = handler.createNotificationFromTemplate(
        'grade',
        {
          subject: 'Mathematics',
          assignment: 'Final Exam',
          studentName: 'John Doe',
          score: 85,
          maxScore: 100
        }
      );

      expect(notification).not.toBeNull();
      expect(notification?.type).toBe('grade');
      expect(notification?.body).toContain('John Doe');
      expect(notification?.body).toContain('85/100');
    });

    it('should return null for non-existent template', () => {
      const notification = handler.createNotificationFromTemplate(
        'non-existent',
        {}
      );

      expect(notification).toBeNull();
    });

    it('should include all required notification properties', () => {
      const notification = handler.createNotificationFromTemplate(
        'announcement',
        { title: 'Test', content: 'Content' }
      );

      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('type');
      expect(notification).toHaveProperty('title');
      expect(notification).toHaveProperty('body');
      expect(notification).toHaveProperty('timestamp');
      expect(notification).toHaveProperty('read');
      expect(notification).toHaveProperty('priority');
    });
  });

  describe('cleanup', () => {
    it('should clear all templates', () => {
      handler.createTemplate(
        'Test Template',
        'announcement',
        'Test',
        'Content',
        { id: 'user-1' }
      );

      handler.cleanup();

      const templates = handler.getTemplates();
      // After cleanup, should only have default templates (which are still in the map)
      // The method clears both templates and defaultTemplates maps
      expect(templates.length).toBe(0);
    });
  });
});
