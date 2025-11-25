// Hook untuk error reporting yang terintegrasi dengan error logging service
// Memudahkan penggunaan error monitoring di seluruh aplikasi

import React, { useCallback, useRef } from 'react';
import { getErrorLoggingService, ErrorReportingOptions } from '../services/errorLoggingService';

export interface UseErrorReportingOptions extends ErrorReportingOptions {
  componentName?: string;
  enableAutoCatch?: boolean;
}

export interface ErrorReportingHook {
  logError: (error: Error, metadata?: Record<string, any>) => Promise<void>;
  logWarning: (message: string, metadata?: Record<string, any>) => Promise<void>;
  logInfo: (message: string, metadata?: Record<string, any>) => Promise<void>;
  reportError: (error: Error, context?: string, metadata?: Record<string, any>) => Promise<void>;
  clearLogs: () => void;
  getLogs: () => any[];
  getStats: () => any;
  updateConfig: (options: Partial<ErrorReportingOptions>) => void;
}

export function useErrorReporting(options: UseErrorReportingOptions = {}): ErrorReportingHook {
  const errorServiceRef = useRef(getErrorLoggingService(options));
  const { componentName = 'UnknownComponent', enableAutoCatch = false } = options;

  const logError = useCallback(async (error: Error, metadata?: Record<string, any>) => {
    await errorServiceRef.current.logError(error, undefined, {
      component: componentName,
      ...metadata
    });
  }, [componentName]);

  const logWarning = useCallback(async (message: string, metadata?: Record<string, any>) => {
    const warningError = new Error(message);
    warningError.name = 'Warning';

    await errorServiceRef.current.logError(warningError, undefined, {
      component: componentName,
      severity: 'low',
      type: 'warning',
      ...metadata
    });
  }, [componentName]);

  const logInfo = useCallback(async (message: string, metadata?: Record<string, any>) => {
    const infoError = new Error(message);
    infoError.name = 'Info';

    await errorServiceRef.current.logError(infoError, undefined, {
      component: componentName,
      severity: 'low',
      type: 'info',
      ...metadata
    });
  }, [componentName]);

  const reportError = useCallback(async (
    error: Error,
    context?: string,
    metadata?: Record<string, any>
  ) => {
    await errorServiceRef.current.logError(error, undefined, {
      component: componentName,
      context,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }, [componentName]);

  const clearLogs = useCallback(() => {
    errorServiceRef.current.clearStoredErrorLogs();
  }, []);

  const getLogs = useCallback(() => {
    return errorServiceRef.current.getStoredErrorLogs();
  }, []);

  const getStats = useCallback(() => {
    return errorServiceRef.current.getErrorStats();
  }, []);

  const updateConfig = useCallback((newOptions: Partial<ErrorReportingOptions>) => {
    errorServiceRef.current.updateOptions(newOptions);
  }, []);

  // Auto catch unhandled errors jika diaktifkan
  if (enableAutoCatch && typeof window !== 'undefined') {
    const originalErrorHandler = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (error) {
        errorServiceRef.current.logError(error, undefined, {
          component: componentName,
          source: 'window.onerror',
          line: lineno,
          column: colno
        });
      }

      // Call original handler jika ada
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }

      return false;
    };

    // Catch unhandled promise rejections
    const originalUnhandledRejectionHandler = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));

      errorServiceRef.current.logError(error, undefined, {
        component: componentName,
        source: 'unhandledrejection',
        type: 'promise_rejection'
      });

      if (originalUnhandledRejectionHandler) {
        originalUnhandledRejectionHandler.call(window, event);
      }
    };
  }

  return {
    logError,
    logWarning,
    logInfo,
    reportError,
    clearLogs,
    getLogs,
    getStats,
    updateConfig
  };
}

// HOC untuk wrapping components dengan error reporting
export function withErrorReporting<P extends object>(
  Component: React.ComponentType<P>,
  options: UseErrorReportingOptions = {}
) {
  const WrappedComponent = (props: P) => {
    const errorReporting = useErrorReporting({
      componentName: Component.displayName || Component.name,
      ...options
    });

    return <Component {...props} errorReporting={errorReporting} />;
  };

  WrappedComponent.displayName = `withErrorReporting(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Utility function untuk manual error reporting tanpa hook
export const reportError = async (
  error: Error,
  context?: string,
  metadata?: Record<string, any>
) => {
  await getErrorLoggingService().logError(error, undefined, {
    context,
    ...metadata
  });
};

// Utility function untuk reporting errors dari try-catch blocks
export const safeExecute = async <T,>(
  fn: () => Promise<T> | T,
  context?: string,
  metadata?: Record<string, any>
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    await reportError(
      error instanceof Error ? error : new Error(String(error)),
      context,
      metadata
    );
    return null;
  }
};

export default useErrorReporting;