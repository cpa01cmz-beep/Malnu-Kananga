import React, { useState, useEffect, useCallback } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSaved?: Date;
  errorMessage?: string;
  className?: string;
  showTimestamp?: boolean;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'text-xs gap-1',
  md: 'text-sm gap-1.5',
};

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
};

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved,
  errorMessage,
  className = '',
  showTimestamp = true,
  size = 'sm',
}) => {
  const [displayStatus, setDisplayStatus] = useState(status);
  const [isVisible, setIsVisible] = useState(false);

  // Delayed status update for smoother transitions
  useEffect(() => {
    if (status === 'saved') {
      // Keep showing "saving" briefly before showing "saved"
      const timer = setTimeout(() => {
        setDisplayStatus('saved');
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (status === 'idle') {
      // Fade out after showing saved state
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setDisplayStatus(status);
      setIsVisible(true);
    }
  }, [status]);

  const formatTimestamp = useCallback((date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return 'baru saja';
    if (seconds < 60) return `${seconds}d yang lalu`;
    if (minutes < 60) return `${minutes}m yang lalu`;
    if (hours < 24) return `${hours}j yang lalu`;
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const getStatusContent = () => {
    switch (displayStatus) {
      case 'saving':
        return (
          <>
            <svg
              className={`${iconSizeClasses[size]} animate-spin text-primary-500`}
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-neutral-500 dark:text-neutral-400 animate-pulse">
              Menyimpan...
            </span>
          </>
        );

      case 'saved':
        return (
          <>
            <svg
              className={`${iconSizeClasses[size]} text-green-500 animate-success-pop`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Tersimpan
              {showTimestamp && lastSaved && (
                <span className="text-neutral-400 dark:text-neutral-500 ml-1">
                  ({formatTimestamp(lastSaved)})
                </span>
              )}
            </span>
          </>
        );

      case 'error':
        return (
          <>
            <svg
              className={`${iconSizeClasses[size]} text-red-500 animate-pulse-once`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-600 dark:text-red-400 font-medium" title={errorMessage}>
              Gagal menyimpan
            </span>
          </>
        );

      default:
        return null;
    }
  };

  if (displayStatus === 'idle' && !isVisible) {
    return null;
  }

  return (
    <div
      className={`
        inline-flex items-center ${sizeClasses[size]} 
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {getStatusContent()}
    </div>
  );
};

export default AutoSaveIndicator;
