import { useState, useCallback } from 'react';
import { RETRY_CONFIG } from '../constants';

export type ErrorType = 'network' | 'validation' | 'permission' | 'not-found' | 'server' | 'timeout' | 'generic';

/**
 * Hook for error handling with recovery
 * Moved to separate file to comply with React Fast Refresh rules
 */
export const useErrorRecovery = (error: Error | null, retryAction?: () => void) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = useCallback(async () => {
    if (!retryAction || isRetrying) return;

    setIsRetrying(true);
    try {
      await retryAction();
      setRetryCount(0);
    } catch {
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  }, [retryAction, isRetrying]);

  const getErrorType = (err: Error): ErrorType => {
    const message = err.message.toLowerCase();
    
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
    canRetry: !!retryAction && retryCount < RETRY_CONFIG.MAX_ATTEMPTS,
  };
};

export default useErrorRecovery;
