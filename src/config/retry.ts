/**
 * Retry Configuration
 * Centralized retry logic configuration throughout the application
 * Flexy Principle: No hardcoded retry logic - everything is configurable
 */

import { RETRY_TIMING } from './timing';

// HTTP Status codes that should trigger a retry
export const RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
] as const;

// Network error messages that should trigger a retry
export const RETRYABLE_NETWORK_ERRORS = [
  'Network Error',
  'fetch failed',
  'Failed to fetch',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
] as const;

// Server error status codes
export const SERVER_ERROR_STATUS_CODES = [
  500,
  502,
  503,
  504,
] as const;

// Default retry options
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

// Default retry configuration
export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: RETRY_TIMING.INITIAL_DELAY,
  maxDelay: RETRY_TIMING.MAX_DELAY,
  backoffMultiplier: RETRY_TIMING.BACKOFF_MULTIPLIER,
  shouldRetry: (error: Error): boolean => {
    const isNetworkError = RETRYABLE_NETWORK_ERRORS.some(msg =>
      error.message.includes(msg)
    );
    const isRetryableStatus = RETRYABLE_STATUS_CODES.some(status =>
      error.message.includes(`status ${status}`) ||
      error.message.includes(`${status}`)
    );

    return isNetworkError || isRetryableStatus;
  },
  onRetry: () => {},
} as const;

// Retry result interface
export interface RetryResult<T> {
  data: T;
  attempts: number;
  lastError?: Error;
}
