// GeminiErrorBoundary.tsx - Enhanced Error Boundary for Gemini API errors

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { GeminiError, getUserFriendlyMessage } from '../utils/geminiErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GeminiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GeminiErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to monitoring service
    this.logErrorToMonitoring(error, errorInfo);
  }

  private logErrorToMonitoring(error: Error, errorInfo: ErrorInfo) {
    // Send error to monitoring service
    try {
      fetch('/api/errors/boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          isGeminiError: error instanceof GeminiError,
        }),
      }).catch(() => {
        // Silently fail to avoid infinite loops
      });
    } catch {
      // Ignore monitoring errors
    }
  }

  private retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      // Default fallback UI
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h3 className="mb-2 text-lg font-semibold text-red-900">
            Terjadi Kesalahan
          </h3>
          
          <p className="mb-4 text-red-700">
            {getUserFriendlyMessage(this.state.error)}
          </p>

          <div className="flex justify-center gap-2">
            <button
              onClick={this.retry}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Coba Lagi
            </button>
            
            {this.state.error instanceof GeminiError && this.state.error.errorInfo.retryable && (
              <button
                onClick={() => window.location.reload()}
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Refresh Halaman
              </button>
            )}
          </div>

          {import.meta.env.DEV && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-red-600">
                Detail Teknis (Development)
              </summary>
              <pre className="mt-2 overflow-auto text-xs text-red-600">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default GeminiErrorBoundary;