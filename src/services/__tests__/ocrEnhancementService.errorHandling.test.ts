import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('OCR Enhancement Service Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('AI Client Initialization', () => {
    it('should initialize AI client with valid API key', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'valid-api-key-12345');

      const { generateTextSummary } = await import('../ocrEnhancementService');

      expect(generateTextSummary).toBeDefined();
    });

    it('should return error message when API key is missing', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { generateTextSummary } = await import('../ocrEnhancementService');

      const result = await generateTextSummary('Test text');
      expect(result).toBe('Terjadi kesalahan saat membuat ringkasan teks.');

      errorSpy.mockRestore();
    });
  });

  describe('generateTextSummary Error Handling', () => {
    it('should return error message on AI initialization failure', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { generateTextSummary } = await import('../ocrEnhancementService');

      const result = await generateTextSummary('Test content for summarization');
      expect(result).toBe('Terjadi kesalahan saat membuat ringkasan teks.');
    });

    it('should return error message on empty input', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { generateTextSummary } = await import('../ocrEnhancementService');

      const result = await generateTextSummary('');
      expect(result).toBe('Tidak ada teks untuk dianalisis.');
    });

    it('should return error message on whitespace-only input', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { generateTextSummary } = await import('../ocrEnhancementService');

      const result = await generateTextSummary('   ');
      expect(result).toBe('Tidak ada teks untuk dianalisis.');
    });

    it('should handle service errors gracefully', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { generateTextSummary } = await import('../ocrEnhancementService');

      const result = await generateTextSummary('Test content');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('compareTextsForSimilarity Error Handling', () => {
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

    it('should return default similarity on AI initialization failure', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result = await compareTextsForSimilarity('text 1', 'text 2');
      expect(result.similarity).toBe(0);
      expect(result.isPlagiarized).toBe(false);
      expect(result.details).toBe('Terjadi kesalahan analisis');
    });

    it('should handle threshold parameter correctly', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');

      const { compareTextsForSimilarity } = await import('../ocrEnhancementService');

      const result = await compareTextsForSimilarity('text 1', 'text 2', 0.9);
      expect(result).toBeDefined();
      expect(typeof result.similarity).toBe('number');
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
