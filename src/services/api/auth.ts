// api/auth.ts - Authentication API and Token Management

import type { User, UserExtraRole } from '../../types';
import { STORAGE_KEYS, TIME_SECONDS, API_ENDPOINTS } from '../../constants';
import { logger } from '../../utils/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ============================================
// TYPES
// ============================================

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthPayload {
  user_id: string;
  email: string;
  role: string;
  extra_role?: string | null;
  session_id: string;
  exp: number;
}

// ============================================
// TOKEN UTILITY FUNCTIONS
// ============================================

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function parseJwtPayload(token: string): AuthPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      (typeof window !== 'undefined' ? window.atob(base64) : globalThis.Buffer.from(base64, 'base64').toString())
        .split('')
        .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

export function isTokenExpiringSoon(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return true;

  const now = Math.floor(Date.now() / 1000);
  return (payload.exp - now) < TIME_SECONDS.FIVE_MINUTES;
}

export let isRefreshing = false;
export let refreshSubscribers: Array<(token: string) => void> = [];

export function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

export function onTokenRefreshed(token: string | null): void {
  if (token) {
    refreshSubscribers.forEach(callback => callback(token));
  }
  refreshSubscribers = [];
}

export { getRefreshToken };

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await response.json();

    if (data.success && data.data?.token && data.data?.refreshToken) {
      setAuthToken(data.data.token);
      setRefreshToken(data.data.refreshToken);
    }

    return data;
  },

  async logout(): Promise<void> {
    const token = getAuthToken();
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (e) {
      logger.error('Logout error:', e);
    } finally {
      clearAuthToken();
    }
  },

  async refreshToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        setAuthToken(data.data.token);
        return true;
      }

      return false;
    } catch (e) {
      logger.error('Refresh token error:', e);
      return false;
    }
  },

  getCurrentUser(): User | null {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) return null;

    const payload = parseJwtPayload(token);
    if (!payload) return null;

    return {
      id: payload.user_id,
      name: '',
      email: payload.email,
      role: payload.role as 'admin' | 'teacher' | 'student',
      status: 'active',
      extraRole: payload.extra_role as UserExtraRole || null,
    };
  },

  getRefreshToken,
  isAuthenticated(): boolean {
    const token = getAuthToken();
    return token !== null && !isTokenExpired(token);
  },

  async forgotPassword(email: string): Promise<ApiResponse<unknown>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  },

  async verifyResetToken(token: string): Promise<ApiResponse<unknown>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse<unknown>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    return data;
  },

  getAuthToken,
};
