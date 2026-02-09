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
  const colorClasses = {
    primary: 'border-primary-600',
    neutral: 'border-neutral-600',
    success: 'border-green-600',
    error: 'border-red-600'
  };

  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/80% dark:bg-neutral-900/80% z-50 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center';

  if (fullScreen || text) {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="flex flex-col items-center gap-4">
          {/* Enhanced spinner with dots */}
          <div className="flex items-center gap-1">
            <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
            <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
            <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}></div>
          </div>
          {text && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-fade-in font-medium">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Simple spinner for inline use
  return (
    <div className={`${className} inline-flex items-center`}>
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.15s] mx-1`}></div>
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;