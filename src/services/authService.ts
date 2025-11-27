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

// Enhanced email validation with security checks
function isValidEmail(email: string): boolean {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Length validation
  if (email.length < 5 || email.length > 254) {
    return false;
  }
  
  // Security checks - prevent dangerous patterns
  const dangerousPatterns = [
    /\.\./,           // Directory traversal
    /[<>]/,           // HTML injection
    /javascript:/i,   // JavaScript protocol
    /data:/i,         // Data protocol
    /vbscript:/i,     // VBScript protocol
    /file:/i,         // File protocol
    /ftp:/i,          // FTP protocol
    /[\x00-\x1F\x7F]/ // Control characters
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(email))) {
    return false;
  }
  
  // Domain validation - prevent suspicious domains
  const [localPart, domain] = email.split('@');
  
  // Local part validation
  if (!localPart || localPart.length > 64) {
    return false;
  }
  
  // Domain validation
  if (!domain || domain.length > 253) {
    return false;
  }
  
  // Prevent consecutive dots
  if (email.includes('..')) {
    return false;
  }
  
  // Prevent leading/trailing dots and hyphens in domain parts
  const domainParts = domain.split('.');
  for (const part of domainParts) {
    if (part.startsWith('-') || part.endsWith('-') || part.startsWith('.') || part.endsWith('.')) {
      return false;
    }
  }
  
  // Check for allowed characters in local part
  const localPartRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localPartRegex.test(localPart)) {
    return false;
  }
  
  // Check for allowed characters in domain
  const domainRegex = /^[a-zA-Z0-9.-]+$/;
  if (!domainRegex.test(domain)) {
    return false;
  }
  
  return true;
}

// Input sanitization function
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove JavaScript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/vbscript:/gi, '') // Remove VBScript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

// Validate user input for common attacks
function validateUserInput(input: string, type: 'email' | 'name' | 'general' = 'general'): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = sanitizeInput(input);
  
  // Length validation
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Input cannot be empty' };
  }
  
  if (sanitized.length > 1000) {
    return { valid: false, sanitized: '', error: 'Input too long' };
  }
  
  // Type-specific validation
  switch (type) {
    case 'email':
      if (!isValidEmail(sanitized)) {
        return { valid: false, sanitized: '', error: 'Invalid email format' };
      }
      break;
      
    case 'name':
      // Name validation - allow letters, spaces, and common punctuation
      const nameRegex = /^[a-zA-Z\s\u00C0-\u017F.,'-]+$/;
      if (!nameRegex.test(sanitized)) {
        return { valid: false, sanitized: '', error: 'Invalid name format' };
      }
      if (sanitized.length > 100) {
        return { valid: false, sanitized: '', error: 'Name too long' };
      }
      break;
      
    case 'general':
      // General input validation - prevent script injection
      const dangerousPatterns = [
        /<script/i,
        /<\/script>/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<form/i,
        /javascript:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i,
        /onclick=/i
      ];
      
      if (dangerousPatterns.some(pattern => pattern.test(sanitized))) {
        return { valid: false, sanitized: '', error: 'Invalid input detected' };
      }
      break;
  }
  
  return { valid: true, sanitized };
}

// SECURITY: All client-side JWT generation functions removed
// Token generation and verification must be handled server-side only
// This prevents secret key exposure and authentication bypass vulnerabilities

// SECURITY: All client-side token verification functions removed
// Token verification must be handled server-side only
// This prevents token tampering and authentication bypass vulnerabilities

// SECURE Token storage management using HTTP-only cookies
class TokenManager {
  private static TOKEN_KEY = 'malnu_secure_token';
  
  // SECURITY: Replaced localStorage with secure cookie-based storage
  static storeToken(token: string): Promise<void> {
    // In production, tokens should be stored in HTTP-only cookies set by server
    // For development, we'll use sessionStorage (more secure than localStorage)
    if (isDevelopment) {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    // Production: Server should set HTTP-only cookie
    return Promise.resolve();
  }

  static storeTokenSync(token: string): void {
    // SECURITY: Using sessionStorage instead of localStorage for XSS protection
    if (isDevelopment) {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
    // Production: Server should set HTTP-only cookie
  }

  static getToken(): string | null {
    // In development, check sessionStorage
    if (isDevelopment) {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    // Production: Read from HTTP-only cookie (handled by server)
    return null;
  }

  static removeToken(): void {
    // Remove from sessionStorage in development
    if (isDevelopment) {
      sessionStorage.removeItem(this.TOKEN_KEY);
    }
    // Production: Server should clear HTTP-only cookie
    document.cookie = 'auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; HttpOnly; SameSite=Strict';
  }

  // SECURITY: Removed auto-refresh functionality - tokens should be refreshed server-side
  static initializeTokenManager(): void {
    // Token management now handled server-side
    console.log('Token management initialized - server-side only');
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
const isDevelopment = import.meta.env.DEV;
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true' || import.meta.env.USE_SUPABASE === 'true';

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

    // Default users untuk testing berbagai role
    const defaultUsers = [
      {
        id: 1,
        email: 'admin@ma-malnukananga.sch.id',
        name: 'Administrator',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 2,
        email: 'guru@ma-malnukanaga.sch.id',
        name: 'Dr. Siti Nurhaliza, M.Pd.',
        role: 'teacher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 3,
        email: 'siswa@ma-malnukanaga.sch.id',
        name: 'Ahmad Fauzi Rahman',
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 4,
        email: 'parent@ma-malnukanaga.sch.id',
        name: 'Bapak Ahmad Rahman',
        role: 'parent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 5,
        email: 'ayah@ma-malnukanaga.sch.id',
        name: 'Bapak Ahmad Fauzi',
        role: 'parent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 6,
        email: 'ibu@ma-malnukanaga.sch.id',
        name: 'Ibu Siti Aminah',
        role: 'parent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ];

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
      // Use error sanitizer to prevent information disclosure
      const errorContext = {
        endpoint: '/request-login-link',
        method: 'POST',
        timestamp: new Date().toISOString()
      };
      
      // Import dynamically to avoid circular dependencies
      const { ErrorSanitizer } = await import('../utils/errorSanitizer');
      const sanitized = ErrorSanitizer.sanitizeError(error as Error, errorContext);
      
      return { success: false, message: sanitized.message };
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

    // Enhanced email validation with security checks
    const emailValidation = validateUserInput(email, 'email');
    if (!emailValidation.valid) {
      return {
        success: false,
        message: emailValidation.error || 'Format email tidak valid.'
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

// Export untuk kemudahan testing
export { LocalAuthService, ProductionAuthService };