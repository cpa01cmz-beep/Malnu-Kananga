/**
 * Skeleton Provider and Context
 * Automatic skeleton loading states for async operations
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import EnhancedSkeleton, { SkeletonVariant } from './EnhancedSkeleton';

interface SkeletonConfig {
  variant: SkeletonVariant;
  lines?: number;
  height?: string;
  width?: string;
  className?: string;
}

interface SkeletonContextType {
  isLoading: boolean;
  loadingConfig: SkeletonConfig | null;
  startLoading: (config: SkeletonConfig) => void;
  stopLoading: () => void;
}

const SkeletonContext = createContext<SkeletonContextType | undefined>(undefined);

interface SkeletonProviderProps {
  children: ReactNode;
}

export const SkeletonProvider: React.FC<SkeletonProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState<SkeletonConfig | null>(null);

  const startLoading = useCallback((config: SkeletonConfig) => {
    setLoadingConfig(config);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setTimeout(() => setLoadingConfig(null), 300); // Keep skeleton visible briefly for smooth transition
  }, []);

  const value = {
    isLoading,
    loadingConfig,
    startLoading,
    stopLoading,
  };

  return (
    <SkeletonContext.Provider value={value}>
      {children}
    </SkeletonContext.Provider>
  );
};

export const useSkeleton = () => {
  const context = useContext(SkeletonContext);
  if (context === undefined) {
    throw new Error('useSkeleton must be used within a SkeletonProvider');
  }
  return context;
};

interface SkeletonBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  config?: SkeletonConfig;
  showWhenLoading?: boolean;
}

export const SkeletonBoundary: React.FC<SkeletonBoundaryProps> = ({
  children,
  fallback,
  config = { variant: 'text', lines: 3 },
  showWhenLoading = true,
}) => {
  const { isLoading } = useSkeleton();

  if (isLoading && showWhenLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <EnhancedSkeleton {...config} />;
  }

  return <>{children}</>;
};

// Higher-order component for automatic skeleton loading
export const withSkeleton = <P extends object>(
  Component: React.ComponentType<P>,
  skeletonConfig: SkeletonConfig
) => {
  const WithSkeletonComponent = (props: P & { isLoading?: boolean }) => {
    const { isLoading: propIsLoading, ...rest } = props;
    
    if (propIsLoading) {
      return <EnhancedSkeleton {...skeletonConfig} />;
    }
    
    return <Component {...(rest as P)} />;
  };

  WithSkeletonComponent.displayName = `withSkeleton(${Component.displayName || Component.name})`;
  
  return WithSkeletonComponent;
};

// Hook for async operations with automatic skeleton states
export const useAsyncSkeleton = <T,>(
  asyncFn: () => Promise<T>,
  config: SkeletonConfig
) => {
  const { startLoading, stopLoading } = useSkeleton();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    try {
      startLoading(config);
      setError(null);
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      stopLoading();
    }
  }, [asyncFn, config, startLoading, stopLoading]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    error,
    execute,
    reset,
    isLoading: false, // Loading state is managed by context
  };
};

// Component presets for common use cases
export const SkeletonPresets = {
  // Dashboard skeletons
  dashboardCard: { variant: 'card' as SkeletonVariant, lines: 4, className: 'mb-4' },
  dashboardStats: { variant: 'dashboard' as SkeletonVariant },
  dashboardChart: { variant: 'chart' as SkeletonVariant, height: '300px' },
  
  // Form skeletons
  formField: { variant: 'form' as SkeletonVariant, lines: 1 },
  fullForm: { variant: 'form' as SkeletonVariant, lines: 6 },
  
  // List skeletons
  listItems: { variant: 'list' as SkeletonVariant, lines: 5 },
  notifications: { variant: 'notification' as SkeletonVariant, lines: 3 },
  
  // Content skeletons
  article: { variant: 'card' as SkeletonVariant, lines: 8 },
  searchResults: { variant: 'search-result' as SkeletonVariant, lines: 4 },
  
  // Data skeletons
  table: { variant: 'table' as SkeletonVariant, lines: 5 },
  calendar: { variant: 'calendar' as SkeletonVariant },
  
  // Simple skeletons
  avatar: { variant: 'avatar' as SkeletonVariant, height: '40px', width: '40px' },
  button: { variant: 'rectangular' as SkeletonVariant, height: '40px', width: '120px' },
  input: { variant: 'rectangular' as SkeletonVariant, height: '48px' },
};

export default SkeletonContext;