import React, { ReactNode } from 'react';
import Button from './Button';
import { CardSkeleton, ListItemSkeleton, TableSkeleton } from './Skeleton';
import { AlertCircleIcon } from '../icons/StatusIcons';
import { UI_STRINGS } from '../../constants';

export type LoadingStateSize = 'sm' | 'md' | 'lg';
export type LoadingStateType = 'page' | 'section' | 'inline' | 'table' | 'list';
export type LoadingStateVariant = 'card' | 'list' | 'table' | 'custom';
export type ProgressType = 'indeterminate' | 'determinate' | 'pulse' | 'shimmer';

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
  progress?: number; // 0-100 for determinate progress
  progressType?: ProgressType;
  progressMessage?: string;
  showEta?: boolean;
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
  variant?: 'default' | 'minimal' | 'illustrated' | 'friendly' | 'guidance';
  ariaLabel?: string;
  illustration?: ReactNode;
  helpText?: string;
  tips?: string[];
  category?: 'no-data' | 'no-results' | 'no-network' | 'first-time' | 'maintenance' | 'custom';
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

// Progress Indicator Component
const ProgressIndicator: React.FC<{
  progress?: number;
  type?: ProgressType;
  size?: LoadingStateSize;
  message?: string;
  showEta?: boolean;
}> = ({ progress = 0, type = 'indeterminate', size = 'md', message, showEta = false }) => {
  const progressSize = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  if (type === 'pulse') {
    return (
      <div className="flex justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    );
  }

  if (type === 'shimmer') {
    return (
      <div className="flex justify-center">
        <div className="w-12 h-12 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
      </div>
    );
  }

  if (type === 'determinate' && progress > 0) {
    return (
      <div className="w-full max-w-xs mx-auto space-y-3">
        <div className={`w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden ${progressSize}`}>
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {message || `Memproses... ${Math.round(progress)}%`}
          </div>
          {showEta && progress > 0 && (
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Perkiraan waktu: {Math.ceil((100 - progress) / 10)} detik
            </div>
          )}
        </div>
      </div>
    );
  }

  // Indeterminate (default)
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-neutral-200 dark:border-neutral-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 animate-pulse">
          {message}
        </div>
      )}
    </div>
  );
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
  ariaLabel,
  illustration,
  helpText,
  tips,
  category = 'custom'
}) => {
  const variantClasses = {
    default: 'text-center py-12',
    minimal: 'text-left py-8',
    illustrated: 'text-center py-16',
    friendly: 'text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl',
    guidance: 'text-center py-16'
  };

  const ariaProps: Record<string, string> = {};
  if (ariaLabel) {
    ariaProps['aria-label'] = ariaLabel;
  }

  // Category-specific configurations
  const categoryConfig = {
    'no-data': {
      defaultIcon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      defaultTitle: 'Tidak Ada Data',
      color: 'text-blue-500 dark:text-blue-400'
    },
    'no-results': {
      defaultIcon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      defaultTitle: 'Tidak Ada Hasil',
      color: 'text-amber-500 dark:text-amber-400'
    },
    'no-network': {
      defaultIcon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      defaultTitle: 'Tidak Ada Koneksi',
      color: 'text-red-500 dark:text-red-400'
    },
    'first-time': {
      defaultIcon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      defaultTitle: 'Pertama Kali?',
      color: 'text-green-500 dark:text-green-400'
    },
    'maintenance': {
      defaultIcon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      defaultTitle: 'Dalam Perbaikan',
      color: 'text-purple-500 dark:text-purple-400'
    },
    'custom': {
      defaultIcon: null,
      defaultTitle: null,
      color: 'text-neutral-500 dark:text-neutral-400'
    }
  };

  const config = categoryConfig[category];
  const displayIcon = icon || illustration || config.defaultIcon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className={`${sizeClasses[size]} ${variantClasses[variant]} mobile-spacing-enhanced`}
      role="status"
      aria-live="polite"
      {...ariaProps}
    >
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
        {displayIcon && (
          <div className={`${iconSizeClasses[size]} ${config.color} animate-fade-in hover-lift-enhanced p-6 rounded-2xl bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 glass-effect`}>
            {displayIcon}
          </div>
        )}
        {displayTitle && (
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white animate-fade-in typography-headline text-contrast-enhanced">
            {displayTitle}
          </h3>
        )}
        <p className="text-neutral-600 dark:text-neutral-400 font-medium animate-fade-in text-center leading-relaxed typography-body">
          {message}
        </p>
        
        {/* Help text */}
        {helpText && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 max-w-sm">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              {helpText}
            </p>
          </div>
        )}

        {(submessage || subMessage) && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-fade-in text-center leading-relaxed typography-small">
            {submessage || subMessage}
          </p>
        )}

        {/* Tips section */}
        {tips && tips.length > 0 && (
          <div className="text-left bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 max-w-sm">
            <h4 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2 text-sm">Tips:</h4>
            <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
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
            aria-label="Coba lagi memuat data"
            shortcut="Ctrl+R"
            size={size === 'lg' ? 'lg' : 'md'}
            className="touch-manipulation haptic-feedback mobile-touch-target hover-lift-enhanced"
          >
            Coba Lagi
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            aria-label="Muat ulang halaman"
            shortcut="Ctrl+Shift+R"
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
  progress = 0,
  progressType = 'indeterminate',
  progressMessage,
  showEta = false,
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
            {progressType === 'determinate' && progress > 0 ? (
              <ProgressIndicator 
                progress={progress}
                type={progressType}
                size={size}
                message={progressMessage}
                showEta={showEta}
              />
            ) : (
              <SectionLoadingState variant={variant} count={count} />
            )}
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
