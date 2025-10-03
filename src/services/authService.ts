// Authentication service untuk development dan production
import { WORKER_URL } from '../utils/envValidation';

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
    const newUser: User = {
      id: Date.now(), // Simple ID generation for demo
      email,
      name,
      role: 'user',
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
    if (isDevelopment) {
      // Development mode - simulate magic link
      const user = LocalAuthService.findUserByEmail(email) || LocalAuthService.createUser(email);
      const token = btoa(`${email}:${Date.now() + 15 * 60 * 1000}`); // 15 menit expiry
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
        const [email, expiry] = atob(token).split(':');
        if (Date.now() > Number(expiry)) {
          return { success: false, message: 'Token sudah kedaluwarsa' };
        }

        const user = LocalAuthService.findUserByEmail(email);
        if (user) {
          LocalAuthService.setCurrentUser(user);
          return { success: true, user, message: 'Login berhasil' };
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

  static getCurrentUser(): User | null {
    return isDevelopment ? LocalAuthService.getCurrentUser() : null; // Production perlu cookie handling
  }

  static logout(): void {
    if (isDevelopment) {
      LocalAuthService.setCurrentUser(null);
    } else {
      // Production logout perlu server-side handling
      document.cookie = 'auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

// Export untuk kemudahan testing
export { LocalAuthService, ProductionAuthService };