import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'inline' | 'card' | 'banner' | 'toast' | 'full-page' | 'modal';
  icon?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  retryAction?: {
    label: string;
    onRetry: () => void;
    loading?: boolean;
  };
  errorType?: 'network' | 'validation' | 'permission' | 'not-found' | 'server' | 'timeout' | 'generic';
  timestamp?: Date;
  correlationId?: string;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  variant = 'card' as const,
  icon,
  className = '',
  dismissible = false,
  onDismiss,
  actions,
  retryAction,
  errorType = 'generic' as const,
  timestamp,
  correlationId,
  showDetails = false,
  onToggleDetails,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [detailsVisible, setDetailsVisible] = React.useState(showDetails);
  
  React.useEffect(() => {
    if (variant === 'toast' && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [variant, isVisible, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleRetry = () => {
    retryAction?.onRetry();
  };

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible);
    onToggleDetails?.();
  };

  if (!isVisible && variant === 'toast') {
    return null;
  }

  const baseClasses = 'error-accessible micro-fade-in';
  
  const variantClasses = {
    card: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200',
    inline: 'text-red-700 dark:text-red-300 flex items-center gap-2 text-sm',
    banner: 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 flex items-start justify-between',
    toast: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg max-w-sm mx-auto micro-slide-down',
    'full-page': 'min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-8',
    'modal': 'bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-red-200 dark:border-red-800 p-6 max-w-lg w-full mx-auto'
  };

  // Error type specific configurations
  const errorTypeConfig = {
    network: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      title: 'Network Error',
      defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
    },
    validation: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Validation Error',
      defaultMessage: 'Please check your input and try again.',
    },
    permission: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Permission Denied',
      defaultMessage: 'You don\'t have permission to perform this action.',
    },
    'not-found': {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      title: 'Not Found',
      defaultMessage: 'The requested resource could not be found.',
    },
    server: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Server Error',
      defaultMessage: 'Something went wrong on our end. Please try again later.',
    },
    timeout: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Request Timeout',
      defaultMessage: 'The request took too long to complete. Please try again.',
    },
    generic: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Error',
      defaultMessage: 'An unexpected error occurred.',
    },
  };

  const config = errorTypeConfig[errorType];
  const defaultIcon = icon || config.icon;
  const defaultTitle = title === 'Error' ? config.title : title;

  // Recovery suggestions based on error type
  const getSuggestions = () => {
    switch (errorType) {
      case 'network':
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Contact your network administrator',
        ];
      case 'validation':
        return [
          'Review all form fields',
          'Check for required fields',
          'Ensure all data is in correct format',
        ];
      case 'permission':
        return [
          'Contact your administrator',
          'Request necessary permissions',
          'Try logging in again',
        ];
      case 'not-found':
        return [
          'Check the URL for typos',
          'Go back to the previous page',
          'Use the search function',
        ];
      case 'server':
      case 'timeout':
        return [
          'Try again in a few moments',
          'Refresh the page',
          'Contact support if the issue persists',
        ];
      default:
        return [
          'Try refreshing the page',
          'Check your internet connection',
          'Contact support if needed',
        ];
    }
  };

if (variant === 'inline') {
    return (
      <div className={`${baseClasses} ${variantClasses.inline} ${className}`} role="alert" aria-live="polite">
        {defaultIcon}
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  const content = (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className} relative`} role="alert" aria-live="assertive">
      <div className="flex items-start gap-3 flex-1">
        <div className="flex-shrink-0">
          {defaultIcon}
        </div>
        <div className="flex-1 min-w-0">
          {defaultTitle && (
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1 text-lg">
              {defaultTitle}
            </h3>
          )}
          <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed mb-3">
            {message}
          </p>
          
          {/* Recovery Actions */}
          <div className="space-y-3">
            {retryAction && (
              <button
                onClick={handleRetry}
                disabled={retryAction.loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors duration-200 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                {retryAction.loading && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {retryAction.label}
              </button>
            )}
            
            {actions && (
              <div className="flex gap-2 flex-wrap">
                {actions}
              </div>
            )}
            
            {/* Suggestions */}
            {!['inline', 'toast'].includes(variant) && (
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200 mb-2">What you can try:</p>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                  {getSuggestions().map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Error Details */}
            {(correlationId || timestamp) && (
              <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                <button
                  onClick={toggleDetails}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                >
                  {detailsVisible ? 'Hide' : 'Show'} technical details
                </button>
                {detailsVisible && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 space-y-1 font-mono">
                    {timestamp && (
                      <div>Time: {timestamp.toLocaleString()}</div>
                    )}
                    {correlationId && (
                      <div>ID: {correlationId}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Subtle animated border for emphasis */}
      {variant === 'card' && (
        <div className="absolute inset-0 rounded-xl border-2 border-red-300 dark:border-red-700 opacity-30 animate-pulse-slow pointer-events-none"></div>
      )}
    </div>
  );

  // Full page variant needs special layout
  if (variant === 'full-page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-8">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Enhanced error components for specific use cases
export const NetworkError: React.FC<Omit<ErrorMessageProps, 'errorType' | 'retryAction'> & { onRetry?: () => void }> = ({
  onRetry,
  ...props
}) => (
  <ErrorMessage
    {...props}
    errorType="network"
    retryAction={onRetry ? {
      label: 'Try Again',
      onRetry,
    } : undefined}
  />
);

export const ValidationError: React.FC<Omit<ErrorMessageProps, 'errorType'>> = (props) => (
  <ErrorMessage {...props} errorType="validation" />
);

export const PermissionError: React.FC<Omit<ErrorMessageProps, 'errorType'>> = (props) => (
  <ErrorMessage {...props} errorType="permission" />
);

export const NotFoundError: React.FC<Omit<ErrorMessageProps, 'errorType'>> = (props) => (
  <ErrorMessage {...props} errorType="not-found" />
);

export const ServerError: React.FC<Omit<ErrorMessageProps, 'errorType' | 'retryAction'> & { onRetry?: () => void }> = ({
  onRetry,
  ...props
}) => (
  <ErrorMessage
    {...props}
    errorType="server"
    retryAction={onRetry ? {
      label: 'Retry',
      onRetry,
    } : undefined}
  />
);

export const TimeoutError: React.FC<Omit<ErrorMessageProps, 'errorType' | 'retryAction'> & { onRetry?: () => void }> = ({
  onRetry,
  ...props
}) => (
  <ErrorMessage
    {...props}
    errorType="timeout"
    retryAction={onRetry ? {
      label: 'Retry',
      onRetry,
    } : undefined}
  />
);

// Full page error components
export const FullPageError: React.FC<Omit<ErrorMessageProps, 'variant'> & { onRetry?: () => void }> = ({
  onRetry,
  ...props
}) => (
  <ErrorMessage
    {...props}
    variant="full-page"
    retryAction={onRetry ? {
      label: 'Try Again',
      onRetry,
    } : undefined}
  />
);

export default ErrorMessage;