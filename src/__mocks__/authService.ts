// Mock for authService that handles import.meta in test environment
// import { WORKER_URL } from '../utils/envValidation';

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
  // In test environment, use a simpler approach
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Generate a simple signature for development mode (not secure, but sufficient for local testing)
function generateDevelopmentSignature(data: string): string {
  // Simple hash function for development - NOT secure for production
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex string
  return Math.abs(hash).toString(16);
}

// Secure token generation using a synchronous approach for test environment
function generateSecureTokenSync(email: string, expiryTime: number = 15 * 60 * 1000): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    email: email,
    exp: Math.floor((Date.now() + expiryTime) / 1000),
    iat: Math.floor(Date.now() / 1000),
    jti: generateRandomString(16) // Unique token ID
  };

  // Encode header dan payload ke base64url
  const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  // For development mode, generate a simple token without server-side secret
  // In production, this should be handled by the server
  const signature = generateDevelopmentSignature(`${encodedHeader}.${encodedPayload}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify dan decode secure token
function verifyAndDecodeToken(token: string): TokenData | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature using development signature method
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = generateDevelopmentSignature(data);

    if (signature !== expectedSignature) {
      return null; // Invalid signature
    }

    // Add padding jika diperlukan
    const paddedPayload = encodedPayload + '='.repeat((4 - encodedPayload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    const tokenData: TokenData = JSON.parse(decodedPayload);

    // Verify expiration
    if (Date.now() / 1000 > tokenData.exp) {
      return null;
    }

    return tokenData;
  } catch (error) {
    return null;
  }
}

// Check if token needs refresh (dalam 5 menit terakhir)
function shouldRefreshToken(token: string): boolean {
  const tokenData = verifyAndDecodeToken(token);
  if (!tokenData) return false;

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  return (tokenData.exp - now) <= fiveMinutes;
}

// Synchronous refresh token for development
function refreshTokenSync(currentToken: string): string | null {
  const tokenData = verifyAndDecodeToken(currentToken);
  if (!tokenData) return null;

  // Generate token baru dengan expiry time yang sama atau diperpanjang
  // Note: In a real implementation, this should be handled server-side for security
  return generateSecureTokenSync(tokenData.email, 15 * 60 * 1000);
}

// Token storage management with synchronous operations for tests
class TokenManager {
  private static TOKEN_KEY = 'malnu_secure_token';
  private static REFRESH_TIMER_KEY = 'malnu_refresh_timer';

  static storeTokenSync(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.scheduleTokenRefresh(token);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TIMER_KEY);
  }

  private static scheduleTokenRefresh(token: string): void {
    // In test environment, we don't schedule actual refreshes
    // Just store the refresh timer info
    localStorage.setItem(this.REFRESH_TIMER_KEY, Date.now().toString());
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

// Test environment - using local storage for testing
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
const useSupabase = process.env.VITE_USE_SUPABASE === 'true' || process.env.USE_SUPABASE === 'true';

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

    // Check if this is a test scenario where we need to create a specific user
    // rather than using the default users
    const existingUser = users.find(user => user.email === email && user.is_active);
    if (existingUser) {
      return existingUser;
    }

    // Buat user baru dengan role berdasarkan email pattern
    let role = 'student'; // default role
    if (email.includes('admin')) role = 'admin';
    else if (email.includes('guru') || email.includes('teacher')) role = 'teacher';
    else if (email.includes('parent') || email.includes('ayah') || email.includes('ibu') || email.includes('wali')) role = 'parent';

    const newUser: User = {
      id: Date.now(), // Simple ID generation for demo
      email,
      name: name || email.split('@')[0], // Use email prefix as name if not provided
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
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

// Mock for SupabaseAuthService
class SupabaseAuthService {
  static async requestLoginLink(email: string): Promise<LoginResponse> {
    return { success: true, message: 'Link login telah dikirim ke email Anda' };
  }

  static async verifySession(): Promise<VerifyResponse> {
    const user = LocalAuthService.getCurrentUser();
    return { success: !!user, user, message: user ? 'Session valid' : 'No valid session' };
  }

  static async refreshSession(): Promise<RefreshTokenResponse> {
    return { success: true, message: 'Session refreshed' };
  }

  static async signOut(): Promise<void> {
    // Mock sign out
  }

  static async getCurrentUser(): Promise<User | null> {
    return LocalAuthService.getCurrentUser();
  }

  static async isAuthenticated(): Promise<boolean> {
    return !!LocalAuthService.getCurrentUser();
  }
}

// Main auth service that works in test environment
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
      // Development mode - simulate magic link dengan secure token
      const user = LocalAuthService.findUserByEmail(email) || LocalAuthService.createUser(email);
      const token = generateSecureTokenSync(email, 15 * 60 * 1000); // 15 menit expiry
      LocalAuthService.setCurrentUser(user);
      
      // Store token in localStorage as expected by tests for the refresh token flow
      localStorage.setItem('malnu_secure_token', token);

      // Simulate email sending
      console.log(`[DEV MODE] Magic link untuk ${email}: /verify-login?token=${token}`);
      return { success: true, message: 'Link login (cek console untuk development mode)' };
    } else {
      // Production mode would go here
      return { success: true, message: 'Link login telah dikirim ke email Anda' };
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
      try {
        const tokenData = verifyAndDecodeToken(token);
        if (!tokenData) {
          return { success: false, message: 'Token tidak valid atau sudah kedaluwarsa' };
        }

        // Find or create user based on token email
        let user = LocalAuthService.findUserByEmail(tokenData.email);
        if (!user) {
          user = LocalAuthService.createUser(tokenData.email);
        }

        if (user) {
          LocalAuthService.setCurrentUser(user);
          // Store token dengan refresh mechanism
          TokenManager.storeTokenSync(token);

          // Check if token perlu refresh dalam waktu dekat
          const needsRefresh = shouldRefreshToken(token);

          return {
            success: true,
            user,
            message: 'Login berhasil',
            needsRefresh,
            refreshedToken: needsRefresh ? refreshTokenSync(token) || undefined : undefined
          };
        } else {
          return { success: false, message: 'User tidak ditemukan' };
        }
      } catch (error) {
        return { success: false, message: 'Token tidak valid' };
      }
    } else {
      // Production mode would go here
      return { success: true, message: 'Login berhasil' };
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

      const newToken = refreshTokenSync(currentToken);
      if (newToken) {
        TokenManager.storeTokenSync(newToken);
        return { success: true, token: newToken, message: 'Token berhasil di-refresh' };
      } else {
        TokenManager.removeToken();
        return { success: false, message: 'Token tidak valid, silakan login ulang' };
      }
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
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (useSupabase) {
      return await SupabaseAuthService.getCurrentUser();
    }
    return isDevelopment ? LocalAuthService.getCurrentUser() : null;
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
      // Initialize token manager in development mode
    }
  }
}

// Export for testing
export { LocalAuthService, SupabaseAuthService };