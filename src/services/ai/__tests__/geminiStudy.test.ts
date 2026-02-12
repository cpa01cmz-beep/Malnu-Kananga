import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock external dependencies
const mockAnalysisCache = {
  get: vi.fn(),
  set: vi.fn()
};

const mockWithCircuitBreaker = vi.fn();
const mockIdGenerators = {
  studyPlan: vi.fn()
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

// Mock AI_CONFIG
vi.mock('../../../constants', () => ({
  AI_CONFIG: {
    THINKING_BUDGET: 1024
  }
}));

describe('Gemini Study', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateStudyPlan', () => {
    const mockStudentData = {
      studentName: 'John Doe',
      grades: [
        { subject: 'Math', score: 85, grade: 'B', trend: 'improving' },
        { subject: 'Science', score: 92, grade: 'A', trend: 'stable' },
        { subject: 'English', score: 78, grade: 'C', trend: 'declining' }
      ],
      attendance: {
        percentage: 95,
        totalDays: 20,
        present: 19,
        absent: 1
      },
      goals: [
        { subject: 'Math', targetGrade: 'A', deadline: '2024-06-01' },
        { subject: 'English', targetGrade: 'B', deadline: '2024-06-01' }
      ],
      subjects: [
        { name: 'Mathematics', currentGrade: 85 },
        { name: 'Science', currentGrade: 92 },
        { name: 'English', currentGrade: 78 }
      ]
    };

    it('should return cached study plan when available', async () => {
      const cachedPlan = {
        id: 'cached_plan_123',
        studentName: 'John Doe',
        title: 'Cached Study Plan',
        description: 'This is a cached study plan',
        subjects: [],
        schedule: [],
        recommendations: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        validUntil: '2024-01-29T00:00:00.000Z',
        status: 'active' as const
      };

      mockAnalysisCache.get.mockReturnValue(cachedPlan);

      const { generateStudyPlan } = await import('../geminiStudy');
      const result = await generateStudyPlan(mockStudentData, 4);

      expect(result).toEqual(cachedPlan);
      expect(mockAnalysisCache.get).toHaveBeenCalledWith({
        operation: 'studyPlanGeneration',
        input: JSON.stringify({ studentData: mockStudentData, durationWeeks: 4 }),
        model: expect.any(String)
      });
    });

    it('should generate new study plan when not cached', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockPlanData = {
        title: 'Personalized Study Plan for John Doe',
        description: 'A comprehensive study plan focusing on mathematics and English improvement',
        subjects: [
          {
            subjectName: 'English',
            currentGrade: 78,
            targetGrade: 'B',
            priority: 'high',
            weeklyHours: 6,
            focusAreas: ['grammar', 'vocabulary'],
            resources: ['English textbook', 'Grammar exercises']
          },
          {
            subjectName: 'Mathematics',
            currentGrade: 85,
            targetGrade: 'A',
            priority: 'medium',
            weeklyHours: 4,
            focusAreas: ['algebra', 'problem solving'],
            resources: ['Math workbook', 'Online exercises']
          }
        ],
        schedule: [
          {
            dayOfWeek: 'Senin',
            timeSlot: '15:00-16:00',
            subject: 'English',
            activity: 'study',
            duration: 60
          },
          {
            dayOfWeek: 'Selasa',
            timeSlot: '15:00-16:00',
            subject: 'Mathematics',
            activity: 'practice',
            duration: 60
          }
        ],
        recommendations: [
          {
            category: 'study_tips',
            title: 'Active Learning Techniques',
            description: 'Use active recall and spaced repetition',
            priority: 1
          },
          {
            category: 'time_management',
            title: 'Study Schedule Optimization',
            description: 'Study in 25-minute focused blocks',
            priority: 2
          }
        ]
      };

      const mockResponse = { text: JSON.stringify(mockPlanData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockIdGenerators.studyPlan.mockReturnValue('study_plan_456');

      const { generateStudyPlan } = await import('../geminiStudy');
      const result = await generateStudyPlan(mockStudentData, 4);

      expect(result.id).toBe('study_plan_456');
      expect(result.studentName).toBe('John Doe');
      expect(result.title).toBe('Personalized Study Plan for John Doe');
      expect(result.subjects).toHaveLength(2);
      expect(result.schedule).toHaveLength(2);
      expect(result.recommendations).toHaveLength(2);
      expect(result.status).toBe('active');
      expect(result.createdAt).toBeDefined();
      expect(result.validUntil).toBeDefined();
      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'studyPlanGeneration',
          input: JSON.stringify({ studentData: mockStudentData, durationWeeks: 4 })
        }),
        expect.objectContaining({
          ...mockPlanData,
          id: 'study_plan_456',
          studentId: 'John Doe',
          studentName: 'John Doe',
          createdAt: expect.any(String),
          validUntil: expect.any(String),
          status: 'active'
        })
      );
    });

    it('should construct proper study plan generation prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test Plan"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 4);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Anda adalah asisten pembelajaran profesional');
      expect(promptCall.contents).toContain('Buat rencana belajar personal yang efektif');
      expect(promptCall.contents).toContain('Nama: John Doe');
      expect(promptCall.contents).toContain('Jumlah mata pelajaran: 3');
      expect(promptCall.contents).toContain('Persentase kehadiran: 95%');
      expect(promptCall.contents).toContain('DURASI RENCANA: 4 minggu');
    });

    it('should include student grades in prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 4);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('DATA AKADEMIK:');
      expect(promptCall.contents).toContain('- Math: Nilai 85 (B), Tren: improving');
      expect(promptCall.contents).toContain('- Science: Nilai 92 (A), Tren: stable');
      expect(promptCall.contents).toContain('- English: Nilai 78 (C), Tren: declining');
    });

    it('should include goals when provided', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 4);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('TARGET PRESTASI (Goals):');
      expect(promptCall.contents).toContain('- Math: Target A, Deadline: 2024-06-01');
      expect(promptCall.contents).toContain('- English: Target B, Deadline: 2024-06-01');
    });

    it('should handle empty goals', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const studentDataWithoutGoals = {
        ...mockStudentData,
        goals: []
      };

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(studentDataWithoutGoals, 4);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Tidak ada target yang ditetapkan');
    });

    it('should use default duration when not specified', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData); // No duration specified

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('DURASI RENCANA: 4 minggu');
    });

    it('should use custom duration when specified', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 6);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('DURASI RENCANA: 6 minggu');
    });

    it('should use JSON schema validation', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 4);

      const configCall = mockGenerateContent.mock.calls[0][0];
      expect(configCall.config.responseMimeType).toBe('application/json');
      expect(configCall.config.responseSchema).toBeDefined();
      expect(configCall.config.responseSchema.type).toBe('object');
    });

    it('should validate required fields in study plan structure', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 4);

      const schema = mockGenerateContent.mock.calls[0][0].config.responseSchema;
      const requiredFields = schema.required;
      expect(requiredFields).toContain('title');
      expect(requiredFields).toContain('description');
      expect(requiredFields).toContain('subjects');
      expect(requiredFields).toContain('schedule');
      expect(requiredFields).toContain('recommendations');
    });

    it('should calculate validUntil date correctly', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockPlanData = {
        title: 'Test Plan',
        description: 'Test',
        subjects: [],
        schedule: [],
        recommendations: []
      };

      const mockResponse = { text: JSON.stringify(mockPlanData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockIdGenerators.studyPlan.mockReturnValue('test_plan_id');

      const { generateStudyPlan } = await import('../geminiStudy');
      const result = await generateStudyPlan(mockStudentData, 4);

      const expectedValidUntil = new Date();
      expectedValidUntil.setDate(expectedValidUntil.getDate() + (4 * 7));
      
      expect(new Date(result.validUntil)).toEqual(expectedValidUntil);
    });

    it('should include priority and activity type guidance in prompt', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Test"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 4);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('KATEGORI PRIORITAS:');
      expect(promptCall.contents).toContain('- high: Nilai rendah (D/C) atau memiliki target tinggi');
      expect(promptCall.contents).toContain('JENIS AKTIVITAS:');
      expect(promptCall.contents).toContain('- study: Belajar materi baru');
      expect(promptCall.contents).toContain('- practice: Latihan soal');
    });

    it('should handle AI service errors gracefully', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);
      mockWithCircuitBreaker.mockRejectedValue(new Error('AI service error'));

      const { generateStudyPlan } = await import('../geminiStudy');

      await expect(generateStudyPlan(mockStudentData, 4))
        .rejects.toThrow('Gagal memproses respon dari AI');
    });

    it('should cache successful study plan results', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockPlanData = {
        title: 'Test Study Plan',
        description: 'Test description',
        subjects: [],
        schedule: [],
        recommendations: []
      };

      const mockResponse = { text: JSON.stringify(mockPlanData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);
      mockIdGenerators.studyPlan.mockReturnValue('cached_plan_789');

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(mockStudentData, 4);

      expect(mockAnalysisCache.set).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'studyPlanGeneration',
          input: JSON.stringify({ studentData: mockStudentData, durationWeeks: 4 })
        }),
        expect.objectContaining({
          ...mockPlanData,
          id: 'cached_plan_789',
          studentId: 'John Doe',
          studentName: 'John Doe',
          createdAt: expect.any(String),
          validUntil: expect.any(String),
          status: 'active'
        })
      );
    });

    it('should handle student with no subjects', async () => {
      const studentWithNoSubjects = {
        ...mockStudentData,
        grades: [],
        subjects: []
      };

      mockAnalysisCache.get.mockReturnValue(undefined);

      const mockGenerateContent = vi.fn().mockResolvedValue({ text: '{"title":"Empty Plan"}' });
      vi.doMock('./geminiClient', () => ({
        getAIInstance: vi.fn().mockResolvedValue({
          models: { generateContent: mockGenerateContent }
        })
      }));

      const { generateStudyPlan } = await import('../geminiStudy');
      await generateStudyPlan(studentWithNoSubjects, 4);

      const promptCall = mockGenerateContent.mock.calls[0][0];
      expect(promptCall.contents).toContain('Jumlah mata pelajaran: 0');
      expect(mockWithCircuitBreaker).toHaveBeenCalled();
    });

    it('should validate subject data structure', async () => {
      mockAnalysisCache.get.mockReturnValue(undefined);

      const studentWithSubjects = {
        ...mockStudentData,
        subjects: [
          { name: 'Physics', currentGrade: 88 },
          { name: 'Chemistry', currentGrade: 76 }
        ]
      };

      const mockPlanData = {
        title: 'Science Focus Plan',
        subjects: [
          {
            subjectName: 'Chemistry',
            currentGrade: 76,
            targetGrade: 'B',
            priority: 'high',
            weeklyHours: 5,
            focusAreas: ['equations'],
            resources: ['Chemistry textbook']
          }
        ],
        schedule: [],
        recommendations: []
      };

      const mockResponse = { text: JSON.stringify(mockPlanData) };
      mockWithCircuitBreaker.mockResolvedValue(mockResponse);

      const { generateStudyPlan } = await import('../geminiStudy');
      const result = await generateStudyPlan(studentWithSubjects, 4);

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].subjectName).toBe('Chemistry');
      expect(result.subjects[0].currentGrade).toBe(76);
    });
  });
});