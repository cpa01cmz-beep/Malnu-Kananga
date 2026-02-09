import React from 'react';

export type SuspenseLoadingSize = 'sm' | 'md' | 'lg';

export interface SuspenseLoadingProps {
  message?: string;
  size?: SuspenseLoadingSize;
  className?: string;
}

const SuspenseLoading: React.FC<SuspenseLoadingProps> = ({
  message = 'Memuat...',
  size = 'md',
  className = ''
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

  return (
    <div
      className={`flex flex-col justify-center items-center ${containerClasses[size]} space-y-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative">
        <div
          className={`${skeletonClasses[size]} bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 animate-shimmer`}
          aria-hidden="true"
        />
        <div className={`absolute inset-0 ${skeletonClasses[size]} rounded-xl border-2 border-neutral-100 dark:border-neutral-800 animate-pulse`} aria-hidden="true" />
        <div className={`absolute inset-2 ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-primary-100 dark:bg-primary-900/30 animate-pulse-slow`} aria-hidden="true" />
      </div>
      <p className={`${textSizeClasses[size]} text-neutral-500 dark:text-neutral-400 font-medium animate-fade-in-up`}>
        {message}
      </p>
    </div>
  );
};

export default SuspenseLoading;
