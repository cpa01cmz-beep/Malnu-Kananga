import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLessonPlanning } from '../useLessonPlanning';
import * as lessonPlanService from '../../services/lessonPlanService';

vi.mock('../../services/lessonPlanService');

describe('useLessonPlanning Hook', () => {
  const mockGenerateLessonPlan = vi.fn();
  const mockDefaultLessonPlanTemplates = [
    {
      id: 'template_1',
      name: 'Template 1',
      description: 'Test template',
      subject: undefined,
      grade: undefined,
      structure: {
        activities: [],
        assessmentType: 'formative' as const
      },
      isDefault: true,
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(lessonPlanService, 'generateLessonPlan').mockImplementation(mockGenerateLessonPlan);
    vi.spyOn(lessonPlanService, 'defaultLessonPlanTemplates', 'get').mockReturnValue(mockDefaultLessonPlanTemplates);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useLessonPlanning());

      expect(result.current.lessonPlan).toBeNull();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.templates).toEqual(mockDefaultLessonPlanTemplates);
    });

    it('should have all required functions', () => {
      const { result } = renderHook(() => useLessonPlanning());

      expect(typeof result.current.generateLessonPlan).toBe('function');
      expect(typeof result.current.saveLessonPlan).toBe('function');
      expect(typeof result.current.loadSavedPlans).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('generateLessonPlan', () => {
    it('should generate lesson plan successfully', async () => {
      const mockLessonPlan = {
        id: 'test-id',
        title: 'Test Lesson Plan',
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar',
        objectives: ['Test objective'],
        materials: ['Test material'],
        duration: 90,
        activities: [],
        assessment: {
          type: 'formative' as const,
          method: 'Quiz',
          criteria: ['Criteria 1']
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'AI'
      };

      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: mockLessonPlan
      });

      const { result } = renderHook(() => useLessonPlanning());

      await act(async () => {
        const response = await result.current.generateLessonPlan({
          subject: 'Matematika',
          grade: 'Kelas X',
          topic: 'Aljabar',
          duration: 90,
          includeMaterials: true,
          includeHomework: true
        });

        expect(response.success).toBe(true);
        expect(response.lessonPlan).toEqual(mockLessonPlan);
      });

      await waitFor(() => {
        expect(result.current.lessonPlan).toEqual(mockLessonPlan);
        expect(result.current.isGenerating).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should set generating state during generation', async () => {
      let resolveGeneration: ((value: any) => void) | undefined;
      mockGenerateLessonPlan.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveGeneration = resolve;
        });
      });

      const { result } = renderHook(() => useLessonPlanning());

      act(() => {
        result.current.generateLessonPlan({
          subject: 'Matematika',
          grade: 'Kelas X',
          topic: 'Aljabar',
          duration: 90,
          includeMaterials: true,
          includeHomework: true
        });
      });

      expect(result.current.isGenerating).toBe(true);

      await act(async () => {
        resolveGeneration!({ success: true, lessonPlan: null });
      });

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false);
      });
    });

    it('should handle generation errors', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: false,
        error: 'AI generation failed'
      });

      const { result } = renderHook(() => useLessonPlanning());

      await act(async () => {
        const response = await result.current.generateLessonPlan({
          subject: 'Matematika',
          grade: 'Kelas X',
          topic: 'Aljabar',
          duration: 90,
          includeMaterials: true,
          includeHomework: true
        });

        expect(response.success).toBe(false);
        expect(response.error).toBe('AI generation failed');
      });

      await waitFor(() => {
        expect(result.current.error).toBe('AI generation failed');
        expect(result.current.isGenerating).toBe(false);
      });
    });

    it('should clear previous error on new generation', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: true,
        lessonPlan: null
      });

      const { result } = renderHook(() => useLessonPlanning());

      act(() => {
        result.current.generateLessonPlan({
          subject: 'Matematika',
          grade: 'Kelas X',
          topic: 'Aljabar',
          duration: 90,
          includeMaterials: true,
          includeHomework: true
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('saveLessonPlan', () => {
    it('should save lesson plan to localStorage', () => {
      const mockLessonPlan = {
        id: 'test-id',
        title: 'Test Lesson Plan',
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar',
        objectives: [],
        materials: [],
        duration: 90,
        activities: [],
        assessment: {
          type: 'formative' as const,
          method: 'Quiz',
          criteria: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'AI'
      };

      const { result } = renderHook(() => useLessonPlanning());

      expect(() => {
        result.current.saveLessonPlan(mockLessonPlan);
      }).not.toThrow();

      const saved = JSON.parse(localStorage.getItem('malnu_lesson_plans') || '[]');
      expect(saved).toContainEqual(mockLessonPlan);
    });

    it('should update existing lesson plan', () => {
      const mockLessonPlan = {
        id: 'test-id',
        title: 'Test Lesson Plan',
        subject: 'Matematika',
        grade: 'Kelas X',
        topic: 'Aljabar',
        objectives: [],
        materials: [],
        duration: 90,
        activities: [],
        assessment: {
          type: 'formative' as const,
          method: 'Quiz',
          criteria: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'AI'
      };

      localStorage.setItem('malnu_lesson_plans', JSON.stringify([mockLessonPlan]));

      const { result } = renderHook(() => useLessonPlanning());

      const updatedPlan = {
        ...mockLessonPlan,
        title: 'Updated Lesson Plan'
      };

      result.current.saveLessonPlan(updatedPlan);

      const saved = JSON.parse(localStorage.getItem('malnu_lesson_plans') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].title).toBe('Updated Lesson Plan');
    });
  });

  describe('loadSavedPlans', () => {
    it('should load saved plans from localStorage', () => {
      const mockPlans = [
        {
          id: 'plan-1',
          title: 'Plan 1',
          subject: 'Matematika',
          grade: 'Kelas X',
          topic: 'Topic 1',
          objectives: [],
          materials: [],
          duration: 90,
          activities: [],
          assessment: {
            type: 'formative' as const,
            method: 'Quiz',
            criteria: []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'AI'
        },
        {
          id: 'plan-2',
          title: 'Plan 2',
          subject: 'Bahasa Indonesia',
          grade: 'Kelas XI',
          topic: 'Topic 2',
          objectives: [],
          materials: [],
          duration: 90,
          activities: [],
          assessment: {
            type: 'formative' as const,
            method: 'Quiz',
            criteria: []
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'AI'
        }
      ];

      localStorage.setItem('malnu_lesson_plans', JSON.stringify(mockPlans));

      const { result } = renderHook(() => useLessonPlanning());

      const loadedPlans = result.current.loadSavedPlans();

      expect(loadedPlans).toHaveLength(2);
      expect(loadedPlans).toEqual(mockPlans);
    });

    it('should return empty array when no plans saved', () => {
      localStorage.removeItem('malnu_lesson_plans');

      const { result } = renderHook(() => useLessonPlanning());

      const loadedPlans = result.current.loadSavedPlans();

      expect(loadedPlans).toEqual([]);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('malnu_lesson_plans', 'invalid json');

      const { result } = renderHook(() => useLessonPlanning());

      const loadedPlans = result.current.loadSavedPlans();

      expect(loadedPlans).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      mockGenerateLessonPlan.mockResolvedValue({
        success: false,
        error: 'Test error'
      });

      const { result } = renderHook(() => useLessonPlanning());

      await act(async () => {
        await result.current.generateLessonPlan({
          subject: 'Matematika',
          grade: 'Kelas X',
          topic: 'Aljabar',
          duration: 90,
          includeMaterials: true,
          includeHomework: true
        });
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
