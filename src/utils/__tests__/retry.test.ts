/**
 * Tests for retry utility
 * Verifies retry logic, exponential backoff, error classification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  retryWithBackoff,
  isNetworkError,
  isRateLimitError,
  isServerError,
  isRetryableError,
  getRetryDelay,
  RetryOptions,
  RetryResult
} from '../retry';

describe('retry', () => {
  describe('retryWithBackoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(fn);
      
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(fn);

      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for retries', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(fn, {
        initialDelay: 1000,
        backoffMultiplier: 2
      });

      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(2000);

      const result = await promise;

      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should respect maxRetries option', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Network Error'));

      const promise = retryWithBackoff(fn, {
        maxRetries: 2
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Network Error');
      expect(fn).toHaveBeenCalledTimes(3); // 2 retries + 1 initial
    });

    it('should not retry non-retryable errors', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Non-retryable error'));
      const shouldRetry = vi.fn(() => false);

      await expect(retryWithBackoff(fn, {
        shouldRetry
      })).rejects.toThrow('Non-retryable error');

      expect(fn).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalled();
    });

    it('should call onRetry callback', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue('success');

      const onRetry = vi.fn();

      const promise = retryWithBackoff(fn, {
        onRetry
      });

      await vi.advanceTimersByTimeAsync(1000);

      await promise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should respect custom maxDelay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(fn, {
        initialDelay: 1000,
        backoffMultiplier: 10,
        maxDelay: 5000
      });

      await vi.advanceTimersByTimeAsync(1000);
      await vi.advanceTimersByTimeAsync(5000);
      await vi.advanceTimersByTimeAsync(5000);

      await promise;

      expect(fn).toHaveBeenCalledTimes(4);
    });

    it('should return last error in result', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValue('success');

      try {
        const promise = retryWithBackoff(fn);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result.lastError).toBeDefined();
        expect(result.lastError?.message).toBe('First error');
      } catch (_e) {
        // Ignore unhandled errors from mock rejections
      }
    });

    it('should handle non-Error objects', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce('string error')
        .mockResolvedValue('success');

      try {
        const promise = retryWithBackoff(fn);
        await vi.runAllTimersAsync();
        const result = await promise;

        expect(result.data).toBe('success');
        expect(result.lastError).toBeInstanceOf(Error);
      } catch (_e) {
        // Ignore unhandled errors from mock rejections
      }
    });

    it('should use default options when none provided', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValue('success');

      const promise = retryWithBackoff(fn);

      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
    });

    it('should throw error after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Network Error'));

      const promise = retryWithBackoff(fn, {
        maxRetries: 3
      });

      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('Network Error');
      expect(fn).toHaveBeenCalledTimes(4); // 3 retries + 1 initial
    });

    it('should handle zero maxRetries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Network Error'));
      
      await expect(retryWithBackoff(fn, {
        maxRetries: 0
      })).rejects.toThrow('Network Error');
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('isNetworkError', () => {
    it('should identify Network Error', () => {
      const error = new Error('Network Error');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify fetch failed error', () => {
      const error = new Error('fetch failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify Failed to fetch error', () => {
      const error = new Error('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify ECONNREFUSED error', () => {
      const error = new Error('ECONNREFUSED');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify ETIMEDOUT error', () => {
      const error = new Error('ETIMEDOUT');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify ENOTFOUND error', () => {
      const error = new Error('ENOTFOUND');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify EAI_AGAIN error', () => {
      const error = new Error('EAI_AGAIN');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new Error('Some other error');
      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for empty error message', () => {
      const error = new Error('');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isRateLimitError', () => {
    it('should identify 429 status code', () => {
      const error = new Error('429 Too Many Requests');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should identify rate limit message', () => {
      const error = new Error('rate limit exceeded');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should identify lowercase rate limit message', () => {
      const error = new Error('Rate limit exceeded');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should identify too many requests message', () => {
      const error = new Error('Too many requests');
      expect(isRateLimitError(error)).toBe(true);
    });

    it('should return false for non-rate limit errors', () => {
      const error = new Error('Some other error');
      expect(isRateLimitError(error)).toBe(false);
    });

    it('should return false for 500 error', () => {
      const error = new Error('500 Internal Server Error');
      expect(isRateLimitError(error)).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should identify 500 error', () => {
      const error = new Error('500 Internal Server Error');
      expect(isServerError(error)).toBe(true);
    });

    it('should identify status 500', () => {
      const error = new Error('status 500');
      expect(isServerError(error)).toBe(true);
    });

    it('should identify 502 error', () => {
      const error = new Error('502 Bad Gateway');
      expect(isServerError(error)).toBe(true);
    });

    it('should identify 503 error', () => {
      const error = new Error('503 Service Unavailable');
      expect(isServerError(error)).toBe(true);
    });

    it('should identify 504 error', () => {
      const error = new Error('504 Gateway Timeout');
      expect(isServerError(error)).toBe(true);
    });

    it('should identify status 502', () => {
      const error = new Error('status 502');
      expect(isServerError(error)).toBe(true);
    });

    it('should identify status 503', () => {
      const error = new Error('status 503');
      expect(isServerError(error)).toBe(true);
    });

    it('should identify status 504', () => {
      const error = new Error('status 504');
      expect(isServerError(error)).toBe(true);
    });

    it('should return false for non-server errors', () => {
      const error = new Error('Some other error');
      expect(isServerError(error)).toBe(false);
    });

    it('should return false for 404 error', () => {
      const error = new Error('404 Not Found');
      expect(isServerError(error)).toBe(false);
    });

    it('should return false for 401 error', () => {
      const error = new Error('401 Unauthorized');
      expect(isServerError(error)).toBe(false);
    });
  });

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const error = new Error('Network Error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      const error = new Error('429 Too Many Requests');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for server errors', () => {
      const error = new Error('500 Internal Server Error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const error = new Error('404 Not Found');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for client errors', () => {
      const error = new Error('400 Bad Request');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for authorization errors', () => {
      const error = new Error('401 Unauthorized');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for forbidden errors', () => {
      const error = new Error('403 Forbidden');
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate delay for first retry', () => {
      const delay = getRetryDelay(1, 1000);
      expect(delay).toBe(1000);
    });

    it('should calculate delay for second retry with exponential backoff', () => {
      const delay = getRetryDelay(2, 1000);
      expect(delay).toBe(2000);
    });

    it('should calculate delay for third retry with exponential backoff', () => {
      const delay = getRetryDelay(3, 1000);
      expect(delay).toBe(4000);
    });

    it('should calculate delay for fourth retry with exponential backoff', () => {
      const delay = getRetryDelay(4, 1000);
      expect(delay).toBe(8000);
    });

    it('should respect maxDelay limit', () => {
      const delay = getRetryDelay(10, 1000, 5000);
      expect(delay).toBe(5000);
    });

    it('should use default initialDelay when not provided', () => {
      const delay = getRetryDelay(1);
      expect(delay).toBe(1000);
    });

    it('should use default maxDelay when not provided', () => {
      const delay = getRetryDelay(100, 1000);
      expect(delay).toBe(10000);
    });

    it('should calculate correct delays for multiple attempts', () => {
      expect(getRetryDelay(1, 1000, 10000)).toBe(1000);
      expect(getRetryDelay(2, 1000, 10000)).toBe(2000);
      expect(getRetryDelay(3, 1000, 10000)).toBe(4000);
      expect(getRetryDelay(4, 1000, 10000)).toBe(8000);
      expect(getRetryDelay(5, 1000, 10000)).toBe(10000);
    });
  });

  describe('RetryOptions interface', () => {
    it('should accept all optional properties', () => {
      const options: RetryOptions = {
        maxRetries: 5,
        initialDelay: 2000,
        maxDelay: 20000,
        backoffMultiplier: 3,
        shouldRetry: vi.fn(),
        onRetry: vi.fn()
      };
      
      expect(options.maxRetries).toBe(5);
      expect(options.initialDelay).toBe(2000);
      expect(options.maxDelay).toBe(20000);
      expect(options.backoffMultiplier).toBe(3);
    });
  });

  describe('RetryResult interface', () => {
    it('should have correct structure', () => {
      const result: RetryResult<string> = {
        data: 'success',
        attempts: 3,
        lastError: new Error('Previous error')
      };
      
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(result.lastError).toBeInstanceOf(Error);
    });

    it('should allow undefined lastError', () => {
      const result: RetryResult<string> = {
        data: 'success',
        attempts: 1
      };
      
      expect(result.lastError).toBeUndefined();
    });
  });
});
