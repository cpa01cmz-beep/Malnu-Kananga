import type { PushNotification, NotificationSettings, VoiceNotificationSettings } from '../types';
import { VALIDATION_LIMITS } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a PushNotification object
 */
export function validatePushNotification(notification: unknown): ValidationResult {
  const errors: string[] = [];

  if (!notification || typeof notification !== 'object') {
    return { isValid: false, errors: ['Notification must be an object'] };
  }

  const n = notification as Partial<PushNotification>;

  if (!n.id || typeof n.id !== 'string' || n.id.trim().length === 0) {
    errors.push('Notification ID is required and must be a non-empty string');
  }

  if (!n.type || typeof n.type !== 'string' || n.type.trim().length === 0) {
    errors.push('Notification type is required and must be a non-empty string');
  } else {
    const validTypes = ['announcement', 'grade', 'ppdb', 'event', 'library', 'system', 'ocr', 'ocr_validation', 'missing_grades'];
    if (!validTypes.includes(n.type)) {
      errors.push(`Invalid notification type: ${n.type}. Must be one of: ${validTypes.join(', ')}`);
    }
  }

  if (!n.title || typeof n.title !== 'string' || n.title.trim().length === 0) {
    errors.push('Notification title is required and must be a non-empty string');
  } else if (n.title.length > VALIDATION_LIMITS.NOTIFICATION_TITLE_MAX) {
    errors.push(`Notification title must not exceed ${VALIDATION_LIMITS.NOTIFICATION_TITLE_MAX} characters`);
  }

  if (!n.body || typeof n.body !== 'string' || n.body.trim().length === 0) {
    errors.push('Notification body is required and must be a non-empty string');
  } else if (n.body.length > VALIDATION_LIMITS.NOTIFICATION_BODY_MAX) {
    errors.push(`Notification body must not exceed ${VALIDATION_LIMITS.NOTIFICATION_BODY_MAX} characters`);
  }

  if (!n.timestamp || typeof n.timestamp !== 'string' || isNaN(Date.parse(n.timestamp))) {
    errors.push('Notification timestamp is required and must be a valid ISO date string');
  }

  if (n.read !== undefined && typeof n.read !== 'boolean') {
    errors.push('Notification read flag must be a boolean');
  }

  if (n.priority && typeof n.priority === 'string') {
    const validPriorities = ['low', 'normal', 'high'];
    if (!validPriorities.includes(n.priority)) {
      errors.push(`Invalid priority: ${n.priority}. Must be one of: ${validPriorities.join(', ')}`);
    }
  }

  if (n.targetRoles && !Array.isArray(n.targetRoles)) {
    errors.push('Target roles must be an array');
  }

  if (n.targetExtraRoles && !Array.isArray(n.targetExtraRoles)) {
    errors.push('Target extra roles must be an array');
  }

  if (n.targetUsers && !Array.isArray(n.targetUsers)) {
    errors.push('Target users must be an array');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates NotificationSettings object
 */
export function validateNotificationSettings(settings: unknown): ValidationResult {
  const errors: string[] = [];

  if (!settings || typeof settings !== 'object') {
    return { isValid: false, errors: ['Settings must be an object'] };
  }

  const s = settings as Partial<NotificationSettings>;

  if (s.enabled !== undefined && typeof s.enabled !== 'boolean') {
    errors.push('enabled flag must be a boolean');
  }

  if (s.roleBasedFiltering !== undefined && typeof s.roleBasedFiltering !== 'boolean') {
    errors.push('roleBasedFiltering flag must be a boolean');
  }

  if (s.batchNotifications !== undefined && typeof s.batchNotifications !== 'boolean') {
    errors.push('batchNotifications flag must be a boolean');
  }

  if (s.quietHours) {
    if (typeof s.quietHours !== 'object') {
      errors.push('quietHours must be an object');
    } else if (s.quietHours.enabled !== undefined && typeof s.quietHours.enabled !== 'boolean') {
      errors.push('quietHours.enabled flag must be a boolean');
    } else if (s.quietHours.start !== undefined && !isValidTimeString(s.quietHours.start)) {
      errors.push('quietHours.start must be a valid time string (HH:MM)');
    } else if (s.quietHours.end !== undefined && !isValidTimeString(s.quietHours.end)) {
      errors.push('quietHours.end must be a valid time string (HH:MM)');
    }
  }

  const booleanSettings = ['announcements', 'grades', 'ppdbStatus', 'events', 'library', 'system', 'ocr'];
  booleanSettings.forEach(key => {
    const typedKey = key as keyof NotificationSettings;
    if (s[typedKey] !== undefined && typeof s[typedKey] !== 'boolean') {
      errors.push(`${key} flag must be a boolean`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates VoiceNotificationSettings object
 */
export function validateVoiceNotificationSettings(settings: unknown): ValidationResult {
  const errors: string[] = [];

  if (!settings || typeof settings !== 'object') {
    return { isValid: false, errors: ['Voice settings must be an object'] };
  }

  const s = settings as Partial<VoiceNotificationSettings>;

  if (s.enabled !== undefined && typeof s.enabled !== 'boolean') {
    errors.push('enabled flag must be a boolean');
  }

  if (s.highPriorityOnly !== undefined && typeof s.highPriorityOnly !== 'boolean') {
    errors.push('highPriorityOnly flag must be a boolean');
  }

  if (s.respectQuietHours !== undefined && typeof s.respectQuietHours !== 'boolean') {
    errors.push('respectQuietHours flag must be a boolean');
  }

  if (s.voiceSettings) {
    if (typeof s.voiceSettings !== 'object') {
      errors.push('voiceSettings must be an object');
    } else {
      if (s.voiceSettings.rate !== undefined) {
        if (typeof s.voiceSettings.rate !== 'number') {
          errors.push('voiceSettings.rate must be a number');
        } else if (s.voiceSettings.rate < 0.5 || s.voiceSettings.rate > 2.0) {
          errors.push('voiceSettings.rate must be between 0.5 and 2.0');
        }
      }

      if (s.voiceSettings.pitch !== undefined) {
        if (typeof s.voiceSettings.pitch !== 'number') {
          errors.push('voiceSettings.pitch must be a number');
        } else if (s.voiceSettings.pitch < 0 || s.voiceSettings.pitch > 2.0) {
          errors.push('voiceSettings.pitch must be between 0 and 2.0');
        }
      }

      if (s.voiceSettings.volume !== undefined) {
        if (typeof s.voiceSettings.volume !== 'number') {
          errors.push('voiceSettings.volume must be a number');
        } else if (s.voiceSettings.volume < 0 || s.voiceSettings.volume > 1.0) {
          errors.push('voiceSettings.volume must be between 0 and 1.0');
        }
      }
    }
  }

  if (s.categories) {
    if (typeof s.categories !== 'object') {
      errors.push('categories must be an object');
    } else {
      const validCategories = ['grades', 'attendance', 'system', 'meetings'];
      Object.keys(s.categories).forEach(key => {
        if (!validCategories.includes(key)) {
          errors.push(`Invalid category: ${key}. Must be one of: ${validCategories.join(', ')}`);
        } else if (typeof s.categories![key as keyof typeof s.categories] !== 'boolean') {
          errors.push(`${key} category flag must be a boolean`);
        }
      });
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates time string format (HH:MM)
 */
function isValidTimeString(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
}

/**
 * Type guard for PushNotification
 */
export function isPushNotification(value: unknown): value is PushNotification {
  const validation = validatePushNotification(value);
  return validation.isValid;
}

/**
 * Type guard for NotificationSettings
 */
export function isNotificationSettings(value: unknown): value is NotificationSettings {
  const validation = validateNotificationSettings(value);
  return validation.isValid;
}

/**
 * Type guard for VoiceNotificationSettings
 */
export function isVoiceNotificationSettings(value: unknown): value is VoiceNotificationSettings {
  const validation = validateVoiceNotificationSettings(value);
  return validation.isValid;
}

/**
 * Sanitizes notification text to prevent XSS
 */
export function sanitizeNotificationText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates and sanitizes notification data
 */
export function validateAndSanitizeNotification(notification: unknown): { isValid: boolean; errors: string[]; sanitized?: PushNotification } {
  const validation = validatePushNotification(notification);
  
  if (!validation.isValid) {
    return { isValid: false, errors: validation.errors };
  }

  const n = notification as PushNotification;
  const sanitized: PushNotification = {
    ...n,
    title: sanitizeNotificationText(n.title),
    body: sanitizeNotificationText(n.body),
  };

  return { isValid: true, errors: [], sanitized };
}
