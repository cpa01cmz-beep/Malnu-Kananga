import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import { authAPI } from '../apiService';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call authAPI.login and return success', async () => {
      vi.spyOn(authAPI, 'login').mockResolvedValue({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'teacher' as const,
            status: 'active'
          },
          token: 'test-token',
          refreshToken: 'test-refresh-token'
        }
      });

      const result = await authService.login('test@example.com', 'password');

      expect(authAPI.login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result).toBe(true);
    });

    it('should throw validation error if email is empty', async () => {
      await expect(authService.login('', 'password')).rejects.toThrow('Email dan password harus diisi');
      expect(authAPI.login).not.toHaveBeenCalled();
    });

    it('should throw validation error if password is empty', async () => {
      await expect(authService.login('test@example.com', '')).rejects.toThrow('Email dan password harus diisi');
      expect(authAPI.login).not.toHaveBeenCalled();
    });

    it('should handle API failure', async () => {
      const error = new Error('Login failed');
      vi.spyOn(authAPI, 'login').mockRejectedValue(error);

      await expect(authService.login('test@example.com', 'password')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should call authAPI.logout', async () => {
      vi.spyOn(authAPI, 'logout').mockResolvedValue(undefined);

      await authService.logout();

      expect(authAPI.logout).toHaveBeenCalled();
    });

    it('should handle logout failure gracefully', async () => {
      const error = new Error('Logout failed');
      vi.spyOn(authAPI, 'logout').mockRejectedValue(error);

      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should delegate to authAPI.isAuthenticated', () => {
      vi.spyOn(authAPI, 'isAuthenticated').mockReturnValue(true);

      const result = authService.isAuthenticated();

      expect(authAPI.isAuthenticated).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should delegate to authAPI.getCurrentUser', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'teacher' as const,
        status: 'active' as const
      };
      vi.spyOn(authAPI, 'getCurrentUser').mockReturnValue(mockUser);

      const result = authService.getCurrentUser();

      expect(authAPI.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when no user authenticated', () => {
      vi.spyOn(authAPI, 'getCurrentUser').mockReturnValue(null);

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('getAuthToken', () => {
    it('should delegate to authAPI.getAuthToken', () => {
      vi.spyOn(authAPI, 'getAuthToken').mockReturnValue('test-token');

      const result = authService.getAuthToken();

      expect(authAPI.getAuthToken).toHaveBeenCalled();
      expect(result).toBe('test-token');
    });

    it('should return null when no token', () => {
      vi.spyOn(authAPI, 'getAuthToken').mockReturnValue(null);

      const result = authService.getAuthToken();

      expect(result).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should delegate to authAPI.getRefreshToken', () => {
      vi.spyOn(authAPI, 'getRefreshToken').mockReturnValue('refresh-token');

      const result = authService.getRefreshToken();

      expect(authAPI.getRefreshToken).toHaveBeenCalled();
      expect(result).toBe('refresh-token');
    });

    it('should return null when no refresh token', () => {
      vi.spyOn(authAPI, 'getRefreshToken').mockReturnValue(null);

      const result = authService.getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('should call API and return success response', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset email sent'
      };
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });
      global.fetch = mockFetch as any;

      const result = await authService.forgotPassword('test@example.com');

      expect(result).toEqual(mockResponse);
    });

    it('should handle API failure', async () => {
      const error = new Error('API request failed');
      const mockFetch = vi.fn().mockRejectedValue(error);
      global.fetch = mockFetch as any;

      await expect(authService.forgotPassword('test@example.com')).rejects.toThrow();
    });
  });

  describe('verifyResetToken', () => {
    it('should call API and return success response', async () => {
      const mockResponse = {
        success: true,
        message: 'Token is valid'
      };
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });
      global.fetch = mockFetch as any;

      const result = await authService.verifyResetToken('valid-token');

      expect(result).toEqual(mockResponse);
    });

    it('should handle API failure', async () => {
      const error = new Error('Token verification failed');
      const mockFetch = vi.fn().mockRejectedValue(error);
      global.fetch = mockFetch as any;

      await expect(authService.verifyResetToken('valid-token')).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should call API and return success response', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset successful'
      };
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });
      global.fetch = mockFetch as any;

      const result = await authService.resetPassword('valid-token', 'new-password');

      expect(result).toEqual(mockResponse);
    });

    it('should handle API failure', async () => {
      const error = new Error('Password reset failed');
      const mockFetch = vi.fn().mockRejectedValue(error);
      global.fetch = mockFetch as any;

      await expect(authService.resetPassword('valid-token', 'new-password')).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should call API with auth token and return success response', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Updated Name',
        email: 'test@example.com'
      };
      const mockResponse = {
        success: true,
        message: 'Profile updated',
        data: mockUser
      };
      vi.spyOn(authAPI, 'getAuthToken').mockReturnValue('test-token');
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });
      global.fetch = mockFetch as any;

      const result = await authService.updateProfile('user-1', mockUser);

      expect(result).toEqual(mockResponse);
    });

    it('should handle API failure', async () => {
      const error = new Error('Profile update failed');
      const mockFetch = vi.fn().mockRejectedValue(error);
      global.fetch = mockFetch as any;

      await expect(authService.updateProfile('user-1', {})).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    it('should call API with auth token and return success response', async () => {
      const mockResponse = {
        success: true,
        message: 'Password changed successfully'
      };
      vi.spyOn(authAPI, 'getAuthToken').mockReturnValue('test-token');
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockResponse)
      });
      global.fetch = mockFetch as any;

      const result = await authService.changePassword('user-1', 'old-password', 'new-password');

      expect(result).toEqual(mockResponse);
    });

    it('should handle API failure', async () => {
      const error = new Error('Password change failed');
      const mockFetch = vi.fn().mockRejectedValue(error);
      global.fetch = mockFetch as any;

      await expect(authService.changePassword('user-1', 'old-password', 'new-password')).rejects.toThrow();
    });
  });
});
