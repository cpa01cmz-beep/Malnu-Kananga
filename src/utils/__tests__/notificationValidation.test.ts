import { describe, it, expect } from 'vitest';
import type { PushNotification, NotificationSettings, VoiceNotificationSettings, NotificationType } from '../../types';
import {
  validatePushNotification,
  validateNotificationSettings,
  validateVoiceNotificationSettings,
  isPushNotification,
  isNotificationSettings,
  isVoiceNotificationSettings,
  sanitizeNotificationText,
  validateAndSanitizeNotification,
} from '../../utils/notificationValidation';

describe('notificationValidation', () => {
  describe('validatePushNotification', () => {
    it('should validate correct notification', () => {
      const notification: PushNotification = {
        id: 'test-123',
        type: 'grade',
        title: 'Test Title',
        body: 'Test Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing notification object', () => {
      const result = validatePushNotification(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Notification must be an object');
    });

    it('should reject empty notification object', () => {
      const result = validatePushNotification({});
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject empty id', () => {
      const notification = {
        id: '',
        type: 'grade',
        title: 'Test',
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      } as PushNotification;

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Notification ID is required and must be a non-empty string');
    });

    it('should reject invalid type', () => {
      const notification = {
        id: 'test',
        type: 'invalid-type' as NotificationType,
        title: 'Test',
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      } as PushNotification;

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid notification type'))).toBe(true);
    });

    it('should reject empty title', () => {
      const notification = {
        id: 'test',
        type: 'grade',
        title: '',
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      } as PushNotification;

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Notification title is required and must be a non-empty string');
    });

    it('should reject title over 200 characters', () => {
      const notification = {
        id: 'test',
        type: 'grade',
        title: 'A'.repeat(201),
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      } as PushNotification;

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Notification title must not exceed 200 characters');
    });

    it('should reject empty body', () => {
      const notification = {
        id: 'test',
        type: 'grade',
        title: 'Title',
        body: '',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      } as PushNotification;

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Notification body is required and must be a non-empty string');
    });

    it('should reject body over 1000 characters', () => {
      const notification = {
        id: 'test',
        type: 'grade',
        title: 'Title',
        body: 'A'.repeat(1001),
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      } as PushNotification;

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Notification body must not exceed 1000 characters');
    });

    it('should reject invalid timestamp', () => {
      const notification = {
        id: 'test',
        type: 'grade',
        title: 'Title',
        body: 'Body',
        timestamp: 'invalid-date',
        read: false,
        priority: 'normal',
      } as PushNotification;

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Notification timestamp is required and must be a valid ISO date string');
    });

    it('should reject invalid priority', () => {
      const notification = {
        id: 'test',
        type: 'grade',
        title: 'Title',
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'invalid' as any,
      };

      const result = validatePushNotification(notification);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid priority'))).toBe(true);
    });

    it('should accept all valid notification types', () => {
      const validTypes = ['announcement', 'grade', 'ppdb', 'event', 'library', 'system', 'ocr', 'ocr_validation', 'missing_grades'] as NotificationType[];
      
      validTypes.forEach(type => {
        const notification: PushNotification = {
          id: `test-${type}`,
          type,
          title: 'Test',
          body: 'Body',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'normal',
        };

        const result = validatePushNotification(notification);
        expect(result.isValid).toBe(true);
      });
    });

    it('should accept all valid priorities', () => {
      const validPriorities = ['low', 'normal', 'high'];
      
      validPriorities.forEach(priority => {
        const notification: PushNotification = {
          id: 'test',
          type: 'grade',
          title: 'Test',
          body: 'Body',
          timestamp: new Date().toISOString(),
          read: false,
          priority: priority as any,
        };

        const result = validatePushNotification(notification);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateNotificationSettings', () => {
    it('should validate correct settings', () => {
      const settings: NotificationSettings = {
        enabled: true,
        announcements: true,
        grades: true,
        ppdbStatus: true,
        events: true,
        library: true,
        system: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        voiceNotifications: {
          enabled: false,
          highPriorityOnly: true,
          respectQuietHours: true,
          voiceSettings: {
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8,
          },
          categories: {
            grades: true,
            attendance: true,
            system: true,
            meetings: true,
          },
        },
      };

      const result = validateNotificationSettings(settings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-boolean enabled flag', () => {
      const settings = {
        enabled: 'true' as any,
      };

      const result = validateNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('enabled flag must be a boolean');
    });

    it('should reject invalid quiet hours time format', () => {
      const settings = {
        enabled: true,
        quietHours: {
          enabled: true,
          start: '25:00',
          end: '24:00',
        },
      };

      const result = validateNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('quietHours.start must be a valid time string') || e.includes('quietHours.end must be a valid time string'))).toBe(true);
    });

    it('should reject non-boolean category flags', () => {
      const settings = {
        enabled: true,
        announcements: 'true' as any,
      };

      const result = validateNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('announcements flag must be a boolean');
    });
  });

  describe('validateVoiceNotificationSettings', () => {
    it('should validate correct voice settings', () => {
      const settings: VoiceNotificationSettings = {
        enabled: true,
        highPriorityOnly: true,
        respectQuietHours: true,
        voiceSettings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 0.8,
        },
        categories: {
          grades: true,
          attendance: true,
          system: true,
          meetings: true,
        },
      };

      const result = validateVoiceNotificationSettings(settings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid rate (too low)', () => {
      const settings = {
        enabled: true,
        voiceSettings: {
          rate: 0.3,
          pitch: 1.0,
          volume: 0.8,
        },
        categories: {
          grades: true,
          attendance: true,
          system: true,
          meetings: true,
        },
      };

      const result = validateVoiceNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('voiceSettings.rate must be between 0.5 and 2.0');
    });

    it('should reject invalid rate (too high)', () => {
      const settings = {
        enabled: true,
        voiceSettings: {
          rate: 2.5,
          pitch: 1.0,
          volume: 0.8,
        },
        categories: {
          grades: true,
          attendance: true,
          system: true,
          meetings: true,
        },
      };

      const result = validateVoiceNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('voiceSettings.rate must be between 0.5 and 2.0');
    });

    it('should reject invalid pitch (negative)', () => {
      const settings = {
        enabled: true,
        voiceSettings: {
          rate: 1.0,
          pitch: -0.5,
          volume: 0.8,
        },
        categories: {
          grades: true,
          attendance: true,
          system: true,
          meetings: true,
        },
      };

      const result = validateVoiceNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('voiceSettings.pitch must be between 0 and 2.0');
    });

    it('should reject invalid volume (too high)', () => {
      const settings = {
        enabled: true,
        voiceSettings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.5,
        },
        categories: {
          grades: true,
          attendance: true,
          system: true,
          meetings: true,
        },
      };

      const result = validateVoiceNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('voiceSettings.volume must be between 0 and 1.0');
    });

    it('should reject invalid category', () => {
      const settings = {
        enabled: true,
        categories: {
          grades: true,
          attendance: true,
          system: true,
          meetings: true,
          invalid: true as any,
        },
      };

      const result = validateVoiceNotificationSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid category'))).toBe(true);
    });
  });

  describe('Type Guards', () => {
    it('should identify valid PushNotification', () => {
      const notification: PushNotification = {
        id: 'test',
        type: 'grade',
        title: 'Test',
        body: 'Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };

      expect(isPushNotification(notification)).toBe(true);
    });

    it('should reject invalid PushNotification', () => {
      expect(isPushNotification(null)).toBe(false);
      expect(isPushNotification({})).toBe(false);
      expect(isPushNotification({ id: 'test' })).toBe(false);
    });

    it('should identify valid NotificationSettings', () => {
      const settings: NotificationSettings = {
        enabled: true,
        announcements: true,
        grades: true,
        ppdbStatus: true,
        events: true,
        library: true,
        system: true,
        ocr: true,
        roleBasedFiltering: false,
        batchNotifications: false,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
        voiceNotifications: {
          enabled: false,
          highPriorityOnly: true,
          respectQuietHours: true,
          voiceSettings: {
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8,
          },
          categories: {
            grades: true,
            attendance: true,
            system: true,
            meetings: true,
          },
        },
      };

      expect(isNotificationSettings(settings)).toBe(true);
    });

    it('should reject invalid NotificationSettings', () => {
      expect(isNotificationSettings(null)).toBe(false);
      expect(isNotificationSettings({})).toBe(true);
    });

    it('should identify valid VoiceNotificationSettings', () => {
      const settings: VoiceNotificationSettings = {
        enabled: true,
        highPriorityOnly: true,
        respectQuietHours: true,
        voiceSettings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 0.8,
        },
        categories: {
          grades: true,
          attendance: true,
          system: true,
          meetings: true,
        },
      };

      expect(isVoiceNotificationSettings(settings)).toBe(true);
    });

    it('should reject invalid VoiceNotificationSettings', () => {
      expect(isVoiceNotificationSettings(null)).toBe(false);
      expect(isVoiceNotificationSettings({})).toBe(true);
    });
  });

  describe('sanitizeNotificationText', () => {
    it('should sanitize HTML entities', () => {
      const input = '<script>alert("XSS")</script>';
      const output = sanitizeNotificationText(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('&lt;script&gt;');
    });

    it('should sanitize ampersands', () => {
      expect(sanitizeNotificationText('A & B')).toBe('A &amp; B');
    });

    it('should sanitize less than', () => {
      expect(sanitizeNotificationText('A < B')).toBe('A &lt; B');
    });

    it('should sanitize greater than', () => {
      expect(sanitizeNotificationText('A > B')).toBe('A &gt; B');
    });

    it('should sanitize quotes', () => {
      expect(sanitizeNotificationText('A "B"')).toBe('A &quot;B&quot;');
      expect(sanitizeNotificationText("A 'B'")).toBe("A &#x27;B&#x27;");
    });

    it('should handle empty string', () => {
      expect(sanitizeNotificationText('')).toBe('');
    });

    it('should handle normal text', () => {
      expect(sanitizeNotificationText('Normal text')).toBe('Normal text');
    });
  });

  describe('validateAndSanitizeNotification', () => {
    it('should validate and sanitize correct notification', () => {
      const notification: PushNotification = {
        id: 'test',
        type: 'grade',
        title: 'Test <script>alert("XSS")</script>',
        body: 'Body with & special > chars',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };

      const result = validateAndSanitizeNotification(notification);
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBeDefined();
      expect(result.sanitized!.title).not.toContain('<script>');
      expect(result.sanitized!.body).toContain('&amp;');
      expect(result.sanitized!.body).toContain('&gt;');
    });

    it('should return error for invalid notification', () => {
      const invalid = { id: '' } as any;

      const result = validateAndSanitizeNotification(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.sanitized).toBeUndefined();
    });

    it('should not modify valid notification text', () => {
      const notification: PushNotification = {
        id: 'test',
        type: 'grade',
        title: 'Normal Title',
        body: 'Normal Body',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'normal',
      };

      const result = validateAndSanitizeNotification(notification);
      expect(result.sanitized!.title).toBe('Normal Title');
      expect(result.sanitized!.body).toBe('Normal Body');
    });
  });
});
