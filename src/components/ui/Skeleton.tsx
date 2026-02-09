import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer';
  lines?: number;
  animated?: boolean;
}

const baseClasses = "bg-neutral-200 dark:bg-neutral-700";
const animationClasses = {
  pulse: "animate-pulse",
  wave: "animate-wave",
  shimmer: "animate-shimmer",
};

const variantClasses: Record<'text' | 'rectangular' | 'circular' | 'rounded', string> = {
  text: "rounded",
  rectangular: "rounded-lg",
  circular: "rounded-full",
  rounded: "rounded-lg",
};

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  lines = 1,
  animated = true,
}) => {
  const isWave = animation === 'wave';
  const isShimmer = animation === 'shimmer';
  const backgroundClass = isWave
    ? 'bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700 skeleton-wave'
    : isShimmer
    ? 'bg-gradient-to-r from-transparent via-neutral-100/50 to-transparent dark:from-transparent dark:via-neutral-600/50 dark:to-transparent skeleton-shimmer'
    : baseClasses;

  const classes = `
    ${backgroundClass}
    ${variantClasses[variant]}
    ${animated ? animationClasses[animation] : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" role="presentation" aria-label="Loading content">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${backgroundClass} ${variantClasses[variant]} ${animated ? animationClasses[animation] : ''}`}
            style={{
              ...style,
              height: style.height || '1rem',
              width: index === lines - 1 ? '70%' : style.width || '100%',
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    style.height = style.height || '1rem';
  }

  return <div className={classes} style={Object.keys(style).length > 0 ? style : undefined} role="presentation" aria-label="Loading content" />;
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
    <Skeleton variant="rectangular" height="200" className="w-full" />
    <div className="p-6 space-y-4">
      <Skeleton variant="text" height={28} className="w-3/4" />
      <Skeleton variant="text" height={20} className="w-full" />
      <Skeleton variant="text" height={20} className="w-5/6" />
    </div>
  </div>
);

export const ListItemSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-4 p-4 ${className}`}>
    <Skeleton variant="circular" width={48} height={48} />
    <div className="flex-1 space-y-3">
      <Skeleton variant="text" height={20} className="w-1/3" />
      <Skeleton variant="text" height={16} className="w-2/3" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="w-full space-y-3">
    <div className="flex gap-4 p-4 border-b border-neutral-200 dark:border-neutral-700">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} variant="text" height={20} className="flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" height={16} className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const DashboardCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 p-6 space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="text" height={20} className="w-20" />
    </div>
    <Skeleton variant="text" height={32} className="w-1/2" />
    <Skeleton variant="text" height={16} className="w-3/4" />
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({ fields = 3, className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton variant="text" height={16} className="w-1/4" />
        <Skeleton variant="rectangular" height={48} className="w-full" />
      </div>
    ))}
    <Skeleton variant="rectangular" height={48} className="w-32" />
  </div>
);

export const UserAvatarSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <Skeleton variant="circular" width={48} height={48} />
    <div className="space-y-2">
      <Skeleton variant="text" height={20} className="w-32" />
      <Skeleton variant="text" height={16} className="w-24" />
    </div>
  </div>
);

export const NewsCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
    <Skeleton variant="rectangular" height={200} className="w-full" />
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" height={16} className="w-20" />
        <Skeleton variant="text" height={16} className="w-16" />
      </div>
      <Skeleton variant="text" height={24} className="w-full" />
      <Skeleton variant="text" height={16} lines={3} className="w-full" />
    </div>
  </div>
);

export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="text" height={16} className="w-16" />
    </div>
    <Skeleton variant="text" height={32} className="w-24 mb-2" />
    <Skeleton variant="text" height={16} className="w-32" />
  </div>
);

export default Skeleton;
