import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProgressiveLoading } from '../../hooks/useProgressiveLoading';

// Progressive image loading component
interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkMxOC4yMDYxIDI2IDE2Ljc5MzkgMjQuNTg1OCAxNi41ODU4IDIyLjgxNDZDMTYuMzc3NyAyMS4wNDM0IDE3LjA0MzQgMTkuMzU1NCAxOC4zNTU0IDE4LjM1NTRDMTkuNjY3NCAxNy4zNTU0IDIxLjM1NTQgMTcuMDQzNCAyMi44MTQ2IDE4LjM1NTRDMjQuMjc3NyAxOS42Njc0IDI0LjU4NTggMjEuMzU1NCAyMi44MTQ2IDIyLjgxNDZDMjEuMDQzNCAyNC4yNzc3IDE4LjIwNjEgMjYgMjAgMjZaIiBmaWxsPSIjRDRENEY3Ii8+Cjwvc3ZnPgo=',
  className = '',
  onLoad,
  onError,
  lazy = true,
  priority = 'medium',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    
    img.src = src;
  }, [src, onLoad, onError]);

  const imageClasses = [
    'transition-all',
    'duration-500',
    'ease-out',
    isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm',
    className,
  ].filter(Boolean).join(' ');

  if (hasError) {
    const errorClasses = [
      'flex',
      'items-center',
      'justify-center',
      'bg-neutral-100',
      'dark:bg-neutral-800',
      'text-neutral-400',
      'dark:text-neutral-600',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={errorClasses}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className={['absolute', 'inset-0', 'bg-neutral-200', 'dark:bg-neutral-700', 'animate-pulse', className].filter(Boolean).join(' ')}
          aria-hidden="true"
        />
      )}
      
      {/* Image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={imageClasses}
        loading={lazy ? 'lazy' : 'eager'}
        decoding={priority === 'high' ? 'sync' : 'async'}
      />
    </div>
  );
};

// Progressive list component for large datasets
interface ProgressiveListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  threshold?: number;
  className?: string;
  loadingComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export const ProgressiveList = <T,>({
  items,
  renderItem,
  itemHeight = 60,
  containerHeight = 400,
  threshold = 0.5,
  className = '',
  loadingComponent,
  emptyComponent,
}: ProgressiveListProps<T>) => {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load initial items
  useEffect(() => {
    const initialCount = Math.min(20, items.length);
    setVisibleItems(items.slice(0, initialCount));
    setLoadedCount(initialCount);
  }, [items]);

  // Set up intersection observer for progressive loading
  useEffect(() => {
    if (!containerRef.current || loadedCount >= items.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          loadMoreItems();
        }
      },
      { threshold }
    );

    const sentinel = containerRef.current.querySelector('[data-sentinel]');
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadedCount, items.length, isLoading, threshold]);

  const loadMoreItems = useCallback(() => {
    if (isLoading || loadedCount >= items.length) return;

    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      const nextCount = Math.min(loadedCount + 20, items.length);
      const newItems = items.slice(loadedCount, nextCount);
      
      setVisibleItems(prev => [...prev, ...newItems]);
      setLoadedCount(nextCount);
      setIsLoading(false);
    }, 300);
  }, [isLoading, loadedCount, items]);

  if (items.length === 0) {
    return <>{emptyComponent || <div className="text-center p-8">No items found</div>}</>;
  }

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ minHeight: items.length * itemHeight }}>
        {visibleItems.map((item, index) => (
          <div 
            key={index} 
            style={{ height: itemHeight }}
            className="border-b border-neutral-100 dark:border-neutral-800"
          >
            {renderItem(item, index)}
          </div>
        ))}
        
        {/* Loading sentinel */}
        {loadedCount < items.length && (
          <div 
            data-sentinel
            style={{ height: itemHeight }}
            className="flex items-center justify-center"
          >
            {isLoading ? (
              loadingComponent || <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full" />
            ) : (
              <div className="text-neutral-400 text-sm">Loading more...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Progressive content wrapper
interface ProgressiveContentProps<T> {
  loader: () => Promise<T>;
  children: (data: T) => React.ReactNode;
  fallback?: React.ReactNode;
  errorComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  options?: {
    delay?: number;
    timeout?: number;
    strategy?: 'skeleton' | 'placeholder' | 'spinner';
  };
}

export const ProgressiveContent = <T,>({
  loader,
  children,
  fallback,
  errorComponent,
  loadingComponent,
  options = {},
}: ProgressiveContentProps<T>) => {
  const {
    shouldShowSkeleton,
    shouldShowContent,
    shouldShowError,
    data,
    error,
    load,
    retry,
  } = useProgressiveLoading(loader, options);

  useEffect(() => {
    load();
  }, [load]);

  if (shouldShowError) {
    return (
      <>
        {errorComponent || (
          <div className="text-center p-8">
            <div className="text-red-500 mb-2">Error loading content</div>
            <button 
              onClick={retry}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </>
    );
  }

  if (shouldShowSkeleton) {
    return (
      <>
        {loadingComponent || (
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        )}
      </>
    );
  }

  if (shouldShowContent && data) {
    return <>{children(data)}</>;
  }

  return <>{fallback}</>;
};

export default ProgressiveImage;