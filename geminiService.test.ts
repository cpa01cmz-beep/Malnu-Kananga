import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally for all tests
global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any environment variables that might trigger real API calls
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
  });

  describe('initialGreeting', () => {
    it('should return expected greeting message', async () => {
      // Import the service function directly
      const { initialGreeting } = await import('./src/services/geminiService');
      expect(initialGreeting).toBe("Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?");
    });
  });

  describe('getAIResponseStream', () => {
    it('should return fallback message on API error', async () => {
      const { getAIResponseStream } = await import('./src/services/geminiService');
      
      const chunks = [];
      for await (const chunk of getAIResponseStream('test', [])) {
        chunks.push(chunk);
      }
      
      // Should return the fallback error message
      expect(chunks).toContain("Maaf, sistem AI sedang sibuk atau mengalami gangguan. Silakan coba sesaat lagi.");
    });
  });

  describe('analyzeClassPerformance', () => {
    it('should return fallback message on API error', async () => {
      const { analyzeClassPerformance } = await import('./src/services/geminiService');
      
      const result = await analyzeClassPerformance([]);
      
      // Should return fallback error message
      expect(result).toBe("Maaf, gagal menganalisis data saat ini.");
    });
  });

  describe('getAIEditorResponse', () => {
    it('should throw error on API failure', async () => {
      const { getAIEditorResponse } = await import('./src/services/geminiService');
      
      try {
        await getAIEditorResponse('test', { featuredPrograms: [], latestNews: [] });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Expected to throw error
        expect(error instanceof Error).toBe(true);
        expect(error.message).toBe("Gagal memproses respon dari AI. Mohon coba instruksi yang lebih spesifik.");
      }
    });
  });
});