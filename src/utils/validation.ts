/**
 * Validation utilities for form inputs
 * Indonesian language error messages
 */

import { EMAIL_LIMITS, PASSWORD_LIMITS } from '../config/limits';

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email validation with real-time feedback
export const emailValidation: ValidationRule = {
  validate: (email: string) => {
    if (!email || email.trim() === '') return false;
    
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return false;
    
    // Additional checks for common email format issues
    const trimmedEmail = email.trim().toLowerCase();
    const parts = trimmedEmail.split('@');
    
    if (parts.length !== 2) return false;
    if (parts[0].length === 0 || parts[1].length === 0) return false;
    if (parts[0].length > EMAIL_LIMITS.MAX_LOCAL_LENGTH || parts[1].length > EMAIL_LIMITS.MAX_DOMAIN_LENGTH) return false;
    if (parts[0].startsWith('.') || parts[0].endsWith('.')) return false;
    
    return true;
  },
  message: 'Format email tidak valid. Contoh: nama@email.com'
};

// Password validation with clear requirements
export const passwordValidation: ValidationRule = {
  validate: (password: string) => {
    if (!password || password.length === 0) return false;
    if (password.length < PASSWORD_LIMITS.MIN_LENGTH) return false; // Minimum 6 characters
    return true;
  },
  message: `Password minimal ${PASSWORD_LIMITS.MIN_LENGTH} karakter`
};

export const getPasswordRequirements = (password: string): {
  met: boolean;
  requirement: string;
  status: 'met' | 'unmet';
}[] => [
  {
    met: password.length >= PASSWORD_LIMITS.MIN_LENGTH,
    requirement: `Minimal ${PASSWORD_LIMITS.MIN_LENGTH} karakter`,
    status: password.length >= PASSWORD_LIMITS.MIN_LENGTH ? 'met' : 'unmet'
  },
  {
    met: password.length > 0,
    requirement: 'Password wajib diisi',
    status: password.length > 0 ? 'met' : 'unmet'
  }
];

// Real-time validation function
export function validateEmailRealtime(email: string): ValidationResult {
  const errors: string[] = [];
  
  if (!email || email.trim() === '') {
    errors.push('Email harus diisi');
    return { isValid: false, errors };
  }
  
  if (!emailValidation.validate(email)) {
    errors.push(emailValidation.message);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Real-time password validation
export function validatePasswordRealtime(password: string): ValidationResult {
  const errors: string[] = [];
  
  if (!password || password.length === 0) {
    errors.push('Password harus diisi');
    return { isValid: false, errors };
  }
  
  if (password.length < PASSWORD_LIMITS.MIN_LENGTH) {
    errors.push(passwordValidation.message);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Comprehensive form validation
export function validateLoginForm(email: string, password: string): ValidationResult {
  const emailResult = validateEmailRealtime(email);
  const passwordResult = validatePasswordRealtime(password);
  
  const allErrors = [...emailResult.errors, ...passwordResult.errors];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

// Error classification for login scenarios
export function classifyLoginError(error: unknown): string {
  if (!error) return 'Terjadi kesalahan yang tidak terduga';
  
  const errorMessage = (error as Error).message?.toLowerCase() || String(error).toLowerCase();
  
  // Network/Connectivity errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('time out')) {
    return 'Waktu habis. Silakan coba lagi.';
  }
  
  // Authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || 
      errorMessage.includes('kredensial') || errorMessage.includes('login gagal')) {
    return 'Email atau password salah. Periksa kembali data Anda.';
  }
  
  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('server error')) {
    return 'Server sedang bermasalah. Silakan coba beberapa saat lagi.';
  }
  
  // Rate limiting
  if (errorMessage.includes('429') || errorMessage.includes('rate limit') || 
      errorMessage.includes('terlalu banyak')) {
    return 'Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi.';
  }
  
  // Fallback for unknown errors
  return 'Login gagal. Silakan periksa data Anda dan coba lagi.';
}

// Accessibility: Screen reader announcement utilities
export function announceValidation(message: string, _type: 'error' | 'success' | 'info' = 'error'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'alert');
  announcement.setAttribute('aria-live', 'polite');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
