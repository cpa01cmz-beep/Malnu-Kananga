// ocr-validation-integration.test.ts - Integration tests for OCR validation notifications

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ocrService } from '../ocrService';
// parentGradeNotificationService is imported via OCR events in the test setup
// OCR service is mocked above

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

// Mock push notification service
const mockShowNotification = vi.fn().mockResolvedValue(undefined);

vi.mock('../pushNotificationService', () => ({
  pushNotificationService: {
    showLocalNotification: mockShowNotification
  }
}));

// Mock OCR service to emit events instead of actual OCR processing
vi.mock('../ocrService', () => ({
  ocrService: {
    extractTextFromImage: vi.fn().mockImplementation(async (file, progressCallback, options) => {
      // Simulate OCR processing and emit validation events
      const event = new CustomEvent('ocr-validation', {
        detail: {
          id: `validation-${options.documentId}`,
          type: 'validation-failure',
          documentId: options.documentId,
          documentType: options.documentType,
          confidence: 45.0,
          issues: ['Gambar kurang jelas', 'Teks sulit terbaca'],
          userId: options.userId,
          timestamp: new Date().toISOString(),
          actionUrl: options.actionUrl
        }
      });
      
      // Emit the event immediately
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

    // Verify that a notification was created and sent
    expect(mockShowNotification).toHaveBeenCalled();
    
    const notificationCall = mockShowNotification.mock.calls[0][0];
    expect(notificationCall.type).toBe('ocr_validation');
    expect(notificationCall.priority).toBe('high'); // Should be high for failure
    expect(notificationCall.title).toContain('Validasi Dokumen');
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

    // Should not send notification immediately during quiet hours
    expect(mockShowNotification).not.toHaveBeenCalled();

    // But should have queued the notification
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'malnu_queued_ocr_validations',
      expect.stringContaining('test-doc-456')
    );

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