/**
 * Error handling utilities for teacher workflow components
 */

import React from 'react';
import { OperationResult } from './teacherValidation';

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
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
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
 */
export const handleApiError = (error: unknown): string => {
  if (!error) {
    return 'Terjadi kesalahan yang tidak diketahui';
  }

  const err = error as { name?: string; message?: string; status?: number };

  // Network errors
  if (err.name === 'TypeError' && err.message?.includes('fetch')) {
    return 'Koneksi Internet gagal. Periksa koneksi Anda dan coba lagi.';
  }

  if (err.name === 'AbortError') {
    return 'Operasi dibatalkan karena terlalu lama. Coba lagi.';
  }

  // HTTP status errors
  if (err.status) {
    switch (err.status) {
      case 400:
        return err.message || 'Data yang dikirim tidak valid. Periksa kembali input Anda.';
      case 401:
        return 'Sesi Anda telah berakhir. Silakan login kembali.';
      case 403:
        return 'Anda tidak memiliki izin untuk melakukan operasi ini.';
      case 404:
        return 'Data tidak ditemukan. Mungkin telah dihapus atau dipindahkan.';
      case 409:
        return 'Konflik data. Mungkin ada perubahan yang dilakukan oleh pengguna lain.';
      case 422:
        return err.message || 'Validasi gagal. Periksa kembali input Anda.';
      case 429:
        return 'Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.';
      case 500:
        return 'Terjadi kesalahan pada server. Silakan coba lagi beberapa saat.';
      case 502:
        return 'Server sedang dalam pemeliharaan. Silakan coba lagi nanti.';
      case 503:
        return 'Layanan tidak tersedia sementara. Silakan coba lagi nanti.';
      case 504:
        return 'Server terlalu lama merespons. Silakan coba lagi.';
      default:
        return `Terjadi kesalahan (${err.status}). Silakan coba lagi.`;
    }
  }

  // Generic error messages
  if (err.message) {
    // Don't expose technical error details to users
    if (err.message.includes('JSON') ||
        err.message.includes('parse') ||
        err.message.includes('syntax')) {
      return 'Format data tidak valid. Hubungi administrator jika masalah berlanjut.';
    }

    return err.message;
  }

  return 'Terjadi kesalahan. Silakan coba lagi.';
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
  
  const k = 1024;
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