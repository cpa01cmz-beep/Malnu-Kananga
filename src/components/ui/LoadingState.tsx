import React, { ReactNode } from 'react';
import Button from './Button';
import { CardSkeleton, ListItemSkeleton, TableSkeleton } from './Skeleton';
import { AlertCircleIcon } from '../icons/StatusIcons';
import { UI_STRINGS } from '../../constants';

export type LoadingStateSize = 'sm' | 'md' | 'lg';
export type LoadingStateType = 'page' | 'section' | 'inline' | 'table' | 'list';
export type LoadingStateVariant = 'card' | 'list' | 'table' | 'custom';

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRetry?: () => void;
  type?: LoadingStateType;
  variant?: LoadingStateVariant;
  size?: LoadingStateSize;
  rows?: number;
  cols?: number;
  count?: number;
  children: ReactNode;
  className?: string;
}

export interface SuggestedAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
}

export interface EmptyStateProps {
  message: string;
  submessage?: string;
  subMessage?: string;
  title?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  suggestedActions?: SuggestedAction[];
  size?: LoadingStateSize;
  variant?: 'default' | 'minimal' | 'illustrated';
  ariaLabel?: string;
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  size?: LoadingStateSize;
}

const sizeClasses: Record<LoadingStateSize, string> = {
  sm: 'p-4 text-sm',
  md: 'p-8 text-base',
  lg: 'p-12 text-lg',
};

const iconSizeClasses: Record<LoadingStateSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  submessage,
  subMessage,
  title,
  icon,
  action,
  suggestedActions,
  size = 'md',
  variant = 'default',
  ariaLabel
}) => {
  const variantClasses = {
    default: 'text-center py-12',
    minimal: 'text-left py-8',
    illustrated: 'text-center py-16'
  };

  const ariaProps: Record<string, string> = {};
  if (ariaLabel) {
    ariaProps['aria-label'] = ariaLabel;
  }

  return (
    <div
      className={`${sizeClasses[size]} ${variantClasses[variant]} mobile-spacing-enhanced`}
      role="status"
      aria-live="polite"
      {...ariaProps}
    >
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
        {icon && (
          <div className={`${iconSizeClasses[size]} text-neutral-400 dark:text-neutral-500 animate-fade-in hover-lift-enhanced p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 glass-effect`}>
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white animate-fade-in typography-headline text-contrast-enhanced">
            {title}
          </h3>
        )}
        <p className="text-neutral-600 dark:text-neutral-400 font-medium animate-fade-in text-center leading-relaxed typography-body">
          {message}
        </p>
        {(submessage || subMessage) && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-fade-in text-center leading-relaxed typography-small">
            {submessage || subMessage}
          </p>
        )}
        {action && (
          <Button
            variant="primary"
            onClick={action.onClick}
            size={size === 'lg' ? 'lg' : 'md'}
            className="touch-manipulation haptic-feedback mobile-touch-target hover-lift-enhanced"
          >
            {action.label}
          </Button>
        )}
        {suggestedActions && suggestedActions.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-3 mt-4"
            role="group"
            aria-label="Aksi yang disarankan"
          >
            {suggestedActions.map((suggestedAction, index) => (
              <Button
                key={index}
                variant={suggestedAction.variant || 'secondary'}
                onClick={() => {
                  suggestedAction.onClick();
                  // Haptic feedback
                  if ('vibrate' in navigator && window.innerWidth <= 768) {
                    navigator.vibrate(10);
                  }
                }}
                size={size === 'lg' ? 'lg' : 'md'}
                icon={suggestedAction.icon}
                iconPosition="left"
                className="touch-manipulation haptic-feedback mobile-touch-target hover-lift-enhanced"
              >
                {suggestedAction.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  size = 'md'
}) => (
  <div className={`${sizeClasses[size]} text-center mobile-spacing-enhanced`} role="alert" aria-live="assertive">
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
      <div className={`${iconSizeClasses[size]} text-red-500 dark:text-red-400 p-4 rounded-full bg-red-100 dark:bg-red-900/30 animate-fade-in hover-lift-enhanced`}>
        <AlertCircleIcon />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white animate-fade-in typography-headline">
          Terjadi Kesalahan
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 animate-fade-in text-center leading-relaxed typography-body">
          {message}
        </p>
      </div>
      {onRetry && (
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
          <Button
            variant="primary"
            onClick={() => {
              onRetry();
              // Haptic feedback for retry
              if ('vibrate' in navigator && window.innerWidth <= 768) {
                navigator.vibrate([15, 5, 15]);
              }
            }}
            size={size === 'lg' ? 'lg' : 'md'}
            className="touch-manipulation haptic-feedback mobile-touch-target hover-lift-enhanced"
          >
            Coba Lagi
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            size={size === 'lg' ? 'lg' : 'md'}
            className="touch-manipulation haptic-feedback mobile-touch-target"
          >
            Muat Ulang Halaman
          </Button>
        </div>
      )}
    </div>
  </div>
);

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error = null,
  empty = false,
  emptyMessage = 'Tidak ada data',
  emptyIcon,
  onRetry,
  type = 'section',
  variant = 'card',
  size = 'md',
  rows = 5,
  cols = 4,
  count = 3,
  children,
  className = ''
}) => {
  const containerClasses = `
    ${className}
  `.replace(/\s+/g, ' ').trim();

  if (error) {
    return (
      <div className={containerClasses} role="alert" aria-live="polite">
        <ErrorState message={error} onRetry={onRetry} size={size} />
      </div>
    );
  }

  if (isLoading) {
    switch (type) {
      case 'page':
        return (
          <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <PageLoadingState _variant={variant} count={count} />
            </div>
          </main>
        );

      case 'table':
        return (
          <div className={containerClasses} role="status" aria-live="polite" aria-busy="true">
            <TableSkeleton rows={rows} cols={cols} />
          </div>
        );

      case 'list':
        return (
          <div className={`${containerClasses} space-y-3`} role="status" aria-live="polite" aria-busy="true">
            {Array.from({ length: count }).map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        );

      case 'inline':
        return (
          <div className={containerClasses} role="status" aria-live="polite" aria-busy="true">
            <InlineLoadingState size={size} />
          </div>
        );

      case 'section':
      default:
        return (
          <div className={containerClasses} role="status" aria-live="polite" aria-busy="true">
            <SectionLoadingState variant={variant} count={count} />
          </div>
        );
    }
  }

  if (empty) {
    return (
      <div className={containerClasses}>
        <EmptyState
          message={emptyMessage}
          icon={emptyIcon}
          size={size}
        />
      </div>
    );
  }

  return <>{children}</>;
};

const PageLoadingState: React.FC<{ _variant: LoadingStateVariant; count: number }> = ({
  _variant,
  count
}) => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4" aria-hidden="true"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" aria-hidden="true"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

const SectionLoadingState: React.FC<{ variant: LoadingStateVariant; count: number }> = ({
  variant,
  count
}) => {
  switch (variant) {
    case 'list':
      return (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      );
    case 'table':
      return <TableSkeleton rows={count} cols={4} />;
    case 'card':
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
  }
};

const InlineLoadingState: React.FC<{ size: LoadingStateSize }> = ({ size }) => {
  const spinnerSize = size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md';
  const textClass = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base';

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const loadingMessages = [
    UI_STRINGS.LOADING,
    'Sedang diproses...',
    'Mohon tunggu...',
    'Sedang mengambil data...'
  ];

  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="relative">
        <svg
          className={`animate-spin ${sizeClasses[spinnerSize]} text-primary-600`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="status"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {/* Animated rings */}
        <div className="absolute inset-0 animate-ping">
          <div className={`${sizeClasses[spinnerSize]} rounded-full border-2 border-primary-200 dark:border-primary-800 opacity-75`}></div>
        </div>
      </div>
      <span className={`${textClass} text-neutral-600 dark:text-neutral-400 animate-fade-in text-center leading-relaxed`}>
        {loadingMessages[messageIndex]}
      </span>
      {/* Progress dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 bg-primary-400 dark:bg-primary-600 rounded-full animate-pulse`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s'
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
};

export { LoadingState, EmptyState, ErrorState };

export { LoadingState as default };
