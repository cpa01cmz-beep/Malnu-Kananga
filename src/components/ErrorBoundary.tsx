import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getErrorLoggingService } from '../services/errorLoggingService';
import { captureErrorBoundary } from '../services/sentryService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Gunakan error logging service untuk comprehensive error tracking
    const errorLoggingService = getErrorLoggingService();

    // Log error dengan metadata tambahan untuk debugging
    errorLoggingService.logErrorBoundary(error, {
      componentStack: errorInfo.componentStack || '',
    }, {
      componentName: this.constructor.name,
      props: Object.keys(this.props),
      hasCustomFallback: !!this.props.fallback,
      hasCustomErrorHandler: !!this.props.onError
    }).catch((logErrorValue) => {
      // Fallback jika logging service gagal
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      console.error('Error logging service juga gagal:', logErrorValue);
    });

    // Kirim error ke Sentry
    captureErrorBoundary(error, errorInfo.componentStack || '');

    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Terjadi Kesalahan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Maaf, terjadi kesalahan yang tidak terduga. Halaman akan dimuat ulang untuk memperbaiki masalah ini.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Muat Ulang Halaman
              </button>

              <button
                onClick={this.handleReset}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Coba Lagi
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Detail Error (Development)
                </summary>
                <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-64 space-y-3">
                  <div className="font-mono">
                    <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                      {this.state.error.name}: {this.state.error.message}
                    </div>

                    <div className="mb-3">
                      <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>

                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div className="mb-3">
                        <div className="text-yellow-600 dark:text-yellow-400 font-semibold mb-1">Component Stack:</div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="text-green-600 dark:text-green-400 font-semibold mb-1">Error Log Info:</div>
                      <div className="text-xs space-y-1">
                        <div>Session ID: <span className="font-mono">{getErrorLoggingService().getSessionId() || 'N/A'}</span></div>
                        <div>URL: <span className="font-mono">{window.location.href}</span></div>
                        <div>User Agent: <span className="font-mono text-xs">{navigator.userAgent}</span></div>
                        <div>Timestamp: <span className="font-mono">{new Date().toISOString()}</span></div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-purple-600 dark:text-purple-400 font-semibold mb-1">Stored Error Count:</div>
                      <div className="text-xs">
                        {getErrorLoggingService().getStoredErrorLogs().length} errors logged in this session
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => {
                          const logs = getErrorLoggingService().exportErrorLogs();
                          console.log('All Error Logs:', JSON.parse(logs));
                          window.alert('Error logs exported to console');
                        }}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                      >
                        Export Logs
                      </button>

                      <button
                        onClick={() => {
                          getErrorLoggingService().clearStoredErrorLogs();
                          window.alert('Error logs cleared');
                        }}
                        className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        Clear Logs
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC untuk wrapping components dengan error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (_error: Error, _errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook untuk manual error throwing (untuk testing atau conditional errors)
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

export default ErrorBoundary;