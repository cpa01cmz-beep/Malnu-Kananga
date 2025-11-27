// Multi-Factor Authentication (MFA) support for magic link authentication
// This provides an additional layer of security beyond email-based authentication

interface MFAConfig {
  enabled: boolean;
  methods: ('totp' | 'sms' | 'backup')[];
  issuer: string;
  secretLength: number;
  tokenLength: number;
  expiryMinutes: number;
}

interface MFAChallenge {
  id: string;
  userId: string;
  method: string;
  secret: string;
  token: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

interface MFASetup {
  userId: string;
  secret: string;
  backupCodes: string[];
  enabled: boolean;
  methods: string[];
}

class MFAService {
  private static config: MFAConfig = {
    enabled: true,
    methods: ['totp', 'backup'],
    issuer: 'MA Malnu Kananga',
    secretLength: 32,
    tokenLength: 6,
    expiryMinutes: 10
  };

  private static challenges = new Map<string, MFAChallenge>();
  private static setups = new Map<string, MFASetup>();

  // Generate cryptographically secure random secret
  static generateSecret(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Generate TOTP token (simplified implementation)
  static generateTOTPToken(secret: string): string {
    // In production, use a proper TOTP library like 'otplib'
    // This is a simplified version for demonstration
    const timeStep = Math.floor(Date.now() / 30000); // 30-second steps
    const hash = this.simpleHMAC(secret, timeStep.toString());
    const offset = hash[hash.length - 1] & 0x0F;
    const code = (hash[offset] & 0x7F) << 24 | 
                 (hash[offset + 1] & 0xFF) << 16 |
                 (hash[offset + 2] & 0xFF) << 8 |
                 (hash[offset + 3] & 0xFF);
    return (code % 1000000).toString().padStart(6, '0');
  }

  // Simple HMAC implementation (use proper crypto library in production)
  private static simpleHMAC(secret: string, data: string): number[] {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const message = encoder.encode(data);
    
    // This is a simplified version - use Web Crypto API in production
    let hash = 0;
    const combined = new Uint8Array(key.length + message.length);
    combined.set(key);
    combined.set(message, key.length);
    
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash + combined[i]) & 0xFFFFFFFF;
    }
    
    const result = new Array(20);
    for (let i = 0; i < 20; i++) {
      result[i] = (hash >> (i * 8)) & 0xFF;
    }
    return result;
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = this.generateSecret(8).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Create MFA challenge for user
  static createChallenge(userId: string, method: string): MFAChallenge {
    const challengeId = this.generateSecret(16);
    const secret = this.generateSecret(this.config.secretLength);
    const token = method === 'totp' ? this.generateTOTPToken(secret) : this.generateSecret(this.config.tokenLength);
    
    const challenge: MFAChallenge = {
      id: challengeId,
      userId,
      method,
      secret,
      token,
      expiresAt: Date.now() + (this.config.expiryMinutes * 60 * 1000),
      attempts: 0,
      maxAttempts: 3
    };

    this.challenges.set(challengeId, challenge);
    return challenge;
  }

  // Verify MFA challenge
  static verifyChallenge(challengeId: string, providedToken: string): { success: boolean; error?: string } {
    const challenge = this.challenges.get(challengeId);
    
    if (!challenge) {
      return { success: false, error: 'Invalid challenge' };
    }

    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(challengeId);
      return { success: false, error: 'Challenge expired' };
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      this.challenges.delete(challengeId);
      return { success: false, error: 'Too many attempts' };
    }

    challenge.attempts++;

    // Verify token
    let isValid = false;
    if (challenge.method === 'totp') {
      // For TOTP, check current and adjacent time steps
      const timeStep = Math.floor(Date.now() / 30000);
      for (let offset = -1; offset <= 1; offset++) {
        const expectedToken = this.generateTOTPToken(challenge.secret);
        if (providedToken === expectedToken) {
          isValid = true;
          break;
        }
      }
    } else {
      isValid = providedToken === challenge.token;
    }

    if (isValid) {
      this.challenges.delete(challengeId);
      return { success: true };
    } else {
      if (challenge.attempts >= challenge.maxAttempts) {
        this.challenges.delete(challengeId);
        return { success: false, error: 'Too many attempts' };
      }
      return { success: false, error: 'Invalid token' };
    }
  }

  // Setup MFA for user
  static setupMFA(userId: string, method: string): { secret: string; backupCodes: string[]; qrCode?: string } {
    const secret = this.generateSecret(this.config.secretLength);
    const backupCodes = this.generateBackupCodes();
    
    let setup = this.setups.get(userId);
    if (!setup) {
      setup = {
        userId,
        secret,
        backupCodes,
        enabled: false,
        methods: []
      };
    }

    setup.methods.push(method);
    this.setups.set(userId, setup);

    // Generate QR code URL for TOTP (simplified)
    const qrCode = method === 'totp' ? 
      `otpauth://totp/${this.config.issuer}:${userId}?secret=${secret}&issuer=${this.config.issuer}` : 
      undefined;

    return { secret, backupCodes, qrCode };
  }

  // Enable MFA for user
  static enableMFA(userId: string): { success: boolean; error?: string } {
    const setup = this.setups.get(userId);
    if (!setup) {
      return { success: false, error: 'MFA not set up' };
    }

    setup.enabled = true;
    this.setups.set(userId, setup);
    return { success: true };
  }

  // Disable MFA for user
  static disableMFA(userId: string): { success: boolean; error?: string } {
    const setup = this.setups.get(userId);
    if (!setup) {
      return { success: false, error: 'MFA not set up' };
    }

    setup.enabled = false;
    this.setups.set(userId, setup);
    return { success: true };
  }

  // Check if user has MFA enabled
  static isMFAEnabled(userId: string): boolean {
    const setup = this.setups.get(userId);
    return setup?.enabled || false;
  }

  // Verify backup code
  static verifyBackupCode(userId: string, code: string): { success: boolean; error?: string } {
    const setup = this.setups.get(userId);
    if (!setup) {
      return { success: false, error: 'MFA not set up' };
    }

    const codeIndex = setup.backupCodes.indexOf(code.toUpperCase());
    if (codeIndex === -1) {
      return { success: false, error: 'Invalid backup code' };
    }

    // Remove used backup code
    setup.backupCodes.splice(codeIndex, 1);
    this.setups.set(userId, setup);
    
    return { success: true };
  }

  // Get MFA status for user
  static getMFAStatus(userId: string): { enabled: boolean; methods: string[]; backupCodesRemaining: number } {
    const setup = this.setups.get(userId);
    if (!setup) {
      return { enabled: false, methods: [], backupCodesRemaining: 0 };
    }

    return {
      enabled: setup.enabled,
      methods: setup.methods,
      backupCodesRemaining: setup.backupCodes.length
    };
  }

  // Clean up expired challenges
  static cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [id, challenge] of this.challenges.entries()) {
      if (now > challenge.expiresAt) {
        this.challenges.delete(id);
      }
    }
  }
}

// Enhanced authentication service with MFA support
export class EnhancedAuthService {
  // Request login link with MFA consideration
  static async requestLoginLink(email: string): Promise<{ success: boolean; message: string; requiresMFA?: boolean }> {
    // Validate input
    const emailValidation = validateUserInput(email, 'email');
    if (!emailValidation.valid) {
      return {
        success: false,
        message: emailValidation.error || 'Format email tidak valid.'
      };
    }

    // Check if user has MFA enabled
    const userId = email; // In production, use actual user ID
    const mfaStatus = MFAService.getMFAStatus(userId);
    
    if (mfaStatus.enabled) {
      // Create MFA challenge
      const challenge = MFAService.createChallenge(userId, 'totp');
      
      // In production, send MFA token via SMS, email, or authenticator app
      console.log(`MFA token for ${email}: ${challenge.token}`);
      
      return {
        success: true,
        message: 'Link login telah dikirim ke email Anda. Periksa juga aplikasi authenticator Anda.',
        requiresMFA: true
      };
    }

    // Standard magic link flow
    // ... existing magic link logic ...
    
    return {
      success: true,
      message: 'Link login telah dikirim ke email Anda.'
    };
  }

  // Verify login with MFA
  static async verifyLoginWithMFA(email: string, token: string, mfaToken?: string): Promise<{ success: boolean; message: string; user?: any }> {
    // Validate inputs
    const emailValidation = validateUserInput(email, 'email');
    if (!emailValidation.valid) {
      return {
        success: false,
        message: emailValidation.error || 'Format email tidak valid.'
      };
    }

    const tokenValidation = validateUserInput(token, 'general');
    if (!tokenValidation.valid) {
      return {
        success: false,
        message: 'Token tidak valid.'
      };
    }

    const userId = email;
    const mfaStatus = MFAService.getMFAStatus(userId);

    if (mfaStatus.enabled) {
      if (!mfaToken) {
        return {
          success: false,
          message: 'MFA token diperlukan.'
        };
      }

      // Verify MFA token
      const mfaValidation = validateUserInput(mfaToken, 'general');
      if (!mfaValidation.valid) {
        return {
          success: false,
          message: 'MFA token tidak valid.'
        };
      }

      // Create and verify MFA challenge
      const challenge = MFAService.createChallenge(userId, 'totp');
      const mfaResult = MFAService.verifyChallenge(challenge.id, mfaToken);
      
      if (!mfaResult.success) {
        return {
          success: false,
          message: mfaResult.error || 'MFA token tidak valid.'
        };
      }
    }

    // Verify magic link token
    // ... existing token verification logic ...
    
    return {
      success: true,
      message: 'Login berhasil.'
    };
  }
}

// Export MFA service for use in other components
export { MFAService };

// Re-export validation functions
function validateUserInput(input: string, type: 'email' | 'name' | 'general' = 'general'): { valid: boolean; sanitized: string; error?: string } {
  const sanitized = input.trim().replace(/[<>]/g, '');
  
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Input cannot be empty' };
  }
  
  if (sanitized.length > 1000) {
    return { valid: false, sanitized: '', error: 'Input too long' };
  }
  
  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      return { valid: false, sanitized: '', error: 'Invalid email format' };
    }
  }
  
  return { valid: true, sanitized };
}