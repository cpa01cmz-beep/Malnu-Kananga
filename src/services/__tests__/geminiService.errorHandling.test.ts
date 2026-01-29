import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Gemini Service Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe('AI Client Initialization', () => {
    it('should handle missing API key gracefully', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { getAIResponseStream } = await import('../geminiService');

      const chunks = [];
      for await (const chunk of getAIResponseStream('test', [])) {
        chunks.push(chunk);
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toContain('Konfigurasi API tidak valid');

      errorSpy.mockRestore();
    });

    it('should return error message when API key is empty', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { analyzeClassPerformance } = await import('../geminiService');

      const result = await analyzeClassPerformance([]);

      expect(result).toContain('Konfigurasi API tidak valid');
    });

    it('should handle API key initialization errors', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { analyzeStudentPerformance } = await import('../geminiService');

      const result = await analyzeStudentPerformance({
        grades: [],
        attendance: { percentage: 0, totalDays: 0, present: 0, absent: 0 },
        trends: []
      }, false);

      expect(result).toContain('Konfigurasi API tidak valid');
    });
  });

  describe('Service Function Error Handling', () => {
    it('should handle getAIEditorResponse errors gracefully', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { getAIEditorResponse } = await import('../geminiService');

      try {
        await getAIEditorResponse('test', { featuredPrograms: [], latestNews: [] });
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Konfigurasi API tidak valid');
        }
      }
    });

    it('should handle generateAssignmentFeedback errors', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { generateAssignmentFeedback } = await import('../geminiService');

      try {
        await generateAssignmentFeedback(
          { title: 'Test', description: 'Test', type: 'test', maxScore: 100 },
          { studentName: 'Student', submissionText: 'Test' }
        );
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Konfigurasi API tidak valid');
        }
      }
    });

    it('should handle generateQuiz errors', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { generateQuiz } = await import('../geminiService');

      try {
        await generateQuiz(
          [{ title: 'Test', content: 'Test content', category: 'test' }],
          { questionCount: 5, questionTypes: ['multiple_choice'], difficulty: 'medium' }
        );
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Server sedang mengalami gangguan');
        }
      }
    });

    it('should handle generateStudyPlan errors', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { generateStudyPlan } = await import('../geminiService');

      try {
        await generateStudyPlan({
          studentName: 'Student',
          grades: [],
          attendance: { percentage: 0, totalDays: 0, present: 0, absent: 0 },
          goals: [],
          subjects: []
        }, 4);
        expect(true).toBe(false);
      } catch (error) {
        if (error instanceof Error) {
          expect(error.message).toContain('Server sedang mengalami gangguan');
        }
      }
    });
  });

  describe('Error Recovery and Caching', () => {
    it('should handle multiple consecutive errors without crashing', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { getAIResponseStream, analyzeClassPerformance } = await import('../geminiService');

      const chunks1 = [];
      for await (const chunk of getAIResponseStream('test1', [])) {
        chunks1.push(chunk);
      }
      expect(chunks1.length).toBeGreaterThan(0);

      const result1 = await analyzeClassPerformance([]);
      expect(result1.length).toBeGreaterThan(0);

      const chunks2 = [];
      for await (const chunk of getAIResponseStream('test2', [])) {
        chunks2.push(chunk);
      }
      expect(chunks2.length).toBeGreaterThan(0);
    });

    it('should cache initialization error to prevent repeated failures', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const { analyzeClassPerformance } = await import('../geminiService');

      const result1 = await analyzeClassPerformance([]);
      const result2 = await analyzeClassPerformance([]);
      const result3 = await analyzeClassPerformance([]);

      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
      expect(result3.length).toBeGreaterThan(0);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
