import { logger } from './logger';
import { RETRY_CONFIG, HTTP } from '../constants';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryResult<T> {
  data: T;
  attempts: number;
  lastError?: Error;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
  maxDelay: RETRY_CONFIG.DEFAULT_MAX_DELAY,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    const isNetworkError = error.message.includes('Network Error') ||
                        error.message.includes('fetch failed') ||
                        error.message.includes('ECONNREFUSED') ||
                        error.message.includes('ETIMEDOUT');
    const isRetryableStatus = HTTP.RETRYABLE_STATUSES.some(status =>
      error.message.includes(`status ${status}`) ||
      error.message.includes(`${status}`)
    );

    return isNetworkError || isRetryableStatus;
  },
  onRetry: () => {}
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt <= opts.maxRetries) {
    attempt++;

    try {
      const data = await fn();
      return {
        data,
        attempts: attempt,
        lastError
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt > opts.maxRetries || !opts.shouldRetry(lastError)) {
        logger.error(`Max retries reached or non-retryable error after ${attempt} attempts:`, lastError);
        throw lastError;
      }

      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelay
      );

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, lastError.message);
      opts.onRetry(attempt, lastError);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries reached');
}

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

export function isRateLimitError(error: Error): boolean {
  return error.message.includes('429') ||
         error.message.toLowerCase().includes('rate limit') ||
         error.message.toLowerCase().includes('too many requests');
}

export function isServerError(error: Error): boolean {
  return HTTP.SERVER_ERROR_STATUSES.some(status =>
    error.message.includes(`status ${status}`) ||
    error.message.includes(`${status}`)
  );
}

export function isRetryableError(error: Error): boolean {
  return isNetworkError(error) || isRateLimitError(error) || isServerError(error);
}

export function getRetryDelay(attempt: number, initialDelay: number = RETRY_CONFIG.DEFAULT_INITIAL_DELAY, maxDelay: number = RETRY_CONFIG.DEFAULT_MAX_DELAY): number {
  const backoffDelay = initialDelay * Math.pow(2, attempt - 1);
  return Math.min(backoffDelay, maxDelay);
}
