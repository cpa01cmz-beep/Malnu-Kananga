import { useCallback, useState } from 'react';
import { AppError, classifyError, logError, getUIFeedback, ErrorFeedback } from '../utils/errorHandler';

export interface ErrorHandlingOptions {
  operation: string;
  component?: string;
  fallbackMessage?: string;
  onError?: (error: AppError, feedback: ErrorFeedback) => void;
}

export interface ErrorState {
  hasError: boolean;
  appError: AppError | null;
  feedback: ErrorFeedback | null;
  message: string;
  retryAction?: (() => void) | null;
}

export const useErrorHandler = () => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    appError: null,
    feedback: null,
    message: '',
    retryAction: null,
  });

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlingOptions): AppError => {
      const appError = classifyError(error, {
        operation: options.operation,
        timestamp: Date.now(),
      });

      // Log the error
      logError(appError);

      // Get UI feedback
      const feedback = getUIFeedback(appError);

      // Update state
      setErrorState({
        hasError: true,
        appError,
        feedback,
        message: appError.message,
        retryAction: null,
      });

      // Call custom error handler if provided
      if (options.onError) {
        options.onError(appError, feedback);
      }

      return appError;
    },
    []
  );

  const handleAsyncError = useCallback(
    async <T>(
      asyncOperation: () => Promise<T>,
      options: ErrorHandlingOptions
    ): Promise<T | null> => {
      try {
        const result = await asyncOperation();
        // Clear any existing error on success
        setErrorState({ hasError: false, appError: null, feedback: null, message: '', retryAction: null });
        return result;
      } catch (error) {
        handleError(error, options);
        return null;
      }
    },
    [handleError]
  );

  const clearError = useCallback(() => {
    setErrorState({ hasError: false, appError: null, feedback: null, message: '', retryAction: null });
  }, []);

  const retryWithAction = useCallback((action: () => Promise<void> | void) => {
    clearError();
    // Execute the retry action
    action();
  }, [clearError]);

  const handleApiError = useCallback(
    (error: unknown, operation: string, retryAction?: () => void): AppError => {
      const appError = handleError(error, { operation });
      if (retryAction) {
        setErrorState(prev => ({
          ...prev,
          retryAction,
        }));
      }
      return appError;
    },
    [handleError]
  );

  return { 
    errorState,
    handleError, 
    handleAsyncError, 
    clearError,
    retryWithAction,
    handleApiError
  };
};