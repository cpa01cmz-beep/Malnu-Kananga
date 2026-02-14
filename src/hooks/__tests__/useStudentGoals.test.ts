import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useStudentGoals } from '../useStudentGoals'

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})

describe('useStudentGoals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockReturnValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with empty goals', async () => {
    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.goals).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should load existing goals from localStorage', async () => {
    const storedGoals = [
      {
        id: 'student123_goal_1',
        type: 'grade' as const,
        title: 'Get good grades',
        description: 'Achieve 90 average',
        targetValue: 90,
        currentValue: 85,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedGoals))

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    
    expect(result.current.goals).toHaveLength(1)
    expect(result.current.goals[0].title).toBe('Get good grades')
  })

  it('should add a new goal', async () => {
    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newGoal = {
      type: 'grade' as const,
      title: 'New Goal',
      description: 'Description',
      targetValue: 100,
      startDate: '2024-01-01',
      targetDate: '2024-12-31'
    }

    await act(async () => {
      await result.current.addGoal(newGoal)
    })

    expect(result.current.goals).toHaveLength(1)
    expect(result.current.goals[0].title).toBe('New Goal')
    expect(result.current.goals[0].status).toBe('active')
    expect(result.current.goals[0].currentValue).toBe(0)
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('should update an existing goal', async () => {
    const storedGoals = [
      {
        id: 'student123_goal_1',
        type: 'grade' as const,
        title: 'Goal Title',
        description: 'Description',
        targetValue: 90,
        currentValue: 50,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedGoals))

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateGoal('student123_goal_1', { currentValue: 95 })
    })

    expect(result.current.goals[0].currentValue).toBe(95)
  })

  it('should auto-complete goal when target reached', async () => {
    const storedGoals = [
      {
        id: 'student123_goal_1',
        type: 'grade' as const,
        title: 'Goal Title',
        description: 'Description',
        targetValue: 90,
        currentValue: 85,
        startDate: '2024-01-01',
        targetDate: '2099-12-31',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedGoals))

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateGoal('student123_goal_1', { currentValue: 95 })
    })

    expect(result.current.goals[0].status).toBe('completed')
  })

  it('should delete a goal', async () => {
    const storedGoals = [
      {
        id: 'student123_goal_1',
        type: 'grade' as const,
        title: 'Goal to Delete',
        description: 'Description',
        targetValue: 90,
        currentValue: 50,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'student123_goal_2',
        type: 'attendance' as const,
        title: 'Goal to Keep',
        description: 'Description',
        targetValue: 100,
        currentValue: 90,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedGoals))

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteGoal('student123_goal_1')
    })

    expect(result.current.goals).toHaveLength(1)
    expect(result.current.goals[0].id).toBe('student123_goal_2')
  })

  it('should archive a goal', async () => {
    const storedGoals = [
      {
        id: 'student123_goal_1',
        type: 'grade' as const,
        title: 'Goal Title',
        description: 'Description',
        targetValue: 90,
        currentValue: 50,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedGoals))

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.archiveGoal('student123_goal_1')
    })

    expect(result.current.goals[0].status).toBe('archived')
  })

  it('should filter active goals', async () => {
    const storedGoals = [
      {
        id: 'student123_goal_1',
        type: 'grade' as const,
        title: 'Active Goal',
        description: 'Description',
        targetValue: 90,
        currentValue: 50,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'student123_goal_2',
        type: 'attendance' as const,
        title: 'Completed Goal',
        description: 'Description',
        targetValue: 100,
        currentValue: 100,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'completed' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedGoals))

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const activeGoals = result.current.getActiveGoals()
    
    expect(activeGoals).toHaveLength(1)
    expect(activeGoals[0].title).toBe('Active Goal')
  })

  it('should filter completed goals', async () => {
    const storedGoals = [
      {
        id: 'student123_goal_1',
        type: 'grade' as const,
        title: 'Active Goal',
        description: 'Description',
        targetValue: 90,
        currentValue: 50,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'active' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'student123_goal_2',
        type: 'attendance' as const,
        title: 'Completed Goal',
        description: 'Description',
        targetValue: 100,
        currentValue: 100,
        startDate: '2024-01-01',
        targetDate: '2024-06-01',
        status: 'completed' as const,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedGoals))

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const completedGoals = result.current.getCompletedGoals()
    
    expect(completedGoals).toHaveLength(1)
    expect(completedGoals[0].title).toBe('Completed Goal')
  })

  it('should handle localStorage errors gracefully', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const { result } = renderHook(() => useStudentGoals('student123'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.goals).toEqual([])
  })
})
