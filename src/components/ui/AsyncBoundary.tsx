import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from './Button';
import { ExclamationCircleIcon, InformationCircleIcon } from '../icons/MaterialIcons';

export type LoadingStateType = 'spinner' | 'skeleton' | 'dots' | 'pulse' | 'progress';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface LoadingStateProps {
  isLoading: boolean;
  type?: LoadingStateType;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  children?: React.ReactNode;
  minLoadTime?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  type = 'spinner',
  message = 'Loading...',
  size = 'md',
  overlay = false,
  children,
  minLoadTime = 500,
}) => {
  const [showLoading, setShowLoading] = useState(false);
  const minLoadTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      const timer = window.setTimeout(() => {
        setShowLoading(true);
      }, minLoadTime);
      minLoadTimerRef.current = timer as unknown as number;
    } else {
      setShowLoading(false);
      if (minLoadTimerRef.current) {
        window.clearTimeout(minLoadTimerRef.current as unknown as number);
      }
    }

    return () => {
      if (minLoadTimerRef.current) {
        window.clearTimeout(minLoadTimerRef.current as unknown as number);
      }
    };
  }, [isLoading, minLoadTime]);

  if (!showLoading) {
    return <>{children}</>;
  }

  const LoadingContent = () => {
    switch (type) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className={`animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600 ${
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
            }`} role="status" aria-label="Loading">
              <span className="sr-only">Loading...</span>
            </div>
            {message && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
                {message}
              </p>
            )}
          </div>
        );

      case 'skeleton':
        return (
          <div className="space-y-3">
            <div className="skeleton-base h-4 w-3/4 rounded"></div>
            <div className="skeleton-base h-4 w-1/2 rounded"></div>
            <div className="skeleton-base h-4 w-2/3 rounded"></div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`rounded-full bg-primary-600 animate-bounce ${
                    size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  role="status"
                  aria-label="Loading"
                ></div>
              ))}
            </div>
            {message && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {message}
              </p>
            )}
          </div>
        );

      case 'pulse':
        return (
          <div className="flex flex-col items-center gap-3">
            <div className={`rounded-full bg-primary-600 animate-pulse ${
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
            }`} role="status" aria-label="Loading">
              <span className="sr-only">Loading...</span>
            </div>
            {message && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {message}
              </p>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className="flex flex-col items-center gap-3 w-full max-w-md">
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full animate-shimmer progress-animate"></div>
            </div>
            {message && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {message}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const content = <LoadingContent />;

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
        <div className="flex flex-col items-center gap-3 p-6">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export interface ErrorStateProps {
  error: Error | string | null;
  severity?: ErrorSeverity;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
  icon?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  severity = 'error',
  title,
  message,
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  dismissText = 'Dismiss',
  icon,
  className = '',
  showIcon = true,
}) => {
  if (!error) return null;

  const errorString = typeof error === 'string' ? error : error.message;
  const errorMessage = message || errorString;

  const severityConfig = {
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: icon || <InformationCircleIcon className="w-5 h-5" />,
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      icon: icon || <ExclamationCircleIcon className="w-5 h-5" />,
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: icon || <ExclamationCircleIcon className="w-5 h-5" />,
    },
    critical: {
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-300 dark:border-red-700',
      textColor: 'text-red-900 dark:text-red-100',
      iconColor: 'text-red-700 dark:text-red-300',
      icon: icon || <ExclamationCircleIcon className="w-5 h-5" />,
    },
  };

  const config = severityConfig[severity];

  return (
    <div
      className={`
        p-4 rounded-xl border ${config.bgColor} ${config.borderColor}
        animate-fade-in-up ${className}
      `}
      role="alert"
      aria-live={severity === 'critical' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
            {config.icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-semibold text-sm mb-1 ${config.textColor}`}>
              {title}
            </h3>
          )}
          
          <p className={`text-sm leading-relaxed ${config.textColor}`}>
            {errorMessage}
          </p>

          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  icon={<InformationCircleIcon className="w-4 h-4" />}
                >
                  {retryText}
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                >
                  {dismissText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface AsyncBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onError?: (error: Error) => void;
  retryKey?: string;
}

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  fallback,
  errorFallback,
  onError,
  retryKey,
}) => {
  const [state, setState] = useState<{
    status: 'idle' | 'loading' | 'error' | 'success';
    error: Error | null;
  }>({
    status: 'idle',
    error: null,
  });

  const handleRetry = useCallback(() => {
    setState({ status: 'idle', error: null });
  }, []);

  const _handleError = useCallback((error: Error) => {
    setState({ status: 'error', error });
    onError?.(error);
  }, [onError]);

  useEffect(() => {
    if (state.status === 'error' && retryKey) {
      // Reset state when retryKey changes
      setState({ status: 'idle', error: null });
    }
  }, [retryKey, state.status]);

  if (state.status === 'loading') {
    return <>{fallback || <LoadingState isLoading={true} />}</>;
  }

  if (state.status === 'error') {
    return (
      <>
        {errorFallback || (
          <ErrorState
            error={state.error}
            onRetry={handleRetry}
            title="Something went wrong"
            message="Please try again or contact support if the problem persists."
          />
        )}
      </>
    );
  }

  return <>{children}</>;
};



export default LoadingState;