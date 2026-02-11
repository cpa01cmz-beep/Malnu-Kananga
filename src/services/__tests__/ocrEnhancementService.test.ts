import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock AI cache service
const mockOcrCache = {
  set: vi.fn(),
  get: vi.fn(),
};

vi.mock('../aiCacheService', () => ({
  ocrCache: mockOcrCache,
}));

// Mock error handler utilities
vi.mock('../../utils/errorHandler', () => ({
  classifyError: vi.fn((error) => error),
  logError: vi.fn(),
  withCircuitBreaker: vi.fn((fn) => fn()),
  createError: vi.fn(),
  ErrorType: {
    API_KEY_ERROR: 'API_KEY_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('OCREnhancementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generateTextSummary', () => {
    it('should handle empty text gracefully', async () => {
      const { generateTextSummary } = await import('../ocrEnhancementService');
      
      const result1 = await generateTextSummary('');
      expect(result1).toBe('Tidak ada teks untuk dianalisis.');

      const result2 = await generateTextSummary('   ');
      expect(result2).toBe('Tidak ada teks untuk dianalisis.');

      const result3 = await generateTextSummary(null as any);
      expect(result3).toBe('Tidak ada teks untuk dianalisis.');
    });

    it('should handle missing API key', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { generateTextSummary } = await import('../ocrEnhancementService');
      const result = await generateTextSummary('Test text');

      expect(result).toBe('Terjadi kesalahan saat membuat ringkasan teks.');
    });

    it('should use custom maxLength parameter', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { generateTextSummary } = await import('../ocrEnhancementService');
      
      // Just verify the function accepts the parameter
      const result = await generateTextSummary('Test text', 100);
      expect(typeof result).toBe('string');
    });

    it('should handle AI service errors gracefully', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { generateTextSummary } = await import('../ocrEnhancementService');
      const result = await generateTextSummary('Test content');
      expect(typeof result).toBe('string');
    });

    it('should not cache empty results', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { generateTextSummary } = await import('../ocrEnhancementService');
      
      await generateTextSummary('');
      await generateTextSummary('   ');

      // Cache should not be called for empty inputs
      expect(mockOcrCache.set).not.toHaveBeenCalled();
    });
  });

  describe('compareTextsForSimilarity', () => {
    it('should return zero similarity on missing text inputs', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result1 = await compareTextsForSimilarity('', 'some text');
      expect(result1.similarity).toBe(0);
      expect(result1.isPlagiarized).toBe(false);
      expect(result1.details).toBe('Teks tidak lengkap');

      const result2 = await compareTextsForSimilarity('some text', '');
      expect(result2.similarity).toBe(0);
      expect(result2.isPlagiarized).toBe(false);
      expect(result2.details).toBe('Teks tidak lengkap');
    });

    it('should handle threshold parameter correctly', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result = await compareTextsForSimilarity('text 1', 'text 2', 0.9);
      expect(result).toBeDefined();
      expect(typeof result.similarity).toBe('number');
      expect(typeof result.isPlagiarized).toBe('boolean');
      expect(typeof result.details).toBe('string');
    });

    it('should return default similarity on AI initialization failure', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result = await compareTextsForSimilarity('text 1', 'text 2');
      expect(result.similarity).toBe(0);
      expect(result.isPlagiarized).toBe(false);
      expect(result.details).toBe('Terjadi kesalahan analisis');
    });

    it('should handle similarity result with proper structure', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result = await compareTextsForSimilarity('text 1', 'text 2');
      
      expect(result).toHaveProperty('similarity');
      expect(result).toHaveProperty('isPlagiarized');
      expect(result).toHaveProperty('details');
      expect(typeof result.similarity).toBe('number');
      expect(typeof result.isPlagiarized).toBe('boolean');
      expect(typeof result.details).toBe('string');
      expect(result.similarity).toBeGreaterThanOrEqual(0);
      expect(result.similarity).toBeLessThanOrEqual(1);
    });

    it('should use default threshold when not specified', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result = await compareTextsForSimilarity('Text 1', 'Text 2');
      expect(typeof result.similarity).toBe('number');
    });
  });

  describe('AI Client Management', () => {
    it('should cache initialization error', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { generateTextSummary, compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result1 = await generateTextSummary('Test 1');
      const result2 = await generateTextSummary('Test 2');

      expect(result1).toBe('Terjadi kesalahan saat membuat ringkasan teks.');
      expect(result2).toBe('Terjadi kesalahan saat membuat ringkasan teks.');

      const result3 = await compareTextsForSimilarity('text 1', 'text 2');
      expect(result3.similarity).toBe(0);
      expect(result3.isPlagiarized).toBe(false);
    });

    it('should handle service initialization', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { generateTextSummary } = await import('../ocrEnhancementService');
      const result = await generateTextSummary('Test content');
      
      expect(typeof result).toBe('string');
    });
  });

  describe('Error Recovery', () => {
    it('should handle multiple service calls after initialization failure', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { generateTextSummary, compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result1 = await generateTextSummary('test 1');
      expect(result1).toBe('Terjadi kesalahan saat membuat ringkasan teks.');

      const result2 = await generateTextSummary('test 2');
      expect(result2).toBe('Terjadi kesalahan saat membuat ringkasan teks.');

      const result3 = await compareTextsForSimilarity('text 1', 'text 2');
      expect(result3.similarity).toBe(0);
      expect(result3.isPlagiarized).toBe(false);
    });
  });
});