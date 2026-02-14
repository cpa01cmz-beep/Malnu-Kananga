import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStudentGoals } from '../useStudentGoals';

// Mock dependencies
vi.mock('../constants', () => ({
  STORAGE_KEYS: {
    STUDENT_GOALS: vi.fn((id?: string) => id ? `malnu_student_goals_${id}` : 'malnu_student_goals'),
  },
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('useStudentGoals Hook', () => {
  const testStudentId = 'student123';
  const testGoal = {
    type: 'grade' as const,
    title: 'Target Math Grade',
    description: 'Achieve 90+ in Mathematics',
    targetValue: 90,
    subjectId: 'math-001',
    subjectName: 'Mathematics',
    startDate: '2026-01-01',
    targetDate: '2026-06-30',
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty goals', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.goals).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load existing goals from localStorage', async () => {
    const existingGoals = [
      {
        id: 'student123_goal_abc123',
        ...testGoal,
        currentValue: 85,
        status: 'active' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    localStorage.setItem(`malnu_student_goals_${testStudentId}`, JSON.stringify(existingGoals));

    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].title).toBe('Target Math Grade');
  });

  it('should add a new goal', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].title).toBe(testGoal.title);
    expect(result.current.goals[0].status).toBe('active');
    expect(result.current.goals[0].currentValue).toBe(0);
    expect(result.current.goals[0].id).toContain('student123_goal_');
  });

  it('should update an existing goal', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    const goalId = result.current.goals[0].id;

    await act(async () => {
      await result.current.updateGoal(goalId, { currentValue: 75 });
    });

    expect(result.current.goals[0].currentValue).toBe(75);
  });

  it('should mark goal as completed when target reached', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    const goalId = result.current.goals[0].id;

    await act(async () => {
      await result.current.updateGoal(goalId, { currentValue: 90 });
    });

    expect(result.current.goals[0].status).toBe('completed');
  });

  it('should delete a goal', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    expect(result.current.goals).toHaveLength(1);

    const goalId = result.current.goals[0].id;

    await act(async () => {
      await result.current.deleteGoal(goalId);
    });

    expect(result.current.goals).toHaveLength(0);
  });

  it('should archive a goal', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    const goalId = result.current.goals[0].id;

    await act(async () => {
      await result.current.archiveGoal(goalId);
    });

    expect(result.current.goals[0].status).toBe('archived');
  });

  it('should update progress via updateProgress', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    const goalId = result.current.goals[0].id;

    await act(async () => {
      await result.current.updateProgress(goalId, 50);
    });

    expect(result.current.goals[0].currentValue).toBe(50);
  });

  it('should filter active goals', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    const goalId = result.current.goals[0].id;

    await act(async () => {
      await result.current.updateGoal(goalId, { currentValue: 90 });
    });

    await act(async () => {
      await result.current.addGoal({ ...testGoal, title: 'Second Goal' });
    });

    const activeGoals = result.current.getActiveGoals();
    expect(activeGoals).toHaveLength(1);
    expect(activeGoals[0].title).toBe('Second Goal');
  });

  it('should filter completed goals', async () => {
    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    const goalId = result.current.goals[0].id;

    await act(async () => {
      await result.current.updateGoal(goalId, { currentValue: 90 });
    });

    const completedGoals = result.current.getCompletedGoals();
    expect(completedGoals).toHaveLength(1);
    expect(completedGoals[0].title).toBe('Target Math Grade');
  });

  it('should handle localStorage errors gracefully', async () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useStudentGoals(testStudentId));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Gagal memuat tujuan belajar');
    expect(result.current.loading).toBe(false);
  });

  it('should work without studentId', async () => {
    const { result } = renderHook(() => useStudentGoals());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.addGoal(testGoal);
    });

    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].id).toContain('student_goal_');
  });
});
