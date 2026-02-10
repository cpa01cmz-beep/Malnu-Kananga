import React from 'react';

export type SuspenseLoadingSize = 'sm' | 'md' | 'lg';
export type SuspenseLoadingVariant = 'default' | 'shimmer' | 'dots';

export interface SuspenseLoadingProps {
  message?: string;
  size?: SuspenseLoadingSize;
  className?: string;
  variant?: SuspenseLoadingVariant;
}

const SuspenseLoading: React.FC<SuspenseLoadingProps> = ({
  message = 'Memuat...',
  size = 'md',
  className = '',
  variant = 'shimmer'
}) => {
  const containerClasses = {
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80',
  };

  const skeletonClasses = {
    sm: 'w-12 h-12 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-20 h-20 rounded-2xl',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const LoadingIcon = () => {
    if (variant === 'dots') {
      return (
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} 
                rounded-full bg-primary-500 animate-bounce`
              }
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'shimmer') {
      return (
        <div
          className={`${skeletonClasses[size]} bg-neutral-200 dark:bg-neutral-700 rounded-2xl relative overflow-hidden`}
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -translate-x-full animate-shimmer"
            style={{
              animation: 'shimmer 1.5s ease-in-out infinite'
            }}
          />
        </div>
      );
    }

    return (
      <div
        className={`${skeletonClasses[size]} bg-neutral-200 dark:bg-neutral-700 animate-pulse`}
        aria-hidden="true"
      />
    );
  };

  return (
    <div
      className={`flex flex-col justify-center items-center ${containerClasses[size]} space-y-4 ${className} animate-fade-in`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoadingIcon />
      <p className={`${textSizeClasses[size]} text-neutral-500 dark:text-neutral-400 font-medium animate-fade-in-up delay-200`}>
        {message}
      </p>
      <div className="w-16 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full animate-progress-fill" />
      </div>
    </div>
  );
};

export default SuspenseLoading;
