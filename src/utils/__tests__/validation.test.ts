/**
 * Tests for validation utility
 * Verifies form validation, error classification, and accessibility features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  emailValidation,
  passwordValidation,
  getPasswordRequirements,
  validateEmailRealtime,
  validatePasswordRealtime,
  validateLoginForm,
  classifyLoginError,
  announceValidation
} from '../validation';

describe('validation', () => {
  describe('emailValidation', () => {
    it('should validate correct email format', () => {
      expect(emailValidation.validate('test@example.com')).toBe(true);
    });

    it('should validate email with subdomain', () => {
      expect(emailValidation.validate('user@mail.example.com')).toBe(true);
    });

    it('should reject empty email', () => {
      expect(emailValidation.validate('')).toBe(false);
    });

    it('should reject whitespace-only email', () => {
      expect(emailValidation.validate('   ')).toBe(false);
    });

    it('should reject email without @ symbol', () => {
      expect(emailValidation.validate('invalidemail.com')).toBe(false);
    });

    it('should reject email with multiple @ symbols', () => {
      expect(emailValidation.validate('user@@example.com')).toBe(false);
    });

    it('should reject email without domain', () => {
      expect(emailValidation.validate('user@')).toBe(false);
    });

    it('should reject email without local part', () => {
      expect(emailValidation.validate('@example.com')).toBe(false);
    });

    it('should reject email with local part > 64 characters', () => {
      const longEmail = 'a'.repeat(65) + '@example.com';
      expect(emailValidation.validate(longEmail)).toBe(false);
    });

    it('should reject email with domain > 253 characters', () => {
      const longDomain = 'user@' + 'a'.repeat(254);
      expect(emailValidation.validate(longDomain)).toBe(false);
    });

    it('should reject email with local part starting with dot', () => {
      expect(emailValidation.validate('.user@example.com')).toBe(false);
    });

    it('should reject email with local part ending with dot', () => {
      expect(emailValidation.validate('user.@example.com')).toBe(false);
    });

    it('should trim whitespace from email', () => {
      expect(emailValidation.validate('  test@example.com  ')).toBe(true);
      expect(emailValidation.validate('TEST@EXAMPLE.COM')).toBe(true);
    });

    it('should have correct error message', () => {
      expect(emailValidation.message).toBe('Format email tidak valid. Contoh: nama@email.com');
    });
  });

  describe('passwordValidation', () => {
    it('should validate password with 6 characters', () => {
      expect(passwordValidation.validate('123456')).toBe(true);
    });

    it('should validate password with more than 6 characters', () => {
      expect(passwordValidation.validate('password123')).toBe(true);
    });

    it('should reject empty password', () => {
      expect(passwordValidation.validate('')).toBe(false);
    });

    it('should reject password with less than 6 characters', () => {
      expect(passwordValidation.validate('12345')).toBe(false);
    });

    it('should reject password with only whitespace', () => {
      expect(passwordValidation.validate('     ')).toBe(false);
    });

    it('should have correct error message', () => {
      expect(passwordValidation.message).toBe('Password minimal 6 karakter');
    });
  });

  describe('getPasswordRequirements', () => {
    it('should return requirements for short password', () => {
      const result = getPasswordRequirements('123');
      expect(result).toHaveLength(2);
      
      expect(result[0]).toEqual({
        met: false,
        requirement: 'Minimal 6 karakter',
        status: 'unmet'
      });
      
      expect(result[1]).toEqual({
        met: true,
        requirement: 'Password wajib diisi',
        status: 'met'
      });
    });

    it('should return requirements for valid password', () => {
      const result = getPasswordRequirements('123456');
      expect(result).toHaveLength(2);
      
      expect(result[0].met).toBe(true);
      expect(result[0].requirement).toBe('Minimal 6 karakter');
      expect(result[0].status).toBe('met');
      
      expect(result[1].met).toBe(true);
      expect(result[1].requirement).toBe('Password wajib diisi');
      expect(result[1].status).toBe('met');
    });

    it('should return requirements for empty password', () => {
      const result = getPasswordRequirements('');
      expect(result).toHaveLength(2);
      
      expect(result[0].met).toBe(false);
      expect(result[1].met).toBe(false);
      expect(result[0].status).toBe('unmet');
      expect(result[1].status).toBe('unmet');
    });

    it('should return all requirements met for long password', () => {
      const result = getPasswordRequirements('verylongpassword');
      
      expect(result.every(req => req.met)).toBe(true);
      expect(result.every(req => req.status === 'met')).toBe(true);
    });
  });

  describe('validateEmailRealtime', () => {
    it('should return valid for correct email', () => {
      const result = validateEmailRealtime('test@example.com');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid for empty email', () => {
      const result = validateEmailRealtime('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email harus diisi');
    });

    it('should return invalid for whitespace email', () => {
      const result = validateEmailRealtime('   ');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email harus diisi');
    });

    it('should return invalid for invalid email format', () => {
      const result = validateEmailRealtime('invalidemail');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format email tidak valid. Contoh: nama@email.com');
    });

    it('should return validation result with correct structure', () => {
      const result = validateEmailRealtime('test@example.com');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('validatePasswordRealtime', () => {
    it('should return valid for password with 6+ characters', () => {
      const result = validatePasswordRealtime('password123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid for empty password', () => {
      const result = validatePasswordRealtime('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password harus diisi');
    });

    it('should return invalid for short password', () => {
      const result = validatePasswordRealtime('123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password minimal 6 karakter');
    });

    it('should return validation result with correct structure', () => {
      const result = validatePasswordRealtime('password');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('validateLoginForm', () => {
    it('should return valid for correct email and password', () => {
      const result = validateLoginForm('test@example.com', 'password123');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid for empty email', () => {
      const result = validateLoginForm('', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email harus diisi');
    });

    it('should return invalid for invalid email', () => {
      const result = validateLoginForm('invalidemail', 'password123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid for empty password', () => {
      const result = validateLoginForm('test@example.com', '');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password harus diisi');
    });

    it('should return invalid for short password', () => {
      const result = validateLoginForm('test@example.com', '123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password minimal 6 karakter');
    });

    it('should return multiple errors for invalid email and password', () => {
      const result = validateLoginForm('', '123');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors).toContain('Email harus diisi');
      expect(result.errors).toContain('Password minimal 6 karakter');
    });

    it('should combine errors from both validators', () => {
      const emailResult = validateEmailRealtime('invalidemail');
      const passwordResult = validatePasswordRealtime('123');
      
      const result = validateLoginForm('invalidemail', '123');
      
      expect(result.errors).toEqual([
        ...emailResult.errors,
        ...passwordResult.errors
      ]);
    });
  });

  describe('classifyLoginError', () => {
    it('should return unknown error for null/undefined error', () => {
      const result = classifyLoginError(null);
      expect(result).toBe('Terjadi kesalahan yang tidak terduga');
      
      const result2 = classifyLoginError(undefined);
      expect(result2).toBe('Terjadi kesalahan yang tidak terduga');
    });

    it('should classify network errors', () => {
      const networkError = new Error('Network Error');
      expect(classifyLoginError(networkError)).toContain('server');
      expect(classifyLoginError(networkError)).toContain('koneksi internet');
    });

    it('should classify fetch errors', () => {
      const fetchError = new Error('fetch failed');
      expect(classifyLoginError(fetchError)).toContain('server');
    });

    it('should classify connection errors', () => {
      const connectionError = new Error('connection error');
      expect(classifyLoginError(connectionError)).toContain('server');
    });

    it('should classify timeout errors', () => {
      const timeoutError = new Error('timeout');
      expect(classifyLoginError(timeoutError)).toContain('Waktu habis');
    });

    it('should classify 401 unauthorized errors', () => {
      const authError = new Error('401 unauthorized');
      expect(classifyLoginError(authError)).toContain('Email atau password salah');
    });

    it('should classify unauthorized errors without status code', () => {
      const authError = new Error('unauthorized');
      expect(classifyLoginError(authError)).toContain('Email atau password salah');
    });

    it('should classify Indonesian credential errors', () => {
      const indonesianError = new Error('kredensial tidak valid');
      expect(classifyLoginError(indonesianError)).toContain('Email atau password salah');
    });

    it('should classify Indonesian login failure errors', () => {
      const indonesianError = new Error('login gagal');
      expect(classifyLoginError(indonesianError)).toContain('Email atau password salah');
    });

    it('should classify 500 server errors', () => {
      const serverError = new Error('500 server error');
      expect(classifyLoginError(serverError)).toContain('Server sedang bermasalah');
    });

    it('should classify 429 rate limit errors', () => {
      const rateLimitError = new Error('429 rate limit');
      expect(classifyLoginError(rateLimitError)).toContain('Terlalu banyak percobaan login');
    });

    it('should classify rate limit errors', () => {
      const rateLimitError = new Error('rate limit exceeded');
      expect(classifyLoginError(rateLimitError)).toContain('Terlalu banyak percobaan login');
    });

    it('should classify Indonesian rate limit errors', () => {
      const indonesianError = new Error('terlalu banyak percobaan');
      expect(classifyLoginError(indonesianError)).toContain('Terlalu banyak percobaan login');
    });

    it('should return fallback for unknown error messages', () => {
      const unknownError = new Error('some unknown error');
      expect(classifyLoginError(unknownError)).toContain('Login gagal');
    });

    it('should handle string errors', () => {
      const stringError = 'network error';
      expect(classifyLoginError(stringError)).toContain('server');
    });

    it('should handle error objects with message property', () => {
      const errorObject = { message: '401 unauthorized' };
      expect(classifyLoginError(errorObject)).toContain('Email atau password salah');
    });
  });

  describe('announceValidation', () => {
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {

      createElementSpy = vi.spyOn(document, 'createElement').mockImplementation(() => ({
        setAttribute: vi.fn(),

        style: {} as any,
        textContent: '',
        remove: vi.fn()
      } as any));

      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue({} as any);

      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue({} as any);

      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should create announcement element with correct attributes', () => {
      announceValidation('Test error message', 'error');
      
      expect(createElementSpy).toHaveBeenCalledWith('div');
      
      const element = createElementSpy.mock.results[0].value;
      expect(element.setAttribute).toHaveBeenCalledWith('role', 'alert');
      expect(element.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
      expect(element.textContent).toBe('Test error message');
    });

    it('should add announcement to document body', () => {
      announceValidation('Test message');
      
      expect(appendChildSpy).toHaveBeenCalled();
    });

    it('should set correct aria-live attribute', () => {
      announceValidation('Test message', 'error');
      
      const element = createElementSpy.mock.results[0].value;
      expect(element.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
    });

    it('should use error type by default', () => {
      announceValidation('Test message');
      
      const element = createElementSpy.mock.results[0].value;
      expect(element.textContent).toBe('Test message');
    });

    it('should handle success type', () => {
      announceValidation('Success message', 'success');
      
      const element = createElementSpy.mock.results[0].value;
      expect(element.textContent).toBe('Success message');
    });

    it('should handle info type', () => {
      announceValidation('Info message', 'info');
      
      const element = createElementSpy.mock.results[0].value;
      expect(element.textContent).toBe('Info message');
    });

    it('should set correct positioning styles', () => {
      announceValidation('Test message');

      const element = createElementSpy.mock.results[0].value;

      expect(element.style.position).toBe('absolute');
      expect(element.style.left).toBe('-9999px');
      expect(element.style.width).toBe('1px');
      expect(element.style.height).toBe('1px');
      expect(element.style.overflow).toBe('hidden');
    });

    it('should remove announcement after 1 second', () => {
      announceValidation('Test message');
      
      vi.advanceTimersByTime(999);
      expect(removeChildSpy).not.toHaveBeenCalled();
      
      vi.advanceTimersByTime(1);
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should handle multiple announcements', () => {
      announceValidation('First message');
      announceValidation('Second message');
      announceValidation('Third message');
      
      expect(appendChildSpy).toHaveBeenCalledTimes(3);
      expect(removeChildSpy).toHaveBeenCalledTimes(0);
      
      vi.advanceTimersByTime(1000);
      expect(removeChildSpy).toHaveBeenCalledTimes(3);
    });

    it('should create new element for each announcement', () => {
      announceValidation('Message 1');
      announceValidation('Message 2');
      
      const element1 = createElementSpy.mock.results[0].value;
      const element2 = createElementSpy.mock.results[1].value;
      
      expect(element1).not.toBe(element2);
      expect(element1.textContent).toBe('Message 1');
      expect(element2.textContent).toBe('Message 2');
    });
  });
});
