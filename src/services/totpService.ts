import { STORAGE_KEYS } from '../constants';
import { logger } from '../utils/logger';
import { ENV } from '../config/env';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorData {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  createdAt?: string;
}

const TOTP_ISSUER = ENV.SCHOOL.NAME;
const BACKUP_CODES_COUNT = 10;

function base32Encode(buffer: ArrayBuffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = new Uint8Array(buffer);
  let bits = 0;
  let value = 0;
  let result = '';

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result += alphabet[(value >> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 0x1f];
  }

  return result.padEnd(16, '=');
}

function generateSecret(): string {
  const buffer = new Uint8Array(20);
  crypto.getRandomValues(buffer);
  return base32Encode(buffer.buffer);
}

async function hmacSha1(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const keyBuffer = key.buffer as ArrayBuffer;
  const dataBuffer = data.buffer as ArrayBuffer;
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  return new Uint8Array(signature);
}

async function getHotpValue(secret: string, counter: number): Promise<number> {
  const secretBytes = base32Decode(secret);
  const counterBytes = new Uint8Array(8);
  
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter >>>= 8;
  }

  const hash = await hmacSha1(secretBytes, counterBytes);
  const offset = hash[hash.length - 1] & 0xf;
  
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  return binary % 1000000;
}

function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanBase32 = base32.replace(/=/g, '').toUpperCase();
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of cleanBase32) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    
    buffer = (buffer << 5) | value;
    bits += 5;
    
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}

export const totpService = {
  generateSecret(): string {
    return generateSecret();
  },

  getOtpauthUrl(secret: string, accountName: string): string {
    const encodedIssuer = encodeURIComponent(TOTP_ISSUER);
    const encodedAccount = encodeURIComponent(accountName);
    return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
  },

  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      const code = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
        .match(/.{4}/g)
        ?.join('-') || '';
      codes.push(code);
    }
    return codes;
  },

  verifyCode(secret: string, code: string, window = 1): boolean {
    const trimmedCode = code.replace(/\s/g, '').replace(/-/g, '');
    
    if (trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
      return false;
    }

    const counter = Math.floor(Date.now() / 30000);
    
    let matched = false;
    
    const checkCodes = async () => {
      for (let i = -window; i <= window; i++) {
        const expectedCode = (await getHotpValue(secret, counter + i)).toString().padStart(6, '0');
        if (expectedCode === trimmedCode) {
          matched = true;
          return;
        }
      }
    };
    
    checkCodes();
    
    return matched;
  },

  verifyBackupCode(userId: string, code: string): boolean {
    try {
      const storageKey = STORAGE_KEYS.TWO_FACTOR_BACKUP_CODES(userId);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) return false;
      
      const backupCodes = JSON.parse(stored) as string[];
      const normalizedCode = code.replace(/\s/g, '').toUpperCase();
      
      const index = backupCodes.findIndex(
        c => c.replace(/\s/g, '').toUpperCase() === normalizedCode
      );
      
      if (index === -1) return false;
      
      backupCodes.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(backupCodes));
      
      return true;
    } catch (err) {
      logger.error('Failed to verify backup code:', err);
      return false;
    }
  },

  async setupTwoFactor(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    const secret = this.generateSecret();
    const qrCodeUrl = this.getOtpauthUrl(secret, userEmail);
    const backupCodes = this.generateBackupCodes();

    try {
      const pendingKey = STORAGE_KEYS.TWO_FACTOR_PENDING_SETUP;
      const pendingData = {
        secret,
        backupCodes,
        userId,
        expiresAt: Date.now() + 10 * 60 * 1000
      };
      localStorage.setItem(pendingKey, JSON.stringify(pendingData));
    } catch (err) {
      logger.error('Failed to store pending 2FA setup:', err);
    }

    return { secret, qrCodeUrl, backupCodes };
  },

  confirmTwoFactor(userId: string, secret: string, verificationCode: string): boolean {
    if (!this.verifyCode(secret, verificationCode)) {
      return false;
    }

    try {
      const pendingKey = STORAGE_KEYS.TWO_FACTOR_PENDING_SETUP;
      const pendingData = JSON.parse(localStorage.getItem(pendingKey) || '{}');
      
      if (pendingData.userId !== userId) {
        return false;
      }

      if (Date.now() > pendingData.expiresAt) {
        localStorage.removeItem(pendingKey);
        return false;
      }

      const secretKey = STORAGE_KEYS.TWO_FACTOR_SECRET(userId);
      const enabledKey = STORAGE_KEYS.TWO_FACTOR_ENABLED(userId);
      const backupKey = STORAGE_KEYS.TWO_FACTOR_BACKUP_CODES(userId);

      localStorage.setItem(secretKey, secret);
      localStorage.setItem(enabledKey, 'true');
      localStorage.setItem(backupKey, JSON.stringify(pendingData.backupCodes));
      localStorage.removeItem(pendingKey);

      logger.info('2FA enabled for user:', userId);
      return true;
    } catch (err) {
      logger.error('Failed to confirm 2FA setup:', err);
      return false;
    }
  },

  isTwoFactorEnabled(userId: string): boolean {
    try {
      const key = STORAGE_KEYS.TWO_FACTOR_ENABLED(userId);
      return localStorage.getItem(key) === 'true';
    } catch {
      return false;
    }
  },

  getTwoFactorData(userId: string): TwoFactorData | null {
    try {
      const enabled = this.isTwoFactorEnabled(userId);
      if (!enabled) return null;

      const secretKey = STORAGE_KEYS.TWO_FACTOR_SECRET(userId);
      const backupKey = STORAGE_KEYS.TWO_FACTOR_BACKUP_CODES(userId);

      const secret = localStorage.getItem(secretKey) ?? undefined;
      const backupCodesStr = localStorage.getItem(backupKey);
      const backupCodes = backupCodesStr ? JSON.parse(backupCodesStr) : [];
      const createdAt = localStorage.getItem(secretKey + '_created') ?? undefined;

      return {
        enabled: true,
        secret,
        backupCodes,
        createdAt
      };
    } catch (err) {
      logger.error('Failed to get 2FA data:', err);
      return null;
    }
  },

  disableTwoFactor(userId: string, verificationCode: string): boolean {
    try {
      const secretKey = STORAGE_KEYS.TWO_FACTOR_SECRET(userId);
      const secret = localStorage.getItem(secretKey);
      
      if (!secret) return false;
      
      if (!this.verifyCode(secret, verificationCode)) {
        return false;
      }

      localStorage.removeItem(secretKey);
      localStorage.removeItem(STORAGE_KEYS.TWO_FACTOR_ENABLED(userId));
      localStorage.removeItem(STORAGE_KEYS.TWO_FACTOR_BACKUP_CODES(userId));

      logger.info('2FA disabled for user:', userId);
      return true;
    } catch (err) {
      logger.error('Failed to disable 2FA:', err);
      return false;
    }
  },

  getRemainingBackupCodes(userId: string): number {
    try {
      const key = STORAGE_KEYS.TWO_FACTOR_BACKUP_CODES(userId);
      const stored = localStorage.getItem(key);
      if (!stored) return 0;
      const codes = JSON.parse(stored) as string[];
      return codes.length;
    } catch {
      return 0;
    }
  },

  regenerateBackupCodes(userId: string, verificationCode: string): string[] | null {
    try {
      const secretKey = STORAGE_KEYS.TWO_FACTOR_SECRET(userId);
      const secret = localStorage.getItem(secretKey);
      
      if (!secret) return null;
      
      if (!this.verifyCode(secret, verificationCode)) {
        return null;
      }

      const newCodes = this.generateBackupCodes();
      const backupKey = STORAGE_KEYS.TWO_FACTOR_BACKUP_CODES(userId);
      localStorage.setItem(backupKey, JSON.stringify(newCodes));

      logger.info('Backup codes regenerated for user:', userId);
      return newCodes;
    } catch (err) {
      logger.error('Failed to regenerate backup codes:', err);
      return null;
    }
  }
};
