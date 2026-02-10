import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table' | 'avatar';
  animated?: boolean;
  shimmerColor?: string;
  baseColor?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  lines = 3, 
  height = '1rem',
  width,
  variant = 'text',
  animated = true,
  shimmerColor = 'rgba(255, 255, 255, 0.3)',
  baseColor = 'rgba(0, 0, 0, 0.1)',
  speed = 'normal'
}) => {
  const getAnimationClass = () => {
    if (!animated) return '';
    
    switch (speed) {
      case 'slow':
        return 'animate-shimmer-slow';
      case 'fast':
        return 'animate-shimmer-fast';
      default:
        return 'animate-shimmer';
    }
  };

  const getBaseClasses = () => {
    const baseClasses = 'relative overflow-hidden';
    const animationClass = getAnimationClass();
    return `${baseClasses} ${animationClass}`;
  };

  const getSkeletonStyle = () => ({
    backgroundColor: baseColor,
    backgroundImage: animated 
      ? `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`
      : 'none',
    backgroundSize: animated ? '200% 100%' : 'auto',
  });

  if (variant === 'avatar') {
    return (
      <div 
        className={`${getBaseClasses()} rounded-full ${className}`}
        style={{ 
          width: width || height, 
          height,
          ...getSkeletonStyle()
        }}
      />
    );
  }

  if (variant === 'circular') {
    return (
      <div 
        className={`${getBaseClasses()} rounded-full ${className}`}
        style={{ 
          width: width || height, 
          height,
          ...getSkeletonStyle()
        }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div 
        className={`${getBaseClasses()} rounded-lg ${className}`}
        style={{ 
          width: width || '100%', 
          height,
          ...getSkeletonStyle()
        }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Card header */}
        <div className="flex items-center space-x-4">
          <div 
            className={`${getBaseClasses()} rounded-full`}
            style={{ 
              width: '48px', 
              height: '48px',
              ...getSkeletonStyle()
            }}
          />
          <div className="flex-1 space-y-2">
            <div 
              className={`${getBaseClasses()} rounded-lg h-4`}
              style={{ 
                width: '60%',
                ...getSkeletonStyle()
              }}
            />
            <div 
              className={`${getBaseClasses()} rounded-lg h-3`}
              style={{ 
                width: '40%',
                ...getSkeletonStyle()
              }}
            />
          </div>
        </div>
        
        {/* Card content lines */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`${getBaseClasses()} rounded-lg h-4`}
              style={{ 
                width: i === lines - 1 ? '70%' : `${Math.random() * 30 + 70}%`,
                ...getSkeletonStyle()
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`header-${i}`}
              className={`${getBaseClasses()} rounded-lg h-6`}
              style={{ ...getSkeletonStyle() }}
            />
          ))}
        </div>
        
        {/* Table rows */}
        {Array.from({ length: lines }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`${getBaseClasses()} rounded-lg h-4`}
                style={{ ...getSkeletonStyle() }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Default: text lines
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${getBaseClasses()} rounded-lg h-4`}
          style={{ 
            width: width || (i === lines - 1 ? '70%' : `${Math.random() * 30 + 70}%`),
            height: height || '1rem',
            ...getSkeletonStyle()
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;