import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'neutral' | 'success' | 'error';
  text?: string;
  fullScreen?: boolean;
  className?: string;
  variant?: 'dots' | 'pulse' | 'ring' | 'skeleton';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  fullScreen = false,
  className = '',
  variant = 'dots'
}) => {
  const colorClasses = {
    primary: 'bg-primary-500',
    neutral: 'bg-neutral-500',
    success: 'bg-green-500',
    error: 'bg-red-500'
  };

  const colorClassesBorder = {
    primary: 'border-primary-600',
    neutral: 'border-neutral-600',
    success: 'border-green-600',
    error: 'border-red-600'
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-neutral-900/90 z-50 backdrop-blur-md animate-fade-in'
    : 'flex flex-col items-center justify-center';

  const renderDots = () => (
    <div className="flex items-center gap-2">
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.32s] shadow-sm`}></div>
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce [animation-delay:-0.16s] shadow-sm`}></div>
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce shadow-sm`}></div>
    </div>
  );

  const renderPulse = () => (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse-slow shadow-lg`}></div>
  );

  const renderRing = () => (
    <div className={`${sizeClasses[size]} border-2 ${colorClassesBorder[color]} border-t-transparent rounded-full animate-spin shadow-sm`}></div>
  );

  const renderSkeleton = () => (
    <div className="flex gap-2">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded skeleton-shimmer`}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded skeleton-shimmer`} style={{ animationDelay: '0.2s' }}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded skeleton-shimmer`} style={{ animationDelay: '0.4s' }}></div>
    </div>
  );

  const getSpinner = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'ring':
        return renderRing();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderDots();
    }
  };

  if (fullScreen || text) {
    return (
      <div className={`${containerClasses} ${className}`}>
        <div className="flex flex-col items-center gap-6 animate-scale-in">
          {getSpinner()}
          {text && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-fade-in font-medium text-reveal max-w-xs text-center">
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
      {getSpinner()}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;