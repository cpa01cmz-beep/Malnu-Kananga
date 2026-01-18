import { authAPI } from './apiService';
import { UserRole, UserExtraRole } from '../types/permissions';
import { 
  classifyError, 
  logError, 
  createValidationError
} from '../utils/errorHandler';

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-reset-token`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
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
}