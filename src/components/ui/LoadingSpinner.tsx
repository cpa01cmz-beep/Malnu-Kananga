import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'neutral' | 'success' | 'error';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary-600',
    neutral: 'border-neutral-600',
    success: 'border-green-600',
    error: 'border-red-600'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80% dark:bg-neutral-900/80% z-50'
    : 'flex flex-col items-center justify-center';

  if (fullScreen || text) {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div 
            className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
            role="status"
            aria-label={text || "Loading"}
          >
            <span className="sr-only">Loading...</span>
          </div>
          {text && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;