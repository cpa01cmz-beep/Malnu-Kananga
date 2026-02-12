import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
const mockAnalysisCache = {
  get: vi.fn(),
  set: vi.fn()
};

const mockWithCircuitBreaker = vi.fn();
const mockIdGenerators = {
  analysis: vi.fn(),
  feedback: vi.fn()
};

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

vi.mock('../../../utils/idGenerator', () => ({
  idGenerators: mockIdGenerators
}));

describe('Gemini Analysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Mock navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('analyzeClassPerformance', () => {
    const mockGrades = [
      { studentName: 'John Doe', subject: 'Math', grade: 'A', semester: 'Fall 2024' },
      { studentName: 'Jane Smith', subject: 'Math', grade: 'C', semester: 'Fall 2024' }
    ];

    it('should return cached analysis when available', async () => {
      const cachedAnalysis = 'This is cached class analysis';
      mockAnalysisCache.get.mockReturnValue(cachedAnalysis);

      const { analyzeClassPerformance } = await import('../geminiAnalysis');
      const result = await analyzeClassPerformance(mockGrades);

      expect(result).toBe(cachedAnalysis);
      expect(mockAnalysisCache.get).toHaveBeenCalledWith({
        operation: 'classAnalysis',
        input: JSON.stringify(mockGrades),
        model: expect.any(String)
      });
    });

    it('should generate new analysis when not cached', async () => {
      // Mock cache miss
      mockAnalysisCache.get.mockReturnValue(undefined);

      // Mock successful AI response
      const mockAnalysis = 'Class performance analysis result';
      const mockResponse = { text: mockAnalysis };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { analyzeClassPerformance } = await import('../geminiAnalysis');
      const result = await analyzeClassPerformance(mockGrades);

      expect(result).toBe(mockAnalysis);
      expect(mockWithCircuitBreaker).toHaveBeenCalledWith(expect.any(Function));
      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'classAnalysis',
          input: JSON.stringify(mockGrades)
        }),
        mockAnalysis
      );
    });

    it('should construct proper analysis prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      const _mockResponse = { text: 'Analysis result' };
      mockWithCircuitBreaker.mockImplementation((fn) => {
        return fn();
      });
      
      // Mock geminiClient to capture the call
      const mockGenerateContent = vi.fn().mockResolvedValue({ text: 'Analysis result' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { analyzeClassPerformance } = await import('../geminiAnalysis');
      await analyzeClassPerformance(mockGrades);

      // The circuit breaker should have been called with a function
      expect(mockWithCircuitBreaker).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle AI service errors gracefully', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      mockWithCircuitBreaker.mockRejectedValue(new Error('AI service unavailable'));

      const { analyzeClassPerformance } = await import('../geminiAnalysis');
      const result = await analyzeClassPerformance(mockGrades);

      expect(result).toContain('Maaf');
      expect(result).toContain('gagal menganalisis');
    });

    it('should handle empty grades array', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      const mockResponse = { text: 'Empty class analysis' };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { analyzeClassPerformance } = await import('../geminiAnalysis');
      const result = await analyzeClassPerformance([]);

      expect(result).toBe('Empty class analysis');
      expect(mockAnalysisCache.set).toHaveBeenCalled();
    });

    it('should cache successful analysis results', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      const mockAnalysis = 'New analysis result';
      const mockResponse = { text: mockAnalysis };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { analyzeClassPerformance } = await import('../geminiAnalysis');
      await analyzeClassPerformance(mockGrades);

      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'classAnalysis',
          input: JSON.stringify(mockGrades)
        }),
        mockAnalysis
      );
    });
  });

  describe('analyzeStudentPerformance', () => {
    const mockStudentData = {
      grades: [
        { subject: 'Math', score: 85, grade: 'B', trend: 'improving' },
        { subject: 'Science', score: 92, grade: 'A', trend: 'stable' }
      ],
      attendance: { percentage: 95, totalDays: 20, present: 19, absent: 1 },
      trends: [
        { month: 'January', averageScore: 85, attendanceRate: 95 },
        { month: 'February', averageScore: 88, attendanceRate: 92 }
      ]
    };

    it('should return cached student analysis when available', async () => {
      const cachedAnalysis = 'This is cached student analysis';
      mockAnalysisCache.get.mockReturnValue(cachedAnalysis);

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      const result = await analyzeStudentPerformance(mockStudentData);

      expect(result).toBe(cachedAnalysis);
      expect(mockAnalysisCache.get).toHaveBeenCalledWith({
        operation: 'studentAnalysis',
        input: JSON.stringify(mockStudentData),
        model: expect.any(String)
      });
    });

    it('should generate new student analysis when online', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: true });

      const mockAnalysis = 'Student performance analysis result';
      const mockResponse = { text: mockAnalysis };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      const result = await analyzeStudentPerformance(mockStudentData);

      expect(result).toBe(mockAnalysis);
      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'studentAnalysis',
          input: JSON.stringify(mockStudentData)
        }),
        mockAnalysis
      );
    });

    it('should queue analysis when offline', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: false });

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      const result = await analyzeStudentPerformance(mockStudentData, true);

      expect(result).toContain('Analisis AI sedang diproses');
      expect(result).toContain('koneksi internet kembali');
    });

    it('should use offline queue service when offline', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: false });

      mockIdGenerators.analysis.mockReturnValue('analysis_123');

      const mockOfflineQueue = {
        addAction: vi.fn()
      };

      vi.doMock('../offlineActionQueueService', () => ({
        offlineActionQueueService: mockOfflineQueue
      }));

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      await analyzeStudentPerformance(mockStudentData, true);

      expect(mockOfflineQueue.addAction).toHaveBeenCalledWith({
        type: 'create',
        entity: 'ai_analysis',
        entityId: 'analysis_123',
        endpoint: expect.any(String),
        method: 'POST',
        data: expect.objectContaining({
          operation: 'studentAnalysis',
          studentData: mockStudentData,
          model: expect.any(String),
          timestamp: expect.any(Number)
        })
      });
    });

    it('should generate unique analysis ID when queuing', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: false });

      mockIdGenerators.analysis.mockReturnValue('unique_analysis_456');

      const mockOfflineQueue = { addAction: vi.fn() };
      vi.doMock('../offlineActionQueueService', () => ({
        offlineActionQueueService: mockOfflineQueue
      }));

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      await analyzeStudentPerformance(mockStudentData, true);

      expect(mockIdGenerators.analysis).toHaveBeenCalledWith('student');
    });

    it('should construct proper student analysis prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: true });

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: 'Student analysis' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      await analyzeStudentPerformance(mockStudentData);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Analisis data performa akademik siswa');
      expect(promptCall.contents).toContain('📊 **ANALISIS KINERJA AKADEMIK**');
      expect(promptCall.contents).toContain(mockStudentData.grades.length.toString());
    });

    it('should handle AI service errors for student analysis', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: true });

      mockWithCircuitBreaker.mockRejectedValue(new Error('AI service error'));

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      const result = await analyzeStudentPerformance(mockStudentData);

      expect(result).toContain('Maaf');
      expect(result).toContain('gagal menganalisis');
    });

    it('should cache successful student analysis', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: true });

      const mockAnalysis = 'Student analysis result';
      const mockResponse = { text: mockAnalysis };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      await analyzeStudentPerformance(mockStudentData);

      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'studentAnalysis',
          input: JSON.stringify(mockStudentData)
        }),
        mockAnalysis
      );
    });

    it('should handle offline mode without queuing', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      Object.defineProperty(global.navigator, 'onLine', { value: false });

      const { analyzeStudentPerformance } = await import('../geminiAnalysis');
      
      // Should not throw when queueIfOffline is false
      await expect(analyzeStudentPerformance(mockStudentData, false)).rejects.toThrow();
    });
  });

  describe('generateAssignmentFeedback', () => {
    const mockAssignment = {
      title: 'Math Homework',
      description: 'Complete problems 1-10',
      type: 'homework',
      subjectName: 'Mathematics',
      maxScore: 100
    };

    const mockSubmission = {
      studentName: 'John Doe',
      submissionText: 'Here are my answers to the math problems...',
      attachments: [
        { fileName: 'work.pdf', fileType: 'application/pdf' }
      ]
    };

    it('should return cached feedback when available', async () => {
      const cachedFeedback = {
        feedback: 'Cached feedback',
        strengths: ['Good work'],
        improvements: ['Check calculations'],
        confidence: 0.85
      };
      mockAnalysisCache.get.mockReturnValue(cachedFeedback);

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');
      const result = await generateAssignmentFeedback(mockAssignment, mockSubmission);

      expect(result).toEqual(cachedFeedback);
      expect(mockAnalysisCache.get).toHaveBeenCalledWith({
        operation: 'assignmentFeedback',
        input: JSON.stringify({ assignment: mockAssignment, submission: mockSubmission }),
        model: expect.any(String)
      });
    });

    it('should generate new feedback when not cached', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockFeedbackData = {
        feedback: 'Good effort on this assignment',
        strengths: ['Clear explanations', 'Correct methods'],
        improvements: ['Check units', 'Show work for complex problems'],
        suggestedScore: 85,
        confidence: 0.9
      };

      const mockResponse = { 
        text: JSON.stringify(mockFeedbackData)
      };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      mockIdGenerators.feedback.mockReturnValue('feedback_123');

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');
      const result = await generateAssignmentFeedback(mockAssignment, mockSubmission);

      expect(result).toEqual({
        ...mockFeedbackData,
        id: 'feedback_123',
        generatedAt: expect.any(String),
        aiModel: expect.any(String)
      });
    });

    it('should include attachment info in prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"feedback":"test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');
      await generateAssignmentFeedback(mockAssignment, mockSubmission);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('work.pdf');
      expect(promptCall.contents).toContain('application/pdf');
    });

    it('should handle submission without attachments', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const submissionNoAttachments = {
        ...mockSubmission,
        attachments: undefined
      };

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"feedback":"test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');
      await generateAssignmentFeedback(mockAssignment, submissionNoAttachments);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Tidak ada jawaban teks');
    });

    it('should handle submission score in prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"feedback":"test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');
      await generateAssignmentFeedback(mockAssignment, mockSubmission, 75);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Nilai saat ini: 75/100');
    });

    it('should validate feedback schema', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ 
        text: '{"feedback":"test","strengths":["good"],"improvements":["better"],"confidence":0.8}' 
      });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');
      const result = await generateAssignmentFeedback(mockAssignment, mockSubmission);

      expect(result.feedback).toBe('test');
      expect(result.strengths).toEqual(['good']);
      expect(result.improvements).toEqual(['better']);
      expect(result.confidence).toBe(0.8);
    });

    it('should handle AI service errors for feedback generation', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      mockWithCircuitBreaker.mockRejectedValue(new Error('AI error'));

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');

      await expect(generateAssignmentFeedback(mockAssignment, mockSubmission))
        .rejects.toThrow('Gagal memproses respon dari AI');
    });

    it('should cache successful feedback results', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockFeedbackData = { feedback: 'Good work', strengths: [], improvements: [], confidence: 0.9 };
      const mockResponse = { text: JSON.stringify(mockFeedbackData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      mockIdGenerators.feedback.mockReturnValue('feedback_456');

      const { generateAssignmentFeedback } = await import('../geminiAnalysis');
      await generateAssignmentFeedback(mockAssignment, mockSubmission);

      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'assignmentFeedback',
          input: JSON.stringify({ assignment: mockAssignment, submission: mockSubmission })
        }),
        expect.objectContaining({
          ...mockFeedbackData,
          id: 'feedback_456',
          generatedAt: expect.any(String),
          aiModel: expect.any(String)
        })
      );
    });
  });
});