import { useCallback, useState } from 'react';
import { logger } from '../utils/logger';

interface ErrorContext {
  operation: string;
  component: string;
  fallbackMessage?: string;
}

interface ErrorState {
  hasError: boolean;
  message: string | null;
  retryAction?: () => void;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: null,
  });

  const handleError = useCallback(
    (error: unknown, context?: ErrorContext) => {
      let userMessage: string;
      
      if (error instanceof Error) {
        // Log the technical error
        logger.error(`Error in ${context?.component || 'unknown'}: ${context?.operation || 'unknown'}`, error);
        
        // Classify the error and create user-friendly message
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || !navigator.onLine) {
          userMessage = 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('time out') || errorMessage.includes('timed out')) {
          userMessage = 'Waktu habis saat menghubungi server. Silakan coba lagi.';
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          userMessage = 'Terlalu banyak permintaan. Silakan tunggu sebentar sebelum mencoba lagi.';
        } else if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('unauthorized')) {
          userMessage = 'Anda tidak memiliki izin untuk melakukan operasi ini.';
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          userMessage = 'Data yang dicari tidak ditemukan.';
        } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
          userMessage = 'Server sedang mengalami gangguan. Silakan coba sesaat lagi.';
        } else {
          userMessage = context?.fallbackMessage || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
        }
      } else {
        // Handle non-Error objects
        logger.error('Non-Error thrown:', error);
        userMessage = context?.fallbackMessage || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.';
      }
      
      setErrorState({
        hasError: true,
        message: userMessage,
      });
      
      return userMessage;
    },
    []
  );

  const handleApiError = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      context?: ErrorContext
    ): Promise<T | null> => {
      try {
        const result = await apiCall();
        // Clear any existing error on success
        setErrorState({ hasError: false, message: null });
        return result;
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    setErrorState({ hasError: false, message: null });
  }, []);

  const retryWithAction = useCallback((action: () => Promise<void> | void) => {
    setErrorState({ hasError: false, message: null, retryAction: action });
  }, []);

  return { 
    errorState,
    handleError, 
    handleApiError, 
    clearError,
    retryWithAction 
  };
};