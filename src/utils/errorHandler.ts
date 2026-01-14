import { logger } from './logger';
import { ADMIN_EMAIL } from '../constants';

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  API_KEY_ERROR = 'API_KEY_ERROR',
  QUOTA_EXCEEDED_ERROR = 'QUOTA_EXCEEDED_ERROR',
  CONTENT_FILTER_ERROR = 'CONTENT_FILTER_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  OCR_ERROR = 'OCR_ERROR',
  NOTIFICATION_ERROR = 'NOTIFICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  OFFLINE_ERROR = 'OFFLINE_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR'
}

export interface ErrorContext {
  operation: string;
  timestamp: number;
  attempt?: number;
  maxAttempts?: number;
}

export class AppError extends Error {
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
    this.name = 'AppError';
    this.type = type;
    this.context = context;
    this.isRetryable = isRetryable;
    this.originalError = originalError;
  }
}

export class GeminiAPIError extends AppError {
  constructor(
    message: string,
    type: ErrorType,
    context: ErrorContext,
    isRetryable: boolean,
    originalError?: unknown
  ) {
    super(message, type, context, isRetryable, originalError);
    this.name = 'GeminiAPIError';
  }
}

const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK_ERROR]: 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.',
  [ErrorType.TIMEOUT_ERROR]: 'Waktu habis saat memproses permintaan. Silakan coba lagi.',
  [ErrorType.RATE_LIMIT_ERROR]: 'Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.',
  [ErrorType.API_KEY_ERROR]: 'Konfigurasi API tidak valid. Hubungi administrator.',
  [ErrorType.QUOTA_EXCEEDED_ERROR]: 'Kuota API telah habis. Silakan coba lagi nanti.',
  [ErrorType.CONTENT_FILTER_ERROR]: 'Permintaan Anda tidak dapat diproses karena kebijakan konten.',
  [ErrorType.SERVER_ERROR]: 'Server sedang mengalami gangguan. Silakan coba sesaat lagi.',
  [ErrorType.UNKNOWN_ERROR]: 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.',
  [ErrorType.OCR_ERROR]: 'Gagal memproses dokumen. Silakan pastikan gambar jelas dan coba lagi.',
  [ErrorType.NOTIFICATION_ERROR]: 'Tidak dapat mengirim notifikasi. Periksa pengaturan perangkat Anda.',
  [ErrorType.VALIDATION_ERROR]: 'Data yang dimasukkan tidak valid. Silakan periksa kembali.',
  [ErrorType.PERMISSION_ERROR]: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
  [ErrorType.OFFLINE_ERROR]: 'Tidak dapat melakukan operasi saat offline. Data akan disinkronkan saat online.',
  [ErrorType.CONFLICT_ERROR]: 'Data telah diubah oleh pengguna lain. Silakan refresh dan coba lagi.'
};

export function getUserFriendlyMessage(error: AppError): string {
  return ERROR_MESSAGES[error.type] || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];
}

export function classifyError(error: unknown, context: ErrorContext): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // Handle null/undefined errors
  if (error === null || error === undefined) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
      ErrorType.UNKNOWN_ERROR,
      context,
      true,
      error
    );
  }

  const err = error as Error;

  if (!navigator.onLine) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.NETWORK_ERROR],
      ErrorType.NETWORK_ERROR,
      context,
      true,
      error
    );
  }

  const errorMessage = (err.message || String(error)).toLowerCase();

  if (errorMessage.includes('timeout') || errorMessage.includes('time out') || errorMessage.includes('timed')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.TIMEOUT_ERROR],
      ErrorType.TIMEOUT_ERROR,
      context,
      true,
      error
    );
  }

  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.RATE_LIMIT_ERROR],
      ErrorType.RATE_LIMIT_ERROR,
      context,
      true,
      error
    );
  }

  if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('401') || errorMessage.includes('403')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.API_KEY_ERROR],
      ErrorType.API_KEY_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.QUOTA_EXCEEDED_ERROR],
      ErrorType.QUOTA_EXCEEDED_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('content filter') || errorMessage.includes('safety')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.CONTENT_FILTER_ERROR],
      ErrorType.CONTENT_FILTER_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.NETWORK_ERROR],
      ErrorType.NETWORK_ERROR,
      context,
      true,
      error
    );
  }

  if (errorMessage.includes('ocr') || errorMessage.includes('tesseract') || errorMessage.includes('gambar') || errorMessage.includes('dokumen')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.OCR_ERROR],
      ErrorType.OCR_ERROR,
      context,
      true,
      error
    );
  }

  if (errorMessage.includes('notification') || errorMessage.includes('push') || errorMessage.includes('permission')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.NOTIFICATION_ERROR],
      ErrorType.NOTIFICATION_ERROR,
      context,
      true,
      error
    );
  }

  if (errorMessage.includes('validasi') || errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.VALIDATION_ERROR],
      ErrorType.VALIDATION_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('permission') || errorMessage.includes('izin')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.PERMISSION_ERROR],
      ErrorType.PERMISSION_ERROR,
      context,
      false,
      error
    );
  }

  if (errorMessage.includes('conflict') || errorMessage.includes('konflik') || errorMessage.includes('409')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.CONFLICT_ERROR],
      ErrorType.CONFLICT_ERROR,
      context,
      true,
      error
    );
  }

  return new AppError(
    ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
    ErrorType.UNKNOWN_ERROR,
    context,
    true,
    error
  );
}

export function logError(error: AppError): void {
  const logData = {
    type: error.type,
    operation: error.context.operation,
    isRetryable: error.isRetryable,
    timestamp: new Date(error.context.timestamp).toISOString(),
    message: error.message,
    errorName: error.name
  };

  logger.error(`[${error.name}]`, JSON.stringify(logData, null, 2));

  if (error.context.attempt !== undefined && error.context.maxAttempts) {
    logger.error(`[${error.name}] Attempt ${error.context.attempt} of ${error.context.maxAttempts}`);
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

export function shouldRetry(error: AppError, attempt: number, maxAttempts: number): boolean {
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
  let lastError: AppError | null = null;

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

  throw lastError || new AppError(
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
      throw new AppError(
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

// Standardized error creation utilities
export function createError(
  type: ErrorType,
  operation: string,
  userMessage?: string,
  isRetryable: boolean = true,
  originalError?: unknown
): AppError {
  const message = userMessage || ERROR_MESSAGES[type];
  return new AppError(
    message,
    type,
    { operation, timestamp: Date.now() },
    isRetryable,
    originalError
  );
}

export function createOCRError(operation: string, originalError?: unknown): AppError {
  return createError(
    ErrorType.OCR_ERROR,
    operation,
    undefined,
    true,
    originalError
  );
}

export function createNotificationError(operation: string, originalError?: unknown): AppError {
  return createError(
    ErrorType.NOTIFICATION_ERROR,
    operation,
    undefined,
    true,
    originalError
  );
}

export function createValidationError(operation: string, validationMessage?: string): AppError {
  return createError(
    ErrorType.VALIDATION_ERROR,
    operation,
    validationMessage,
    false
  );
}

export function createPermissionError(operation: string, permission?: string): AppError {
  const message = permission 
    ? `Anda tidak memiliki izin ${permission} untuk melakukan tindakan ini.`
    : ERROR_MESSAGES[ErrorType.PERMISSION_ERROR];
  return createError(
    ErrorType.PERMISSION_ERROR,
    operation,
    message,
    false
  );
}

export function createConflictError(operation: string, originalError?: unknown): AppError {
  return createError(
    ErrorType.CONFLICT_ERROR,
    operation,
    undefined,
    true,
    originalError
  );
}

export function createOfflineError(operation: string): AppError {
  return createError(
    ErrorType.OFFLINE_ERROR,
    operation,
    undefined,
    true
  );
}

// Error boundary and UI feedback utilities
export interface ErrorFeedback {
  type: 'error' | 'warning' | 'info';
  message: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export function getUIFeedback(error: AppError): ErrorFeedback {
  const baseFeedback: ErrorFeedback = {
    type: 'error',
    message: getUserFriendlyMessage(error)
  };

  // Add actionable feedback based on error type
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      baseFeedback.actions = [
        {
          label: 'Coba Lagi',
          action: () => window.location.reload(),
          variant: 'primary'
        }
      ];
      break;

    case ErrorType.PERMISSION_ERROR:
      baseFeedback.actions = [
        {
          label: 'Hubungi Administrator',
          action: () => {
            // Navigate to contact admin or open email
            window.open(`mailto:${ADMIN_EMAIL}`);
          }
        }
      ];
      break;

    case ErrorType.OCR_ERROR:
      baseFeedback.actions = [
        {
          label: 'Pilih Gambar Lain',
          action: () => {
            // Trigger file selection dialog
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.click();
          },
          variant: 'primary'
        }
      ];
      break;

    case ErrorType.CONFLICT_ERROR:
      baseFeedback.actions = [
        {
          label: 'Refresh Halaman',
          action: () => window.location.reload(),
          variant: 'primary'
        }
      ];
      break;

    case ErrorType.OFFLINE_ERROR:
      baseFeedback.type = 'warning';
      baseFeedback.message = 'Anda sedang offline. Data akan disimpan dan disinkronkan saat koneksi tersedia.';
      break;
  }

  return baseFeedback;
}
