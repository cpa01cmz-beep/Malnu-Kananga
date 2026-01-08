import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, AlertCircle, X } from 'lucide-react';
import { ErrorState } from '../hooks/useErrorHandler';

interface ErrorFeedbackProps {
  errorState: ErrorState;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  errorState,
  onRetry,
  onDismiss,
  className = '',
}) => {
  if (!errorState.hasError || !errorState.feedback) {
    return null;
  }

  const { feedback } = errorState;

  const getIcon = () => {
    switch (feedback.type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getAlertClass = () => {
    switch (feedback.type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`rounded-md border p-4 ${getAlertClass()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {feedback.message}
          </p>
          
          {feedback.actions && feedback.actions.length > 0 && (
            <div className="mt-3 flex gap-2">
              {feedback.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {action.label === 'Coba Lagi' && <RefreshCw className="w-3 h-3 mr-1" />}
                  {action.label}
                </button>
              ))}
              {onRetry && !feedback.actions.some(a => a.label === 'Coba Lagi') && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Coba Lagi
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized error components for common scenarios
export const NetworkError: React.FC<{ onRetry?: () => void; className?: string }> = ({
  onRetry,
  className,
}) => (
  <ErrorFeedback
    errorState={{
      hasError: true,
      appError: null,
      feedback: {
        type: 'error',
        message: 'Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.',
        actions: onRetry ? [
          {
            label: 'Coba Lagi',
            action: onRetry,
            variant: 'primary',
          },
        ] : undefined,
      },
    }}
    className={className}
  />
);

export const OfflineIndicator: React.FC<{ className?: string }> = ({ className }) => (
  <ErrorFeedback
    errorState={{
      hasError: true,
      appError: null,
      feedback: {
        type: 'warning',
        message: 'Anda sedang offline. Data akan disimpan dan disinkronkan saat koneksi tersedia.',
      },
    }}
    className={className}
  />
);

export const PermissionError: React.FC<{ 
  permission?: string; 
  onContactAdmin?: () => void;
  className?: string;
}> = ({ permission, onContactAdmin, className }) => (
  <ErrorFeedback
    errorState={{
      hasError: true,
      appError: null,
      feedback: {
        type: 'error',
        message: permission 
          ? `Anda tidak memiliki izin ${permission} untuk melakukan tindakan ini.`
          : 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
        actions: onContactAdmin ? [
          {
            label: 'Hubungi Administrator',
            action: onContactAdmin,
          },
        ] : undefined,
      },
    }}
    className={className}
  />
);