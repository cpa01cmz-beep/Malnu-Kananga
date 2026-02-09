import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CategoryService } from '../categoryService'
import { subjectsAPI, classesAPI } from '../apiService'
import { logger } from '../../utils/logger'
import { STORAGE_KEYS, CACHE_TTL } from '../../constants'

// Mock dependencies
vi.mock('../apiService', () => ({
  subjectsAPI: {
    getAll: vi.fn()
  },
  classesAPI: {
    getAll: vi.fn()
  }
}))

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

global.localStorage = localStorageMock

describe('CategoryService', () => {
  let service: CategoryService

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    vi.useFakeTimers()
    
    // Get singleton instance
    service = CategoryService.getInstance()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CategoryService.getInstance()
      const instance2 = CategoryService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('should create only one instance across multiple calls', () => {
      const instances = Array.from({ length: 5 }, () => CategoryService.getInstance())
      expect(instances.every(inst => inst === instances[0])).toBe(true)
    })
  })

  describe('getSubjects', () => {
    const mockSubjects = [
      { id: '1', name: 'Mathematics', code: 'MATH', description: 'Math', creditHours: 4 },
      { id: '2', name: 'Science', code: 'SCI', description: 'Science', creditHours: 3 }
    ]

    it('should fetch subjects from API when no cache exists', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({ 
        success: true, 
        message: 'Success', 
        data: mockSubjects 
      })

      const result = await service.getSubjects()

      expect(subjectsAPI.getAll).toHaveBeenCalledTimes(1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SUBJECTS_CACHE,
        expect.stringContaining('"timestamp"')
      )
      expect(result).toEqual(mockSubjects)
    })

    it('should return cached data when cache is valid', async () => {
      const cacheData = {
        data: mockSubjects,
        timestamp: Date.now() - CACHE_TTL.CATEGORY + 1000 // 1 second before expiry
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheData))

      const result = await service.getSubjects()

      expect(subjectsAPI.getAll).not.toHaveBeenCalled()
      expect(result).toEqual(mockSubjects)
    })

    it('should fetch fresh data when cache is expired', async () => {
      const cacheData = {
        data: mockSubjects,
        timestamp: Date.now() - CACHE_TTL.CATEGORY - 1000 // 1 second after expiry
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheData))
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({ 
        success: true, 
        message: 'Success', 
        data: mockSubjects 
      })

      const result = await service.getSubjects()

      expect(subjectsAPI.getAll).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockSubjects)
    })

    it('should force refresh when forceRefresh is true', async () => {
      const cacheData = {
        data: mockSubjects,
        timestamp: Date.now() - CACHE_TTL.CATEGORY + 1000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheData))
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({ 
        success: true, 
        message: 'Success', 
        data: mockSubjects 
      })

      const result = await service.getSubjects(true)

      expect(subjectsAPI.getAll).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockSubjects)
    })

    it('should fall back to cache when API fails', async () => {
      const cacheData = {
        data: mockSubjects,
        timestamp: Date.now() - CACHE_TTL.CATEGORY - 1000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheData))
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({ 
        success: false, 
        message: 'Error', 
        error: 'API Error' 
      })

      const result = await service.getSubjects()

      expect(logger.error).toHaveBeenCalledWith('Failed to fetch subjects:', expect.any(String))
      expect(result).toEqual(mockSubjects)
    })

    it('should throw error when both API and cache fail', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({ 
        success: false, 
        message: 'Error', 
        error: 'API Error' 
      })

      await expect(service.getSubjects()).rejects.toThrow()
    })
  })

  describe('getClasses', () => {
    const mockClasses = [
      { id: '1', name: 'Class 10A', homeroomTeacherId: 'teacher1', academicYear: '2024-2025', semester: '1' as const },
      { id: '2', name: 'Class 10B', homeroomTeacherId: 'teacher2', academicYear: '2024-2025', semester: '1' as const }
    ]

    it('should fetch classes from API when no cache exists', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      vi.mocked(classesAPI.getAll).mockResolvedValue({ 
        success: true, 
        message: 'Success', 
        data: mockClasses 
      })

      const result = await service.getClasses()

      expect(classesAPI.getAll).toHaveBeenCalledTimes(1)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CLASSES_CACHE,
        expect.stringContaining('"timestamp"')
      )
      expect(result).toEqual(mockClasses)
    })

    it('should return cached classes when cache is valid', async () => {
      const cacheData = {
        data: mockClasses,
        timestamp: Date.now() - CACHE_TTL.CATEGORY + 1000
      }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(cacheData))

      const result = await service.getClasses()

      expect(classesAPI.getAll).not.toHaveBeenCalled()
      expect(result).toEqual(mockClasses)
    })
  })

  describe('validateCategory', () => {
    it('should validate valid category names', () => {
      expect(service.validateCategory('Mathematics', [])).toBe(true)
      expect(service.validateCategory('Science', [])).toBe(true)
    })

    it('should reject empty category names', () => {
      expect(service.validateCategory('', [])).toBe(false)
      expect(service.validateCategory('   ', [])).toBe(false)
    })

    it('should reject category names that match existing materials', () => {
      const existingMaterials = ['Mathematics', 'Science']
      
      expect(service.validateCategory('Mathematics', existingMaterials)).toBe(false)
      expect(service.validateCategory('science', existingMaterials)).toBe(false) // Case insensitive
    })

    it('should reject category names with invalid characters', () => {
      expect(service.validateCategory('Math@ematics', [])).toBe(false)
      expect(service.validateCategory('Science#123', [])).toBe(false)
    })
  })

  describe('suggestNewCategory', () => {
    it('should save new category suggestion', () => {
      const suggestion = {
        name: 'New Subject',
        description: 'New curriculum addition',
        suggestedBy: 'teacher1',
        suggestedAt: new Date().toISOString(),
        status: 'pending' as const
      }

      service.suggestNewCategory(suggestion)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CATEGORY_SUGGESTIONS,
        expect.stringContaining('"name":"New Subject"')
      )
      expect(logger.info).toHaveBeenCalledWith('New category suggestion received:', suggestion)
    })

    it('should append to existing suggestions', () => {
      const existingSuggestions = [
        { name: 'Old Subject', description: 'Old reason', suggestedBy: 'teacher1', suggestedAt: '2024-01-01', status: 'pending' as const }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingSuggestions))

      const newSuggestion = {
        name: 'New Subject',
        description: 'New curriculum addition',
        suggestedBy: 'teacher2',
        suggestedAt: new Date().toISOString(),
        status: 'pending' as const
      }

      service.suggestNewCategory(newSuggestion)

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData).toHaveLength(2)
      expect(savedData[1]).toMatchObject(newSuggestion)
    })
  })

  describe('getCategorySuggestions', () => {
    it('should return empty array when no suggestions exist', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const result = service.getCategorySuggestions()
      expect(result).toEqual([])
    })

    it('should return existing suggestions', () => {
      const suggestions = [
        { name: 'Math', description: 'Needed', suggestedBy: 'teacher1', suggestedAt: '2024-01-01', status: 'pending' as const },
        { name: 'Science', description: 'Important', suggestedBy: 'teacher2', suggestedAt: '2024-01-02', status: 'pending' as const }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(suggestions))

      const result = service.getCategorySuggestions()
      expect(result).toEqual(suggestions)
    })
  })

  describe('updateMaterialStats', () => {
    it('should update material statistics', () => {
      const materials = [
        { category: 'Mathematics', title: 'Math Book 1' },
        { category: 'Mathematics', title: 'Math Book 2' },
        { category: 'Science', title: 'Science Book 1' }
      ]

      service.updateMaterialStats(materials)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MATERIAL_STATS,
        expect.stringContaining('"Mathematics"')
      )

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData['Mathematics'].count).toBe(2)
      expect(savedData['Science'].count).toBe(1)
    })

    it('should handle empty materials array', () => {
      service.updateMaterialStats([])
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.MATERIAL_STATS,
        expect.stringContaining('{}')
      )
    })
  })

  describe('clearCache', () => {
    it('should clear all cache keys', () => {
      service.clearCache()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.SUBJECTS_CACHE)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.CLASSES_CACHE)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.CATEGORY_SUGGESTIONS)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.MATERIAL_STATS)
      expect(logger.info).toHaveBeenCalledWith('Category cache cleared')
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      vi.mocked(subjectsAPI.getAll).mockResolvedValue({ 
        success: true, 
        message: 'Success', 
        data: [] 
      })

      // Should not throw but should log error
      await expect(service.getSubjects()).resolves.toEqual([])
    })

    it('should handle JSON parsing errors gracefully', async () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      vi.mocked(subjectsAPI.getAll).mockResolvedValue({ 
        success: true, 
        message: 'Success', 
        data: [] 
      })

      await expect(service.getSubjects()).resolves.toEqual([])
    })
  })
})