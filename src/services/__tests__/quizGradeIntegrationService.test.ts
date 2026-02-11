/**
 * Quiz Grade Integration Service Tests
 * 
 * Tests for converting QuizAttempt to Grade entries
 * @module quizGradeIntegrationService.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as quizGradeIntegrationService from '../quizGradeIntegrationService';
import { gradesAPI } from '../apiService';
import { logger } from '../../utils/logger';
import { TEST_CONSTANTS } from '../../constants';
import type { Grade, Quiz, QuizAttempt } from '../../types';

// Mock API services
vi.mock('../apiService', () => ({
  gradesAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock constants to preserve all real exports while only overriding test constants
vi.mock('../../constants', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    TEST_CONSTANTS: {
      IDS: {
        QUIZ_001: 'quiz-001',
        ATTEMPT_001: 'attempt-001',
        STUDENT_001: 'student-001',
        TEACHER_001: 'teacher-001',
        GRADE_001: 'grade-001',
        SUBJECT_001: 'subject-001',
        CLASS_001: 'class-001',
      },
      NAMES: {
        JOHN_DOE: 'John Doe',
        MATHEMATICS: 'Mathematics',
      },
    },
  };
});

describe('quizGradeIntegrationService', () => {
  const mockQuiz: Quiz = {
    id: TEST_CONSTANTS.IDS.QUIZ_001,
    title: 'Math Quiz 1',
    description: 'Math quiz',
    subjectId: TEST_CONSTANTS.IDS.SUBJECT_001,
    classId: TEST_CONSTANTS.IDS.CLASS_001,
    teacherId: TEST_CONSTANTS.IDS.TEACHER_001,
    academicYear: '2026',
    semester: '1',
    subjectName: TEST_CONSTANTS.NAMES.MATHEMATICS,
    questions: [],
    totalPoints: 100,
    duration: 30,
    passingScore: 60,
    attempts: 3,
    status: 'published',
    createdAt: '2026-01-31T00:00:00.000Z',
    updatedAt: '2026-01-31T00:00:00.000Z',
    aiGenerated: false,
  };

  const mockQuizAttempt: QuizAttempt = {
    id: TEST_CONSTANTS.IDS.ATTEMPT_001,
    quizId: TEST_CONSTANTS.IDS.QUIZ_001,
    studentId: TEST_CONSTANTS.IDS.STUDENT_001,
    studentName: TEST_CONSTANTS.NAMES.JOHN_DOE,
    attemptNumber: 1,
    answers: {},
    score: 85,
    maxScore: 100,
    percentage: 85,
    passed: true,
    startedAt: '2026-01-31T00:00:00.000Z',
    submittedAt: '2026-01-31T00:30:00.000Z',
    timeSpent: 1800,
  };

  const mockGrade: Grade = {
    id: TEST_CONSTANTS.IDS.GRADE_001,
    studentId: TEST_CONSTANTS.IDS.STUDENT_001,
    subjectId: TEST_CONSTANTS.IDS.SUBJECT_001,
    classId: TEST_CONSTANTS.IDS.CLASS_001,
    academicYear: '2026',
    semester: '1',
    assignmentType: 'quiz',
    assignmentName: 'Quiz-quiz-001-attempt-1',
    score: 85,
    maxScore: 100,
    subjectName: TEST_CONSTANTS.NAMES.MATHEMATICS,
    createdAt: '2026-01-31T00:00:00.000Z',
    createdBy: TEST_CONSTANTS.IDS.TEACHER_001,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('findExistingGrade', () => {
    it('should find existing grade for quiz attempt', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'Grades retrieved successfully',
        data: [mockGrade],
      });

      const result = await quizGradeIntegrationService.findExistingGrade(mockQuizAttempt);

      expect(result).toEqual(mockGrade);
      expect(gradesAPI.getAll).toHaveBeenCalledTimes(1);
    });

    it('should return null when no existing grade found', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      const result = await quizGradeIntegrationService.findExistingGrade(mockQuizAttempt);

      expect(result).toBeNull();
    });

    it('should return null when API call fails', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: false,
        message: 'Failed to retrieve grades',
        error: 'API error',
      });

      const result = await quizGradeIntegrationService.findExistingGrade(mockQuizAttempt);

      expect(result).toBeNull();
    });

    it('should return null on exception and log error', async () => {
      vi.mocked(gradesAPI.getAll).mockRejectedValue(new Error('Network error'));

      const result = await quizGradeIntegrationService.findExistingGrade(mockQuizAttempt);

      expect(result).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Error checking for existing grade:', expect.any(Error));
    });
  });

  describe('convertToGrade', () => {
    it('should convert quiz attempt to grade object', () => {
      const result = quizGradeIntegrationService.convertToGrade(mockQuizAttempt, mockQuiz, 'teacher-001');

      expect(result).toEqual({
        studentId: 'student-001',
        subjectId: 'subject-001',
        classId: 'class-001',
        academicYear: '2026',
        semester: '1',
        assignmentType: 'quiz',
        assignmentName: 'Quiz-quiz-001-attempt-1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher-001',
        subjectName: 'Mathematics',
      });
    });

    it('should generate unique assignment name with attempt number', () => {
      const attempt2 = { ...mockQuizAttempt, attemptNumber: 2 };
      const result = quizGradeIntegrationService.convertToGrade(attempt2, mockQuiz, 'teacher-001');

      expect(result.assignmentName).toBe('Quiz-quiz-001-attempt-2');
    });
  });

  describe('integrateQuizAttempt', () => {
    it('should create grade entry successfully', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      vi.mocked(gradesAPI.create).mockResolvedValue({
        success: true,
        message: 'Grade created successfully',
        data: { ...mockGrade, id: 'grade-002' },
      });

      const result = await quizGradeIntegrationService.integrateQuizAttempt(
        mockQuizAttempt,
        mockQuiz,
        'teacher-001'
      );

      expect(result.success).toBe(true);
      expect(result.gradeId).toBe('grade-002');
      expect(result.message).toContain('Grade entry created for quiz attempt 1');
      expect(gradesAPI.create).toHaveBeenCalledWith({
        studentId: 'student-001',
        subjectId: 'subject-001',
        classId: 'class-001',
        academicYear: '2026',
        semester: '1',
        assignmentType: 'quiz',
        assignmentName: 'Quiz-quiz-001-attempt-1',
        score: 85,
        maxScore: 100,
        createdBy: 'teacher-001',
        subjectName: 'Mathematics',
      });
    });

    it('should skip existing grade when skipExisting is true', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'Grades retrieved successfully',
        data: [mockGrade],
      });

      const result = await quizGradeIntegrationService.integrateQuizAttempt(
        mockQuizAttempt,
        mockQuiz,
        'teacher-001',
        { skipExisting: true, overwriteDuplicates: false }
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Grade entry already exists for attempt 1');
      expect(gradesAPI.create).not.toHaveBeenCalled();
    });

    it('should return error when grade creation fails', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      vi.mocked(gradesAPI.create).mockResolvedValue({
        success: false,
        message: 'Failed to create grade',
        error: 'Database error',
      });

      const result = await quizGradeIntegrationService.integrateQuizAttempt(
        mockQuizAttempt,
        mockQuiz,
        'teacher-001'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.message).toBe('Failed to create grade entry');
    });

    it('should handle exceptions and return error', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      vi.mocked(gradesAPI.create).mockRejectedValue(new Error('Unexpected error'));

      const result = await quizGradeIntegrationService.integrateQuizAttempt(
        mockQuizAttempt,
        mockQuiz,
        'teacher-001'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unexpected error');
      expect(result.message).toContain('Failed to integrate quiz attempt:');
      expect(logger.error).toHaveBeenCalledWith('Error integrating quiz attempt:', expect.any(Error));
    });
  });

  describe('integrateQuizAttemptsBatch', () => {
    const mockAttempts: QuizAttempt[] = [
      mockQuizAttempt,
      { ...mockQuizAttempt, id: 'attempt-002', studentId: 'student-002', attemptNumber: 1 },
    ];

    it('should integrate multiple quiz attempts successfully', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      vi.mocked(gradesAPI.create).mockResolvedValue({
        success: true,
        message: 'Grade created successfully',
        data: { ...mockGrade, id: 'grade-new' },
      });

      const quizzes = new Map([['quiz-001', mockQuiz]]);

      const result = await quizGradeIntegrationService.integrateQuizAttemptsBatch(
        mockAttempts,
        quizzes,
        'teacher-001'
      );

      expect(result.total).toBe(2);
      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('should handle attempts for missing quiz', async () => {
      const attemptsWithoutQuiz = [
        { ...mockQuizAttempt, quizId: 'quiz-999' },
      ];

      const quizzes = new Map();

      const result = await quizGradeIntegrationService.integrateQuizAttemptsBatch(
        attemptsWithoutQuiz,
        quizzes,
        'teacher-001'
      );

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.results[0].error).toContain('Quiz quiz-999 not found');
    });

    it('should count skipped attempts correctly', async () => {
      vi.mocked(gradesAPI.getAll)
        .mockResolvedValueOnce({
          success: true,
          message: 'Grades retrieved successfully',
          data: [mockGrade],
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'No grades found',
          data: [],
        });

      const result = await quizGradeIntegrationService.integrateQuizAttemptsBatch(
        mockAttempts,
        new Map([['quiz-001', mockQuiz]]),
        'teacher-001',
        { skipExisting: true, overwriteDuplicates: false }
      );

      expect(result.total).toBe(2);
      expect(result.succeeded).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(1);
    });

    it('should mix success, failure, and skipped results', async () => {
      vi.mocked(gradesAPI.getAll)
        .mockResolvedValueOnce({
          success: true,
          message: 'Grades retrieved successfully',
          data: [mockGrade],
        })
        .mockResolvedValueOnce({
          success: true,
          message: 'No grades found',
          data: [],
        });

      vi.mocked(gradesAPI.create).mockResolvedValue({
        success: true,
        message: 'Grade created successfully',
        data: { ...mockGrade, id: 'grade-new' },
      });

      const result = await quizGradeIntegrationService.integrateQuizAttemptsBatch(
        mockAttempts,
        new Map([['quiz-001', mockQuiz]]),
        'teacher-001',
        { skipExisting: true, overwriteDuplicates: false }
      );

      expect(result.total).toBe(2);
      expect(result.skipped).toBe(1);
      expect(result.succeeded).toBe(1);
    });
  });

  describe('getQuizAttempts', () => {
    beforeEach(() => {
      localStorage.setItem('malnu_quiz_attempts_quiz-001', JSON.stringify([mockQuizAttempt]));
      localStorage.setItem('malnu_quiz_attempts_quiz-002', JSON.stringify([
        { ...mockQuizAttempt, id: 'attempt-002', quizId: 'quiz-002', studentId: 'student-002', studentName: 'Jane Doe' },
      ]));
    });

    it('should get all quiz attempts from localStorage', () => {
      const attempts = quizGradeIntegrationService.getQuizAttempts();

      expect(attempts).toHaveLength(2);
    });

    it('should filter by studentId', () => {
      const attempts = quizGradeIntegrationService.getQuizAttempts('student-001');

      expect(attempts).toHaveLength(1);
      expect(attempts[0].studentId).toBe('student-001');
    });

    it('should filter by quizId', () => {
      const attempts = quizGradeIntegrationService.getQuizAttempts(undefined, 'quiz-001');

      expect(attempts).toHaveLength(1);
      expect(attempts[0].quizId).toBe('quiz-001');
    });

    it('should handle empty localStorage', () => {
      localStorage.clear();

      const attempts = quizGradeIntegrationService.getQuizAttempts();

      expect(attempts).toEqual([]);
    });

    it('should handle malformed JSON and return empty array', () => {
      localStorage.setItem('malnu_quiz_attempts_quiz-bad', 'invalid json');

      const attempts = quizGradeIntegrationService.getQuizAttempts();

      expect(attempts).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith('Error loading quiz attempts:', expect.any(Error));
    });
  });

  describe('getQuiz', () => {
    it('should get quiz from localStorage', () => {
      localStorage.setItem('malnu_quizzes', JSON.stringify([mockQuiz]));

      const quiz = quizGradeIntegrationService.getQuiz('quiz-001');

      expect(quiz).toEqual(mockQuiz);
    });

    it('should return null when quiz not found', () => {
      localStorage.setItem('malnu_quizzes', JSON.stringify([mockQuiz]));

      const quiz = quizGradeIntegrationService.getQuiz('quiz-999');

      expect(quiz).toBeNull();
    });

    it('should return null when quizzes localStorage key is empty', () => {
      const quiz = quizGradeIntegrationService.getQuiz('quiz-001');

      expect(quiz).toBeNull();
    });

    it('should handle malformed JSON and return null', () => {
      localStorage.setItem('malnu_quizzes', 'invalid json');

      const quiz = quizGradeIntegrationService.getQuiz('quiz-001');

      expect(quiz).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('Error loading quiz:', expect.any(Error));
    });
  });

  describe('integrateAllQuizAttempts', () => {
    beforeEach(() => {
      localStorage.setItem('malnu_quiz_attempts_quiz-001', JSON.stringify([mockQuizAttempt]));
      localStorage.setItem('malnu_quizzes', JSON.stringify([mockQuiz]));
    });

    it('should integrate all pending quiz attempts', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      vi.mocked(gradesAPI.create).mockResolvedValue({
        success: true,
        message: 'Grade created successfully',
        data: { ...mockGrade, id: 'grade-new' },
      });

      const result = await quizGradeIntegrationService.integrateAllQuizAttempts('teacher-001');

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(1);
      expect(gradesAPI.create).toHaveBeenCalled();
    });

    it('should return empty result when no attempts exist', async () => {
      localStorage.clear();

      const result = await quizGradeIntegrationService.integrateAllQuizAttempts('teacher-001');

      expect(result.total).toBe(0);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  describe('integrateStudentQuizAttempts', () => {
    beforeEach(() => {
      localStorage.setItem('malnu_quiz_attempts_quiz-001', JSON.stringify([
        mockQuizAttempt,
        { ...mockQuizAttempt, id: 'attempt-002', studentId: 'student-002' },
      ]));
      localStorage.setItem('malnu_quizzes', JSON.stringify([mockQuiz]));
    });

    it('should integrate specific student quiz attempts', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      vi.mocked(gradesAPI.create).mockResolvedValue({
        success: true,
        message: 'Grade created successfully',
        data: { ...mockGrade, id: 'grade-new' },
      });

      const result = await quizGradeIntegrationService.integrateStudentQuizAttempts(
        'student-001',
        'teacher-001'
      );

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(1);
      expect(gradesAPI.create).toHaveBeenCalledTimes(1);
    });

    it('should return empty result when student has no attempts', async () => {
      const result = await quizGradeIntegrationService.integrateStudentQuizAttempts(
        'student-999',
        'teacher-001'
      );

      expect(result.total).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  describe('integrateQuizAttempts', () => {
    beforeEach(() => {
      localStorage.setItem('malnu_quiz_attempts_quiz-001', JSON.stringify([mockQuizAttempt]));
      localStorage.setItem('malnu_quizzes', JSON.stringify([mockQuiz]));
    });

    it('should integrate attempts for specific quiz', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'No grades found',
        data: [],
      });

      vi.mocked(gradesAPI.create).mockResolvedValue({
        success: true,
        message: 'Grade created successfully',
        data: { ...mockGrade, id: 'grade-new' },
      });

      const result = await quizGradeIntegrationService.integrateQuizAttempts('quiz-001', 'teacher-001');

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(1);
    });

    it('should return empty result when quiz not found', async () => {
      const result = await quizGradeIntegrationService.integrateQuizAttempts('quiz-999', 'teacher-001');

      expect(result.total).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  describe('removeQuizGrades', () => {
    it('should delete all grades for specific quiz', async () => {
      const quizGrades = [
        { ...mockGrade, id: 'grade-001', assignmentName: 'Quiz-quiz-001-attempt-1' },
        { ...mockGrade, id: 'grade-002', assignmentName: 'Quiz-quiz-001-attempt-2' },
      ];

      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'Grades retrieved successfully',
        data: quizGrades,
      });

      vi.mocked(gradesAPI.delete).mockResolvedValue({
        success: true,
        message: 'Grade deleted successfully',
      });

      const result = await quizGradeIntegrationService.removeQuizGrades('quiz-001');

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(2);
      expect(gradesAPI.delete).toHaveBeenCalledTimes(2);
    });

    it('should return zero deleted when no quiz grades found', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'Grades retrieved successfully',
        data: [{ ...mockGrade, assignmentType: 'assignment' }],
      });

      const result = await quizGradeIntegrationService.removeQuizGrades('quiz-001');

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(0);
      expect(gradesAPI.delete).not.toHaveBeenCalled();
    });

    it('should handle delete failures gracefully', async () => {
      const quizGrades = [
        { ...mockGrade, id: 'grade-001', assignmentName: 'Quiz-quiz-001-attempt-1' },
      ];

      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: true,
        message: 'Grades retrieved successfully',
        data: quizGrades,
      });

      vi.mocked(gradesAPI.delete).mockResolvedValue({
        success: false,
        message: 'Failed to delete grade',
      });

      const result = await quizGradeIntegrationService.removeQuizGrades('quiz-001');

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(0);
    });

    it('should handle API errors', async () => {
      vi.mocked(gradesAPI.getAll).mockResolvedValue({
        success: false,
        message: 'Failed to retrieve grades',
        error: 'API error',
      });

      const result = await quizGradeIntegrationService.removeQuizGrades('quiz-001');

      expect(result.success).toBe(false);
      expect(result.deleted).toBe(0);
    });
  });

  describe('getIntegrationStatus', () => {
    it('should return statistics on quiz attempts', () => {
      localStorage.setItem('malnu_quiz_attempts_quiz-001', JSON.stringify([
        mockQuizAttempt,
        { ...mockQuizAttempt, id: 'attempt-002' },
      ]));

      const status = quizGradeIntegrationService.getIntegrationStatus();

      expect(status.totalAttempts).toBe(2);
      expect(status.pendingCount).toBe(2);
      expect(status.integratedCount).toBe(0);
    });

    it('should return zero counts when no attempts exist', () => {
      const status = quizGradeIntegrationService.getIntegrationStatus();

      expect(status.totalAttempts).toBe(0);
      expect(status.pendingCount).toBe(0);
      expect(status.integratedCount).toBe(0);
    });
  });
});
