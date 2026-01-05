// geminiErrorHandler.ts - Comprehensive Error Recovery System for Gemini API

export interface GeminiErrorType {
  type: 'network' | 'auth' | 'rate_limit' | 'quota' | 'content_filter' | 'model_unavailable' | 'timeout' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  userMessage: string;
  technicalMessage: string;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: readonly GeminiErrorType['type'][];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open - service temporarily unavailable');
      }
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

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.config.failureThreshold) {
      this.state = 'open';
    }
  }
}

export class GeminiErrorHandler {
  private circuitBreaker: CircuitBreaker;
  private retryConfig: RetryConfig;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 30000, // 30 seconds
    });

    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      retryableErrors: ['network', 'rate_limit', 'timeout', 'model_unavailable'],
    };
  }

  // Enhanced error classification
  classifyError(error: unknown): GeminiErrorType {
    const errorMessage = (error as Error)?.message || '';
    const statusCode = (error as { status?: number; code?: number })?.status || (error as { status?: number; code?: number })?.code;

    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || 
        errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
      return {
        type: 'network',
        severity: 'medium',
        retryable: true,
        userMessage: 'Koneksi internet tidak stabil. Memuat ulang...',
        technicalMessage: `Network error: ${errorMessage}`,
      };
    }

    // Authentication errors
    if (statusCode === 401 || statusCode === 403 || 
        errorMessage.includes('API_KEY') || errorMessage.includes('authentication')) {
      return {
        type: 'auth',
        severity: 'critical',
        retryable: false,
        userMessage: 'Terjadi masalah autentikasi. Silakan hubungi administrator.',
        technicalMessage: `Authentication error: ${errorMessage}`,
      };
    }

    // Rate limiting
    if (statusCode === 429 || errorMessage.includes('rate limit') || 
        errorMessage.includes('quota') && errorMessage.includes('exceeded')) {
      return {
        type: 'rate_limit',
        severity: 'medium',
        retryable: true,
        userMessage: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
        technicalMessage: `Rate limit exceeded: ${errorMessage}`,
      };
    }

    // Quota exceeded (distinguish from rate limit)
    if (errorMessage.includes('billing') || 
        (errorMessage.includes('quota') && !errorMessage.includes('rate limit')) ||
        statusCode === 429 && errorMessage.includes('quota')) {
      return {
        type: 'quota',
        severity: 'high',
        retryable: false,
        userMessage: 'Kuota AI terlampaui. Silakan coba lagi nanti.',
        technicalMessage: `Quota exceeded: ${errorMessage}`,
      };
    }

    // Content filtering
    if (errorMessage.includes('content filter') || errorMessage.includes('safety') ||
        (statusCode === 400 && errorMessage.includes('content'))) {
      return {
        type: 'content_filter',
        severity: 'low',
        retryable: false,
        userMessage: 'Permintaan tidak dapat diproses. Coba phrasing ulang pertanyaan Anda.',
        technicalMessage: `Content filter triggered: ${errorMessage}`,
      };
    }

    // Model unavailable
    if (errorMessage.includes('model') && errorMessage.includes('unavailable') ||
        statusCode === 503) {
      return {
        type: 'model_unavailable',
        severity: 'high',
        retryable: true,
        userMessage: 'Model AI sedang tidak tersedia. Menggunakan alternatif...',
        technicalMessage: `Model unavailable: ${errorMessage}`,
      };
    }

    // Timeout
    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return {
        type: 'timeout',
        severity: 'medium',
        retryable: true,
        userMessage: 'Permintaan terlalu lama. Mencoba kembali...',
        technicalMessage: `Request timeout: ${errorMessage}`,
      };
    }

    // Unknown error
    return {
      type: 'unknown',
      severity: 'high',
      retryable: true,
      userMessage: 'Terjadi kesalahan yang tidak diketahui. Mencoba kembali...',
      technicalMessage: `Unknown error: ${errorMessage}`,
    };
  }

  // Exponential backoff with jitter
  private async delay(attempt: number): Promise<void> {
    const delay = Math.min(
      this.retryConfig.maxDelay,
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1)
    );
    
    // Add jitter to prevent thundering herd
    const jitter = delay * 0.1 * Math.random();
    return new Promise(resolve => setTimeout(resolve, delay + jitter));
  }

  // Execute API call with comprehensive retry logic
  async executeWithRetry<T>(
    apiCall: () => Promise<T>,
    context?: { model?: string; useThinkingMode?: boolean; operation?: string }
  ): Promise<T> {
    const lastError: Error[] = [];

    // Circuit breaker check first
    return this.circuitBreaker.execute(async () => {
      for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
        try {
          return await apiCall();
        } catch (error: unknown) {
const errorInfo = this.classifyError(error);
      lastError.push(error as Error);

          // Log error for monitoring
          this.logError(errorInfo, attempt, context);

          // Don't retry if error is not retryable
          if (!errorInfo.retryable) {
            throw new GeminiError(errorInfo, lastError[lastError.length - 1]);
          }

          // Don't retry on last attempt
          if (attempt === this.retryConfig.maxRetries) {
            throw new GeminiError(errorInfo, lastError[lastError.length - 1]);
          }

          // Wait before retry
          await this.delay(attempt);
        }
      }

      throw new Error('Max retries exceeded');
    });
  }

  // Fallback model selection
  getFallbackModel(originalModel: string): string {
    const fallbackChain = [
      'gemini-3-pro-preview',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    const currentIndex = fallbackChain.indexOf(originalModel);
    if (currentIndex === -1) {
      return fallbackChain[1]; // Default to gemini-2.5-flash
    }

    // Return next model in chain, or the last one if we're at the end
    return fallbackChain[Math.min(currentIndex + 1, fallbackChain.length - 1)];
  }

  // Enhanced error logging
  private logError(errorInfo: GeminiErrorType, attempt: number, context?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      attempt,
      errorType: errorInfo.type,
      severity: errorInfo.severity,
      technicalMessage: errorInfo.technicalMessage,
      context,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('Gemini API Error:', logEntry);
    }

    // In production, send to error monitoring service
    // TODO: Integrate with error monitoring (Sentry, LogRocket, etc.)
    this.sendToErrorMonitoring(logEntry);
  }

  private sendToErrorMonitoring(logEntry: Record<string, unknown>): void {
    // Placeholder for error monitoring integration
    // This could send to Sentry, DataDog, or custom monitoring
    try {
      // Example: Send to analytics endpoint
      fetch('/api/errors/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      }).catch(() => {
        // Silently fail to avoid infinite loops
      });
    } catch {
      // Ignore monitoring errors
    }
  }

  // Health check for Gemini API
  async healthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    try {
      // Test API key validity
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        issues.push('API key is missing');
      }

      // Test basic connectivity
      // Note: This would be a simple health check endpoint
      // For now, we'll just validate the key format
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey && !apiKey.startsWith('AIza')) {
        issues.push('API key format appears invalid');
      }

      return {
        healthy: issues.length === 0,
        issues,
      };
    } catch (error) {
      issues.push(`Health check failed: ${error}`);
      return {
        healthy: false,
        issues,
      };
    }
  }
}

// Custom error class
export class GeminiError extends Error {
  constructor(
    public errorInfo: GeminiErrorType,
    public originalError: Error
  ) {
    super(errorInfo.userMessage);
    this.name = 'GeminiError';
  }
}

// Singleton instance
export const geminiErrorHandler = new GeminiErrorHandler();

// Utility functions for components
export const getUserFriendlyMessage = (error: unknown): string => {
  if (error instanceof GeminiError) {
    return error.errorInfo.userMessage;
  }
  
  const errorHandler = new GeminiErrorHandler();
  const errorInfo = errorHandler.classifyError(error);
  return errorInfo.userMessage;
};

export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof GeminiError) {
    return error.errorInfo.retryable;
  }
  
  const errorHandler = new GeminiErrorHandler();
  const errorInfo = errorHandler.classifyError(error);
  return errorInfo.retryable;
};