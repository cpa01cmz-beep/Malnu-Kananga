import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

const baseClasses = "bg-neutral-200 dark:bg-neutral-700";
const animationClasses = {
  pulse: "animate-pulse",
  wave: "animate-wave",
};

const variantClasses: Record<'text' | 'rectangular' | 'circular', string> = {
  text: "rounded",
  rectangular: "rounded-lg",
  circular: "rounded-full",
};

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${animationClasses[animation]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return <div className={classes} style={style} aria-hidden="true" />;
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

export default Skeleton;
