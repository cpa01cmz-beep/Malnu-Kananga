import React, { useEffect, useState } from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer';
  lines?: number;
  animated?: boolean;
  style?: React.CSSProperties;
  /**
   * Respect user's reduced motion preference.
   * When true (default), animations will be disabled if user prefers reduced motion.
   */
  respectReducedMotion?: boolean;
}

/**
 * Hook to detect if user prefers reduced motion
 * @returns boolean indicating if reduced motion is preferred
 */
const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: { matches: boolean }): void => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

const baseClasses = "bg-neutral-200 dark:bg-neutral-700 skeleton-enhanced";
const animationClasses = {
  pulse: "animate-pulse-slow skeleton-pulse-enhanced",
  wave: "animate-wave skeleton-wave-enhanced", 
  shimmer: "animate-shimmer skeleton-shimmer-enhanced",
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
  respectReducedMotion = true,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = animated && !(respectReducedMotion && prefersReducedMotion);

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
    ${shouldAnimate ? animationClasses[animation] : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="Memuat konten" aria-live="polite">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={`${backgroundClass} ${variantClasses[variant]} ${shouldAnimate ? animationClasses[animation] : ''}`}
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

  return <div className={classes} style={Object.keys(style).length > 0 ? style : undefined} role="status" aria-label="Memuat konten" aria-live="polite" />;
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 overflow-hidden group hover:shadow-lg transition-shadow duration-300 ${className}`}>
    <Skeleton variant="rectangular" height="200" className="w-full skeleton-shimmer-enhanced" />
    <div className="p-6 space-y-4">
      <Skeleton variant="text" height={28} className="w-3/4 skeleton-pulse-enhanced" />
      <Skeleton variant="text" height={20} className="w-full skeleton-wave-enhanced" />
      <Skeleton variant="text" height={20} className="w-5/6 skeleton-wave-enhanced" />
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

// Enhanced skeleton patterns for better UX
export const ChartSkeleton: React.FC<{ type?: 'bar' | 'line' | 'pie'; className?: string }> = ({ 
  type = 'bar', 
  className = '' 
}) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
    <Skeleton variant="text" height={24} className="w-1/3 mb-6" />
    {type === 'bar' && (
      <div className="flex items-end justify-between gap-2 h-48">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton 
            key={i} 
            variant="rectangular" 
            className="flex-1" 
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    )}
    {type === 'line' && (
      <div className="h-48 relative">
        <Skeleton variant="rectangular" height="100%" className="w-full" />
      </div>
    )}
    {type === 'pie' && (
      <div className="flex justify-center">
        <Skeleton variant="circular" width={192} height={192} />
      </div>
    )}
  </div>
);

export const SidebarSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 6, 
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" height={16} className="flex-1" />
      </div>
    ))}
  </div>
);

export const TabSkeleton: React.FC<{ tabs?: number; className?: string }> = ({ 
  tabs = 3, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-700 pb-2">
      {Array.from({ length: tabs }, (_, i) => (
        <Skeleton key={i} variant="text" height={32} className="w-20" />
      ))}
    </div>
    <Skeleton variant="rectangular" height={200} className="w-full" />
  </div>
);

export const ModalSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-6 max-w-md w-full ${className}`}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" height={24} className="w-2/3" />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <Skeleton variant="text" height={16} lines={3} />
      <div className="flex gap-3 justify-end">
        <Skeleton variant="rectangular" height={40} className="w-20" />
        <Skeleton variant="rectangular" height={40} className="w-24" />
      </div>
    </div>
  </div>
);

export const SearchSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    <Skeleton variant="rectangular" height={48} className="w-full rounded-xl" />
    <div className="space-y-2">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" height={16} className="flex-1" />
        </div>
      ))}
    </div>
  </div>
);

export const NotificationSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 4, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex gap-3 p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={16} className="w-3/4" />
          <Skeleton variant="text" height={14} className="w-full" />
        </div>
        <Skeleton variant="text" height={14} className="w-16" />
      </div>
    ))}
  </div>
);

// Enhanced skeleton with interactive micro-animations
export const InteractiveCardSkeleton: React.FC<{ className?: string; interactive?: boolean }> = ({ 
  className = '', 
  interactive = false 
}) => (
  <div className={`
    bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 overflow-hidden
    ${interactive ? 'group cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300' : ''}
    ${className}
  `}>
    <Skeleton 
      variant="rectangular" 
      height="200" 
      className="w-full skeleton-shimmer-enhanced group-hover:opacity-90 transition-opacity duration-200" 
    />
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton variant="circular" width={48} height={48} className="skeleton-pulse-enhanced" />
        <Skeleton variant="text" height={20} className="w-16 skeleton-wave-enhanced" />
      </div>
      <Skeleton variant="text" height={28} className="w-4/5 skeleton-pulse-enhanced" />
      <div className="space-y-2">
        <Skeleton variant="text" height={16} className="w-full skeleton-wave-enhanced" />
        <Skeleton variant="text" height={16} className="w-3/4 skeleton-wave-enhanced" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton variant="rectangular" height={32} className="w-20 skeleton-pulse-enhanced" />
        <Skeleton variant="rectangular" height={32} className="w-24 skeleton-pulse-enhanced" />
      </div>
    </div>
  </div>
);

// Progressive loading skeleton that simulates content loading
export const ProgressiveSkeleton: React.FC<{ 
  stage?: 'initial' | 'loading' | 'almost-done'; 
  className?: string 
}> = ({ stage = 'initial', className = '' }) => {
  const getOpacity = (index: number) => {
    switch (stage) {
      case 'initial': return 1;
      case 'loading': return index < 2 ? 0.7 : 0.4;
      case 'almost-done': return index === 0 ? 0.3 : index === 1 ? 0.6 : 0.9;
      default: return 1;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div 
          key={index} 
          className="transition-opacity duration-500"
          style={{ opacity: getOpacity(index) }}
        >
          <Skeleton 
            variant="rectangular" 
            height={60} 
            className="w-full skeleton-wave-enhanced" 
          />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
