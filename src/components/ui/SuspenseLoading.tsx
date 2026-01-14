
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
      className={`flex flex-col justify-center items-center ${containerClasses[size]} space-y-3 animate-pulse ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={`${skeletonClasses[size]} bg-neutral-200 dark:bg-neutral-700`}
        aria-hidden="true"
      />
      <p className={`${textSizeClasses[size]} text-neutral-500 dark:text-neutral-400 font-medium`}>
        {message}
      </p>
    </div>
  );
};

export default SuspenseLoading;
