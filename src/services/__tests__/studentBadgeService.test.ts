import { describe, it, expect, beforeEach, vi } from 'vitest'
import { studentBadgeService, StudentBadge } from '../studentBadgeService'

// Mock localStorage
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

// Mock logger
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe('studentBadgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockReturnValue(undefined)
  })

  describe('getAllBadges', () => {
    it('should return all predefined badges', () => {
      const badges = studentBadgeService.getAllBadges()
      expect(badges).toHaveLength(13)
    })

    it('should include academic badges', () => {
      const badges = studentBadgeService.getAllBadges()
      const academicBadges = badges.filter(b => b.category === 'academic')
      expect(academicBadges).toHaveLength(3)
    })

    it('should include attendance badges', () => {
      const badges = studentBadgeService.getAllBadges()
      const attendanceBadges = badges.filter(b => b.category === 'attendance')
      expect(attendanceBadges).toHaveLength(2)
    })

    it('should include assignment badges', () => {
      const badges = studentBadgeService.getAllBadges()
      const assignmentBadges = badges.filter(b => b.category === 'assignment')
      expect(assignmentBadges).toHaveLength(3)
    })

    it('should include quiz badges', () => {
      const badges = studentBadgeService.getAllBadges()
      const quizBadges = badges.filter(b => b.category === 'quiz')
      expect(quizBadges).toHaveLength(3)
    })

    it('should include streak badges', () => {
      const badges = studentBadgeService.getAllBadges()
      const streakBadges = badges.filter(b => b.category === 'streak')
      expect(streakBadges).toHaveLength(2)
    })
  })

  describe('getBadgeById', () => {
    it('should return badge when found', () => {
      const badge = studentBadgeService.getBadgeById('first_assignment')
      expect(badge).toBeDefined()
      expect(badge?.name).toBe('Langkah Pertama')
    })

    it('should return undefined when badge not found', () => {
      const badge = studentBadgeService.getBadgeById('non_existent')
      expect(badge).toBeUndefined()
    })

    it('should find academic badges by id', () => {
      const badge = studentBadgeService.getBadgeById('good_student')
      expect(badge).toBeDefined()
      expect(badge?.category).toBe('academic')
      expect(badge?.requirement.type).toBe('grade_average')
    })
  })

  describe('getBadgesByCategory', () => {
    it('should return only academic badges', () => {
      const badges = studentBadgeService.getBadgesByCategory('academic')
      expect(badges).toHaveLength(3)
      badges.forEach(b => expect(b.category).toBe('academic'))
    })

    it('should return only attendance badges', () => {
      const badges = studentBadgeService.getBadgesByCategory('attendance')
      expect(badges).toHaveLength(2)
      badges.forEach(b => expect(b.category).toBe('attendance'))
    })

    it('should return only assignment badges', () => {
      const badges = studentBadgeService.getBadgesByCategory('assignment')
      expect(badges).toHaveLength(3)
      badges.forEach(b => expect(b.category).toBe('assignment'))
    })

    it('should return only quiz badges', () => {
      const badges = studentBadgeService.getBadgesByCategory('quiz')
      expect(badges).toHaveLength(3)
      badges.forEach(b => expect(b.category).toBe('quiz'))
    })

    it('should return only streak badges', () => {
      const badges = studentBadgeService.getBadgesByCategory('streak')
      expect(badges).toHaveLength(2)
      badges.forEach(b => expect(b.category).toBe('streak'))
    })
  })

  describe('getUnlockedBadges', () => {
    it('should return empty array when no badges stored', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const badges = studentBadgeService.getUnlockedBadges('student123')
      expect(badges).toEqual([])
    })

    it('should return parsed badges from localStorage', () => {
      const mockBadges: StudentBadge[] = [
        {
          id: 'first_assignment',
          name: 'Langkah Pertama',
          description: 'Menyelesaikan tugas pertama',
          icon: '🎯',
          category: 'assignment',
          requirement: { type: 'assignments_completed', value: 1 },
          unlockedAt: '2024-01-15T10:00:00.000Z'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBadges))
      
      const badges = studentBadgeService.getUnlockedBadges('student123')
      expect(badges).toHaveLength(1)
      expect(badges[0].id).toBe('first_assignment')
    })

    it('should return empty array when localStorage throws', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      const badges = studentBadgeService.getUnlockedBadges('student123')
      expect(badges).toEqual([])
    })
  })

  describe('saveUnlockedBadges', () => {
    it('should save badges to localStorage', () => {
      const badges: StudentBadge[] = [
        {
          id: 'first_assignment',
          name: 'Langkah Pertama',
          description: 'Menyelesaikan tugas pertama',
          icon: '🎯',
          category: 'assignment',
          requirement: { type: 'assignments_completed', value: 1 },
          unlockedAt: '2024-01-15T10:00:00.000Z'
        }
      ]
      
      studentBadgeService.saveUnlockedBadges('student123', badges)
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining('student123'),
        expect.any(String)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      // Should not throw
      expect(() => {
        studentBadgeService.saveUnlockedBadges('student123', [])
      }).not.toThrow()
    })
  })

  describe('checkAndUnlockBadges', () => {
    it('should unlock first_assignment badge when assignments >= 1', () => {
      const stats = {
        gradeAverage: 80,
        attendanceRate: 90,
        assignmentsCompleted: 1,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const newlyUnlocked = studentBadgeService.checkAndUnlockBadges('student123', stats)
      
      expect(newlyUnlocked).toHaveLength(1)
      expect(newlyUnlocked[0].id).toBe('first_assignment')
    })

    it('should unlock multiple badges when requirements met', () => {
      const stats = {
        gradeAverage: 95,
        attendanceRate: 100,
        assignmentsCompleted: 10,
        quizzesPassed: 5,
        streakDays: 30,
        hasPerfectScore: true
      }
      
      const newlyUnlocked = studentBadgeService.checkAndUnlockBadges('student123', stats)
      
      // Should unlock multiple badges at once
      expect(newlyUnlocked.length).toBeGreaterThan(5)
    })

    it('should not unlock already earned badges', () => {
      const existingBadges: StudentBadge[] = [
        {
          id: 'first_assignment',
          name: 'Langkah Pertama',
          description: 'Menyelesaikan tugas pertama',
          icon: '🎯',
          category: 'assignment',
          requirement: { type: 'assignments_completed', value: 1 },
          unlockedAt: '2024-01-15T10:00:00.000Z'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingBadges))
      
      const stats = {
        gradeAverage: 80,
        attendanceRate: 90,
        assignmentsCompleted: 5,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const newlyUnlocked = studentBadgeService.checkAndUnlockBadges('student123', stats)
      
      // Should only unlock new badges, not already earned ones
      expect(newlyUnlocked.find(b => b.id === 'first_assignment')).toBeUndefined()
    })

    it('should unlock attendance badges when attendance rate met', () => {
      const stats = {
        gradeAverage: 70,
        attendanceRate: 100,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const newlyUnlocked = studentBadgeService.checkAndUnlockBadges('student123', stats)
      
      const attendanceBadges = newlyUnlocked.filter(b => b.category === 'attendance')
      expect(attendanceBadges.length).toBeGreaterThan(0)
    })

    it('should unlock academic badges when grade average met', () => {
      const stats = {
        gradeAverage: 95,
        attendanceRate: 70,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const newlyUnlocked = studentBadgeService.checkAndUnlockBadges('student123', stats)
      
      const academicBadges = newlyUnlocked.filter(b => b.category === 'academic')
      expect(academicBadges.length).toBeGreaterThan(0)
    })

    it('should unlock perfect_score badge when has perfect score', () => {
      const stats = {
        gradeAverage: 70,
        attendanceRate: 70,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: true
      }
      
      const newlyUnlocked = studentBadgeService.checkAndUnlockBadges('student123', stats)
      
      expect(newlyUnlocked.find(b => b.id === 'perfect_quiz')).toBeDefined()
    })

    it('should unlock streak badges when streak days met', () => {
      const stats = {
        gradeAverage: 70,
        attendanceRate: 70,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 7,
        hasPerfectScore: false
      }
      
      const newlyUnlocked = studentBadgeService.checkAndUnlockBadges('student123', stats)
      
      expect(newlyUnlocked.find(b => b.id === 'week_streak')).toBeDefined()
    })
  })

  describe('calculateProgress', () => {
    it('should calculate progress for grade_average badge', () => {
      const badge = studentBadgeService.getBadgeById('good_student')!
      const stats = {
        gradeAverage: 42.5,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const progress = studentBadgeService.calculateProgress(badge, stats)
      
      // 42.5 / 85 * 100 = 50%
      expect(progress).toBe(50)
    })

    it('should cap progress at 100%', () => {
      const badge = studentBadgeService.getBadgeById('good_student')!
      const stats = {
        gradeAverage: 100,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const progress = studentBadgeService.calculateProgress(badge, stats)
      
      expect(progress).toBe(100)
    })

    it('should return 0 progress when no stats met', () => {
      const badge = studentBadgeService.getBadgeById('first_assignment')!
      const stats = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const progress = studentBadgeService.calculateProgress(badge, stats)
      
      expect(progress).toBe(0)
    })

    it('should calculate progress for attendance badge', () => {
      const badge = studentBadgeService.getBadgeById('great_attendance')!
      const stats = {
        gradeAverage: 0,
        attendanceRate: 47.5,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const progress = studentBadgeService.calculateProgress(badge, stats)
      
      // 47.5 / 95 * 100 = 50%
      expect(progress).toBe(50)
    })

    it('should calculate progress for perfect_score badge', () => {
      const badge = studentBadgeService.getBadgeById('perfect_quiz')!
      const statsWithPerfect = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: true
      }
      
      const statsWithoutPerfect = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 0,
        hasPerfectScore: false
      }
      
      const progressWith = studentBadgeService.calculateProgress(badge, statsWithPerfect)
      const progressWithout = studentBadgeService.calculateProgress(badge, statsWithoutPerfect)
      
      expect(progressWith).toBe(100)
      expect(progressWithout).toBe(0)
    })

    it('should calculate progress for streak badge', () => {
      const badge = studentBadgeService.getBadgeById('week_streak')!
      const stats = {
        gradeAverage: 0,
        attendanceRate: 0,
        assignmentsCompleted: 0,
        quizzesPassed: 0,
        streakDays: 3,
        hasPerfectScore: false
      }
      
      const progress = studentBadgeService.calculateProgress(badge, stats)
      
      // 3 / 7 * 100 = 42.86... ~ 43%
      expect(progress).toBe(43)
    })
  })
})
