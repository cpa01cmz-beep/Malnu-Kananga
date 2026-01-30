import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorType,
  AppError,
  classifyError,
  logError,
  createError,
  createOCRError,
  createNotificationError,
  createValidationError,
  createPermissionError,
  createConflictError,
  createOfflineError,
  getUserFriendlyMessage,
  withCircuitBreaker,
  getCircuitBreakerState,
  resetCircuitBreaker,
  getUIFeedback,
  type ErrorContext
} from '../errorHandler';

describe('errorHandler', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      get: () => true,
      configurable: true
    });
  });

  describe('ErrorType enum', () => {
    it('should have all required error types', () => {
      expect(ErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorType.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ErrorType.RATE_LIMIT_ERROR).toBe('RATE_LIMIT_ERROR');
      expect(ErrorType.API_KEY_ERROR).toBe('API_KEY_ERROR');
      expect(ErrorType.QUOTA_EXCEEDED_ERROR).toBe('QUOTA_EXCEEDED_ERROR');
      expect(ErrorType.CONTENT_FILTER_ERROR).toBe('CONTENT_FILTER_ERROR');
      expect(ErrorType.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ErrorType.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
      expect(ErrorType.OCR_ERROR).toBe('OCR_ERROR');
      expect(ErrorType.NOTIFICATION_ERROR).toBe('NOTIFICATION_ERROR');
      expect(ErrorType.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorType.PERMISSION_ERROR).toBe('PERMISSION_ERROR');
      expect(ErrorType.OFFLINE_ERROR).toBe('OFFLINE_ERROR');
      expect(ErrorType.CONFLICT_ERROR).toBe('CONFLICT_ERROR');
    });
  });

  describe('AppError', () => {
    it('should create an AppError with all properties', () => {
      const context: ErrorContext = {
        operation: 'test-operation',
        timestamp: Date.now(),
        attempt: 1,
        maxAttempts: 3
      };
      const error = new AppError(
        'Test error message',
        ErrorType.NETWORK_ERROR,
        context,
        true,
        new Error('Original error')
      );

      expect(error.message).toBe('Test error message');
      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.context).toEqual(context);
      expect(error.isRetryable).toBe(true);
      expect(error.originalError).toBeInstanceOf(Error);
      expect(error.name).toBe('AppError');
    });

    it('should create AppError without original error', () => {
      const context: ErrorContext = {
        operation: 'test-operation',
        timestamp: Date.now()
      };
      const error = new AppError(
        'Test error message',
        ErrorType.UNKNOWN_ERROR,
        context,
        false
      );

      expect(error.originalError).toBeUndefined();
    });
  });

  describe('classifyError', () => {
    const baseContext: ErrorContext = {
      operation: 'test-operation',
      timestamp: Date.now()
    };

    it('should return existing AppError as-is', () => {
      const existingError = new AppError(
        'Existing error',
        ErrorType.NETWORK_ERROR,
        baseContext,
        true
      );

      const result = classifyError(existingError, baseContext);
      expect(result).toBe(existingError);
    });

    it('should classify null/undefined as UNKNOWN_ERROR', () => {
      const nullResult = classifyError(null, baseContext);
      expect(nullResult.type).toBe(ErrorType.UNKNOWN_ERROR);

      const undefinedResult = classifyError(undefined, baseContext);
      expect(undefinedResult.type).toBe(ErrorType.UNKNOWN_ERROR);
    });

    it('should classify offline errors', () => {
      Object.defineProperty(navigator, 'onLine', {
        get: () => false,
        configurable: true
      });

      const error = classifyError(new Error('Test error'), baseContext);
      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify timeout errors', () => {
      const error = classifyError(new Error('Request timeout'), baseContext);
      expect(error.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify rate limit errors', () => {
      const error = classifyError(new Error('429 Too Many Requests'), baseContext);
      expect(error.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify API key errors', () => {
      const error = classifyError(new Error('Invalid API key'), baseContext);
      expect(error.type).toBe(ErrorType.API_KEY_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify quota exceeded errors', () => {
      const error = classifyError(new Error('Quota exceeded'), baseContext);
      expect(error.type).toBe(ErrorType.QUOTA_EXCEEDED_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify content filter errors', () => {
      const error = classifyError(new Error('Content filter triggered'), baseContext);
      expect(error.type).toBe(ErrorType.CONTENT_FILTER_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify OCR errors', () => {
      const error = classifyError(new Error('Tesseract failed to process gambar'), baseContext);
      expect(error.type).toBe(ErrorType.OCR_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify notification errors', () => {
      const error = classifyError(new Error('Push notification permission'), baseContext);
      expect(error.type).toBe(ErrorType.NOTIFICATION_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify validation errors', () => {
      const error = classifyError(new Error('Validasi gagal'), baseContext);
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify permission errors', () => {
      const error = classifyError(new Error('Izin tidak cukup'), baseContext);
      expect(error.type).toBe(ErrorType.PERMISSION_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify conflict errors', () => {
      const error = classifyError(new Error('409 Conflict'), baseContext);
      expect(error.type).toBe(ErrorType.CONFLICT_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify network errors', () => {
      const error = classifyError(new Error('Network request failed'), baseContext);
      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify unknown errors as UNKNOWN_ERROR', () => {
      const error = classifyError(new Error('Some unknown error'), baseContext);
      expect(error.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(error.isRetryable).toBe(true);
    });
  });

  describe('createError utilities', () => {
    it('should create a generic error', () => {
      const error = createError(
        ErrorType.NETWORK_ERROR,
        'test-operation',
        'Custom error message',
        true,
        new Error('Original')
      );

      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.context.operation).toBe('test-operation');
      expect(error.message).toBe('Custom error message');
      expect(error.isRetryable).toBe(true);
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('should create OCR error', () => {
      const error = createOCRError('ocr-operation', new Error('OCR failed'));

      expect(error.type).toBe(ErrorType.OCR_ERROR);
      expect(error.context.operation).toBe('ocr-operation');
      expect(error.isRetryable).toBe(true);
    });

    it('should create notification error', () => {
      const error = createNotificationError('notification-operation');

      expect(error.type).toBe(ErrorType.NOTIFICATION_ERROR);
      expect(error.context.operation).toBe('notification-operation');
      expect(error.isRetryable).toBe(true);
    });

    it('should create validation error', () => {
      const error = createValidationError('validation-operation', 'Field is required');

      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.context.operation).toBe('validation-operation');
      expect(error.message).toBe('Field is required');
      expect(error.isRetryable).toBe(false);
    });

    it('should create permission error', () => {
      const error = createPermissionError('permission-operation', 'read:grades');

      expect(error.type).toBe(ErrorType.PERMISSION_ERROR);
      expect(error.context.operation).toBe('permission-operation');
      expect(error.isRetryable).toBe(false);
      expect(error.message).toContain('read:grades');
    });

    it('should create permission error without specific permission', () => {
      const error = createPermissionError('permission-operation');

      expect(error.type).toBe(ErrorType.PERMISSION_ERROR);
      expect(error.message).toBeDefined();
      expect(error.isRetryable).toBe(false);
    });

    it('should create conflict error', () => {
      const error = createConflictError('conflict-operation', new Error('Conflict'));

      expect(error.type).toBe(ErrorType.CONFLICT_ERROR);
      expect(error.context.operation).toBe('conflict-operation');
      expect(error.isRetryable).toBe(true);
    });

    it('should create offline error', () => {
      const error = createOfflineError('offline-operation');

      expect(error.type).toBe(ErrorType.OFFLINE_ERROR);
      expect(error.context.operation).toBe('offline-operation');
      expect(error.isRetryable).toBe(true);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return message for known error type', () => {
      const error = new AppError(
        'Test',
        ErrorType.NETWORK_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      const message = getUserFriendlyMessage(error);
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });

    it('should return default message for unknown error type', () => {
      const error = new AppError(
        'Test',
        ErrorType.UNKNOWN_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      const message = getUserFriendlyMessage(error);
      expect(message).toBeDefined();
      expect(typeof message).toBe('string');
    });
  });

  describe('logError', () => {
    it('should log error with all properties', () => {
      const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new AppError(
        'Test error',
        ErrorType.NETWORK_ERROR,
        {
          operation: 'test-operation',
          timestamp: Date.now(),
          attempt: 2,
          maxAttempts: 5
        },
        true
      );

      logError(error);

      expect(loggerSpy).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });

    it('should log error without attempt information', () => {
      const loggerSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new AppError(
        'Test error',
        ErrorType.NETWORK_ERROR,
        {
          operation: 'test-operation',
          timestamp: Date.now()
        },
        true
      );

      logError(error);

      expect(loggerSpy).toHaveBeenCalled();
      loggerSpy.mockRestore();
    });
  });

  describe('CircuitBreaker', () => {
    beforeEach(() => {
      resetCircuitBreaker();
    });

    it('should start in closed state', () => {
      const state = getCircuitBreakerState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });

    it('should execute successful operation and stay closed', async () => {
      const result = await withCircuitBreaker(() => Promise.resolve('success'));

      expect(result).toBe('success');
      const state = getCircuitBreakerState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });

    it('should record failure and increment failure count', async () => {
      await expect(
        withCircuitBreaker(() => Promise.reject(new Error('Operation failed')))
      ).rejects.toThrow();

      const state = getCircuitBreakerState();
      expect(state.failures).toBe(1);
      expect(state.state).toBe('closed');
    });

    it('should open circuit after threshold failures', async () => {
      const threshold = 5;

      for (let i = 0; i < threshold; i++) {
        await expect(
          withCircuitBreaker(() => Promise.reject(new Error('Operation failed')))
        ).rejects.toThrow();
      }

      const state = getCircuitBreakerState();
      expect(state.state).toBe('open');
      expect(state.failures).toBeGreaterThanOrEqual(threshold);
    });

    it('should use fallback when circuit is open', async () => {
      const threshold = 5;

      for (let i = 0; i < threshold; i++) {
        await expect(
          withCircuitBreaker(() => Promise.reject(new Error('Operation failed')))
        ).rejects.toThrow();
      }

      const fallbackValue = 'fallback-result';
      const result = await withCircuitBreaker(
        () => Promise.reject(new Error('Should not be called')),
        () => fallbackValue
      );

      expect(result).toBe(fallbackValue);
    });

    it('should throw error when circuit is open and no fallback', async () => {
      const threshold = 5;

      for (let i = 0; i < threshold; i++) {
        await expect(
          withCircuitBreaker(() => Promise.reject(new Error('Operation failed')))
        ).rejects.toThrow();
      }

      await expect(
        withCircuitBreaker(() => Promise.reject(new Error('Should not be called')))
      ).rejects.toThrow('Service temporarily unavailable');
    });

    it.skip('should transition to half-open after timeout', async () => {
      const threshold = 5;

      for (let i = 0; i < threshold; i++) {
        await expect(
          withCircuitBreaker(() => Promise.reject(new Error('Operation failed')))
        ).rejects.toThrow();
      }

      expect(getCircuitBreakerState().state).toBe('open');

      vi.useFakeTimers();

      vi.advanceTimersByTime(60000);

      const result = await withCircuitBreaker(() => Promise.resolve('success'));
      expect(result).toBe('success');

      vi.useRealTimers();
    });

    it.skip('should close circuit after success in half-open state', async () => {
      const threshold = 5;

      for (let i = 0; i < threshold; i++) {
        await expect(
          withCircuitBreaker(() => Promise.reject(new Error('Operation failed')))
        ).rejects.toThrow();
      }

      expect(getCircuitBreakerState().state).toBe('open');

      vi.useFakeTimers();

      vi.advanceTimersByTime(60000);

      const result = await withCircuitBreaker(() => Promise.resolve('success'));
      expect(result).toBe('success');

      const state = getCircuitBreakerState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);

      vi.useRealTimers();
    });

    it('should reset circuit breaker', () => {
      resetCircuitBreaker();

      const state = getCircuitBreakerState();
      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });
  });

  describe('getUIFeedback', () => {
    it('should return base feedback for unknown error type', () => {
      const error = new AppError(
        'Test error',
        ErrorType.UNKNOWN_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      const feedback = getUIFeedback(error);
      expect(feedback.type).toBe('error');
      expect(feedback.message).toBeDefined();
      expect(feedback.actions).toBeUndefined();
    });

    it('should add retry action for network errors', () => {
      const error = new AppError(
        'Test error',
        ErrorType.NETWORK_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      const feedback = getUIFeedback(error);
      expect(feedback.actions).toBeDefined();
      expect(feedback.actions).toHaveLength(1);
      expect(feedback.actions![0].label).toContain('Coba');
    });

    it('should add contact action for permission errors', () => {
      const error = new AppError(
        'Test error',
        ErrorType.PERMISSION_ERROR,
        { operation: 'test', timestamp: Date.now() },
        false
      );

      const feedback = getUIFeedback(error);
      expect(feedback.actions).toBeDefined();
      expect(feedback.actions![0].label).toContain('Hubungi');
    });

    it('should add retry action for OCR errors', () => {
      const error = new AppError(
        'Test error',
        ErrorType.OCR_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      const feedback = getUIFeedback(error);
      expect(feedback.actions).toBeDefined();
      expect(feedback.actions![0].label).toContain('Pilih');
    });

    it('should add refresh action for conflict errors', () => {
      const error = new AppError(
        'Test error',
        ErrorType.CONFLICT_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      const feedback = getUIFeedback(error);
      expect(feedback.actions).toBeDefined();
      expect(feedback.actions![0].label).toContain('Refresh');
    });

    it('should return warning type for offline errors', () => {
      const error = new AppError(
        'Test error',
        ErrorType.OFFLINE_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      const feedback = getUIFeedback(error);
      expect(feedback.type).toBe('warning');
      expect(feedback.message).toContain('offline');
    });
  });

  afterEach(() => {
    resetCircuitBreaker();
  });
});
