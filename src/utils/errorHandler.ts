import { logger } from './logger';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  API_KEY_ERROR = 'API_KEY_ERROR',
  QUOTA_EXCEEDED_ERROR = 'QUOTA_EXCEEDED_ERROR',
  CONTENT_FILTER_ERROR = 'CONTENT_FILTER_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ErrorContext {
  operation: string;
  timestamp: number;
  attempt?: number;
  maxAttempts?: number;
}

export class GeminiAPIError extends Error {
  type: ErrorType;
  context: ErrorContext;
  isRetryable: boolean;
  originalError?: unknown;

  constructor(
    message: string,
    type: ErrorType,
    context: ErrorContext,
    isRetryable: boolean,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'GeminiAPIError';
    this.type = type;
    this.context = context;
    this.isRetryable = isRetryable;
    this.originalError = originalError;
  }
}

const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK_ERROR]: 'Tidak dapat terhubung ke server AI. Silakan periksa koneksi internet Anda.',
  [ErrorType.TIMEOUT_ERROR]: 'Waktu habis saat menghubungi server AI. Silakan coba lagi.',
  [ErrorType.RATE_LIMIT_ERROR]: 'Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.',
  [ErrorType.API_KEY_ERROR]: 'Konfigurasi API tidak valid. Hubungi administrator.',
  [ErrorType.QUOTA_EXCEEDED_ERROR]: 'Kuota API telah habis. Silakan coba lagi nanti.',
  [ErrorType.CONTENT_FILTER_ERROR]: 'Permintaan Anda tidak dapat diproses karena kebijakan konten.',
  [ErrorType.SERVER_ERROR]: 'Server AI sedang mengalami gangguan. Silakan coba sesaat lagi.',
  [ErrorType.UNKNOWN_ERROR]: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
};

export function getUserFriendlyMessage(error: GeminiAPIError): string {
  return ERROR_MESSAGES[error.type] || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];
}

export function classifyError(error: unknown, context: ErrorContext): GeminiAPIError {
  if (error instanceof GeminiAPIError) {
    return error;
  }

  const err = error as Error;

  if (!navigator.onLine) {
    return new GeminiAPIError(
      ERROR_MESSAGES[ErrorType.NETWORK_ERROR],
      ErrorType.NETWORK_ERROR,
      context,
      true,
      error
    );
  }

  const errorMessage = (err.message || String(error)).toLowerCase();

  if (errorMessage.includes('timeout') || errorMessage.includes('time out')) {
    return new GeminiAPIError(
      ERROR_MESSAGES[ErrorType.TIMEOUT_ERROR],
      ErrorType.TIMEOUT_ERROR,
      context,
      true,
      error
    );
  }

  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return new GeminiAPIError(
      ERROR_MESSAGES[ErrorType.RATE_LIMIT_ERROR],
      ErrorType.RATE_LIMIT_ERROR,
      context,
      true,
      error
    );
  }

  if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('401') || errorMessage.includes('403')) {
    return new GeminiAPIError(
      ERROR_MESSAGES[ErrorType.API_KEY_ERROR],
      ErrorType.API_KEY_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
    return new GeminiAPIError(
      ERROR_MESSAGES[ErrorType.QUOTA_EXCEEDED_ERROR],
      ErrorType.QUOTA_EXCEEDED_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('content filter') || errorMessage.includes('safety')) {
    return new GeminiAPIError(
      ERROR_MESSAGES[ErrorType.CONTENT_FILTER_ERROR],
      ErrorType.CONTENT_FILTER_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return new GeminiAPIError(
      ERROR_MESSAGES[ErrorType.NETWORK_ERROR],
      ErrorType.NETWORK_ERROR,
      context,
      true,
      error
    );
  }

  return new GeminiAPIError(
    ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
    ErrorType.UNKNOWN_ERROR,
    context,
    true,
    error
  );
}

export function logError(error: GeminiAPIError): void {
  const logData = {
    type: error.type,
    operation: error.context.operation,
    isRetryable: error.isRetryable,
    timestamp: new Date(error.context.timestamp).toISOString(),
    message: error.message,
    errorName: error.name
  };

  logger.error('[GeminiAPIError]', JSON.stringify(logData, null, 2));

  if (error.context.attempt !== undefined && error.context.maxAttempts) {
    logger.error(`[GeminiAPIError] Attempt ${error.context.attempt} of ${error.context.maxAttempts}`);
  }
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
};

function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelayMs);
}

export function shouldRetry(error: GeminiAPIError, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) {
    return false;
  }
  return error.isRetryable;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: GeminiAPIError | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    const context: ErrorContext = {
      operation: operationName,
      timestamp: Date.now(),
      attempt,
      maxAttempts: config.maxAttempts
    };

    try {
      return await operation();
    } catch (error) {
      lastError = classifyError(error, context);

      if (shouldRetry(lastError, attempt, config.maxAttempts)) {
        logError(lastError);

        const delay = calculateDelay(attempt, config);
        logger.info(`[Retry] Retrying ${operationName} in ${delay}ms (attempt ${attempt}/${config.maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logError(lastError);
        break;
      }
    }
  }

  throw lastError || new GeminiAPIError(
    ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
    ErrorType.UNKNOWN_ERROR,
    { operation: operationName, timestamp: Date.now() },
    false
  );
}

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private timeProvider: () => number = () => Date.now();

  constructor(
    private readonly threshold: number,
    private readonly timeoutMs: number,
    timeProvider?: () => number
  ) {
    if (timeProvider) {
      this.timeProvider = timeProvider;
    }
  }

  private reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private shouldAttempt(): boolean {
    const now = this.timeProvider();
    if (this.state === 'open' && now - this.lastFailureTime > this.timeoutMs) {
      this.state = 'half-open';
      return true;
    }
    return this.state !== 'open';
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = this.timeProvider();
    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      logger.warn(`[CircuitBreaker] Circuit opened after ${this.failureCount} failures`);
    }
  }

  async execute<T>(operation: () => Promise<T>, fallback?: () => T): Promise<T> {
    this.checkStateTransition();

    if (!this.shouldAttempt()) {
      logger.warn('[CircuitBreaker] Circuit is open, using fallback or throwing');
      if (fallback) {
        return fallback();
      }
      throw new GeminiAPIError(
        'Service temporarily unavailable. Please try again later.',
        ErrorType.SERVER_ERROR,
        { operation: 'circuit-breaker', timestamp: this.timeProvider() },
        false
      );
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private checkStateTransition(): void {
    const now = this.timeProvider();
    if (this.state === 'open' && now - this.lastFailureTime > this.timeoutMs) {
      this.state = 'half-open';
      logger.info('[CircuitBreaker] Transitioned to half-open state');
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    this.checkStateTransition();
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

const DEFAULT_CIRCUIT_BREAKER = new CircuitBreaker(5, 60000);

export function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  fallback?: () => T
): Promise<T> {
  return DEFAULT_CIRCUIT_BREAKER.execute(operation, fallback);
}

export function getCircuitBreakerState(): { state: string; failures: number } {
  return {
    state: DEFAULT_CIRCUIT_BREAKER.getState(),
    failures: DEFAULT_CIRCUIT_BREAKER.getFailureCount()
  };
}

export function resetCircuitBreaker(): void {
  DEFAULT_CIRCUIT_BREAKER.recordSuccess();
}
