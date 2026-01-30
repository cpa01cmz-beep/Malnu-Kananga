import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ocrService } from '../ocrService';
import { STORAGE_KEYS } from '../../constants';

describe('ocrService - Basic Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Public API', () => {
    it('should have initialize method', () => {
      expect(ocrService.initialize).toBeTypeOf('function');
    });

    it('should have extractTextFromImage method', () => {
      expect(ocrService.extractTextFromImage).toBeTypeOf('function');
    });

    it('should have terminate method', () => {
      expect(ocrService.terminate).toBeTypeOf('function');
    });

    it('should have clearCache method', () => {
      expect(ocrService.clearCache).toBeTypeOf('function');
    });

    it('should have getCacheStats method', () => {
      expect(ocrService.getCacheStats).toBeTypeOf('function');
    });
  });

  describe('Cache Management', () => {
    it('should clear OCR cache', () => {
      expect(() => ocrService.clearCache()).not.toThrow();
    });

    it('should get cache stats', () => {
      const stats = ocrService.getCacheStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
    });
  });

  describe('Storage Integration', () => {
    it('should use STORAGE_KEYS constant', () => {
      expect(STORAGE_KEYS).toHaveProperty('OCR_VALIDATION_EVENTS');
      expect(STORAGE_KEYS.OCR_VALIDATION_EVENTS).toBeTypeOf('string');
    });
  });
});
