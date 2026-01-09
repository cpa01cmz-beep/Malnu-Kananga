import React from 'react';
import { ArrowPathIcon } from './icons/ArrowPathIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ErrorState } from '../hooks/useErrorHandler';

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

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
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon />;
      default:
        return <AlertTriangleIcon className="w-5 h-5 text-red-500" />;
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
              {feedback.actions.map((action: { label: string; action: () => void; variant?: string }, index: number) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  {action.label === 'Coba Lagi' && <ArrowPathIcon className="w-3 h-3 mr-1" />}
                  {action.label}
                </button>
              ))}
              {onRetry && !feedback.actions.some((a: { label: string; action: () => void; variant?: string }) => a.label === 'Coba Lagi') && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                >
                  <ArrowPathIcon className="w-3 h-3 mr-1" />
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
              <CloseIcon className="w-4 h-4" />
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