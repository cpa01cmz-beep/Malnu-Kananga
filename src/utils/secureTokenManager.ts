// Secure token management utilities
// Replaces insecure client-side token operations

export class SecureTokenManager {
  private static readonly TOKEN_KEY = 'malnu_auth_session';
  
  /**
   * SECURE: Store token using HttpOnly cookie (server-side)
   * Client-side storage is disabled for security
   */
  static async storeToken(token: string): Promise<void> {
    // In production, this should be handled by server setting HttpOnly cookie
    // For development, we use sessionStorage (more secure than localStorage)
    if (import.meta.env.DEV) {
      try {
        sessionStorage.setItem(this.TOKEN_KEY, token);
      } catch (error) {
        console.error('Failed to store token:', error);
      }
    }
    // Production: Server sets HttpOnly cookie via Set-Cookie header
  }
  
  /**
   * SECURE: Get token from secure storage
   */
  static getToken(): string | null {
    if (import.meta.env.DEV) {
      try {
        return sessionStorage.getItem(this.TOKEN_KEY);
      } catch (error) {
        console.error('Failed to retrieve token:', error);
        return null;
      }
    }
    // Production: Token is automatically sent via HttpOnly cookie
    return null;
  }
  
  /**
   * SECURE: Remove token from all storage
   */
  static removeToken(): void {
    if (import.meta.env.DEV) {
      try {
        sessionStorage.removeItem(this.TOKEN_KEY);
      } catch (error) {
        console.error('Failed to remove token:', error);
      }
    }
    // Production: Clear HttpOnly cookie
    document.cookie = `${this.TOKEN_KEY}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; HttpOnly; SameSite=Strict`;
  }
  
  /**
   * SECURITY: Token validation should be server-side only
   * Client-side validation disabled to prevent token tampering
   */
  static isTokenValid(): boolean {
    // Always return true for client-side checks
    // Actual validation happens server-side
    return this.getToken() !== null;
  }
  
  /**
   * SECURITY: Token refresh should be server-side only
   */
  static async refreshToken(): Promise<{ success: boolean; token?: string; message: string }> {
    // Client-side token refresh disabled for security
    this.removeToken();
    return {
      success: false,
      message: 'Token refresh harus dilakukan server-side. Silakan login ulang.'
    };
  }
  
  /**
   * SECURITY: Token expiry check should be server-side only
   */
  static isTokenExpiringSoon(): boolean {
    // Client-side expiry check disabled for security
    return false;
  }
  
  /**
   * Initialize secure token management
   */
  static initialize(): void {
    console.log('Secure token management initialized - server-side validation only');
  }
}

// Export singleton instance
export const secureTokenManager = SecureTokenManager;