import { useState, useCallback } from 'react';
import type {
  LessonPlan,
  LessonPlanGenerationRequest,
  LessonPlanGenerationResponse
} from '../types/lessonPlan.types';
import {
  generateLessonPlan,
  defaultLessonPlanTemplates
} from '../services/lessonPlanService';
import { logger } from '../utils/logger';
import { STORAGE_KEYS } from '../constants';

interface UseLessonPlanningReturn {
  lessonPlan: LessonPlan | null;
  isGenerating: boolean;
  error: string | null;
  templates: typeof defaultLessonPlanTemplates;
  generateLessonPlan: (request: LessonPlanGenerationRequest) => Promise<LessonPlanGenerationResponse>;
  saveLessonPlan: (plan: LessonPlan) => void;
  loadSavedPlans: () => LessonPlan[];
  clearError: () => void;
}

export function useLessonPlanning(): UseLessonPlanningReturn {
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLessonPlanHandler = useCallback(async (
    request: LessonPlanGenerationRequest
  ): Promise<LessonPlanGenerationResponse> => {
    setIsGenerating(true);
    setError(null);

    try {
      logger.info('Generating lesson plan', {
        subject: request.subject,
        topic: request.topic
      });

      const response = await generateLessonPlan(request);

      if (response.success && response.lessonPlan) {
        setLessonPlan(response.lessonPlan);
        logger.info('Lesson plan generated successfully');
      } else {
        setError(response.error || 'Gagal membuat rencana pembelajaran');
        logger.warn('Lesson plan generation failed', { error: response.error });
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak terduga';
      setError(errorMessage);
      logger.error('Error generating lesson plan:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveLessonPlan = useCallback((plan: LessonPlan) => {
    try {
      const savedPlans = loadSavedPlans();
      const existingIndex = savedPlans.findIndex(p => p.id === plan.id);

      if (existingIndex >= 0) {
        savedPlans[existingIndex] = { ...plan, updatedAt: new Date().toISOString() };
      } else {
        savedPlans.push(plan);
      }

      localStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(savedPlans));
      logger.info('Lesson plan saved', { id: plan.id, title: plan.title });
    } catch (err) {
      logger.error('Error saving lesson plan:', err);
      throw new Error('Gagal menyimpan rencana pembelajaran');
    }
  }, []);

  const loadSavedPlans = useCallback((): LessonPlan[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSON_PLANS);
      if (!saved) return [];
      return JSON.parse(saved) as LessonPlan[];
    } catch (err) {
      logger.error('Error loading saved lesson plans:', err);
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    lessonPlan,
    isGenerating,
    error,
    templates: defaultLessonPlanTemplates,
    generateLessonPlan: generateLessonPlanHandler,
    saveLessonPlan,
    loadSavedPlans,
    clearError
  };
}
