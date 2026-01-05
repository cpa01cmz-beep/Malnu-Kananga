import { authAPI } from './apiService';
import { logger } from '../utils/logger';

export interface User {
  id?: string;
  email: string;
  name?: string;
  role?: 'admin' | 'teacher' | 'student';
  status?: 'active' | 'inactive';
}

export class AuthService {
  async login(email: string, password: string): Promise<boolean> {
    try {
      if (!email || !password) {
        return false;
      }

      const response = await authAPI.login(email, password);
      return response.success;
    } catch (error) {
      logger.error('Login error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch (error) {
      logger.error('Logout error:', error);
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
}