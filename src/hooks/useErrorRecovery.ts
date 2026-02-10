import React from 'react';
import type { ErrorMessageProps } from '../components/ui/ErrorMessage';

// Hook for error handling with recovery
export const useErrorRecovery = (error: Error | null, retryAction?: () => void) => {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleRetry = React.useCallback(async () => {
    if (!retryAction || isRetrying) return;

    setIsRetrying(true);
    try {
      await retryAction();
      setRetryCount(0);
    } catch (_err) {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  }, [retryAction, isRetrying]);

  const getErrorType = (error: Error): ErrorMessageProps['errorType'] => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('permission') || message.includes('unauthorized')) return 'permission';
    if (message.includes('not found') || message.includes('404')) return 'not-found';
    if (message.includes('validation') || message.includes('invalid')) return 'validation';
    if (message.includes('server') || message.includes('500')) return 'server';
    
    return 'generic';
  };

  return {
    isRetrying,
    retryCount,
    handleRetry,
    errorType: error ? getErrorType(error) : 'generic',
    canRetry: !!retryAction && retryCount < 3,
  };
};

export default useErrorRecovery;
