import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
const mockAnalysisCache = {
  get: vi.fn(),
  set: vi.fn()
};

const mockWithCircuitBreaker = vi.fn();

vi.mock('../aiCacheService', () => ({
  analysisCache: mockAnalysisCache
}));

vi.mock('../../../utils/errorHandler', () => ({
  withCircuitBreaker: mockWithCircuitBreaker
}));

vi.mock('../../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

// Mock AI_CONFIG
vi.mock('../../../constants', () => ({
  AI_CONFIG: {
    MATERIAL_CONTENT_MAX: 5000,
    DEFAULT_QUIZ_POINTS_PER_QUESTION: 10,
    DEFAULT_QUIZ_TOTAL_POINTS: 100,
    DEFAULT_QUIZ_DURATION_MINUTES: 60,
    DEFAULT_QUIZ_PASSING_SCORE: 70
  }
}));

describe('Gemini Quiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateQuiz', () => {
    const mockMaterials = [
      { title: 'Math Basics', content: 'Basic mathematical concepts', category: 'Mathematics' },
      { title: 'Algebra', content: 'Algebraic equations', category: 'Mathematics' }
    ];

    const mockOptions = {
      questionCount: 5,
      questionTypes: ['multiple_choice', 'true_false'],
      difficulty: 'medium',
      totalPoints: 50,
      focusAreas: ['equations', 'variables']
    };

    it('should return cached quiz when available', async () => {
      const cachedQuiz = {
        title: 'Cached Quiz',
        description: 'Cached quiz description',
        questions: [
          {
            id: 'q1',
            question: 'Cached question',
            type: 'multiple_choice',
            difficulty: 'medium',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            explanation: 'Cached explanation',
            points: 10,
            materialReference: 'Math Basics',
            tags: ['math', 'basics']
          }
        ],
        totalPoints: 50,
        duration: 60,
        passingScore: 70,
        aiGenerated: true,
        aiConfidence: 0.85
      };

      mockAnalysisCache.get.mockReturnValue(cachedQuiz);

      const { generateQuiz } = await import('../geminiQuiz');
      const result = await generateQuiz(mockMaterials, mockOptions);

      expect(result).toEqual(cachedQuiz);
      expect(mockAnalysisCache.get).toHaveBeenCalledWith({
        operation: 'quizGeneration',
        input: JSON.stringify({ materials: mockMaterials, options: mockOptions }),
        model: expect.any(String)
      });
    });

    it('should generate new quiz when not cached', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockQuizData = {
        title: 'Mathematics Quiz',
        description: 'Test your knowledge of basic math',
        questions: [
          {
            id: 'q1',
            question: 'What is 2 + 2?',
            type: 'multiple_choice',
            difficulty: 'medium',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: '2 + 2 = 4',
            points: 10,
            materialReference: 'Math Basics',
            tags: ['arithmetic', 'basic']
          },
          {
            id: 'q2',
            question: 'Is x = 2 a solution to x + 1 = 3?',
            type: 'true_false',
            difficulty: 'medium',
            correctAnswer: 'true',
            explanation: '2 + 1 = 3, so x = 2 is correct',
            points: 10,
            materialReference: 'Algebra',
            tags: ['algebra', 'equations']
          }
        ],
        totalPoints: 50,
        duration: 60,
        passingScore: 70
      };

      const mockResponse = { text: JSON.stringify(mockQuizData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { generateQuiz } = await import('../geminiQuiz');
      const result = await generateQuiz(mockMaterials, mockOptions);

      expect(result.title).toBe('Mathematics Quiz');
      expect(result.questions).toHaveLength(2);
      expect(result.totalPoints).toBe(50);
      expect(result.aiGenerated).toBe(true);
      expect(result.aiConfidence).toBe(0.85);
      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'quizGeneration',
          input: JSON.stringify({ materials: mockMaterials, options: mockOptions })
        }),
        expect.objectContaining({
          ...mockQuizData,
          aiGenerated: true,
          aiConfidence: 0.85
        })
      );
    });

    it('should construct proper quiz generation prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test Quiz"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, mockOptions);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Anda adalah asisten pembuatan kuis profesional untuk guru');
      expect(promptCall.contents).toContain('Buat 5 pertanyaan');
      expect(promptCall.contents).toContain('multiple_choice, true_false');
      expect(promptCall.contents).toContain('Tingkat kesulitan: medium');
      expect(promptCall.contents).toContain('Judul: Math Basics');
      expect(promptCall.contents).toContain('Judul: Algebra');
    });

    it('should include materials content in prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, mockOptions);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Judul: Math Basics');
      expect(promptCall.contents).toContain('Kategori: Mathematics');
      expect(promptCall.contents).toContain('Konten: Basic mathematical concepts');
    });

    it('should handle materials without content', async () => {
      const materialsWithoutContent = [
        { title: 'Math Overview', category: 'Mathematics' }
      ];

      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(materialsWithoutContent, mockOptions);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Judul: Math Overview');
      expect(promptCall.contents).toContain('Kategori: Mathematics');
      expect(promptCall.contents).not.toContain('Konten:');
    });

    it('should include focus areas in prompt when provided', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const optionsWithFocus = {
        ...mockOptions,
        focusAreas: ['equations', 'functions']
      };

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, optionsWithFocus);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Fokus pada topik: equations, functions');
    });

    it('should handle missing focus areas', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const optionsWithoutFocus = {
        ...mockOptions,
        focusAreas: undefined
      };

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, optionsWithoutFocus);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Cakup semua materi secara merata');
    });

    it('should use JSON schema validation', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, mockOptions);

      const configCall = mockGenerateContent.mock.calls[0][0];
      expect(configCall.config.responseMimeType).toBe('application/json');
      expect(configCall.config.responseSchema).toBeDefined();
      expect(configCall.config.responseSchema.type).toBe('object');
      expect(configCall.config.responseSchema.properties).toBeDefined();
    });

    it('should validate required fields in quiz structure', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, mockOptions);

      const schema = mockGenerateContent.mock.calls[0][0].config.responseSchema;
      const requiredFields = schema.required;
      expect(requiredFields).toContain('title');
      expect(requiredFields).toContain('description');
      expect(requiredFields).toContain('questions');
      expect(requiredFields).toContain('totalPoints');
      expect(requiredFields).toContain('duration');
      expect(requiredFields).toContain('passingScore');
    });

    it('should support all question types', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const optionsWithAllTypes = {
        ...mockOptions,
        questionTypes: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank']
      };

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, optionsWithAllTypes);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('multiple_choice, true_false, short_answer, essay, fill_blank');
    });

    it('should handle AI service errors gracefully', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      mockWithCircuitBreaker.mockRejectedValue(new Error('AI service error'));

      const { generateQuiz } = await import('../geminiQuiz');

      await expect(generateQuiz(mockMaterials, mockOptions))
        .rejects.toThrow('Gagal memproses respon dari AI');
    });

    it('should cache successful quiz results', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockQuizData = {
        title: 'Test Quiz',
        description: 'Test description',
        questions: [],
        totalPoints: 50,
        duration: 60,
        passingScore: 70
      };

      const mockResponse = { text: JSON.stringify(mockQuizData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, mockOptions);

      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'quizGeneration',
          input: JSON.stringify({ materials: mockMaterials, options: mockOptions })
        }),
        expect.objectContaining({
          ...mockQuizData,
          aiGenerated: true,
          aiConfidence: 0.85
        })
      );
    });

    it('should handle empty materials array', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Empty Quiz"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz([], mockOptions);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Judul: \nKategori: \n'); // Empty material title and category
    });

    it('should use default values for optional options', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const minimalOptions = {
        questionCount: 3,
        questionTypes: ['multiple_choice'],
        difficulty: 'easy'
      };

      const { generateQuiz } = await import('../geminiQuiz');
      await generateQuiz(mockMaterials, minimalOptions);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('total poin: 30'); // 3 * 10
      expect(promptCall.contents).toContain('60'); // DEFAULT_QUIZ_DURATION_MINUTES
      expect(promptCall.contents).toContain('70'); // DEFAULT_QUIZ_PASSING_SCORE
    });

    it('should validate question structure in generated quiz', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockQuizData = {
        title: 'Structure Test Quiz',
        description: 'Testing quiz structure',
        questions: [
          {
            id: 'q1',
            question: 'Test question',
            type: 'multiple_choice',
            difficulty: 'easy',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            explanation: 'Test explanation',
            points: 10,
            materialReference: 'Test Material',
            tags: ['test']
          }
        ],
        totalPoints: 10,
        duration: 60,
        passingScore: 70
      };

      const mockResponse = { text: JSON.stringify(mockQuizData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { generateQuiz } = await import('../geminiQuiz');
      const result = await generateQuiz(mockMaterials, mockOptions);

      const question = result.questions[0];
      expect(question.id).toBe('q1');
      expect(question.type).toBe('multiple_choice');
      expect(question.options).toEqual(['A', 'B', 'C', 'D']);
      expect(question.points).toBe(10);
    });
  });
});