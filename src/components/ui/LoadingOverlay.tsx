import LoadingSpinner from './LoadingSpinner';

export type LoadingOverlaySize = 'sm' | 'md' | 'lg' | 'full';
export type LoadingOverlayVariant = 'default' | 'minimal' | 'centered';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  size?: LoadingOverlaySize;
  variant?: LoadingOverlayVariant;
  showBackdrop?: boolean;
  backdropBlur?: boolean;
  progress?: number;
  showProgress?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  size = 'md',
  variant = 'default',
  showBackdrop = true,
  backdropBlur = true,
  progress,
  showProgress = false,
  className = '',
  children,
}) => {
  if (!isLoading) return <>{children}</>;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
    full: 'p-16',
  };

  const _spinnerSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    full: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    full: 'text-xl',
  };

  const variantClasses = {
    default: 'flex items-center justify-center min-h-[200px]',
    minimal: 'flex items-center justify-center',
    centered: 'flex items-center justify-center fixed inset-0',
  };

  const backdropClasses = showBackdrop
    ? backdropBlur
      ? 'bg-black/50 backdrop-blur-sm'
      : 'bg-black/30'
    : '';

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-4 ${sizeClasses[size]}`}>
      <LoadingSpinner size={size as 'sm' | 'md' | 'lg'} className="text-primary-600" />
      
      {message && (
        <p className={`${textSizes[size]} text-neutral-600 dark:text-neutral-400 font-medium animate-pulse`}>
          {message}
        </p>
      )}
      
      {showProgress && progress !== undefined && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Progress</span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}
    </div>
  );

  if (variant === 'centered') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClasses}`}
        role="status"
        aria-live="polite"
        aria-busy={isLoading}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-float border border-neutral-200 dark:border-neutral-700">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${variantClasses[variant]} ${backdropClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      {content}
    </div>
  );
};

export default LoadingOverlay;