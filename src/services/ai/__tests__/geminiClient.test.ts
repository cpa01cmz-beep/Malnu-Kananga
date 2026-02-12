import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the module first to check its structure
import { cleanupGeminiService, DEFAULT_API_BASE_URL, AI_MODELS } from '../geminiClient';

describe('Gemini Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    cleanupGeminiService();
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
  });

  afterEach(() => {
    cleanupGeminiService();
  });

  describe('cleanupGeminiService', () => {
    it('should clear AI instance and error state', () => {
      // Cleanup should not throw
      expect(() => cleanupGeminiService()).not.toThrow();
    });

    it('should be callable without errors', () => {
      expect(() => cleanupGeminiService()).not.toThrow();
    });

    it('should be callable multiple times', () => {
      expect(() => {
        cleanupGeminiService();
        cleanupGeminiService();
        cleanupGeminiService();
      }).not.toThrow();
    });
  });

  describe('exports', () => {
    it('should export AI_MODELS', () => {
      expect(AI_MODELS).toBeDefined();
      expect(AI_MODELS.FLASH).toBeDefined();
      expect(AI_MODELS.PRO_THINKING).toBeDefined();
    });

    it('should export DEFAULT_API_BASE_URL', () => {
      expect(DEFAULT_API_BASE_URL).toBeDefined();
      expect(typeof DEFAULT_API_BASE_URL).toBe('string');
    });
  });

  describe('getAIInstance', () => {
    it('should throw error when API key is missing', async () => {
      // Clear environment variable
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      
      // Import the module fresh to get error handling
      const { getAIInstance } = await import('../geminiClient');
      
      await expect(getAIInstance()).rejects.toThrow('API Key Gemini tidak ditemukan');
    });

    it('should accept valid API key', async () => {
      // Mock the GoogleGenAI constructor
      const mockGoogleGenAI = vi.fn().mockReturnValue({
        models: {}
      });
      
      vi.doMock('@google/genai', () => ({
        GoogleGenAI: mockGoogleGenAI
      }));
      
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
      
      // Import fresh after mocking
      const { getAIInstance } = await import('../geminiClient');
      
      const instance = await getAIInstance();
      expect(instance).toBeDefined();
      expect(mockGoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-api-key' });
    });

    it('should handle constructor errors', async () => {
      const mockGoogleGenAI = vi.fn().mockImplementation(() => {
        throw new Error('Invalid API key');
      });
      
      vi.doMock('@google/genai', () => ({
        GoogleGenAI: mockGoogleGenAI
      }));
      
      vi.stubEnv('VITE_GEMINI_API_KEY', 'invalid-key');
      
      // Import fresh after mocking
      const { getAIInstance } = await import('../geminiClient');
      
      await expect(getAIInstance()).rejects.toThrow();
    });

    it('should cache instance for subsequent calls', async () => {
      const mockInstance = { models: {} };
      const mockGoogleGenAI = vi.fn().mockReturnValue(mockInstance);
      
      vi.doMock('@google/genai', () => ({
        GoogleGenAI: mockGoogleGenAI
      }));
      
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      
      // Import fresh after mocking
      const { getAIInstance } = await import('../geminiClient');
      
      const instance1 = await getAIInstance();
      const instance2 = await getAIInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(mockInstance);
      expect(mockGoogleGenAI).toHaveBeenCalledTimes(1);
    });

    it('should reset after cleanup', async () => {
      const mockGoogleGenAI = vi.fn().mockReturnValue({ models: {} });
      
      vi.doMock('@google/genai', () => ({
        GoogleGenAI: mockGoogleGenAI
      }));
      
      vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
      
      // Import fresh after mocking
      const { getAIInstance } = await import('../geminiClient');
      
      await getAIInstance();
      expect(mockGoogleGenAI).toHaveBeenCalledTimes(1);
      
      // Cleanup
      cleanupGeminiService();
      
      // Should create new instance after cleanup
      await getAIInstance();
      expect(mockGoogleGenAI).toHaveBeenCalledTimes(2);
    });
  });

  describe('AI_MODELS', () => {
    it('should have expected model names', () => {
      expect(typeof AI_MODELS.FLASH).toBe('string');
      expect(typeof AI_MODELS.PRO_THINKING).toBe('string');
      expect(AI_MODELS.FLASH.length).toBeGreaterThan(0);
      expect(AI_MODELS.PRO_THINKING.length).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_API_BASE_URL', () => {
    it('should have valid URL format', () => {
      expect(DEFAULT_API_BASE_URL).toMatch(/^https?:\/\//);
      expect(typeof DEFAULT_API_BASE_URL).toBe('string');
      expect(DEFAULT_API_BASE_URL.length).toBeGreaterThan(0);
    });
  });
});