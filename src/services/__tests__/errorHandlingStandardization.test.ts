// Error Handling Standardization Test
// Tests to ensure standardized error handling patterns are working correctly

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  classifyError, 
  logError, 
  getUserFriendlyMessage,
  createValidationError,
  createPermissionError,
  ErrorType,
  AppError 
} from '../../utils/errorHandler';

describe('Error Handling Standardization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console to avoid test output noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Error Classification', () => {
    it('should classify network errors correctly', () => {
      const networkError = new Error('Network request failed');
      const context = { operation: 'apiRequest', timestamp: Date.now() };
      
      const classified = classifyError(networkError, context);
      
      expect(classified).toBeInstanceOf(AppError);
      expect(classified.type).toBe(ErrorType.NETWORK_ERROR);
      expect(classified.context.operation).toBe('apiRequest');
      expect(classified.isRetryable).toBe(true);
    });

    it('should classify validation errors correctly', () => {
      const validationError = new Error('Validation failed: Invalid input');
      const context = { operation: 'formValidation', timestamp: Date.now() };
      
      const classified = classifyError(validationError, context);
      
      expect(classified).toBeInstanceOf(AppError);
      expect(classified.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(classified.isRetryable).toBe(false);
    });

    it('should classify timeout errors correctly', () => {
      const timeoutError = new Error('Request timeout after 30 seconds');
      const context = { operation: 'apiRequest', timestamp: Date.now() };
      
      const classified = classifyError(timeoutError, context);
      
      expect(classified).toBeInstanceOf(AppError);
      expect(classified.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(classified.isRetryable).toBe(true);
    });

    it('should handle unknown errors', () => {
      const unknownError = 'Some unknown error';
      const context = { operation: 'unknownOperation', timestamp: Date.now() };
      
      const classified = classifyError(unknownError, context);
      
      expect(classified).toBeInstanceOf(AppError);
      expect(classified.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(classified.isRetryable).toBe(true);
    });
  });

  describe('Error Creation Utilities', () => {
    it('should create validation errors with proper structure', () => {
      const error = createValidationError('userLogin', 'Email and password required');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.context.operation).toBe('userLogin');
      expect(error.isRetryable).toBe(false);
      expect(error.message).toBe('Email and password required');
    });

    it('should create permission errors with specific permission context', () => {
      const error = createPermissionError('adminPanel', 'admin access');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.type).toBe(ErrorType.PERMISSION_ERROR);
      expect(error.context.operation).toBe('adminPanel');
      expect(error.isRetryable).toBe(false);
      expect(error.message).toContain('admin access');
    });
  });

  describe('User-Friendly Messages', () => {
    it('should provide localized user-friendly messages', () => {
      const networkError = createValidationError('apiRequest', 'Invalid data');
      const message = getUserFriendlyMessage(networkError);
      
      expect(message).toBe('Data yang dimasukkan tidak valid. Silakan periksa kembali.');
    });

    it('should fallback to unknown error message for unrecognized types', () => {
      const mockError = new AppError(
        'Custom error message',
        ErrorType.UNKNOWN_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );
      
      const message = getUserFriendlyMessage(mockError);
      expect(message).toBe('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.');
    });
  });

  describe('Error Logging', () => {
    it('should log errors with proper structure', () => {
      const mockConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = createValidationError('testOperation', 'Test validation failed');
      
      logError(error);
      
      // Check that console.error was called with the expected content
      expect(mockConsole).toHaveBeenCalledTimes(1);
      const loggedContent = mockConsole.mock.calls[0][0] as string;
      expect(loggedContent).toContain('[AppError]');
      expect(loggedContent).toContain('VALIDATION_ERROR');
      expect(loggedContent).toContain('testOperation');
    });

    it('should include attempt information in logs when available', () => {
      const mockConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new AppError(
        'Test error',
        ErrorType.NETWORK_ERROR,
        { operation: 'retryTest', timestamp: Date.now(), attempt: 2, maxAttempts: 3 },
        true
      );
      
      logError(error);
      
      // Check that attempt information is logged (it should be in the second call)
      expect(mockConsole).toHaveBeenCalledTimes(2);
      expect(mockConsole).toHaveBeenLastCalledWith(
        expect.stringContaining('Attempt 2 of 3')
      );
    });
  });

  describe('Consistent Error Patterns', () => {
    it('should maintain consistent error structure across all errors', () => {
      const errors = [
        createValidationError('test1', 'validation failed'),
        createPermissionError('test2', 'admin only'),
        classifyError(new Error('Network failed'), { operation: 'test3', timestamp: Date.now() })
      ];

      errors.forEach(error => {
        expect(error).toBeInstanceOf(AppError);
        expect(error).toHaveProperty('type');
        expect(error).toHaveProperty('context');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('isRetryable');
        expect(error.context).toHaveProperty('operation');
        expect(error.context).toHaveProperty('timestamp');
      });
    });

    it('should handle null/undefined errors gracefully', () => {
      const context = { operation: 'nullTest', timestamp: Date.now() };
      
      expect(() => {
        const result = classifyError(null, context);
        expect(result).toBeInstanceOf(AppError);
        expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      }).not.toThrow();
      
      expect(() => {
        const result = classifyError(undefined, context);
        expect(result).toBeInstanceOf(AppError);
        expect(result.type).toBe(ErrorType.UNKNOWN_ERROR);
      }).not.toThrow();
    });
  });

  describe('Service Integration Patterns', () => {
    it('should demonstrate service-like error handling pattern', async () => {
      // Simulate service method error handling
      const mockServiceMethod = vi.fn().mockRejectedValue(new Error('Service unavailable'));
      
      try {
        await mockServiceMethod();
      } catch (error) {
        const classifiedError = classifyError(error, {
          operation: 'mockService.method',
          timestamp: Date.now()
        });
        
        logError(classifiedError);
        expect(classifiedError.type).toBe(ErrorType.UNKNOWN_ERROR);
      }
    });

    it('should handle offline/network detection correctly', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const error = new Error('Request failed');
      const context = { operation: 'offlineTest', timestamp: Date.now() };
      
      const classified = classifyError(error, context);
      
      expect(classified.type).toBe(ErrorType.NETWORK_ERROR);
    });
  });
});