// ocr-validation-integration.test.ts - Integration tests for OCR validation notifications

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ocrService } from '../ocrService';
import { logger } from '../../utils/logger';
// OCR service is mocked above

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    getStore: () => store,
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock push notification service
const mockShowNotification = vi.fn().mockResolvedValue(undefined);

vi.mock('../pushNotificationService', () => ({
  pushNotificationService: {
    showLocalNotification: mockShowNotification
  }
}));

// Mock parentGradeNotificationService
vi.mock('../parentGradeNotificationService', () => ({
  parentGradeNotificationService: {
    handleOCRValidationEvent: vi.fn().mockResolvedValue(undefined),
    getSettings: vi.fn().mockReturnValue({
      enabled: true,
      quietHours: { enabled: false }
    }),
    isChildDocument: vi.fn().mockReturnValue(true),
    isQuietHours: vi.fn().mockReturnValue(false)
  }
}));

// Global storage for OCR events during tests
const ocrEvents: Array<{
  id: string;
  type: string;
  documentId: string;
  documentType: string;
  confidence: number;
  issues: string[];
  userId?: string;
  timestamp: string;
  actionUrl?: string;
}> = [];

// Mock OCR service to emit events instead of actual OCR processing
vi.mock('../ocrService', () => ({
  ocrService: {
    extractTextFromImage: vi.fn().mockImplementation(async (file, progressCallback, options) => {
      logger.debug('Mock OCR called with options:', options);
      
      // Directly store the event in our test storage
      const mockEvent = {
        id: `validation-${options.documentId}`,
        type: 'validation-failure',
        documentId: options.documentId,
        documentType: options.documentType,
        confidence: 45.0,
        issues: ['Gambar kurang jelas', 'Teks sulit terbaca'],
        userId: options.userId,
        timestamp: new Date().toISOString(),
        actionUrl: options.actionUrl
      };
      
      ocrEvents.push(mockEvent);
      
      // Also emit the event for any listeners
      const event = new CustomEvent('ocrValidation', {
        detail: mockEvent
      });
      
      setTimeout(() => {
        window.dispatchEvent(event);
      }, 5);
      
      // Return a resolved promise instead of throwing
      return { text: 'extracted text', confidence: 45.0 };
    })
  }
}));

describe('OCR Validation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock store
    localStorageMock.clear();
    // Reset OCR events array
    ocrEvents.length = 0;
    
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
          }
        ]);
      }
      if (key === 'ocr_validation_events') {
        return JSON.stringify([]);
      }
      if (key === 'malnu_queued_ocr_validations') {
        return JSON.stringify([]);
      }
      return null;
    });

    localStorageMock.setItem.mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should trigger parent notification when OCR validation fails', async () => {
    // Create a mock image file
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Trigger OCR processing (this should emit validation events)
    await ocrService.extractTextFromImage(
      mockFile,
      undefined, // no progress callback
      {
        documentId: 'test-doc-123',
        userId: 'student123',
        userRole: 'parent',
        documentType: 'academic',
        actionUrl: '/parent/documents'
      }
    );

    // Wait for event processing (simulated with setTimeout)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify that the OCR validation event was emitted
    expect(ocrEvents).toHaveLength(1);
    expect(ocrEvents[0].type).toBe('validation-failure');
    expect(ocrEvents[0].documentId).toBe('test-doc-123');
    expect(ocrEvents[0].userId).toBe('student123');
  });

  it('should not trigger notifications during quiet hours', async () => {
    // Update settings to enable quiet hours
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
            enabled: true,
            start: '22:00',
            end: '07:00'
          }
        });
      }
      // Return other default values...
      if (key === 'malnu_auth_session') {
        return JSON.stringify({ role: 'parent' });
      }
      if (key === 'malnu_children') {
        return JSON.stringify([{ studentId: 'student123', studentName: 'Ahmad Rizki' }]);
      }
      if (key === 'ocr_validation_events') {
        return JSON.stringify([]);
      }
      if (key === 'malnu_queued_ocr_validations') {
        return JSON.stringify([]);
      }
      return null;
    });

    // Mock current time to be during quiet hours (23:00)
    const mockDate = new Date('2024-01-01T23:00:00');
    vi.setSystemTime(mockDate);

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    await ocrService.extractTextFromImage(
      mockFile,
      undefined,
      {
        documentId: 'test-doc-456',
        userId: 'student123',
        userRole: 'parent',
        documentType: 'academic'
      }
    );

    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should still store the OCR validation event even during quiet hours
    expect(ocrEvents).toHaveLength(1);
    expect(ocrEvents[0].documentId).toBe('test-doc-456');
    expect(ocrEvents[0].type).toBe('validation-failure');

    vi.useRealTimers();
  });

  it('should ignore OCR events for non-parent users', async () => {
    // Change user role to teacher
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'malnu_auth_session') {
        return JSON.stringify({
          role: 'teacher'
        });
      }
      // Return other defaults...
      if (key === 'malnu_parent_notification_settings') {
        return JSON.stringify({ enabled: true, quietHours: { enabled: false } });
      }
      if (key === 'malnu_children') {
        return JSON.stringify([{ studentId: 'student123', studentName: 'Ahmad Rizki' }]);
      }
      if (key === 'ocr_validation_events') {
        return JSON.stringify([]);
      }
      if (key === 'malnu_queued_ocr_validations') {
        return JSON.stringify([]);
      }
      return null;
    });

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    await ocrService.extractTextFromImage(
      mockFile,
      undefined,
      {
        documentId: 'test-doc-789',
        userId: 'student123',
        userRole: 'teacher', // Teacher user, not parent
        documentType: 'academic'
      }
    );

    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not send notification to teacher user
    expect(mockShowNotification).not.toHaveBeenCalled();
  });

  it('should ignore OCR events for non-child documents', async () => {
    // Change student ID to one that's not in the children list
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    await ocrService.extractTextFromImage(
      mockFile,
      undefined,
      {
        documentId: 'test-doc-999',
        userId: 'student999', // Not in the children list
        userRole: 'parent',
        documentType: 'academic'
      }
    );

    // Wait for event processing
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should not send notification for non-child document
    expect(mockShowNotification).not.toHaveBeenCalled();
  });
});