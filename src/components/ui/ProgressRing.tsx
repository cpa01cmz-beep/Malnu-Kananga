import React from 'react';

export interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  showPercentage?: boolean;
  animated?: boolean;
  label?: string;
}

const colorClasses = {
  primary: 'stroke-primary-500',
  success: 'stroke-green-500',
  warning: 'stroke-yellow-500',
  error: 'stroke-red-500',
  info: 'stroke-blue-500',
};

const bgColorsClasses = {
  primary: 'stroke-primary-200 dark:stroke-primary-800',
  success: 'stroke-green-200 dark:stroke-green-800',
  warning: 'stroke-yellow-200 dark:stroke-yellow-800',
  error: 'stroke-red-200 dark:stroke-red-800',
  info: 'stroke-blue-200 dark:stroke-blue-800',
};

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className = '',
  color = 'primary',
  showPercentage = true,
  animated = true,
  label,
}) => {
  const normalizedRadius = (size - strokeWidth) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="currentColor"
          className={`${bgColorsClasses[color]} opacity-30`}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress circle */}
        <circle
          stroke="currentColor"
          className={`${colorClasses[color]} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ 
            strokeDashoffset,
            strokeLinecap: 'round'
          }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className={`text-2xl font-bold ${
            color === 'primary' ? 'text-primary-600 dark:text-primary-400' :
            color === 'success' ? 'text-green-600 dark:text-green-400' :
            color === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
            color === 'error' ? 'text-red-600 dark:text-red-400' :
            'text-blue-600 dark:text-blue-400'
          }`}>
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center max-w-[80%]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;