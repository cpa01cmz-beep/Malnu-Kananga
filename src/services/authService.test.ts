import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from './authService'
import { authAPI } from './apiService'

// Mock the authAPI
vi.mock('./apiService', () => ({
  authAPI: {
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    getAuthToken: vi.fn(),
    getRefreshToken: vi.fn(),
  },
}))

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks()
    authService = new AuthService()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = { success: true, data: { user: { email: 'user@test.com' } } }
      vi.mocked(authAPI.login).mockResolvedValue(mockResponse)

      const result = await authService.login('user@test.com', 'password123')
      
      expect(result).toBe(true)
      expect(authAPI.login).toHaveBeenCalledWith('user@test.com', 'password123')
    })

    it('should fail login with invalid credentials', async () => {
      const mockResponse = { success: false, message: 'Invalid credentials' }
      vi.mocked(authAPI.login).mockResolvedValue(mockResponse)

      const result = await authService.login('invalid@test.com', 'short')
      
      expect(result).toBe(false)
      expect(authAPI.login).toHaveBeenCalledWith('invalid@test.com', 'short')
    })
  })

  describe('logout', () => {
    it('should call authAPI logout', async () => {
      vi.mocked(authAPI.logout).mockResolvedValue(undefined)
      
      await authService.logout()
      
      expect(authAPI.logout).toHaveBeenCalled()
    })

    it('should handle logout errors', async () => {
      vi.mocked(authAPI.logout).mockRejectedValue(new Error('Logout failed'))
      
      // Should not throw an error
      await expect(authService.logout()).resolves.toBeUndefined()
    })
  })

  describe('isAuthenticated', () => {
    it('should delegate to authAPI', () => {
      vi.mocked(authAPI.isAuthenticated).mockReturnValue(true)
      
      expect(authService.isAuthenticated()).toBe(true)
      expect(authAPI.isAuthenticated).toHaveBeenCalled()
    })
  })

  describe('getCurrentUser', () => {
    it('should delegate to authAPI', () => {
      const mockUser = { email: 'user@test.com', name: 'Test User' }
      vi.mocked(authAPI.getCurrentUser).mockReturnValue(mockUser)
      
      expect(authService.getCurrentUser()).toEqual(mockUser)
      expect(authAPI.getCurrentUser).toHaveBeenCalled()
    })
  })

  describe('getAuthToken', () => {
    it('should delegate to authAPI', () => {
      const mockToken = 'test-token'
      vi.mocked(authAPI.getAuthToken).mockReturnValue(mockToken)
      
      expect(authService.getAuthToken()).toBe(mockToken)
      expect(authAPI.getAuthToken).toHaveBeenCalled()
    })
  })

  describe('getRefreshToken', () => {
    it('should delegate to authAPI', () => {
      const mockToken = 'refresh-token'
      vi.mocked(authAPI.getRefreshToken).mockReturnValue(mockToken)
      
      expect(authService.getRefreshToken()).toBe(mockToken)
      expect(authAPI.getRefreshToken).toHaveBeenCalled()
    })
  })
})