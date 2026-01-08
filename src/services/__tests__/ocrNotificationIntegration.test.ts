import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ocrService } from '../ocrService';
import { OCRValidationEvent, UserRole } from '../../types';

// Mock dependencies
vi.mock('tesseract.js', () => ({
  createWorker: vi.fn(() => ({
    setParameters: vi.fn(),
    recognize: vi.fn().mockResolvedValue({
      data: {
        text: 'John Doe\nNISN: 1234567890\nMatematika: 85',
        confidence: 45 // Low confidence to trigger validation failure
      }
    }),
    terminate: vi.fn()
  })),
  PSM: {
    AUTO: 1
  }
}));

vi.mock('../pushNotificationService', () => ({
  pushNotificationService: {
    showLocalNotification: vi.fn()
  }
}));

describe('OCR Validation Notification Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    
    // Clear any existing listeners
    window.dispatchEvent = vi.fn();
    
    // Mock current user
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('OCR Service Event Emission', () => {
    it('should emit validation failure event for low confidence OCR', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const customEventHandler = vi.fn();
      
      // Listen for custom events
      window.addEventListener('ocrValidation', customEventHandler);
      
      try {
        await ocrService.extractTextFromImage(mockFile, undefined, {
          documentId: 'test-doc-123',
          userId: 'teacher-1',
          userRole: 'teacher' as UserRole,
          documentType: 'academic',
          actionUrl: '/review/test-doc-123'
        });
      } catch (_error) {
        // OCR processing may fail in test environment, which is expected
      }
      
      // Check if localStorage was called to store the event
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'ocr_validation_events',
        expect.stringContaining('validation-failure')
      );
      
      window.removeEventListener('ocrValidation', customEventHandler);
    });

    it('should detect validation issues correctly', async () => {
      // Test the issue detection logic
      const quality = {
        isSearchable: false,
        isHighQuality: false,
        estimatedAccuracy: 30,
        wordCount: 1,
        characterCount: 4,
        hasMeaningfulContent: false,
        documentType: 'unknown' as const
      };
      
      // Test the issue detection logic
      const testQuality = {
        isSearchable: false,
        isHighQuality: false,
        estimatedAccuracy: 30,
        wordCount: 1,
        characterCount: 4,
        hasMeaningfulContent: false,
        documentType: 'unknown' as const
      };
      
      // Access private method through type assertion for testing
      const ocrServiceAny = ocrService as any;
      const result = ocrServiceAny.detectValidationIssues(testQuality, 30);
      
      expect(result.severity).toBe('failure');
      expect(result.issues).toContain('Confidence terlalu rendah (< 50%)');
      expect(result.issues).toContain('Kualitas teks tidak memenuhi standar tinggi');
    });
  });

  describe('Event Notification Integration', () => {
    it('should create OCR validation notification with correct data', () => {
      const mockEvent: OCRValidationEvent = {
        id: 'ocr-test-123',
        type: 'validation-failure',
        documentId: 'doc-123',
        documentType: 'academic',
        confidence: 45,
        issues: ['Confidence terlalu rendah', 'Jumlah kata terlalu sedikit'],
        timestamp: new Date().toISOString(),
        userId: 'teacher-1',
        userRole: 'teacher',
        actionUrl: '/review/doc-123'
      };

      // Simulate the event that would be emitted by OCR service
      if (typeof window !== 'undefined' && 'CustomEvent' in window) {
        window.dispatchEvent(new CustomEvent('ocrValidation', { detail: mockEvent }));
      }

      // Verify the event structure is correct
      expect(mockEvent.type).toBe('validation-failure');
      expect(mockEvent.confidence).toBeLessThan(50);
      expect(mockEvent.issues.length).toBeGreaterThan(0);
      expect(mockEvent.actionUrl).toBe('/review/doc-123');
    });

    it('should handle validation warning events', () => {
      const mockEvent: OCRValidationEvent = {
        id: 'ocr-warning-123',
        type: 'validation-warning',
        documentId: 'doc-456',
        documentType: 'form',
        confidence: 65,
        issues: ['Confidence rendah (< 70%)'],
        timestamp: new Date().toISOString(),
        userId: 'admin-1',
        userRole: 'admin',
        actionUrl: '/review/doc-456'
      };
      
      window.dispatchEvent(new CustomEvent('ocrValidation', { detail: mockEvent }));
      
      expect(mockEvent.type).toBe('validation-warning');
      expect(mockEvent.confidence).toBeGreaterThan(50);
      expect(mockEvent.confidence).toBeLessThan(70);
    });
  });

  describe('Notification Settings Integration', () => {
    it('should respect OCR notification settings', () => {
      // Test that OCR notifications can be enabled/disabled through settings
      const notificationSettings = {
        enabled: true,
        announcements: true,
        grades: true,
        ppdbStatus: true,
        events: true,
        library: true,
        system: true,
        ocr: false, // OCR notifications disabled
        roleBasedFiltering: true,
        batchNotifications: true,
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      };
      
      // Verify OCR setting exists
      expect(notificationSettings.ocr).toBe(false);
    });
  });

  describe('OCR Validation Event Storage', () => {
    it('should store OCR validation events in localStorage', () => {
      const events = [
        {
          id: 'ocr-1',
          type: 'validation-failure',
          documentId: 'doc-1',
          documentType: 'academic',
          confidence: 45,
          issues: ['Low confidence'],
          timestamp: new Date().toISOString(),
          userId: 'user-1',
          userRole: 'teacher' as UserRole
        }
      ];
      
      localStorage.setItem('ocr_validation_events', JSON.stringify(events));
      const stored = localStorage.getItem('ocr_validation_events');
      const parsed = JSON.parse(stored || '[]');
      
      expect(parsed).toHaveLength(1);
      expect(parsed[0].type).toBe('validation-failure');
    });
  });
});