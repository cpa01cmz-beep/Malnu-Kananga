import { logger } from './logger';
import {
  DEFAULT_RETRY_OPTIONS,
  RETRYABLE_NETWORK_ERRORS,
  SERVER_ERROR_STATUS_CODES,
} from '../config/retry';
import type { RetryOptions, RetryResult } from '../config/retry';

export { RetryOptions, RetryResult };

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
  return RETRYABLE_NETWORK_ERRORS.some((msg: string) => error.message.includes(msg));
}

export function isRateLimitError(error: Error): boolean {
  return error.message.includes('429') ||
         error.message.toLowerCase().includes('rate limit') ||
         error.message.toLowerCase().includes('too many requests');
}

export function isServerError(error: Error): boolean {
  return SERVER_ERROR_STATUS_CODES.some((status: number) =>
    error.message.includes(`status ${status}`) ||
    error.message.includes(`${status}`)
  );
}

export function isRetryableError(error: Error): boolean {
  return isNetworkError(error) || isRateLimitError(error) || isServerError(error);
}

export function getRetryDelay(attempt: number, initialDelay: number = DEFAULT_RETRY_OPTIONS.initialDelay, maxDelay: number = DEFAULT_RETRY_OPTIONS.maxDelay): number {
  const backoffDelay = initialDelay * Math.pow(DEFAULT_RETRY_OPTIONS.backoffMultiplier, attempt - 1);
  return Math.min(backoffDelay, maxDelay);
}
