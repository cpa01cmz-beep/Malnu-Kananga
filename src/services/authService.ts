// Authentication service untuk development dan production
import { WORKER_URL } from '../utils/envValidation';

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

// Secure token generation menggunakan Web Crypto API
async function generateSecureToken(email: string, expiryTime: number = 15 * 60 * 1000): Promise<string> {
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

// Generate signature using HMAC-SHA256 with crypto.subtle (secure signature)
    // In production, signature generation should be done server-side only
    // This client-side implementation is for development/testing purposes only
    // DO NOT use this for production authentication as it exposes the secret
    const secret = isDevelopment ? (import.meta.env.VITE_JWT_SECRET || 'dev-secret-key') : 'CLIENT_SIDE_PLACEHOLDER';
    
    // For production, we'll make a request to the server to generate the signature
    if (!isDevelopment) {
      try {
        const response = await fetch(`${WORKER_URL}/generate-signature`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: `${encodedHeader}.${encodedPayload}` }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate signature');
        }
        
        const { signature } = await response.json();
        return `${encodedHeader}.${encodedPayload}.${signature}`;
      } catch (error) {
        console.error('Error generating signature on server:', error);
        throw new Error('Failed to generate secure token');
      }
    }
    
    // For development, continue with client-side signature generation
    const signature = await generateHMACSignature(`${encodedHeader}.${encodedPayload}`, secret);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Generate cryptographically secure random string
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate HMAC signature using crypto.subtle
async function generateHMACSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
}

// Verify HMAC signature using crypto.subtle
async function verifyHMACSignature(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  // Convert signature from hex string to Uint8Array
  const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  return await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(data));
}

// Verify dan decode secure token
async function verifyAndDecodeToken(token: string): Promise<TokenData | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature using HMAC-SHA256
    const data = `${encodedHeader}.${encodedPayload}`;
    // In production, token verification should be done server-side only
    // This client-side implementation is for development/testing purposes only
    const secret = isDevelopment ? (import.meta.env.VITE_JWT_SECRET || 'dev-secret-key') : 'CLIENT_SIDE_PLACEHOLDER';
    
    // For production, we'll make a request to the server to verify the signature
    if (!isDevelopment) {
      try {
        const response = await fetch(`${WORKER_URL}/verify-signature`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data, signature }),
        });
        
        if (!response.ok) {
          return null; // Invalid signature
        }
        
        const { isValid } = await response.json();
        if (!isValid) {
          return null; // Invalid signature
        }
      } catch (error) {
        console.error('Error verifying signature on server:', error);
        return null; // Invalid signature
      }
    } else {
      // For development, continue with client-side signature verification
      const isValid = await verifyHMACSignature(data, signature, secret);
      if (!isValid) {
        return null; // Invalid signature
      }
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
async function shouldRefreshToken(token: string): Promise<boolean> {
  const tokenData = await verifyAndDecodeToken(token);
  if (!tokenData) return false;

  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  return (tokenData.exp - now) <= fiveMinutes;
}

// Refresh token dengan email yang sama
async function refreshToken(currentToken: string): Promise<string | null> {
  const tokenData = await verifyAndDecodeToken(currentToken);
  if (!tokenData) return null;

  // Generate token baru dengan expiry time yang sama atau diperpanjang
  return await generateSecureToken(tokenData.email, 15 * 60 * 1000);
}

// Token storage management dengan auto-refresh
class TokenManager {
  private static TOKEN_KEY = 'malnu_secure_token';
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

  static async storeToken(token: string): Promise<void> {
    this.initializeCleanup();
    localStorage.setItem(this.TOKEN_KEY, token);
    await this.scheduleTokenRefresh(token);
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

  private static async scheduleTokenRefresh(token: string): Promise<void> {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Schedule refresh 1 menit sebelum token expired
    const tokenData = await verifyAndDecodeToken(token);
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

  static async initializeTokenManager(): Promise<void> {
    const token = this.getToken();
    if (token) {
      // Check if token masih valid atau perlu refresh
      if (await shouldRefreshToken(token)) {
        await this.attemptTokenRefresh();
      } else if (!await verifyAndDecodeToken(token)) {
        // Token sudah expired
        this.removeToken();
      } else {
        // Token masih valid, schedule refresh jika diperlukan
        await this.scheduleTokenRefresh(token);
      }
    }
  }
}

export interface User {
  id: number;
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
        email: 'guru@ma-malnukananga.sch.id',
        name: 'Dr. Siti Nurhaliza, M.Pd.',
        role: 'teacher',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 3,
        email: 'siswa@ma-malnukananga.sch.id',
        name: 'Ahmad Fauzi Rahman',
        role: 'student',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 4,
        email: 'parent@ma-malnukananga.sch.id',
        name: 'Bapak Ahmad Rahman',
        role: 'parent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 5,
        email: 'ayah@ma-malnukananga.sch.id',
        name: 'Bapak Ahmad Fauzi',
        role: 'parent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 6,
        email: 'ibu@ma-malnukananga.sch.id',
        name: 'Ibu Siti Aminah',
        role: 'parent',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      }
    ];

    // Jika belum ada users, inisialisasi dengan default users
    if (users.length === 0) {
      this.saveUsers(defaultUsers);
      return defaultUsers.find(u => u.email === email) || defaultUsers[0];
    }

    // Cari user yang sudah ada
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
      name,
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

    if (isDevelopment) {
      // Development mode - simulate magic link dengan secure token
      const user = LocalAuthService.findUserByEmail(email) || LocalAuthService.createUser(email);
      const token = await generateSecureToken(email, 15 * 60 * 1000); // 15 menit expiry
      LocalAuthService.setCurrentUser(user);

      // Simulate email sending
      console.log(`[DEV MODE] Magic link untuk ${email}: /verify-login?token=${token}`);
      return { success: true, message: 'Link login (cek console untuk development mode)' };
    } else {
      return ProductionAuthService.requestLoginLink(email);
    }
  }

  static async verifyLoginToken(token: string): Promise<VerifyResponse> {
    if (isDevelopment) {
      try {
        const tokenData = await verifyAndDecodeToken(token);
        if (!tokenData) {
          return { success: false, message: 'Token tidak valid atau sudah kedaluwarsa' };
        }

        const user = LocalAuthService.findUserByEmail(tokenData.email);
        if (user) {
          LocalAuthService.setCurrentUser(user);
          // Store token dengan refresh mechanism
          await TokenManager.storeToken(token);

          // Check if token perlu refresh dalam waktu dekat
          const needsRefresh = await shouldRefreshToken(token);

          return {
            success: true,
            user,
            message: 'Login berhasil',
            needsRefresh,
            refreshedToken: needsRefresh ? await refreshToken(token) || undefined : undefined
          };
        } else {
          return { success: false, message: 'User tidak ditemukan' };
        }
      } catch (error) {
        return { success: false, message: 'Token tidak valid' };
      }
    } else {
      return ProductionAuthService.verifyLoginToken(token);
    }
  }

  static async refreshCurrentToken(): Promise<RefreshTokenResponse> {
    if (isDevelopment) {
      const currentToken = TokenManager.getToken();
      if (!currentToken) {
        return { success: false, message: 'Tidak ada token aktif' };
      }

      const newToken = await refreshToken(currentToken);
      if (newToken) {
        await TokenManager.storeToken(newToken);
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
    const token = TokenManager.getToken();
    return token ? shouldRefreshToken(token) : false;
  }

  static clearSession(): void {
    TokenManager.removeToken();
    if (isDevelopment) {
      LocalAuthService.setCurrentUser(null);
    } else {
      // Production logout perlu server-side handling
      document.cookie = 'auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  static getCurrentUser(): User | null {
    return isDevelopment ? LocalAuthService.getCurrentUser() : null; // Production perlu cookie handling
  }

  static logout(): void {
    this.clearSession();
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = this.getCurrentUser();
    const token = TokenManager.getToken();

    if (!user || !token) {
      return false;
    }

    // Check if token masih valid
    const tokenData = await verifyAndDecodeToken(token);
    if (!tokenData) {
      // Token expired, clear session
      this.clearSession();
      return false;
    }

    return true;
  }

  static async initializeAuth(): Promise<void> {
    if (isDevelopment) {
      await TokenManager.initializeTokenManager();
    }
  }
}

// Export untuk kemudahan testing
export { LocalAuthService, ProductionAuthService };