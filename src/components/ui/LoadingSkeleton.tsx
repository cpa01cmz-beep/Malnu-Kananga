import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  lines = 3, 
  height = '1rem',
  width,
  variant = 'text'
}) => {
  if (variant === 'circular') {
    return (
      <div 
        className={`skeleton-enhanced rounded-full ${className}`}
        style={{ width: width || height, height }}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div 
        className={`skeleton-enhanced rounded-lg ${className}`}
        style={{ width: width || '100%', height }}
      />
    );
  }

  // Default: text lines
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-enhanced h-4 rounded"
          style={{ 
            width: width || (i === lines - 1 ? '70%' : `${Math.random() * 30 + 70}%`),
            height: height || '1rem'
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;