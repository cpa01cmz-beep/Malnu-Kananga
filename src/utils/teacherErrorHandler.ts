/**
 * Error handling utilities for teacher workflow components
 */

import React from 'react';
import { OperationResult } from './teacherValidation';
import { API_ERROR_MESSAGES } from './errorMessages';
import { HTTP, RETRY_CONFIG, CONVERSION, BACKOFF_CONFIG } from '../constants';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

export interface AsyncOperation<T> {
  operation: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number, maxRetries: number) => void;
  config?: Partial<RetryConfig>;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: RETRY_CONFIG.MAX_ATTEMPTS,
  retryDelay: RETRY_CONFIG.DEFAULT_INITIAL_DELAY,
  backoffMultiplier: BACKOFF_CONFIG.DEFAULT_MULTIPLIER,
  shouldRetry: (error) => {
    // Retry on network errors and server errors (5xx)
    return error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('timeout') ||
           (error.message.match(/\b5\d\d\b/) !== null);
  }
};

/**
 * Executes async operation with retry mechanism
 */
export const executeWithRetry = async <T>(asyncOp: AsyncOperation<T>): Promise<OperationResult> => {
  const config = { ...DEFAULT_RETRY_CONFIG, ...asyncOp.config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await asyncOp.operation();
      
      if (asyncOp.onSuccess) {
        asyncOp.onSuccess(result);
      }
      
      return {
        success: true,
        data: result,
        canRetry: false
      };
    } catch (error) {
      lastError = error as Error;
      
      if (asyncOp.onError) {
        asyncOp.onError(lastError);
      }

      // Check if we should retry
      const shouldRetry = attempt < config.maxRetries && 
                         (!config.shouldRetry || config.shouldRetry(lastError));

      if (!shouldRetry) {
        break;
      }

      // Call onRetry callback
      if (asyncOp.onRetry) {
        asyncOp.onRetry(attempt + 1, config.maxRetries);
      }

      // Wait before retry
      const delay = config.retryDelay * Math.pow(config.backoffMultiplier || 2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Operation failed',
    canRetry: config.maxRetries > 0 && (!config.shouldRetry || config.shouldRetry(lastError!))
  };
};

/**
 * Handles API errors and provides user-friendly messages
 * Uses centralized error messages from errorMessages.ts
 */
export const handleApiError = (error: unknown): string => {
  if (!error) {
    return API_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  const err = error as { name?: string; message?: string; status?: number };

  // Network errors
  if (err.name === 'TypeError' && err.message?.includes('fetch')) {
    return API_ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (err.name === 'AbortError') {
    return API_ERROR_MESSAGES.ABORT_ERROR;
  }

  // HTTP status errors - Flexy: Using HTTP.STATUS_CODES constants instead of hardcoded numbers
  if (err.status) {
    switch (err.status) {
      case HTTP.STATUS_CODES.BAD_REQUEST:
        return err.message || API_ERROR_MESSAGES.BAD_REQUEST;
      case HTTP.STATUS_CODES.UNAUTHORIZED:
        return API_ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP.STATUS_CODES.FORBIDDEN:
        return API_ERROR_MESSAGES.FORBIDDEN;
      case HTTP.STATUS_CODES.NOT_FOUND:
        return API_ERROR_MESSAGES.NOT_FOUND;
      case HTTP.STATUS_CODES.CONFLICT:
        return API_ERROR_MESSAGES.CONFLICT;
      case HTTP.STATUS_CODES.UNPROCESSABLE_ENTITY:
        return err.message || API_ERROR_MESSAGES.UNPROCESSABLE_ENTITY;
      case HTTP.STATUS_CODES.TOO_MANY_REQUESTS:
        return API_ERROR_MESSAGES.TOO_MANY_REQUESTS;
      case HTTP.STATUS_CODES.INTERNAL_SERVER_ERROR:
        return API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
      case HTTP.STATUS_CODES.BAD_GATEWAY:
        return API_ERROR_MESSAGES.BAD_GATEWAY;
      case HTTP.STATUS_CODES.SERVICE_UNAVAILABLE:
        return API_ERROR_MESSAGES.SERVICE_UNAVAILABLE;
      case HTTP.STATUS_CODES.GATEWAY_TIMEOUT:
        return API_ERROR_MESSAGES.GATEWAY_TIMEOUT;
      default:
        return `Terjadi kesalahan (${err.status}). ${API_ERROR_MESSAGES.OPERATION_FAILED}`;
    }
  }

  // Generic error messages
  if (err.message) {
    if (err.message.includes('JSON') ||
        err.message.includes('parse') ||
        err.message.includes('syntax')) {
      return API_ERROR_MESSAGES.JSON_PARSE_ERROR;
    }

    return err.message;
  }

  return API_ERROR_MESSAGES.OPERATION_FAILED;
};

/**
 * Creates a toast notification helper with proper error handling
 */
export const createToastHandler = (
  showToast: (message: string, type: 'success' | 'info' | 'error') => void
) => ({
  success: (message: string) => showToast(message, 'success'),
  info: (message: string) => showToast(message, 'info'),
  error: (error: string | Error | unknown) => {
    const message = handleApiError(error);
    showToast(message, 'error');
  },
  warning: (message: string) => showToast(message, 'info') // Using 'info' for warnings
});

/**
 * Error boundary state interface
 * Note: React ErrorBoundary should be implemented as a separate component file
 * This utility file focuses on pure functions for error handling
 */

/**
 * Debounce utility for preventing rapid sequential operations
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle utility for limiting operation frequency
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Creates a loading state manager
 */
export const createLoadingManager = (initialState = false) => {
  let loading = initialState;
  const listeners: ((loading: boolean) => void)[] = [];

  const setLoading = (newLoading: boolean) => {
    loading = newLoading;
    listeners.forEach(listener => listener(loading));
  };

  const subscribe = (listener: (loading: boolean) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  return {
    get loading() { return loading; },
    setLoading,
    subscribe
  };
};

/**
 * Formats file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = CONVERSION.BYTES_PER_KB;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validates file type
 */
export const isFileTypeAllowed = (file: File, allowedTypes: string[]): boolean => {
  if (!allowedTypes || allowedTypes.length === 0) return true;
  
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileExtension === type.toLowerCase();
    } else {
      return mimeType.includes(type.toLowerCase());
    }
  });
};

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};