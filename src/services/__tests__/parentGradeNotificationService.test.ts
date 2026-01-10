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

      // Use vi.setSystemTime to mock current time
      const mockDate = new Date('2024-01-01T23:00:00');
      vi.setSystemTime(mockDate);

      expect(service.isQuietHours(quietHours)).toBe(true);

      vi.useRealTimers();
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
      const gradeData = { grade: 85, isBelowThreshold: false, isMajorExam: false };
      const previousGrade = { score: 85 };

      const result = service.shouldNotify(settings, gradeData, previousGrade);
      expect(result).toBe(false);
    });
  });

describe('ParentGradeNotificationService - OCR Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage for OCR tests
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
      if (key === 'malnu_auth_session') {
        return JSON.stringify({
          role: 'parent'
        });
      }
      if (key === 'malnu_children') {
        return JSON.stringify([
          {
            studentId: 'student123',
            studentName: 'Ahmad Rizki'
          },
          {
            studentId: 'student456', 
            studentName: 'Siti Nurhaliza'
          }
        ]);
      }
      return null;
    });

    localStorageMock.setItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isChildDocument', () => {
    it('should return true for child document when current user is parent', () => {
      const service = parentGradeNotificationService as any;
      
      expect(service.isChildDocument('student123')).toBe(true);
      expect(service.isChildDocument('student456')).toBe(true);
    });

    it('should return false for non-child document', () => {
      const service = parentGradeNotificationService as any;
      
      expect(service.isChildDocument('student789')).toBe(false);
    });

    it('should return false when user is not parent', () => {
      const service = parentGradeNotificationService as any;
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'malnu_auth_session') {
          return JSON.stringify({
            role: 'teacher'
          });
        }
        return null;
      });
      
      expect(service.isChildDocument('student123')).toBe(false);
    });
  });

  describe('getStudentName', () => {
    it('should return correct student name', () => {
      const service = parentGradeNotificationService as any;
      
      expect(service.getStudentName('student123')).toBe('Ahmad Rizki');
      expect(service.getStudentName('student456')).toBe('Siti Nurhaliza');
    });

    it('should return fallback for unknown student', () => {
      const service = parentGradeNotificationService as any;
      
      expect(service.getStudentName('student789')).toBe('Siswa student789');
    });

    it('should return fallback when children data is missing', () => {
      const service = parentGradeNotificationService as any;
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'malnu_children') {
          return null;
        }
        return null;
      });
      
      expect(service.getStudentName('student123')).toBe('Siswa student123');
    });
  });

  describe('getDocumentTypeName', () => {
    it('should return correct localized document type names', () => {
      const service = parentGradeNotificationService as any;
      
      expect(service.getDocumentTypeName('academic')).toBe('Akademik');
      expect(service.getDocumentTypeName('administrative')).toBe('Administratif');
      expect(service.getDocumentTypeName('form')).toBe('Formulir');
      expect(service.getDocumentTypeName('certificate')).toBe('Sertifikat');
      expect(service.getDocumentTypeName('unknown')).toBe('Dokumen');
      expect(service.getDocumentTypeName('random')).toBe('Dokumen');
    });
  });

  describe('createOCRValidationNotification', () => {
    it('should create failure notification for validation-failure event', () => {
      const service = parentGradeNotificationService as any;
      const event = {
        id: 'test-event-1',
        type: 'validation-failure',
        documentId: 'doc123',
        documentType: 'academic',
        confidence: 45,
        issues: ['Confidence terlalu rendah (< 50%)', 'Kualitas teks tidak memenuhi standar'],
        userId: 'student123',
        timestamp: new Date().toISOString()
      };

      const notification = service.createOCRValidationNotification(event);

      expect(notification.title).toBe('❌ Validasi Dokumen Gagal - Ahmad Rizki');
      expect(notification.body).toContain('Dokumen Akademik gagal divalidasi');
      expect(notification.body).toContain('Silakan upload ulang dengan kualitas lebih baik');
      expect(notification.priority).toBe('high');
      expect(notification.type).toBe('ocr_validation');
      expect(notification.data.validationType).toBe('validation-failure');
      expect(notification.data.reuploadRequired).toBe(true);
      expect(notification.data.guidance).toContain('Panduan upload ulang');
    });

    it('should create warning notification for validation-warning event', () => {
      const service = parentGradeNotificationService as any;
      const event = {
        id: 'test-event-2',
        type: 'validation-warning',
        documentId: 'doc456',
        documentType: 'certificate',
        confidence: 65,
        issues: ['Confidence rendah (< 70%)'],
        userId: 'student456',
        timestamp: new Date().toISOString()
      };

      const notification = service.createOCRValidationNotification(event);

      expect(notification.title).toBe('⚠️ Validasi Dokumen Perhatian - Siti Nurhaliza');
      expect(notification.body).toContain('Dokumen Sertifikat memiliki masalah');
      expect(notification.body).toContain('Accuracy: 65.0%');
      expect(notification.priority).toBe('normal');
      expect(notification.type).toBe('ocr_validation');
      expect(notification.data.validationType).toBe('validation-warning');
      expect(notification.data.reuploadRequired).toBe(false);
    });

    it('should create success notification for important documents', () => {
      const service = parentGradeNotificationService as any;
      const event = {
        id: 'test-event-3',
        type: 'validation-success',
        documentId: 'doc789',
        documentType: 'certificate',
        confidence: 85,
        issues: [],
        userId: 'student123',
        timestamp: new Date().toISOString()
      };

      const notification = service.createOCRValidationNotification(event);

      expect(notification.title).toBe('✅ Validasi Dokumen Berhasil - Ahmad Rizki');
      expect(notification.body).toContain('Dokumen Sertifikat berhasil divalidasi');
      expect(notification.body).toContain('akurasi 85.0%');
      expect(notification.priority).toBe('low');
      expect(notification.type).toBe('ocr_validation');
      expect(notification.data.validationType).toBe('validation-success');
    });

    it('should skip notification for successful validation of non-important documents', () => {
      const service = parentGradeNotificationService as any;
      const event = {
        id: 'test-event-4',
        type: 'validation-success',
        documentId: 'doc012',
        documentType: 'academic', // Not certificate or administrative
        confidence: 90,
        issues: [],
        userId: 'student123',
        timestamp: new Date().toISOString()
      };

      const notification = service.createOCRValidationNotification(event);

      expect(notification.data.skipped).toBe(true);
      expect(notification.title).toBe('');
    });
  });

  describe('getReuploadGuidance', () => {
    it('should provide specific guidance for confidence issues', () => {
      const service = parentGradeNotificationService as any;
      const issues = ['Confidence terlalu rendah (< 50%)', 'kata terlalu sedikit'];
      
      const guidance = service.getReuploadGuidance('validation-failure', issues);

      expect(guidance).toContain('Panduan upload ulang:');
      expect(guidance).toContain('Pastikan dokumen memiliki kualitas gambar yang jelas dan tajam');
      expect(guidance).toContain('Pastikan semua teks terbaca dengan jelas');
    });

    it('should provide general guidance when no specific issues', () => {
      const service = parentGradeNotificationService as any;
      const issues = ['Random issue'];
      
      const guidance = service.getReuploadGuidance('validation-failure', issues);

      expect(guidance).toContain('Upload ulang dokumen dengan kualitas lebih baik');
      expect(guidance).toContain('Pastikan pencahayaan cukup dan tidak ada bayangan');
    });

    it('should return empty string for non-failure types', () => {
      const service = parentGradeNotificationService as any;
      const issues = ['Some issue'];
      
      const guidance = service.getReuploadGuidance('validation-warning', issues);

      expect(guidance).toBe('');
    });
  });

  describe('processQueuedOCRValidations', () => {
    it('should process ready events and remove them from queue', async () => {
      const service = parentGradeNotificationService as any;
      const pastTime = new Date(Date.now() - 10000).toISOString(); // 10 seconds ago
      const futureTime = new Date(Date.now() + 10000).toISOString(); // 10 seconds in future

      const readyEvent = {
        id: 'ready-event',
        type: 'validation-failure',
        documentId: 'doc123',
        documentType: 'academic',
        confidence: 45,
        issues: ['Test issue'],
        userId: 'student123',
        timestamp: new Date().toISOString(),
        queuedAt: pastTime,
        scheduledFor: pastTime
      };

      const futureEvent = {
        id: 'future-event',
        type: 'validation-warning', 
        documentId: 'doc456',
        documentType: 'certificate',
        confidence: 65,
        issues: ['Test warning'],
        userId: 'student456',
        timestamp: new Date().toISOString(),
        queuedAt: pastTime,
        scheduledFor: futureTime
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'malnu_queued_ocr_validations') {
          return JSON.stringify([readyEvent, futureEvent]);
        }
        return null;
      });

      // Mock sendOCRValidationNotification
      const mockSend = vi.fn().mockResolvedValue(undefined);
      service.sendOCRValidationNotification = mockSend;

      await service.processQueuedOCRValidations();

      expect(mockSend).toHaveBeenCalledWith(readyEvent);
      expect(mockSend).not.toHaveBeenCalledWith(futureEvent);

      // Should update localStorage with only future event
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'malnu_queued_ocr_validations',
        JSON.stringify([futureEvent])
      );
    });

    it('should do nothing when no ready events exist', async () => {
      const service = parentGradeNotificationService as any;
      const futureTime = new Date(Date.now() + 10000).toISOString();

      const futureEvent = {
        id: 'future-event',
        type: 'validation-warning',
        documentId: 'doc456',
        documentType: 'certificate',
        confidence: 65,
        issues: ['Test warning'],
        userId: 'student456',
        timestamp: new Date().toISOString(),
        queuedAt: new Date().toISOString(),
        scheduledFor: futureTime
      };

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'malnu_queued_ocr_validations') {
          return JSON.stringify([futureEvent]);
        }
        return null;
      });

      const mockSend = vi.fn().mockResolvedValue(undefined);
      service.sendOCRValidationNotification = mockSend;

      await service.processQueuedOCRValidations();

      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});
});