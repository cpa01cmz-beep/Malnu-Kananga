import { describe, it, expect, vi } from 'vitest'
import { getQuickParentRecommendations, clearParentRecommendationCache, ParentChildData } from '../parentAIRecommendationService'

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe('parentAIRecommendationService', () => {
  describe('getQuickParentRecommendations', () => {
    const mockChildData: ParentChildData[] = [
      {
        studentId: 'student1',
        studentName: 'Ahmad',
        grades: [
          { subject: 'Math', score: 65, grade: 'C', category: 'test', semester: '1' },
          { subject: 'English', score: 85, grade: 'A', category: 'test', semester: '1' },
          { subject: 'Science', score: 55, grade: 'D', category: 'test', semester: '1' }
        ],
        attendance: {
          percentage: 80,
          totalDays: 100,
          present: 80,
          absent: 15,
          sick: 3,
          permission: 2
        },
        assignments: [
          { title: 'Math HW', subject: 'Math', dueDate: '2024-01-15', status: 'pending' },
          { title: 'English Essay', subject: 'English', dueDate: '2024-01-16', status: 'pending' },
          { title: 'Science Project', subject: 'Science', dueDate: '2024-01-17', status: 'pending' }
        ]
      }
    ]

    it('should return recommendations for low grades', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      const gradeRecommendations = recommendations.filter(r => r.type === 'grades')
      expect(gradeRecommendations.length).toBeGreaterThan(0)
    })

    it('should flag high priority for below 70', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      const gradeRecommendations = recommendations.filter(r => r.type === 'grades')
      expect(gradeRecommendations[0]?.priority).toBe('high')
    })

    it('should return recommendations for low attendance', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      const attendanceRecommendations = recommendations.filter(r => r.type === 'attendance')
      expect(attendanceRecommendations.length).toBeGreaterThan(0)
    })

    it('should flag high priority for attendance below 75%', () => {
      const mockChildWithVeryLowAttendance: ParentChildData[] = [
        {
          studentId: 'student2',
          studentName: 'Budi',
          grades: [],
          attendance: {
            percentage: 70,
            totalDays: 100,
            present: 70,
            absent: 20,
            sick: 5,
            permission: 5
          },
          assignments: []
        }
      ]
      
      const recommendations = getQuickParentRecommendations(mockChildWithVeryLowAttendance)
      
      const attendanceRec = recommendations.find(r => r.type === 'attendance')
      expect(attendanceRec?.priority).toBe('high')
    })

    it('should return recommendations for 3+ pending assignments', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      const assignmentRecommendations = recommendations.filter(r => r.type === 'assignments')
      expect(assignmentRecommendations.length).toBeGreaterThan(0)
    })

    it('should include student name in recommendations', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      recommendations.forEach(rec => {
        expect(rec.studentName).toBe('Ahmad')
      })
    })

    it('should set actionable to true for all recommendations', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      recommendations.forEach(rec => {
        expect(rec.actionable).toBe(true)
      })
    })

    it('should include action information in recommendations', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      recommendations.forEach(rec => {
        expect(rec.action).toBeDefined()
        expect(rec.action?.label).toBeDefined()
        expect(rec.action?.view).toBeDefined()
      })
    })

    it('should handle empty children array', () => {
      const recommendations = getQuickParentRecommendations([])
      
      expect(recommendations).toEqual([])
    })

    it('should handle child with no grades', () => {
      const childWithNoGrades: ParentChildData[] = [
        {
          studentId: 'student3',
          studentName: 'Citra',
          grades: [],
          attendance: {
            percentage: 95,
            totalDays: 100,
            present: 95,
            absent: 3,
            sick: 2,
            permission: 0
          },
          assignments: []
        }
      ]
      
      const recommendations = getQuickParentRecommendations(childWithNoGrades)
      
      expect(recommendations.length).toBe(0)
    })

    it('should handle child with good grades but low attendance', () => {
      const childWithGoodGrades: ParentChildData[] = [
        {
          studentId: 'student4',
          studentName: 'Dedi',
          grades: [
            { subject: 'Math', score: 90, grade: 'A', category: 'test', semester: '1' },
            { subject: 'English', score: 88, grade: 'A', category: 'test', semester: '1' }
          ],
          attendance: {
            percentage: 80,
            totalDays: 100,
            present: 80,
            absent: 15,
            sick: 3,
            permission: 2
          },
          assignments: []
        }
      ]
      
      const recommendations = getQuickParentRecommendations(childWithGoodGrades)
      
      const attendanceRecs = recommendations.filter(r => r.type === 'attendance')
      expect(attendanceRecs.length).toBe(1)
    })

    it('should include subject for grade recommendations', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      
      const gradeRec = recommendations.find(r => r.type === 'grades')
      expect(gradeRec?.subject).toBeDefined()
    })

    it('should have valid expiration dates', () => {
      const recommendations = getQuickParentRecommendations(mockChildData)
      const now = new Date()
      
      recommendations.forEach(rec => {
        const expiresAt = new Date(rec.expiresAt)
        expect(expiresAt.getTime()).toBeGreaterThan(now.getTime())
      })
    })
  })

  describe('clearParentRecommendationCache', () => {
    it('should be callable without error', () => {
      expect(() => clearParentRecommendationCache()).not.toThrow()
    })
  })
})
