import { useState, useCallback, useRef } from 'react';
import { PROGRESSIVE_LOADING_CONFIG } from '../constants';

/**
 * Progressive Loading System
 * Implements optimistic UI updates, lazy loading, and perceived performance optimizations
 */

interface ProgressiveLoadingOptions {
  // Loading strategy
  strategy?: 'skeleton' | 'placeholder' | 'spinner' | 'optimistic';
  
  // Timing options
  delay?: number; // Minimum loading time to prevent flicker
  timeout?: number; // Maximum loading time
  
  // Progressive content loading
  priority?: 'high' | 'medium' | 'low';
  chunkSize?: number; // For paginated content
  loadThreshold?: number; // Intersection observer threshold
  
  // Optimistic UI
  optimisticData?: unknown;
  rollbackOnError?: boolean;
  
  // Callbacks
  onLoadStart?: () => void;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: (data: unknown) => void;
  onLoadError?: (error: Error) => void;
}

interface ProgressiveLoadingReturn<T> {
  // State
  isLoading: boolean;
  isLoaded: boolean;
  hasError: boolean;
  error: Error | null;
  data: T | null;
  progress: number;
  
  // Controls
  load: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  
  // UI helpers
  shouldShowSkeleton: boolean;
  shouldShowContent: boolean;
  shouldShowError: boolean;
}

export const useProgressiveLoading = <T = unknown>(
  loader: () => Promise<T>,
  options: ProgressiveLoadingOptions = {}
): ProgressiveLoadingReturn<T> => {
  const {
    strategy = 'skeleton',
    delay = PROGRESSIVE_LOADING_CONFIG.DEFAULT_DELAY,
    timeout = PROGRESSIVE_LOADING_CONFIG.DEFAULT_TIMEOUT,
    optimisticData,
    rollbackOnError = true,
    onLoadStart,
    onLoadComplete,
    onLoadError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>((optimisticData as T | null) ?? null);
  const [progress, setProgress] = useState(0);
  
  const loadingStartTime = useRef<number>(0);
  const loadingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minimumLoadingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const resetState = useCallback(() => {
    setIsLoading(false);
    setIsLoaded(false);
    setHasError(false);
    setError(null);
    setProgress(0);
    
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
      loadingTimeout.current = null;
    }
    
    if (minimumLoadingTimeout.current) {
      clearTimeout(minimumLoadingTimeout.current);
      minimumLoadingTimeout.current = null;
    }
    
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
  }, []);

  const load = useCallback(async () => {
    if (isLoading) return;
    
    resetState();
    setIsLoading(true);
    loadingStartTime.current = Date.now();
    
    // Create new abort controller
    abortController.current = new AbortController();
    
    // Set up timeout
    loadingTimeout.current = setTimeout(() => {
      if (abortController.current) {
        abortController.current.abort();
      }
      setError(new Error('Loading timeout'));
      setHasError(true);
      setIsLoading(false);
      onLoadError?.(new Error('Loading timeout'));
    }, timeout);
    
    // Set up minimum loading time
    minimumLoadingTimeout.current = setTimeout(() => {
      if (!hasError) {
        // Minimum loading time completed, can show content
        setIsLoaded(true);
      }
    }, delay);
    
    try {
      onLoadStart?.();
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 30;
          return Math.min(next, 90);
        });
      }, PROGRESSIVE_LOADING_CONFIG.PROGRESS_INTERVAL);
      
      const result = await loader();
      
      // Clear progress interval
      clearInterval(progressInterval);
      setProgress(100);
      
      // Cancel timeout
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }
      
      // Update data
      setData(result);
      setError(null);
      setHasError(false);
      
      // Wait for minimum loading time if needed
      const elapsed = Date.now() - loadingStartTime.current;
      if (elapsed < delay) {
        await new Promise(resolve => setTimeout(resolve, delay - elapsed));
      }
      
      setIsLoading(false);
      setIsLoaded(true);
      onLoadComplete?.(result);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      
      // Clear timeout
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }
      
      setError(error);
      setHasError(true);
      setIsLoading(false);
      
      // Rollback to optimistic data if available
      if (rollbackOnError && optimisticData) {
        setData(optimisticData as T | null);
      }
      
      onLoadError?.(error);
    } finally {
      // Clear minimum loading timeout
      if (minimumLoadingTimeout.current) {
        clearTimeout(minimumLoadingTimeout.current);
        minimumLoadingTimeout.current = null;
      }
    }
  }, [
    loader,
    isLoading,
    hasError,
    delay,
    timeout,
    optimisticData,
    rollbackOnError,
    onLoadStart,
    onLoadComplete,
    onLoadError,
    resetState,
  ]);

  const retry = useCallback(() => {
    return load();
  }, [load]);

  const reset = useCallback(() => {
    resetState();
    setData((optimisticData as T | null) ?? null);
  }, [resetState, optimisticData]);

  // UI helpers
  const shouldShowSkeleton = isLoading && strategy === 'skeleton';
  const shouldShowContent = isLoaded && !hasError;
  const shouldShowError = hasError;

  return {
    isLoading,
    isLoaded,
    hasError,
    error,
    data,
    progress,
    load,
    retry,
    reset,
    shouldShowSkeleton,
    shouldShowContent,
    shouldShowError,
  };
};

// Optimistic UI hook
export const useOptimisticUI = <T = unknown>(
  initialValue: T,
  onCommit: (value: T) => Promise<void>,
  onRollback?: (value: T) => void
) => {
  const [value, setValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const [optimisticValue, setOptimisticValue] = useState<T | null>(null);

  const update = useCallback(async (newValue: T) => {
    setIsPending(true);
    setOptimisticValue(newValue);
    
    try {
      await onCommit(newValue);
      setValue(newValue);
      setOptimisticValue(null);
    } catch (error) {
      // Rollback on error
      setOptimisticValue(null);
      onRollback?.(value);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [value, onCommit, onRollback]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setOptimisticValue(null);
    setIsPending(false);
  }, [initialValue]);

  return {
    value: optimisticValue ?? value,
    setValue: update,
    reset,
    isPending,
    isOptimistic: !!optimisticValue,
  };
};

export default useProgressiveLoading;