import React, { useState, useEffect } from 'react';

interface OfflineIndicatorProps {
  showRetryButton?: boolean;
  onRetry?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showRetryButton = true,
  onRetry
}) => {
  const [_isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const showSuccessMessage = (message: string) => {
    // You can integrate with your toast notification system here
    console.log('Success:', message);
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(false);
      setRetryCount(0);

      // Show success message briefly
      showSuccessMessage('Koneksi internet tersambung kembali');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);

    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      window.location.reload();
    }
  };

  if (!showIndicator) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
            </svg>
            <span className="font-medium">Offline Mode</span>
          </div>

          <div className="hidden sm:block text-sm opacity-90">
            Beberapa fitur mungkin terbatas. Data akan disinkronisasi ketika koneksi tersedia.
          </div>
        </div>

        {showRetryButton && (
          <button
            onClick={handleRetry}
            className="bg-white text-yellow-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-500"
          >
            Coba Lagi {retryCount > 0 && `(${retryCount})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;