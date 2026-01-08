import React from 'react';

export type ProgressBarSize = 'sm' | 'md' | 'lg' | 'xl';
export type ProgressBarColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'purple' | 'indigo' | 'orange' | 'red' | 'blue' | 'green';
export type ProgressBarVariant = 'default' | 'striped' | 'animated';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: ProgressBarSize;
  color?: ProgressBarColor;
  variant?: ProgressBarVariant;
  showLabel?: boolean;
  label?: string;
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-valuenow'?: number;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
}

const sizeClasses: Record<ProgressBarSize, string> = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
  xl: 'h-6',
};

const sizeWidthClasses: Record<ProgressBarSize, string> = {
  sm: 'w-16',
  md: 'w-20',
  lg: 'w-24',
  xl: 'w-full',
};

const colorClasses: Record<ProgressBarColor, string> = {
  primary: 'bg-primary-600 dark:bg-primary-400',
  secondary: 'bg-neutral-600 dark:bg-neutral-400',
  success: 'bg-green-600 dark:bg-green-500',
  error: 'bg-red-600 dark:bg-red-500',
  warning: 'bg-yellow-600 dark:bg-yellow-500',
  info: 'bg-blue-600 dark:bg-blue-500',
  purple: 'bg-purple-600 dark:bg-purple-500',
  indigo: 'bg-indigo-600 dark:bg-indigo-500',
  orange: 'bg-orange-600 dark:bg-orange-500',
  red: 'bg-red-600 dark:bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
};

const stripedPattern = `
  linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  )
`;

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  variant = 'default',
  showLabel = false,
  label,
  fullWidth = true,
  className = '',
  'aria-label': ariaLabel,
  'aria-valuenow': ariaValueNow,
  'aria-valuemin': ariaValueMin = 0,
  'aria-valuemax': ariaValueMax = 100,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const widthClass = fullWidth ? 'w-full' : sizeWidthClasses[size];
  const backgroundSize = '1rem 1rem';

  const fillStyle = variant === 'striped' || variant === 'animated' ? {
    backgroundImage: stripedPattern,
    backgroundSize,
    ...(variant === 'animated' ? { animation: 'progress-bar-stripes 1s linear infinite' } : {}),
  } : {};

  return (
    <div className={className}>
      <div
        className={`${widthClass} bg-neutral-200 dark:bg-neutral-700 rounded-full ${sizeClasses[size]} overflow-hidden`}
        role="progressbar"
        aria-label={ariaLabel || label}
        aria-valuenow={ariaValueNow ?? value}
        aria-valuemin={ariaValueMin}
        aria-valuemax={ariaValueMax}
      >
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ${
            variant === 'animated' ? 'animate-progress-stripes' : ''
          }`}
          style={{
            width: `${percentage}%`,
            ...fillStyle,
          }}
        >
          {size === 'xl' && showLabel && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-neutral-800 dark:text-neutral-100">
              {label || `${Math.round(percentage)}%`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
