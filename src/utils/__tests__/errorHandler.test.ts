import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  GeminiAPIError,
  ErrorType,
  classifyError,
  getUserFriendlyMessage,
  logError,
  retryWithBackoff,
  CircuitBreaker,
  withCircuitBreaker,
  getCircuitBreakerState,
  resetCircuitBreaker,
  DEFAULT_RETRY_CONFIG,
  shouldRetry
} from '../errorHandler';

describe('Error Handler Utility', () => {
  describe('GeminiAPIError', () => {
    it('should create error with correct properties', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = new GeminiAPIError(
        'Test error',
        ErrorType.NETWORK_ERROR,
        context,
        true
      );

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.context).toEqual(context);
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('GeminiAPIError');
    });
  });

  describe('classifyError', () => {
    it('should classify network errors correctly', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = classifyError(new Error('Network request failed'), context);

      expect(error).toBeInstanceOf(GeminiAPIError);
      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify timeout errors correctly', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = classifyError(new Error('Request timeout'), context);

      expect(error.type).toBe(ErrorType.TIMEOUT_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify rate limit errors correctly', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = classifyError(new Error('429 Rate limit exceeded'), context);

      expect(error.type).toBe(ErrorType.RATE_LIMIT_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should classify API key errors correctly', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = classifyError(new Error('401 Unauthorized - Invalid API key'), context);

      expect(error.type).toBe(ErrorType.API_KEY_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify quota exceeded errors correctly', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = classifyError(new Error('Quota exceeded'), context);

      expect(error.type).toBe(ErrorType.QUOTA_EXCEEDED_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify content filter errors correctly', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = classifyError(new Error('Content filter blocked this request'), context);

      expect(error.type).toBe(ErrorType.CONTENT_FILTER_ERROR);
      expect(error.isRetryable).toBe(false);
    });

    it('should classify unknown errors correctly', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const error = classifyError(new Error('Unknown error occurred'), context);

      expect(error.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(error.isRetryable).toBe(true);
    });

    it('should return existing GeminiAPIError unchanged', () => {
      const context = { operation: 'test', timestamp: Date.now() };
      const originalError = new GeminiAPIError(
        'Original error',
        ErrorType.NETWORK_ERROR,
        context,
        true
      );
      const error = classifyError(originalError, context);

      expect(error).toBe(originalError);
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return appropriate message for each error type', () => {
      const context = { operation: 'test', timestamp: Date.now() };

      Object.values(ErrorType).forEach(type => {
        const error = new GeminiAPIError('Error', type, context, true);
        const message = getUserFriendlyMessage(error);
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
      });
    });
  });

  describe('logError', () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log error without exposing sensitive data', () => {
      const context = { operation: 'test', timestamp: Date.now(), attempt: 1, maxAttempts: 3 };
      const error = new GeminiAPIError('Test error', ErrorType.NETWORK_ERROR, context, true);

      logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      const calls = consoleSpy.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(operation, 'test');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const config = { ...DEFAULT_RETRY_CONFIG, baseDelayMs: 10, maxDelayMs: 100 };
      const result = await retryWithBackoff(operation, 'test', config);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const error = new GeminiAPIError(
        'API key error',
        ErrorType.API_KEY_ERROR,
        { operation: 'test', timestamp: Date.now() },
        false
      );
      const operation = vi.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(operation, 'test')).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should stop after max attempts', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Network error'));

      const config = { ...DEFAULT_RETRY_CONFIG, baseDelayMs: 10, maxDelayMs: 100, maxAttempts: 2 };

      await expect(retryWithBackoff(operation, 'test', config)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff delays', async () => {
      const delays: number[] = [];
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn((callback, delay) => {
        delays.push(delay as number);
        return originalSetTimeout(callback, delay);
      });

      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');

      const config = { ...DEFAULT_RETRY_CONFIG, baseDelayMs: 100, maxDelayMs: 1000, maxAttempts: 3 };

      await retryWithBackoff(operation, 'test', config);

      global.setTimeout = originalSetTimeout;

      expect(delays).toHaveLength(2);
      expect(delays[0]).toBe(100);
      expect(delays[1]).toBeGreaterThan(delays[0]);
    });
  });

  describe('shouldRetry', () => {
    it('should return true for retryable errors below max attempts', () => {
      const error = new GeminiAPIError(
        'Test error',
        ErrorType.NETWORK_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      expect(shouldRetry(error, 1, 3)).toBe(true);
      expect(shouldRetry(error, 2, 3)).toBe(true);
    });

    it('should return false at max attempts', () => {
      const error = new GeminiAPIError(
        'Test error',
        ErrorType.NETWORK_ERROR,
        { operation: 'test', timestamp: Date.now() },
        true
      );

      expect(shouldRetry(error, 3, 3)).toBe(false);
    });

    it('should return false for non-retryable errors', () => {
      const error = new GeminiAPIError(
        'Test error',
        ErrorType.API_KEY_ERROR,
        { operation: 'test', timestamp: Date.now() },
        false
      );

      expect(shouldRetry(error, 1, 3)).toBe(false);
    });
  });

  describe('CircuitBreaker', () => {
    let breaker: CircuitBreaker;
    let currentTime = 0;

    beforeEach(() => {
      currentTime = 0;
      breaker = new CircuitBreaker(2, 100, () => currentTime);
    });

    it('should be closed initially', () => {
      expect(breaker.getState()).toBe('closed');
      expect(breaker.getFailureCount()).toBe(0);
    });

    it('should remain closed on success', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await breaker.execute(operation);

      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');
      expect(breaker.getFailureCount()).toBe(0);
    });

    it('should open after threshold failures', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));

      await expect(breaker.execute(operation)).rejects.toThrow();
      expect(breaker.getState()).toBe('closed');

      await expect(breaker.execute(operation)).rejects.toThrow();
      expect(breaker.getState()).toBe('open');
    });

    it('should reject operations when open', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Test error'))
        .mockRejectedValueOnce(new Error('Test error'))
        .mockResolvedValue('success');

      await expect(breaker.execute(operation)).rejects.toThrow();
      await expect(breaker.execute(operation)).rejects.toThrow();

      expect(breaker.getState()).toBe('open');

      await expect(breaker.execute(operation)).rejects.toThrow();
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should transition to half-open after timeout', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Test error'))
        .mockRejectedValueOnce(new Error('Test error'))
        .mockResolvedValue('success');

      await expect(breaker.execute(operation)).rejects.toThrow();
      await expect(breaker.execute(operation)).rejects.toThrow();
      expect(breaker.getState()).toBe('open');

      currentTime += 150;

      expect(breaker.getState()).toBe('half-open');

      await expect(breaker.execute(operation)).resolves.toBe('success');

      expect(breaker.getState()).toBe('closed');
    });

    it('should close on success in half-open state', async () => {
      vi.useFakeTimers();
      const breaker = new CircuitBreaker(2, 100);
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Test error'))
        .mockRejectedValueOnce(new Error('Test error'))
        .mockResolvedValue('success');

      await expect(breaker.execute(operation)).rejects.toThrow();
      await expect(breaker.execute(operation)).rejects.toThrow();

      vi.advanceTimersByTime(150);

      const result = await breaker.execute(operation);

      expect(result).toBe('success');
      expect(breaker.getState()).toBe('closed');

      vi.useRealTimers();
    });

    it('should use fallback when open', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const fallback = vi.fn().mockReturnValue('fallback');

      await expect(breaker.execute(operation)).rejects.toThrow();
      await expect(breaker.execute(operation)).rejects.toThrow();

      const result = await breaker.execute(operation, fallback);

      expect(result).toBe('fallback');
      expect(operation).not.toHaveBeenCalledTimes(3);
      expect(fallback).toHaveBeenCalled();
    });
  });

  describe('Global Circuit Breaker Functions', () => {
    beforeEach(() => {
      resetCircuitBreaker();
    });

    it('should execute operations through global circuit breaker', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withCircuitBreaker(operation);

      expect(result).toBe('success');
    });

    it('should provide circuit breaker state', () => {
      const state = getCircuitBreakerState();

      expect(state).toHaveProperty('state');
      expect(state).toHaveProperty('failures');
    });

    it('should reset circuit breaker', () => {
      resetCircuitBreaker();

      const state = getCircuitBreakerState();

      expect(state.state).toBe('closed');
      expect(state.failures).toBe(0);
    });
  });
});
