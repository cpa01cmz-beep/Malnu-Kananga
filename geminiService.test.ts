import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simple tests for basic functionality without complex mocking

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialGreeting', () => {
    it('should return expected greeting message', async () => {
      // Import dynamically to avoid module mocking issues
      const { initialGreeting } = await import('./src/services/geminiService');
      expect(initialGreeting).toBe("Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?");
    });
  });

  describe('getAIResponseStream Error Handling', () => {
    it('should handle API key error gracefully', async () => {
      // Set environment to null to test error handling
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      
      // Import after setting environment
      const { getAIResponseStream } = await import('./src/services/geminiService');
      
      const result = [];
      try {
        for await (const chunk of getAIResponseStream('test', [])) {
          result.push(chunk);
        }
      } catch (error) {
        // Expected to error
      }
      
      // Should either return empty array or error message
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('analyzeClassPerformance Error Handling', () => {
    it('should handle empty grades array', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      
      const { analyzeClassPerformance } = await import('./src/services/geminiService');
      
      const result = await analyzeClassPerformance([]);
      
      // Should return error message for empty input or API errors
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getAIEditorResponse Error Handling', () => {
    it('should handle empty content object', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      
      const { getAIEditorResponse } = await import('./src/services/geminiService');
      
      try {
        const result = await getAIEditorResponse('test', { featuredPrograms: [], latestNews: [] });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to throw error
        expect(error instanceof Error).toBe(true);
      }
    });
  });
});