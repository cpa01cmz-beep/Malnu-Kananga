import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';

export interface StudentGoal {
  id: string;
  type: 'grade' | 'attendance' | 'assignment' | 'quiz';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  subjectId?: string;
  subjectName?: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'failed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface UseStudentGoalsReturn {
  goals: StudentGoal[];
  loading: boolean;
  error: string | null;
  addGoal: (goal: Omit<StudentGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentValue' | 'status'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<StudentGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProgress: (id: string, currentValue: number) => Promise<void>;
  archiveGoal: (id: string) => Promise<void>;
  getActiveGoals: () => StudentGoal[];
  getCompletedGoals: () => StudentGoal[];
}

export const useStudentGoals = (studentId?: string): UseStudentGoalsReturn => {
  const [goals, setGoals] = useState<StudentGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStorageKey = useCallback(() => {
    if (typeof STORAGE_KEYS.STUDENT_GOALS === 'function') {
      return STORAGE_KEYS.STUDENT_GOALS(studentId || 'default');
    }
    return 'malnu_student_goals';
  }, [studentId]);

  useEffect(() => {
    const loadGoals = () => {
      try {
        const storageKey = getStorageKey();
        const storedGoals = localStorage.getItem(storageKey);
        if (storedGoals) {
          const parsedGoals = JSON.parse(storedGoals) as StudentGoal[];
          const filteredGoals = studentId 
            ? parsedGoals.filter(g => g.id.startsWith(studentId))
            : parsedGoals;
          setGoals(filteredGoals);
        }
      } catch (err) {
        logger.error('Failed to load student goals:', err);
        setError('Gagal memuat tujuan belajar');
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, [studentId, getStorageKey]);

  const saveGoals = useCallback((updatedGoals: StudentGoal[]) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updatedGoals));
      setGoals(updatedGoals);
    } catch (err) {
      logger.error('Failed to save student goals:', err);
      setError('Gagal menyimpan tujuan belajar');
    }
  }, [getStorageKey]);

  const generateId = useCallback(() => {
    const prefix = studentId || 'student';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_goal_${timestamp}_${random}`;
  }, [studentId]);

  const addGoal = useCallback(async (goalData: Omit<StudentGoal, 'id' | 'createdAt' | 'updatedAt' | 'currentValue' | 'status'>) => {
    setError(null);
    
    const newGoal: StudentGoal = {
      ...goalData,
      id: generateId(),
      currentValue: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
    logger.info('Student goal added:', newGoal.id);
  }, [goals, saveGoals, generateId]);

  const updateGoal = useCallback(async (id: string, updates: Partial<StudentGoal>) => {
    setError(null);
    
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const updated = { ...goal, ...updates, updatedAt: new Date().toISOString() };
        
        if (updated.currentValue >= updated.targetValue && updated.status === 'active') {
          updated.status = 'completed';
        } else if (updated.status === 'active') {
          const targetDate = new Date(updated.targetDate);
          const now = new Date();
          if (now > targetDate && updated.currentValue < updated.targetValue) {
            updated.status = 'failed';
          }
        }
        
        return updated;
      }
      return goal;
    });

    saveGoals(updatedGoals);
    logger.info('Student goal updated:', id);
  }, [goals, saveGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    setError(null);
    
    const updatedGoals = goals.filter(goal => goal.id !== id);
    saveGoals(updatedGoals);
    logger.info('Student goal deleted:', id);
  }, [goals, saveGoals]);

  const updateProgress = useCallback(async (id: string, currentValue: number) => {
    await updateGoal(id, { currentValue });
  }, [updateGoal]);

  const archiveGoal = useCallback(async (id: string) => {
    await updateGoal(id, { status: 'archived' });
  }, [updateGoal]);

  const getActiveGoals = useCallback(() => {
    return goals.filter(goal => goal.status === 'active');
  }, [goals]);

  const getCompletedGoals = useCallback(() => {
    return goals.filter(goal => goal.status === 'completed');
  }, [goals]);

  return {
    goals,
    loading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    archiveGoal,
    getActiveGoals,
    getCompletedGoals,
  };
};

export type { UseStudentGoalsReturn };
