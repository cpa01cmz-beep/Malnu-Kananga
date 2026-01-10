// parentGradeNotificationService.test.ts - Basic unit tests for missing grades functionality

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { parentGradeNotificationService } from '../parentGradeNotificationService';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ParentGradeNotificationService - Missing Grades', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'malnu_parent_notification_settings') {
        return JSON.stringify({
          enabled: true,
          gradeThreshold: 70,
          subjects: [],
          frequency: 'immediate',
          majorExamsOnly: false,
          missingGradeAlert: true,
          missingGradeDays: 7,
          quietHours: {
            enabled: false,
            start: '22:00',
            end: '07:00'
          }
        });
      }
      return null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getExpectedGradeFrequency', () => {
    it('should return correct frequencies for different assignment types', () => {
      // Access private method through type assertion for testing
      const service = parentGradeNotificationService as any;

      expect(service.getExpectedGradeFrequency('mid_exam')).toBe(30);
      expect(service.getExpectedGradeFrequency('final_exam')).toBe(30);
      expect(service.getExpectedGradeFrequency('uts')).toBe(30);
      expect(service.getExpectedGradeFrequency('quiz')).toBe(14);
      expect(service.getExpectedGradeFrequency('homework')).toBe(7);
      expect(service.getExpectedGradeFrequency('assignment')).toBe(7);
      expect(service.getExpectedGradeFrequency('unknown_type')).toBe(10);
    });
  });

  describe('settings validation', () => {
    it('should return default settings when none found', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const settings = parentGradeNotificationService.getSettings();
      
      expect(settings.enabled).toBe(true);
      expect(settings.missingGradeAlert).toBe(true);
      expect(settings.missingGradeDays).toBe(7);
    });

    it('should return parsed settings when found', () => {
      const customSettings = {
        enabled: false,
        missingGradeAlert: false,
        missingGradeDays: 14
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(customSettings));
      
      const settings = parentGradeNotificationService.getSettings();
      
      expect(settings.enabled).toBe(false);
      expect(settings.missingGradeAlert).toBe(false);
      expect(settings.missingGradeDays).toBe(14);
    });
  });

  describe('isMajorExam', () => {
    it('should correctly identify major exams', () => {
      const service = parentGradeNotificationService as any;

      expect(service.isMajorExam('mid_exam')).toBe(true);
      expect(service.isMajorExam('final_exam')).toBe(true);
      expect(service.isMajorExam('uts')).toBe(true);
      expect(service.isMajorExam('uas')).toBe(true);
      expect(service.isMajorExam('final_test')).toBe(true);
      expect(service.isMajorExam('assignment')).toBe(false);
      expect(service.isMajorExam('quiz')).toBe(false);
    });
  });

  describe('isQuietHours', () => {
    it('should correctly identify quiet hours', () => {
      const service = parentGradeNotificationService as any;
      const quietHours = {
        enabled: true,
        start: '22:00',
        end: '07:00'
      };

      // Create a mock Date constructor
      const mockDateClass = vi.fn();
      mockDateClass.prototype.getHours = vi.fn(() => 23); // 23:00 during quiet hours
      mockDateClass.prototype.getMinutes = vi.fn(() => 0);

      vi.spyOn(global, 'Date').mockImplementation(mockDateClass);

      expect(service.isQuietHours(quietHours)).toBe(true);

      vi.restoreAllMocks();
    });

    it('should return false when quiet hours are disabled', () => {
      const service = parentGradeNotificationService as any;
      const quietHours = {
        enabled: false,
        start: '22:00',
        end: '07:00'
      };

      expect(service.isQuietHours(quietHours)).toBe(false);
    });
  });

  describe('shouldNotify', () => {
    it('should notify for new grades', () => {
      const service = parentGradeNotificationService as any;
      const settings = { majorExamsOnly: false };
      const gradeData = { isBelowThreshold: false, isMajorExam: false };

      expect(service.shouldNotify(settings, gradeData, undefined)).toBe(true);
    });

    it('should notify for changed grades', () => {
      const service = parentGradeNotificationService as any;
      const settings = { majorExamsOnly: false };
      const gradeData = { isBelowThreshold: false, isMajorExam: false };
      const previousGrade = { score: 80 };

      expect(service.shouldNotify(settings, gradeData, previousGrade)).toBe(true);
    });

    it('should notify for grades below threshold', () => {
      const service = parentGradeNotificationService as any;
      const settings = { majorExamsOnly: false };
      const gradeData = { isBelowThreshold: true, isMajorExam: false };

      expect(service.shouldNotify(settings, gradeData, { score: 85 })).toBe(true);
    });

    it('should not notify for non-major exams when majorExamsOnly is true', () => {
      const service = parentGradeNotificationService as any;
      const settings = { majorExamsOnly: true };
      const gradeData = { isBelowThreshold: false, isMajorExam: false };
      const previousGrade = { score: 85 };

      const result = service.shouldNotify(settings, gradeData, previousGrade);
      expect(result).toBe(false);
    });
  });
});