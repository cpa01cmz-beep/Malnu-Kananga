import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from './authService'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

global.localStorage = localStorageMock

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const auth = new AuthService()
      const result = await auth.login('user@test.com', 'password123')
      
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('isAuthenticated', 'true')
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ email: 'user@test.com', name: 'user' }))
    })

    it('should fail login with invalid credentials', async () => {
      const auth = new AuthService()
      const result = await auth.login('invalid@test.com', 'short')
      
      expect(result).toBe(false)
      expect(localStorage.setItem).not.toHaveBeenCalledWith('isAuthenticated', 'true')
    })
  })

  describe('logout', () => {
    it('should clear authentication data', () => {
      const auth = new AuthService()
      auth.logout()
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('isAuthenticated')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('isAuthenticated', () => {
    it('should return false when not authenticated', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const auth = new AuthService()
      
      expect(auth.isAuthenticated()).toBe(false)
    })

    it('should return true when authenticated', () => {
      localStorageMock.getItem.mockReturnValue('true')
      const auth = new AuthService()
      
      expect(auth.isAuthenticated()).toBe(true)
    })
  })

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const auth = new AuthService()
      
      expect(auth.getCurrentUser()).toBe(null)
    })

    it('should return user data when user is stored', () => {
      const userData = { email: 'user@test.com', name: 'Test User' }
      localStorageMock.getItem.mockReturnValue(JSON.stringify(userData))
      const auth = new AuthService()
      
      expect(auth.getCurrentUser()).toEqual(userData)
    })
  })
})