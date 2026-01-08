import { AppError, createOCRError, createNotificationError, createValidationError, createPermissionError, createConflictError, logError } from '../utils/errorHandler';

// Standardized error handling for OCR Service
export function handleOCRError(error: unknown, operation: string): AppError {
  const appError = error instanceof AppError 
    ? error 
    : createOCRError(operation, error);
  
  logError(appError);
  return appError;
}

// Standardized error handling for Push Notification Service  
export function handleNotificationError(error: unknown, operation: string): AppError {
  const appError = error instanceof AppError
    ? error
    : createNotificationError(operation, error);
  
  logError(appError);
  return appError;
}

// Standardized error handling for validation
export function handleValidationError(validationMessage: string, operation: string): AppError {
  const appError = createValidationError(operation, validationMessage);
  logError(appError);
  return appError;
}

// Standardized error handling for permissions
export function handlePermissionError(permission: string, operation: string): AppError {
  const appError = createPermissionError(operation, permission);
  logError(appError);
  return appError;
}

// Standardized error handling for conflicts
export function handleConflictError(error: unknown, operation: string): AppError {
  const appError = error instanceof AppError
    ? error
    : createConflictError(operation, error);
  
  logError(appError);
  return appError;
}

// Utility for service classes to wrap methods with error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorMapper: (error: unknown, ...args: T) => AppError
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const appError = errorMapper(error, ...args);
      throw appError;
    }
  };
}