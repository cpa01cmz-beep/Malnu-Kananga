import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
  ariaLabel?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  ariaLabel = 'Loading'
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-neutral-600',
    white: 'text-white',
    current: 'text-current'
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label={ariaLabel}
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={4}
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
  ariaLabel?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  ariaLabel = 'Loading'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-neutral-600',
    white: 'bg-white',
    current: 'bg-current'
  };

  return (
    <div
      className={`flex gap-1 ${className}`}
      aria-label={ariaLabel}
      role="status"
    >
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

interface LoadingBarProps {
  progress?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  ariaLabel?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress = 0,
  color = 'primary',
  size = 'md',
  className = '',
  showLabel = false,
  ariaLabel = 'Loading progress'
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    secondary: 'bg-neutral-600',
    success: 'bg-green-600',
    warning: 'bg-orange-600',
    danger: 'bg-red-600'
  };

  const bgColorClasses = {
    primary: 'bg-primary-100',
    secondary: 'bg-neutral-100',
    success: 'bg-green-100',
    warning: 'bg-orange-100',
    danger: 'bg-red-100'
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div
        className={`w-full ${sizeClasses[size]} ${bgColorClasses[color]} rounded-full overflow-hidden`}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded';

  const variantClasses = {
    text: 'h-4',
    rectangular: 'rounded-lg',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]}`}
            style={{
              ...style,
              width: i === lines - 1 ? '60%' : style.width || '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

interface FadeInProps {
  children: React.ReactNode;
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 'normal',
  delay = 0,
  direction = 'up',
  className = ''
}) => {
  const durationClasses = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-700'
  };

  const directionClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
    none: 'translate-0'
  };

  return (
    <div
      className={`
        animate-fade-in
        ${durationClasses[duration]}
        ${directionClasses[direction]}
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: 'fast' | 'normal' | 'slow';
  distance?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  duration = 'normal',
  distance = 'md',
  className = ''
}) => {
  const durationClasses = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-700'
  };

  const distanceClasses = {
    sm: {
      up: 'translate-y-2',
      down: '-translate-y-2',
      left: 'translate-x-2',
      right: '-translate-x-2'
    },
    md: {
      up: 'translate-y-8',
      down: '-translate-y-8',
      left: 'translate-x-8',
      right: '-translate-x-8'
    },
    lg: {
      up: 'translate-y-16',
      down: '-translate-y-16',
      left: 'translate-x-16',
      right: '-translate-x-16'
    }
  };

  return (
    <div
      className={`
        animate-slide-in
        ${durationClasses[duration]}
        ${distanceClasses[distance][direction]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  duration = 'normal',
  delay = 0,
  className = ''
}) => {
  const durationClasses = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-700'
  };

  return (
    <div
      className={`
        animate-scale-in
        ${durationClasses[duration]}
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface TransitionProps {
  children: React.ReactNode;
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  duration?: 'fast' | 'normal' | 'slow';
}

export const Transition: React.FC<TransitionProps> = ({
  children,
  show,
  enter = 'transition-all ease-out',
  enterFrom = 'opacity-0 translate-y-4',
  enterTo = 'opacity-100 translate-y-0',
  leave = 'transition-all ease-in',
  leaveFrom = 'opacity-100 translate-y-0',
  leaveTo = 'opacity-0 translate-y-4',
  duration = 'normal'
}) => {
  const durationClasses = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-700'
  };

  const [isVisible, setIsVisible] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const classes = `
    ${isVisible ? `${enter} ${enterFrom}` : `${leave} ${leaveFrom}`}
    ${durationClasses[duration]}
    ${show ? enterTo : leaveTo}
  `;

  return <div className={classes}>{isVisible || show ? children : null}</div>;
};