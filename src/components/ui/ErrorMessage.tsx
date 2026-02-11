import React from 'react';
import { ERROR_MESSAGE_CONFIG, RETRY_CONFIG } from '../../constants';

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
  userFriendlyMessage?: string;
  contextualHelp?: {
    title: string;
    content: string;
    link?: string;
  };
  severity?: 'low' | 'medium' | 'high' | 'critical';
  autoRetry?: {
    enabled: boolean;
    delay?: number;
    maxAttempts?: number;
  };
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
  userFriendlyMessage,
  contextualHelp,
  severity = 'medium',
  autoRetry,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [detailsVisible, setDetailsVisible] = React.useState(showDetails);
  const [retryCount, setRetryCount] = React.useState(0);
  const [timeToNextRetry, setTimeToNextRetry] = React.useState<number | null>(null);
  
  React.useEffect(() => {
    if (variant === 'toast' && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, ERROR_MESSAGE_CONFIG.EXTENDED_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [variant, isVisible, onDismiss]);

  // Auto-retry functionality
  React.useEffect(() => {
    if (autoRetry?.enabled && retryAction && retryCount < (autoRetry.maxAttempts || RETRY_CONFIG.MAX_ATTEMPTS)) {
      const delay = autoRetry.delay || ERROR_MESSAGE_CONFIG.DEFAULT_DELAY_MS;
      setTimeToNextRetry(delay / 1000);
      
      const countdown = setInterval(() => {
        setTimeToNextRetry(prev => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          }
          clearInterval(countdown);
          return null;
        });
      }, 1000);

      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        retryAction.onRetry();
      }, delay);

      return () => {
        clearTimeout(timer);
        clearInterval(countdown);
      };
    }
  }, [autoRetry, retryAction, retryCount]);

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
          'Periksa koneksi internet Anda',
          'Coba muat ulang halaman',
          'Hubungi administrator jaringan',
        ];
      case 'validation':
        return [
          'Periksa semua kolom form',
          'Cek field yang wajib diisi',
          'Pastikan semua data dalam format benar',
        ];
      case 'permission':
        return [
          'Hubungi administrator Anda',
          'Request permission yang diperlukan',
          'Coba login kembali',
        ];
      case 'not-found':
        return [
          'Periksa URL untuk kesalahan ketik',
          'Kembali ke halaman sebelumnya',
          'Gunakan fungsi pencarian',
        ];
      case 'server':
      case 'timeout':
        return [
          'Coba lagi beberapa saat lagi',
          'Muat ulang halaman',
          'Hubungi support jika masalah berlanjut',
        ];
      default:
        return [
          'Coba muat ulang halaman',
          'Periksa koneksi internet',
          'Hubungi support jika diperlukan',
        ];
    }
  };

  // Get user-friendly display message
  const getDisplayMessage = () => {
    if (userFriendlyMessage) return userFriendlyMessage;
    
    const userFriendlyMessages = {
      network: 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.',
      validation: 'Ada kesalahan dalam input Anda. Silakan periksa kembali.',
      permission: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
      'not-found': 'Halaman yang Anda cari tidak ditemukan.',
      server: 'Terjadi kesalahan di server kami. Silakan coba lagi nanti.',
      timeout: 'Permintaan terlalu lama. Silakan coba lagi.',
      generic: 'Terjadi kesalahan yang tidak terduga.',
    };
    
    return userFriendlyMessages[errorType] || message;
  };

  // Get severity color classes
  const getSeverityClasses = () => {
    const severityMap = {
      low: {
        border: 'border-amber-200 dark:border-amber-800',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-800 dark:text-amber-200',
        icon: 'text-amber-600'
      },
      medium: {
        border: 'border-red-200 dark:border-red-800',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-600'
      },
      high: {
        border: 'border-red-300 dark:border-red-700',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-900 dark:text-red-100',
        icon: 'text-red-700'
      },
      critical: {
        border: 'border-red-400 dark:border-red-600',
        bg: 'bg-red-200 dark:bg-red-900/40',
        text: 'text-red-900 dark:text-red-50',
        icon: 'text-red-800'
      }
    };
    
    return severityMap[severity];
  };

if (variant === 'inline') {
    return (
      <div className={`${baseClasses} ${variantClasses.inline} ${className}`} role="alert" aria-live="polite">
        {defaultIcon}
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }

  const severityClasses = getSeverityClasses();
  
  const content = (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className} relative`} role="alert" aria-live="assertive">
      {/* Severity indicator for critical/high errors */}
      {['high', 'critical'].includes(severity) && (
        <div className="absolute -top-2 -right-2">
          <div className={`w-3 h-3 rounded-full ${severity === 'critical' ? 'bg-red-600 animate-pulse' : 'bg-red-500'}`}></div>
        </div>
      )}
      
      <div className="flex items-start gap-3 flex-1">
        <div className="flex-shrink-0">
          {defaultIcon}
        </div>
        <div className="flex-1 min-w-0">
          {defaultTitle && (
            <h3 className={`font-semibold ${severityClasses.text} mb-1 text-lg`}>
              {defaultTitle}
            </h3>
          )}
          <p className={`${severityClasses.text} text-sm leading-relaxed mb-3`}>
            {getDisplayMessage()}
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
             
             {/* Contextual Help */}
             {contextualHelp && !['inline', 'toast'].includes(variant) && (
               <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                 <div className="flex items-start gap-2">
                   <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <div className="flex-1">
                     <p className="font-medium text-blue-800 dark:text-blue-200 text-sm">{contextualHelp.title}</p>
                     <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">{contextualHelp.content}</p>
                     {contextualHelp.link && (
                       <a 
                         href={contextualHelp.link} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-blue-600 dark:text-blue-400 text-xs hover:underline mt-1 inline-block"
                       >
                         Pelajari lebih lanjut →
                       </a>
                     )}
                   </div>
                 </div>
               </div>
             )}

             {/* Auto-retry countdown */}
             {autoRetry?.enabled && retryAction && retryCount < (autoRetry.maxAttempts || 3) && timeToNextRetry !== null && (
               <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                 <div className="flex items-center gap-2">
                   <svg className="w-4 h-4 text-amber-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                   </svg>
                   <div className="text-sm">
                     <p className="font-medium text-amber-800 dark:text-amber-200">Mencoba otomatis dalam {timeToNextRetry} detik...</p>
                     <p className="text-amber-700 dark:text-amber-300 text-xs">Percobaan ke-{retryCount + 1} dari {autoRetry.maxAttempts || 3}</p>
                   </div>
                 </div>
               </div>
             )}

             {/* Suggestions */}
             {!['inline', 'toast'].includes(variant) && (
               <div className="text-sm">
                 <p className={`font-medium ${severityClasses.text} mb-2`}>Yang dapat Anda coba:</p>
                 <ul className="list-disc list-inside space-y-1">
                   {getSuggestions().map((suggestion, index) => (
                     <li key={index} className={`${severityClasses.text} opacity-90`}>{suggestion}</li>
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