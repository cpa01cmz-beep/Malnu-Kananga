import { authAPI } from './apiService';
import { UserRole, UserExtraRole } from '../types/permissions';
import {
  classifyError,
  logError,
  createValidationError
} from '../utils/errorHandler';
import { API_ENDPOINTS } from '../constants';

export interface User {
  id?: string;
  email: string;
  name?: string;
  role?: UserRole | 'admin' | 'teacher' | 'student';
  extraRole?: UserExtraRole;
  status?: 'active' | 'inactive';
}

export class AuthService {
  async login(email: string, password: string): Promise<boolean> {
    try {
      if (!email || !password) {
        const error = createValidationError('login', 'Email dan password harus diisi');
        logError(error);
        throw error;
      }

      const response = await authAPI.login(email, password);
      return response.success;
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'login',
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }
  }

  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'logout',
        timestamp: Date.now()
      });
      logError(classifiedError);
      // Logout errors are non-critical, so we don't throw
    }
  }

  isAuthenticated(): boolean {
    return authAPI.isAuthenticated();
  }

  getCurrentUser(): User | null {
    return authAPI.getCurrentUser();
  }

  getAuthToken(): string | null {
    return authAPI.getAuthToken();
  }

  getRefreshToken(): string | null {
    return authAPI.getRefreshToken();
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string; data?: unknown; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'forgotPassword',
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }
  }

  async verifyResetToken(token: string): Promise<{ success: boolean; message?: string; data?: unknown; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'verifyResetToken',
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message?: string; data?: unknown; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'resetPassword',
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }
  }

  async updateProfile(userId: string, profileData: Partial<User>): Promise<{ success: boolean; message?: string; data?: User; error?: string }> {
    try {
      const token = authAPI.getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${API_ENDPOINTS.USERS.BASE}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'updateProfile',
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const token = authAPI.getAuthToken();
      const endpoint = API_ENDPOINTS.USERS.PASSWORD(userId);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      const classifiedError = classifyError(error, {
        operation: 'changePassword',
        timestamp: Date.now()
      });
      logError(classifiedError);
      throw classifiedError;
    }
  }
}

export const authService = new AuthService();