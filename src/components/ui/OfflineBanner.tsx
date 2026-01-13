import React from 'react';
import Button from './Button';
import { ArrowPathIcon } from '../icons/ArrowPathIcon';

export type OfflineBannerMode = 'offline' | 'slow' | 'both';

export interface OfflineBannerProps {
  mode: OfflineBannerMode;
  show: boolean;
  onRetry?: () => void;
  isRetryLoading?: boolean;
  syncStatus?: {
    needsSync: boolean;
    pendingActions: number;
    lastSync?: number;
  };
  onSync?: () => void;
  isSyncLoading?: boolean;
  cachedDataAvailable?: boolean;
  cachedDataInfo?: string;
  className?: string;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({
  mode,
  show,
  onRetry,
  isRetryLoading = false,
  syncStatus,
  onSync,
  isSyncLoading = false,
  cachedDataAvailable = false,
  cachedDataInfo,
  className = '',
}) => {
  if (!show) {
    return null;
  }

  const isOffline = mode === 'offline' || mode === 'both';
  const isSlow = mode === 'slow' || mode === 'both';

  const getVariant = () => {
    if (isOffline) return 'error';
    if (isSlow) return 'warning';
    return 'info';
  };

  const getMessage = () => {
    if (isOffline && isSlow) {
      return 'Anda sedang offline dengan koneksi lambat. Pastikan koneksi internet Anda aktif.';
    }
    if (isOffline) {
      return 'Anda sedang offline. Pastikan koneksi internet Anda aktif untuk melanjutkan.';
    }
    return 'Koneksi internet Anda lambat. Beberapa fitur mungkin tidak berjalan optimal.';
  };

  const getIcon = () => {
    if (isOffline) {
      return (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M12 3v9m0 0l-3-3m3 3l3-3M6 3v9a9 9 0 009 9" />
        </svg>
      );
    }
    if (isSlow) {
      return (
        <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return null;
  };

  const variant = getVariant();
  const message = getMessage();
  const icon = getIcon();

  const bgClasses = {
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  const textClasses = {
    error: 'text-red-900 dark:text-red-100',
    warning: 'text-yellow-900 dark:text-yellow-100',
    info: 'text-blue-900 dark:text-blue-100',
  };

  const subTextClasses = {
    error: 'text-red-700 dark:text-red-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    info: 'text-blue-700 dark:text-blue-300',
  };

  const iconBgClasses = {
    error: 'bg-red-100 dark:bg-red-900/50',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50',
    info: 'bg-blue-100 dark:bg-blue-900/50',
  };

  return (
    <div
      className={`
        w-full p-4 rounded-xl border mb-6 transition-all duration-200 ease-out
        ${bgClasses[variant]}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={`
              w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
              ${iconBgClasses[variant]}
            `}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${textClasses[variant]} mb-1`}>
            {isOffline ? 'Offline' : isSlow ? 'Koneksi Lambat' : 'Informasi'}
          </p>
          <p className={`text-sm ${subTextClasses[variant]} mb-2`}>
            {message}
          </p>
          {cachedDataAvailable && cachedDataInfo && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              📦 {cachedDataInfo}
            </p>
          )}
        </div>
        {onRetry && !isOffline && (
          <Button
            variant={variant === 'warning' ? 'warning' : 'info'}
            size="sm"
            onClick={onRetry}
            isLoading={isRetryLoading}
            icon={<ArrowPathIcon className="w-4 h-4" />}
            iconPosition="left"
          >
            Coba Lagi
          </Button>
        )}
      </div>

      {syncStatus && syncStatus.needsSync && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <ArrowPathIcon className={`w-5 h-5 flex-shrink-0 ${textClasses[variant]}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textClasses[variant]}`}>
                {syncStatus.pendingActions > 0
                  ? `${syncStatus.pendingActions} aksi pending perlu disinkronkan`
                  : 'Data perlu diperbarui'
                }
              </p>
              <p className={`text-xs ${subTextClasses[variant]}`}>
                Terakhir diperbarui: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleTimeString('id-ID') : 'Belum pernah'}
              </p>
            </div>
            {onSync && (
              <Button
                variant="blue-solid"
                size="sm"
                onClick={onSync}
                isLoading={isSyncLoading}
                icon={<ArrowPathIcon className="w-4 h-4" />}
                iconPosition="left"
              >
                Sinkronkan
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineBanner;
