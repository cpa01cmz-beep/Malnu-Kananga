import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  retryWithBackoff,
  CircuitBreaker,
  ErrorRecoveryStrategy,
  debounce,
  throttle,
} from '../../utils/errorRecovery';

describe('errorRecovery', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn, {
        maxAttempts: 1,
        initialDelay: 0,
        maxDelay: 0,
        backoffFactor: 2,
      });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should accept retry options', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const options = {
        maxAttempts: 5,
        initialDelay: 100,
        maxDelay: 10000,
        backoffFactor: 2,
      };
      const result = await retryWithBackoff(fn, options);
      expect(result).toBe('success');
    });

    it('should accept custom shouldRetry callback', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const shouldRetry = vi.fn(() => true);
      const result = await retryWithBackoff(fn, {
        maxAttempts: 1,
        initialDelay: 0,
        maxDelay: 0,
        backoffFactor: 2,
        shouldRetry,
      });
      expect(result).toBe('success');
    });
  });

  describe('CircuitBreaker', () => {
    it('should allow execution initially', async () => {
      const circuitBreaker = new CircuitBreaker();
      const fn = vi.fn().mockResolvedValue('success');

      const result = await circuitBreaker.execute(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should count failures', async () => {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
      });
      const fn = vi.fn().mockRejectedValue(new Error('Fail'));

      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(fn)).rejects.toThrow('Fail');
      }

      const state = circuitBreaker.getState();
      expect(state.failureCount).toBe(3);
      expect(state.isOpen).toBe(true);
    });

    it('should open circuit after threshold', async () => {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
      });
      const fn = vi.fn().mockRejectedValue(new Error('Fail'));

      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(fn)).rejects.toThrow('Fail');
      }

      await expect(circuitBreaker.execute(fn)).rejects.toThrow('Circuit breaker is open');
    });

    it('should reset after timeout', async () => {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 100,
        monitoringPeriod: 10000,
      });
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'));
      const successFn = vi.fn().mockResolvedValue('success');

      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(failFn)).rejects.toThrow('Fail');
      }

      expect(circuitBreaker.isOpen()).toBe(true);

      vi.advanceTimersByTime(150);

      const result = await circuitBreaker.execute(successFn);
      expect(result).toBe('success');
      expect(circuitBreaker.isOpen()).toBe(false);
    });

    it('should reset on success', async () => {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
      });
      const failFn = vi.fn().mockRejectedValue(new Error('Fail'));
      const successFn = vi.fn().mockResolvedValue('success');

      await expect(circuitBreaker.execute(failFn)).rejects.toThrow('Fail');
      await expect(circuitBreaker.execute(failFn)).rejects.toThrow('Fail');

      const result = await circuitBreaker.execute(successFn);
      expect(result).toBe('success');

      const state = circuitBreaker.getState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should manually reset', () => {
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: 3,
        resetTimeout: 60000,
        monitoringPeriod: 10000,
      });

      const state = circuitBreaker.getState();
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });

    it('should get correct state', async () => {
      const circuitBreaker = new CircuitBreaker();
      const fn = vi.fn().mockResolvedValue('success');

      await circuitBreaker.execute(fn);

      const state = circuitBreaker.getState();
      expect(state.lastSuccessTime).toBeGreaterThan(0);
      expect(state.failureCount).toBe(0);
      expect(state.isOpen).toBe(false);
    });
  });

  describe('ErrorRecoveryStrategy', () => {
    it('should execute with retry and circuit breaker', async () => {
      const strategy = new ErrorRecoveryStrategy(
        { maxAttempts: 1, initialDelay: 0 },
        { failureThreshold: 3, resetTimeout: 60000 }
      );
      const fn = vi.fn().mockResolvedValue('success');

      const result = await strategy.execute(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should get circuit breaker state', () => {
      const strategy = new ErrorRecoveryStrategy();
      const state = strategy.getCircuitBreakerState();
      expect(state).toHaveProperty('isOpen');
      expect(state).toHaveProperty('failureCount');
      expect(state).toHaveProperty('lastFailureTime');
      expect(state).toHaveProperty('lastSuccessTime');
    });

    it('should reset circuit breaker', () => {
      const strategy = new ErrorRecoveryStrategy();
      expect(() => {
        strategy.resetCircuitBreaker();
      }).not.toThrow();
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset debounce timer on new call', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('arg1', 'arg2', 123);
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should pass arguments to throttled function', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled('arg1', 'arg2', 123);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should allow execution after throttle period', () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      vi.advanceTimersByTime(100);
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
