import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleAIError,
  getAIErrorMessage,
  shouldRetryAIError,
  logAIOperationStart,
  logAIOperationSuccess,
  logAIOperationError,
  getCircuitBreakerStateMessage,
  createAIError,
  AIOperationType
} from '../aiErrorHandler';
import { ErrorType } from '../errorHandler';

describe('AI Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleAIError', () => {
    it('should classify network errors correctly', () => {
      const error = new Error('Failed to fetch');
      const classifiedError = handleAIError(error, AIOperationType.CHAT, 'gemini-2.5-flash');

      expect(classifiedError.type).toBe(ErrorType.NETWORK_ERROR);
      expect(classifiedError.context.operation).toBe('getAIResponseStream');
      expect(classifiedError.context.aiModel).toBe('gemini-2.5-flash');
    });

    it('should classify timeout errors correctly', () => {
      const error = new Error('Request timeout');
      const classifiedError = handleAIError(error, AIOperationType.ANALYSIS, 'gemini-3-pro-preview');

      expect(classifiedError.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(classifiedError.context.operation).toBe('analyzeClassPerformance');
      expect(classifiedError.context.aiModel).toBe('gemini-3-pro-preview');
    });

    it('should classify API key errors correctly', () => {
      const error = new Error('401 Unauthorized');
      const classifiedError = handleAIError(error, AIOperationType.EDITOR);

      expect(classifiedError.type).toBe(ErrorType.API_KEY_ERROR);
      expect(classifiedError.isRetryable).toBe(false);
    });

    it('should classify quota exceeded errors correctly', () => {
      const error = new Error('429 Quota exceeded');
      const classifiedError = handleAIError(error, AIOperationType.QUIZ);

      expect(classifiedError.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(classifiedError.isRetryable).toBe(true);
    });

    it('should classify content filter errors correctly', () => {
      const error = new Error('Content filtered');
      const classifiedError = handleAIError(error, AIOperationType.STUDY_PLAN);

      expect(classifiedError.type).toBe(ErrorType.CONTENT_FILTER_ERROR);
      expect(classifiedError.isRetryable).toBe(false);
    });

    it('should classify AI-specific errors correctly', () => {
      const error = new Error('AI model unavailable');
      const classifiedError = handleAIError(error, AIOperationType.FEEDBACK);

      expect(classifiedError.type).toBe(ErrorType.AI_MODEL_ERROR);
      expect(classifiedError.isRetryable).toBe(true);
    });

    it('should include timestamp in error context', () => {
      const error = new Error('Test error');
      const classifiedError = handleAIError(error, AIOperationType.CHAT);

      expect(classifiedError.context.timestamp).toBeLessThanOrEqual(Date.now());
      expect(classifiedError.context.timestamp).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('getAIErrorMessage', () => {
    it('should return operation-specific error message for chat', () => {
      const error = {
        name: 'AppError',
        message: 'Network error',
        type: ErrorType.NETWORK_ERROR,
        context: { operation: 'getAIResponseStream', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.CHAT);

      expect(message).toContain('Tidak dapat terhubung ke server');
    });

    it('should return operation-specific error message for analysis', () => {
      const error = {
        name: 'AppError',
        message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        type: ErrorType.UNKNOWN_ERROR,
        context: { operation: 'analyzeClassPerformance', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.ANALYSIS);

      expect(message).toContain('gagal menganalisis data saat ini');
    });

    it('should return operation-specific error message for editor', () => {
      const error = {
        name: 'AppError',
        message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        type: ErrorType.UNKNOWN_ERROR,
        context: { operation: 'getAIEditorResponse', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.EDITOR);

      expect(message).toContain('memproses respon dari AI');
    });

    it('should return operation-specific error message for quiz', () => {
      const error = {
        name: 'AppError',
        message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        type: ErrorType.UNKNOWN_ERROR,
        context: { operation: 'generateQuiz', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.QUIZ);

      expect(message).toContain('membuat kuis dengan AI');
    });

    it('should return operation-specific error message for study plan', () => {
      const error = {
        name: 'AppError',
        message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        type: ErrorType.UNKNOWN_ERROR,
        context: { operation: 'generateStudyPlan', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.STUDY_PLAN);

      expect(message).toContain('membuat rencana belajar dengan AI');
    });

    it('should return operation-specific error message for feedback', () => {
      const error = {
        name: 'AppError',
        message: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
        type: ErrorType.UNKNOWN_ERROR,
        context: { operation: 'generateAssignmentFeedback', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.FEEDBACK);

      expect(message).toContain('membuat feedback AI');
    });

    it('should return generic message when useGeneric is true', () => {
      const error = {
        name: 'AppError',
        message: 'Network error',
        type: ErrorType.NETWORK_ERROR,
        context: { operation: 'getAIResponseStream', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.CHAT, true);

      expect(message).toContain('sistem AI sedang sibuk');
    });

    it('should return standard message for non-unknown errors', () => {
      const error = {
        name: 'AppError',
        message: 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.',
        type: ErrorType.NETWORK_ERROR,
        context: { operation: 'getAIResponseStream', timestamp: Date.now() },
        isRetryable: true
      };

      const message = getAIErrorMessage(error, AIOperationType.CHAT, false);

      expect(message).toBe('Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.');
    });
  });

  describe('shouldRetryAIError', () => {
    it('should return false for API key errors', () => {
      const error = {
        name: 'AppError',
        message: 'API key error',
        type: ErrorType.API_KEY_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: false
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error = {
        name: 'AppError',
        message: 'Validation error',
        type: ErrorType.VALIDATION_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: false
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(false);
    });

    it('should return false for content filter errors', () => {
      const error = {
        name: 'AppError',
        message: 'Content filtered',
        type: ErrorType.CONTENT_FILTER_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: false
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(false);
    });

    it('should return false for quota exceeded errors', () => {
      const error = {
        name: 'AppError',
        message: 'Quota exceeded',
        type: ErrorType.QUOTA_EXCEEDED_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: false
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(false);
    });

    it('should return false for permission errors', () => {
      const error = {
        name: 'AppError',
        message: 'Permission denied',
        type: ErrorType.PERMISSION_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: false
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(false);
    });

    it('should return true for network errors', () => {
      const error = {
        name: 'AppError',
        message: 'Network error',
        type: ErrorType.NETWORK_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: true
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = {
        name: 'AppError',
        message: 'Timeout',
        type: ErrorType.TIMEOUT_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: true
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(true);
    });

    it('should return true for server errors', () => {
      const error = {
        name: 'AppError',
        message: 'Server error',
        type: ErrorType.SERVER_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: true
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(true);
    });

    it('should return true for AI service errors', () => {
      const error = {
        name: 'AppError',
        message: 'AI service error',
        type: ErrorType.AI_SERVICE_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: true
      };

      const result = shouldRetryAIError(error);

      expect(result).toBe(true);
    });
  });

  describe('getCircuitBreakerStateMessage', () => {
    it('should return closed state message', () => {
      const message = getCircuitBreakerStateMessage('closed', 0);

      expect(message).toContain('beroperasi normal');
    });

    it('should return open state message with failure count', () => {
      const message = getCircuitBreakerStateMessage('open', 5);

      expect(message).toContain('sedang sibuk');
      expect(message).toContain('5 kegagalan');
    });

    it('should return half-open state message with failure count', () => {
      const message = getCircuitBreakerStateMessage('half-open', 3);

      expect(message).toContain('Mencoba memulihkan');
      expect(message).toContain('3');
      expect(message).toContain('kegagalan');
    });

    it('should return unknown state message for invalid state', () => {
      const message = getCircuitBreakerStateMessage('invalid' as any, 0);

      expect(message).toContain('tidak diketahui');
    });
  });

  describe('createAIError', () => {
    it('should create AI error with operation-specific message', () => {
      const error = createAIError(
        ErrorType.AI_SERVICE_ERROR,
        AIOperationType.CHAT
      );

      expect(error.message).toContain('sistem AI sedang sibuk');
      expect(error.type).toBe(ErrorType.AI_SERVICE_ERROR);
      expect(error.context.operation).toBe('getAIResponseStream');
    });

    it('should create AI error with custom user message', () => {
      const customMessage = 'Custom error message';
      const error = createAIError(
        ErrorType.AI_CONTENT_GENERATION_ERROR,
        AIOperationType.EDITOR,
        customMessage
      );

      expect(error.message).toBe(customMessage);
      expect(error.type).toBe(ErrorType.AI_CONTENT_GENERATION_ERROR);
    });

    it('should include original error', () => {
      const originalError = new Error('Original error');
      const error = createAIError(
        ErrorType.AI_MODEL_ERROR,
        AIOperationType.QUIZ,
        undefined,
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });

    it('should set correct retryable status', () => {
      const error = createAIError(
        ErrorType.AI_SERVICE_ERROR,
        AIOperationType.STUDY_PLAN
      );

      expect(error.isRetryable).toBe(true);
    });
  });

  describe('logAIOperationStart', () => {
    it('should log operation start with context', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      logAIOperationStart(AIOperationType.CHAT, { userId: '123' });

      consoleSpy.mockRestore();
    });
  });

  describe('logAIOperationSuccess', () => {
    it('should log operation success with context', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      logAIOperationSuccess(AIOperationType.ANALYSIS, { duration: 1000 });

      consoleSpy.mockRestore();
    });
  });

  describe('logAIOperationError', () => {
    it('should log operation error with context', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const error = {
        name: 'AppError',
        message: 'Test error',
        type: ErrorType.AI_SERVICE_ERROR,
        context: { operation: 'test', timestamp: Date.now() },
        isRetryable: true
      };

      logAIOperationError(AIOperationType.QUIZ, error, { userId: '123' });

      consoleSpy.mockRestore();
    });
  });
});
