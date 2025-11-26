// Authentication service untuk development, production, dan Supabase
import { WORKER_URL } from '../utils/envValidation';
import SupabaseAuthService from './supabaseAuthService';

// Rate limiting untuk client-side protection
const clientRateLimitStore = new Map();
const CLIENT_RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 menit window
  maxAttempts: 3, // Maksimal 3 attempts per window untuk client
};

// Client-side rate limiting check
function isClientRateLimited(email: string): boolean {
  const now = Date.now();
  const clientKey = `client_${email}`;
  const clientData = clientRateLimitStore.get(clientKey);

  if (!clientData) {
    clientRateLimitStore.set(clientKey, {
      attempts: 1,
      firstAttempt: now,
    });
    return false;
  }

  // Reset if window expired
  if (now - clientData.firstAttempt > CLIENT_RATE_LIMIT.windowMs) {
    clientRateLimitStore.set(clientKey, {
      attempts: 1,
      firstAttempt: now,
    });
    return false;
  }

  // Increment attempts
  clientData.attempts++;

  if (clientData.attempts > CLIENT_RATE_LIMIT.maxAttempts) {
    return true;
  }

  clientRateLimitStore.set(clientKey, clientData);
  return false;
}

// Basic email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate cryptographically secure random string
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// REMOVED: Client-side token generation functions for security
// All token operations must be handled server-side in production

// REMOVED: Client-side cryptographic functions for security
// All HMAC operations and token generation must be handled server-side
// This prevents secret key exposure and token forgery attacks

// Verify dan decode secure token - SERVER SIDE ONLY
// Client-side token verification is disabled for security
async function verifyAndDecodeToken(token: string): Promise<TokenData | null> {
  try {
    // Always verify tokens server-side for security
    const response = await fetch(`${WORKER_URL}/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.valid ? result.tokenData : null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Check if token needs refresh (dalam 5 menit terakhir)
async function shouldRefreshToken(token: string): Promise<boolean> {
  const tokenData = await verifyAndDecodeToken(token);
  if (!tokenData) return false;

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  return (tokenData.exp - now) <= fiveMinutes;
}

// Refresh token - SERVER SIDE ONLY
async function refreshToken(currentToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${WORKER_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: currentToken }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.token || null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

// Token storage management dengan auto-refresh
class TokenManager {
  private static TOKEN_KEY = 'malnu_secure_token_v2';
  private static REFRESH_TIMER_KEY = 'malnu_refresh_timer';
  private static refreshTimer: NodeJS.Timeout | null = null;

  // Add cleanup listener for page unload
  private static initialized = false;
  private static cleanupListener: (() => void) | null = null;

  private static initializeCleanup(): void {
    if (this.initialized) return;

    // Clean up timer when page is unloaded
    const cleanup = () => {
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
    };

    window.addEventListener('beforeunload', cleanup);
    this.cleanupListener = cleanup;

    this.initialized = true;
  }

  static storeToken(token: string): Promise<void> {
    this.initializeCleanup();
    localStorage.setItem(this.TOKEN_KEY, token);
    this.scheduleTokenRefresh(token);
    return Promise.resolve(); // For compatibility with async interface
  }

  static storeTokenSync(token: string): void {
    this.initializeCleanup();
    localStorage.setItem(this.TOKEN_KEY, token);
    this.scheduleTokenRefresh(token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TIMER_KEY);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Remove event listener on cleanup
    if (this.cleanupListener) {
      window.removeEventListener('beforeunload', this.cleanupListener);
      this.cleanupListener = null;
      this.initialized = false;
    }
  }

  private static scheduleTokenRefresh(token: string): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh 1 menit sebelum token expired
    const tokenData = verifyAndDecodeToken(token);
    if (!tokenData) return;

    const now = Math.floor(Date.now() / 1000);
    const refreshTime = (tokenData.exp - now - 60) * 1000; // 1 menit sebelum expired

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.attemptTokenRefresh();
      }, refreshTime);
      localStorage.setItem(this.REFRESH_TIMER_KEY, Date.now().toString());
    }
  }

  private static async attemptTokenRefresh(): Promise<void> {
    const currentToken = this.getToken();
    if (!currentToken) return;

    const newToken = await refreshToken(currentToken);
    if (newToken) {
      await this.storeToken(newToken);
      console.log('🔄 Token berhasil di-refresh secara otomatis');
    } else {
      console.warn('⚠️ Gagal refresh token, user perlu login ulang');
      this.removeToken();
    }
  }

  private static attemptTokenRefreshSync(): void {
    const currentToken = this.getToken();
    if (!currentToken) return;

    // refreshTokenSync is not defined, using refreshToken
    refreshToken(currentToken).then(newToken => {
      if (newToken) {
        this.storeTokenSync(newToken);
        console.log('🔄 Token berhasil di-refresh secara otomatis');
      } else {
        console.warn('⚠️ Gagal refresh token, user perlu login ulang');
        this.removeToken();
      }
    });
  }

  static initializeTokenManager(): void {
    const token = this.getToken();
    if (token) {
      // Check if token masih valid atau perlu refresh
      if (shouldRefreshToken(token)) {
        if (isDevelopment) {
          this.attemptTokenRefreshSync();
        } else {
          // For production, use async refresh
          this.attemptTokenRefresh();
        }
      } else if (!verifyAndDecodeToken(token)) {
        // Token sudah expired
        this.removeToken();
      } else {
        // Token masih valid, schedule refresh jika diperlukan
        this.scheduleTokenRefresh(token);
      }
    }
  }
}

export interface User {
  id: string | number; // Support both string (UUID) and number IDs
  email: string;
  name?: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface VerifyResponse {
  success: boolean;
  user?: User;
  message: string;
  needsRefresh?: boolean;
  refreshedToken?: string;
}

export interface TokenData {
  email: string;
  exp: number;
  iat: number;
  jti: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  message: string;
}

// Development mode - menggunakan local storage untuk testing
const isDevelopment = import.meta.env?.DEV;
const useSupabase = import.meta.env?.VITE_USE_SUPABASE === 'true' || import.meta.env?.USE_SUPABASE === 'true';

class LocalAuthService {
  private static USERS_KEY = 'malnu_auth_users';
  private static CURRENT_USER_KEY = 'malnu_auth_current_user';

  static getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static findUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email && user.is_active) || null;
  }

  static createUser(email: string, name?: string): User {
    const users = this.getUsers();

    // SECURITY: Removed hardcoded default users for security
    // In production, users must be created through proper admin interface
    // Development users should be created manually through setup process
    const defaultUsers = [];

    // SECURITY: Only allow predefined users - no dynamic user creation
    const existingUser = defaultUsers.find(user => user.email === email && user.is_active);
    if (existingUser) {
      return existingUser;
    }

    // SECURITY: Disabled automatic user creation for demo mode
    // Only allow predefined users for security
    console.error('SECURITY: Automatic user creation disabled - unknown email not allowed');
    throw new Error('User not found. Please use a registered email address.');
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  static getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }
}

// Production authentication service menggunakan Cloudflare Worker
class ProductionAuthService {
  static async requestLoginLink(email: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${WORKER_URL}/request-login-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: 'Link login telah dikirim ke email Anda' };
      } else {
        return { success: false, message: data.message || 'Gagal mengirim link login' };
      }
    } catch (error) {
      console.error('Auth service error:', error);
      return { success: false, message: 'Terjadi kesalahan pada server' };
    }
  }

  static async verifyLoginToken(token: string): Promise<VerifyResponse> {
    try {
      const response = await fetch(`${WORKER_URL}/verify-login?token=${encodeURIComponent(token)}`);

      if (response.ok) {
        // Redirect akan dilakukan oleh browser untuk production
        return { success: true, message: 'Login berhasil' };
      } else {
        const errorText = await response.text();
        return { success: false, message: errorText || 'Token tidak valid' };
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, message: 'Terjadi kesalahan saat verifikasi' };
    }
  }
}

// Main auth service yang memilih implementation berdasarkan environment
export class AuthService {
  static async requestLoginLink(email: string): Promise<LoginResponse> {
    // Client-side rate limiting
    if (isClientRateLimited(email)) {
      return {
        success: false,
        message: 'Terlalu banyak percobaan login. Silakan tunggu 1 menit sebelum mencoba lagi.'
      };
    }

    // Basic email validation
    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Format email tidak valid.'
      };
    }

    if (useSupabase) {
      // Use Supabase authentication
      return await SupabaseAuthService.requestLoginLink(email);
    } else if (isDevelopment) {
      // Development mode - use server-side authentication only
      // SECURITY: Removed client-side token generation
      return ProductionAuthService.requestLoginLink(email);
    } else {
      return ProductionAuthService.requestLoginLink(email);
    }
  }

  static async verifyLoginToken(token: string): Promise<VerifyResponse> {
    if (useSupabase) {
      // Use Supabase authentication
      const result = await SupabaseAuthService.verifySession();
      return {
        success: result.success,
        user: result.user,
        message: result.message
      };
    } else if (isDevelopment) {
      // Development mode - use server-side verification only
      // SECURITY: Removed client-side token verification
      return ProductionAuthService.verifyLoginToken(token);
    } else {
      return ProductionAuthService.verifyLoginToken(token);
    }
  }

  static async refreshCurrentToken(): Promise<RefreshTokenResponse> {
    if (useSupabase) {
      // Use Supabase for session refresh
      const result = await SupabaseAuthService.refreshSession();
      return {
        success: result.success,
        message: result.message
      };
    } else if (isDevelopment) {
      const currentToken = TokenManager.getToken();
      if (!currentToken) {
        return { success: false, message: 'Tidak ada token aktif' };
      }

      // Use refreshToken instead of refreshTokenSync
      return refreshToken(currentToken).then(newToken => {
        if (newToken) {
          TokenManager.storeTokenSync(newToken);
          return { success: true, token: newToken, message: 'Token berhasil di-refresh' };
        } else {
          TokenManager.removeToken();
          return { success: false, message: 'Token tidak valid, silakan login ulang' };
        }
      });
    } else {
      return { success: false, message: 'Token refresh hanya tersedia di development mode' };
    }
  }

  static getStoredToken(): string | null {
    return TokenManager.getToken();
  }

  static isTokenExpiringSoon(): boolean {
    if (useSupabase) {
      // For Supabase, we'll rely on their session management
      return false;
    }
    const token = TokenManager.getToken();
    return token ? shouldRefreshToken(token) : false;
  }

  static async clearSession(): Promise<void> {
    if (useSupabase) {
      // Use Supabase for logout
      await SupabaseAuthService.signOut();
      if (isDevelopment) {
        LocalAuthService.setCurrentUser(null);
      }
    } else {
      TokenManager.removeToken();
      if (isDevelopment) {
        LocalAuthService.setCurrentUser(null);
      } else {
        // Production logout perlu server-side handling
        document.cookie = 'auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (useSupabase) {
      return await SupabaseAuthService.getCurrentUser();
    }
    return isDevelopment ? LocalAuthService.getCurrentUser() : null; // Production perlu cookie handling
  }

  static async logout(): Promise<void> {
    await this.clearSession();
  }

  static async isAuthenticated(): Promise<boolean> {
    if (useSupabase) {
      return await SupabaseAuthService.isAuthenticated();
    }

    const user = await this.getCurrentUser();
    const token = TokenManager.getToken();

    if (!user || !token) {
      return false;
    }

    // Check if token masih valid
    const tokenData = verifyAndDecodeToken(token);
    if (!tokenData) {
      // Token expired, clear session
      await this.clearSession();
      return false;
    }

    return true;
  }

  static initializeAuth(): void {
    if (isDevelopment && !useSupabase) {
      TokenManager.initializeTokenManager();
    }
  }
}

