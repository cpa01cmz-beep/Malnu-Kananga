import { RETRY_CONFIG } from "../constants";
export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {
    maxAttempts: 3,
    initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
    maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
    backoffFactor: 2,
  }
): Promise<T> {
  let lastError: Error | null = null;
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === options.maxAttempts) {
        break;
      }

      const shouldRetry = options.shouldRetry
        ? options.shouldRetry(lastError, attempt)
        : true;

      if (!shouldRetry) {
        break;
      }

      await sleep(delay);
      delay = Math.min(delay * options.backoffFactor, options.maxDelay);
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Sleep function for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms) as unknown as Promise<void>);
}

/**
 * Circuit Breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    lastSuccessTime: null,
  };

  constructor(private options: CircuitBreakerOptions = {
    failureThreshold: RETRY_CONFIG.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
    resetTimeout: RETRY_CONFIG.DEFAULT_RESET_TIMEOUT,
    monitoringPeriod: RETRY_CONFIG.DEFAULT_MONITORING_PERIOD,
  }) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.shouldSkipAttempt()) {
      throw new Error('Circuit breaker is open. Too many recent failures.');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private shouldSkipAttempt(): boolean {
    if (!this.state.isOpen) {
      return false;
    }

    if (this.state.lastFailureTime) {
      const timeSinceLastFailure = Date.now() - this.state.lastFailureTime;
      if (timeSinceLastFailure > this.options.resetTimeout) {
        this.state.isOpen = false;
        this.state.failureCount = 0;
        return false;
      }
    }

    return true;
  }

  private onSuccess(): void {
    this.state.lastSuccessTime = Date.now();
    this.state.failureCount = 0;
    this.state.isOpen = false;
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    if (this.state.failureCount >= this.options.failureThreshold) {
      this.state.isOpen = true;
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
    };
  }

  isOpen(): boolean {
    return this.state.isOpen;
  }
}

/**
 * Error recovery strategies
 */
export class ErrorRecoveryStrategy {
  private circuitBreaker: CircuitBreaker;
  private retryOptions: RetryOptions;

  constructor(
    retryOptions: Partial<RetryOptions> = {},
    circuitBreakerOptions: Partial<CircuitBreakerOptions> = {}
  ) {
    this.retryOptions = {
      maxAttempts: 3,
      initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
      maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
      backoffFactor: 2,
      ...retryOptions,
    };

    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: RETRY_CONFIG.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
      resetTimeout: RETRY_CONFIG.DEFAULT_RESET_TIMEOUT,
      monitoringPeriod: RETRY_CONFIG.DEFAULT_MONITORING_PERIOD,
      ...circuitBreakerOptions,
    });
  }

  /**
   * Execute function with retry and circuit breaker
   */
  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await this.circuitBreaker.execute(() =>
        retryWithBackoff(fn, this.retryOptions)
      );
    } catch (error) {
      if (context) {
        throw new Error(`Failed to execute ${context}: ${error instanceof Error ? error.message : String(error)}`);
      }
      throw error;
    }
  }

  /**
   * Execute function with fallback on failure
   */
  async executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: (error: Error) => T | Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await this.execute(fn, context);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      try {
        return await fallback(err);
      } catch (fallbackError) {
        if (context) {
          throw new Error(`Failed to execute ${context} and fallback failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        }
        throw fallbackError;
      }
    }
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
  }
}

/**
 * Create a debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Create a throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'Network Error',
    'fetch failed',
    'Failed to fetch',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN'
  ];

  return networkErrorMessages.some(msg => error.message.includes(msg));
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: Error): boolean {
  return error.message.includes('429') ||
         error.message.toLowerCase().includes('rate limit') ||
         error.message.toLowerCase().includes('too many requests');
}

/**
 * Check if an error is a server error
 */
export function isServerError(error: Error): boolean {
  const serverErrorStatuses = [500, 502, 503, 504];
  return serverErrorStatuses.some(status =>
    error.message.includes(`status ${status}`) ||
    error.message.includes(`${status}`)
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  return isNetworkError(error) || isRateLimitError(error) || isServerError(error);
}

/**
 * Calculate retry delay with exponential backoff
 */
export function getRetryDelay(attempt: number, initialDelay: number = RETRY_CONFIG.DEFAULT_INITIAL_DELAY, maxDelay: number = RETRY_CONFIG.DEFAULT_MAX_DELAY): number {
  const backoffDelay = initialDelay * Math.pow(2, attempt - 1);
  return Math.min(backoffDelay, maxDelay);
}
