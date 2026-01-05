// geminiService.test.ts - Tests for enhanced Gemini service with error recovery

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleGenAI } from '@google/genai';

// Mock the GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContentStream: vi.fn(),
      generateContent: vi.fn(),
    },
  })),
  Type: {
    OBJECT: 'object',
    ARRAY: 'array',
    STRING: 'string',
  },
}));

// Mock the error handler
vi.mock('../utils/geminiErrorHandler', () => ({
  geminiErrorHandler: {
    executeWithRetry: vi.fn(),
    getFallbackModel: vi.fn(),
    healthCheck: vi.fn(),
  },
  GeminiError: class extends Error {
    constructor(public errorInfo: { userMessage: string; retryable: boolean }, public originalError: Error) {
      super(errorInfo.userMessage);
      this.name = 'GeminiError';
    }
  },
}));

// Mock the config
vi.mock('../config', () => ({
  WORKER_CHAT_ENDPOINT: 'https://example.com/chat',
}));

import { getAIResponseStream, analyzeClassPerformance, getAIEditorResponse, checkGeminiHealth } from '../geminiService';
import { geminiErrorHandler } from '../utils/geminiErrorHandler';

describe('Enhanced Gemini Service', () => {
  const mockGeminiErrorHandler = geminiErrorHandler as ReturnType<typeof vi.mocked>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAIResponseStream', () => {
    it('should handle successful streaming response', async () => {
      const mockChunks = ['Hello', ' ', 'world'];
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of mockChunks) {
            yield { text: chunk };
          }
        },
      };

      mockGeminiErrorHandler.executeWithRetry.mockImplementation((fn) => fn());
      
      const mockGenerateContentStream = vi.fn().mockResolvedValue(mockStream);
      const mockGemini = new GoogleGenAI({ apiKey: 'test-key' });
      mockGemini.models.generateContentStream = mockGenerateContentStream;

      // Mock global fetch for RAG context
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ context: 'test context' }),
      });

      const generator = getAIResponseStream('test message', []);
      const result = [];
      
      for await (const chunk of generator) {
        result.push(chunk);
      }

      expect(result).toEqual(mockChunks);
    });

    it('should handle GeminiError and return user-friendly message', async () => {
      const errorInfo = {
        type: 'network',
        severity: 'medium',
        retryable: true,
        userMessage: 'Koneksi internet tidak stabil',
        technicalMessage: 'Network error',
      };

      const geminiError = new (class extends Error {
        constructor() {
          super('Koneksi internet tidak stabil');
          this.name = 'GeminiError';
        }
        errorInfo = errorInfo;
        originalError = new Error('Network error');
      })();

      mockGeminiErrorHandler.executeWithRetry.mockRejectedValue(geminiError);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ context: 'test context' }),
      });

      const generator = getAIResponseStream('test message', []);
      const result = [];
      
      for await (const chunk of generator) {
        result.push(chunk);
      }

      expect(result).toEqual(['Koneksi internet tidak stabil']);
    });

    it('should handle generic errors and return default message', async () => {
      mockGeminiErrorHandler.executeWithRetry.mockRejectedValue(new Error('Unknown error'));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ context: 'test context' }),
      });

      const generator = getAIResponseStream('test message', []);
      const result = [];
      
      for await (const chunk of generator) {
        result.push(chunk);
      }

      expect(result).toEqual(['Maaf, sistem AI sedang sibuk atau mengalami gangguan. Silakan coba sesaat lagi.']);
    });

    it('should handle RAG context fetch errors gracefully', async () => {
      const mockChunks = ['Response'];
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of mockChunks) {
            yield { text: chunk };
          }
        },
      };

      mockGeminiErrorHandler.executeWithRetry.mockImplementation((fn) => fn());
      
      const mockGenerateContentStream = vi.fn().mockResolvedValue(mockStream);
      const mockGemini = new GoogleGenAI({ apiKey: 'test-key' });
      mockGemini.models.generateContentStream = mockGenerateContentStream;

      // Mock failed RAG fetch
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const generator = getAIResponseStream('test message', []);
      const result = [];
      
      for await (const chunk of generator) {
        result.push(chunk);
      }

      expect(result).toEqual(mockChunks);
    });
  });

  describe('analyzeClassPerformance', () => {
    it('should handle successful analysis', async () => {
      const mockResponse = { text: 'Analysis result' };
      mockGeminiErrorHandler.executeWithRetry.mockResolvedValue(mockResponse);

      const result = await analyzeClassPerformance([
        { studentName: 'John', subject: 'Math', grade: 'A', semester: '1' }
      ]);

      expect(result).toBe('Analysis result');
    });

    it('should handle retryable errors with fallback model', async () => {
      const errorInfo = {
        type: 'model_unavailable',
        severity: 'high',
        retryable: true,
        userMessage: 'Model AI sedang tidak tersedia',
        technicalMessage: 'Model unavailable',
      };

      const geminiError = new (class extends Error {
        constructor() {
          super('Model AI sedang tidak tersedia');
          this.name = 'GeminiError';
        }
        errorInfo = errorInfo;
        originalError = new Error('Model unavailable');
      })();

      // First call fails, second succeeds
      mockGeminiErrorHandler.executeWithRetry
        .mockRejectedValueOnce(geminiError)
        .mockResolvedValueOnce({ text: 'Analysis result' });

      mockGeminiErrorHandler.getFallbackModel.mockReturnValue('gemini-2.5-flash');

      const result = await analyzeClassPerformance([
        { studentName: 'John', subject: 'Math', grade: 'A', semester: '1' }
      ]);

      expect(result).toBe('Analysis result');
      expect(mockGeminiErrorHandler.getFallbackModel).toHaveBeenCalled();
    });

    it('should handle GeminiError and return user-friendly message', async () => {
      const errorInfo = {
        type: 'quota',
        severity: 'high',
        retryable: false,
        userMessage: 'Kuota AI terlampaui',
        technicalMessage: 'Quota exceeded',
      };

      const geminiError = new (class extends Error {
        constructor() {
          super('Kuota AI terlampaui');
          this.name = 'GeminiError';
        }
        errorInfo = errorInfo;
        originalError = new Error('Quota exceeded');
      })();

      mockGeminiErrorHandler.executeWithRetry.mockRejectedValue(geminiError);

      const result = await analyzeClassPerformance([
        { studentName: 'John', subject: 'Math', grade: 'A', semester: '1' }
      ]);

      expect(result).toBe('Kuota AI terlampaui');
    });
  });

  describe('getAIEditorResponse', () => {
    it('should handle successful content editing', async () => {
      const mockResponse = { text: '{"featuredPrograms": [], "latestNews": []}' };
      mockGeminiErrorHandler.executeWithRetry.mockResolvedValue(mockResponse);

      const currentContent = {
        featuredPrograms: [],
        latestNews: [],
      };

      const result = await getAIEditorResponse('test prompt', currentContent);

      expect(result).toEqual(currentContent);
    });

    it('should handle retryable errors with fallback model', async () => {
      const errorInfo = {
        type: 'timeout',
        severity: 'medium',
        retryable: true,
        userMessage: 'Permintaan terlalu lama',
        technicalMessage: 'Request timeout',
      };

      const geminiError = new (class extends Error {
        constructor() {
          super('Permintaan terlalu lama');
          this.name = 'GeminiError';
        }
        errorInfo = errorInfo;
        originalError = new Error('Request timeout');
      })();

      // First call fails, second succeeds
      mockGeminiErrorHandler.executeWithRetry
        .mockRejectedValueOnce(geminiError)
        .mockResolvedValueOnce({ text: '{"featuredPrograms": [], "latestNews": []}' });

      mockGeminiErrorHandler.getFallbackModel.mockReturnValue('gemini-2.5-flash');

      const currentContent = {
        featuredPrograms: [],
        latestNews: [],
      };

      const result = await getAIEditorResponse('test prompt', currentContent);

      expect(result).toEqual(currentContent);
    });

    it('should handle GeminiError and throw user-friendly message', async () => {
      const errorInfo = {
        type: 'content_filter',
        severity: 'low',
        retryable: false,
        userMessage: 'Permintaan tidak dapat diproses',
        technicalMessage: 'Content filter triggered',
      };

      const geminiError = new (class extends Error {
        constructor() {
          super('Permintaan tidak dapat diproses');
          this.name = 'GeminiError';
        }
        errorInfo = errorInfo;
        originalError = new Error('Content filter triggered');
      })();

      mockGeminiErrorHandler.executeWithRetry.mockRejectedValue(geminiError);

      await expect(
        getAIEditorResponse('test prompt', { featuredPrograms: [], latestNews: [] })
      ).rejects.toThrow('Permintaan tidak dapat diproses');
    });
  });

  describe('checkGeminiHealth', () => {
    it('should call health check and return result', async () => {
      const mockHealthCheckResult = {
        healthy: true,
        issues: [],
      };

      mockGeminiErrorHandler.healthCheck.mockResolvedValue(mockHealthCheckResult);

      const result = await checkGeminiHealth();

      expect(result).toEqual(mockHealthCheckResult);
      expect(mockGeminiErrorHandler.healthCheck).toHaveBeenCalledTimes(1);
    });
  });
});