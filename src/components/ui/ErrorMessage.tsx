import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'inline' | 'card' | 'banner' | 'toast';
  icon?: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  variant = 'card',
  icon,
  className = '',
  dismissible = false,
  onDismiss,
  actions
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
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

  if (!isVisible && variant === 'toast') {
    return null;
  }

  const baseClasses = 'error-accessible micro-fade-in';
  
  const variantClasses = {
    card: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200',
    inline: 'text-red-700 dark:text-red-300 flex items-center gap-2 text-sm',
    banner: 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 flex items-start justify-between',
    toast: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg max-w-sm mx-auto micro-slide-down'
  };

  const defaultIcon = icon || (
    <svg className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (variant === 'inline') {
    return (
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} role="alert" aria-live="polite">
        {defaultIcon}
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} role="alert" aria-live="assertive">
      <div className="flex items-start gap-3 flex-1">
        <div className="flex-shrink-0">
          {defaultIcon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1 text-lg">
              {title}
            </h3>
          )}
          <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
            {message}
          </p>
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
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
};

export default ErrorMessage;