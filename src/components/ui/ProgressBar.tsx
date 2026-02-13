import React, { useState, useCallback } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';

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
  /** Custom accessible description of the current value (e.g., "3 of 10 files uploaded") */
  'aria-valuetext'?: string;
  /** ID of element describing the progress bar for additional context */
  'aria-describedby'?: string;
  /** Show tooltip with exact percentage on hover */
  showTooltip?: boolean;
  /** Custom tooltip text. If not provided, shows percentage */
  tooltipText?: string;
  /** Whether the progress is in an indeterminate state (e.g., when total is unknown) */
  indeterminate?: boolean;
  /** Whether to announce progress changes to screen readers via aria-live region */
  announce?: boolean;
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
    rgba(var(--progress-bar-striped-overlay), 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(var(--progress-bar-striped-overlay), 0.15) 50%,
    rgba(var(--progress-bar-striped-overlay), 0.15) 75%,
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
  'aria-valuemax': ariaValueMax,
  'aria-valuetext': ariaValueText,
  'aria-describedby': ariaDescribedBy,
  showTooltip = true,
  tooltipText,
  indeterminate = false,
  announce = false,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const percentage = indeterminate ? 100 : Math.min(Math.max((value / max) * 100, 0), 100);
  const widthClass = fullWidth ? 'w-full' : sizeWidthClasses[size];
  const backgroundSize = '1rem 1rem';

  const fillStyle = variant === 'striped' || variant === 'animated' ? {
    backgroundImage: stripedPattern,
    backgroundSize,
    ...(variant === 'animated' && !prefersReducedMotion ? { animation: 'progress-bar-stripes 1s linear infinite' } : {}),
  } : {};

  const ariaValueMaxFinal = ariaValueMax ?? max;
  const isActive = value > 0 && value < max && !indeterminate;

  const handleMouseEnter = useCallback(() => setIsTooltipVisible(true), []);
  const handleMouseLeave = useCallback(() => setIsTooltipVisible(false), []);
  const handleFocus = useCallback(() => setIsTooltipVisible(true), []);
  const handleBlur = useCallback(() => setIsTooltipVisible(false), []);

  const displayText = tooltipText || `${Math.round(percentage)}%`;
  const accessibleDescription = ariaValueText || (indeterminate ? 'Progress in progress' : `${Math.round(percentage)}% complete`);

  return (
    <div className={`relative group ${className}`}>
      {announce && (
        <span
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="progressbar-live-region"
        >
          {accessibleDescription}
        </span>
      )}
      <div
        className={`${widthClass} bg-neutral-200 dark:bg-neutral-700 rounded-full ${sizeClasses[size]} overflow-hidden cursor-help`}
        role="progressbar"
        aria-label={ariaLabel || label}
        aria-valuenow={indeterminate ? undefined : (ariaValueNow ?? value)}
        aria-valuemin={ariaValueMin}
        aria-valuemax={ariaValueMaxFinal}
        aria-valuetext={indeterminate ? undefined : ariaValueText}
        aria-describedby={ariaDescribedBy}
        aria-busy={isActive ? 'true' : 'false'}
        data-indeterminate={indeterminate ? 'true' : 'false'}
        onMouseEnter={showTooltip ? handleMouseEnter : undefined}
        onMouseLeave={showTooltip ? handleMouseLeave : undefined}
        onFocus={showTooltip ? handleFocus : undefined}
        onBlur={showTooltip ? handleBlur : undefined}
        tabIndex={showTooltip ? 0 : undefined}
      >
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ${
            variant === 'animated' && !prefersReducedMotion ? 'animate-progress-stripes' : ''
          } ${indeterminate ? 'animate-pulse' : ''}`}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            ...fillStyle,
          }}
        >
          {size === 'xl' && showLabel && (
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-neutral-800 dark:text-neutral-100" aria-hidden="true">
              {label || (indeterminate ? 'Loading...' : `${Math.round(percentage)}%`)}
            </span>
          )}
        </div>
      </div>
      
      {/* Tooltip - Micro UX Delight: Shows exact percentage on hover/focus */}
      {showTooltip && (
        <span
          className={`
            absolute -top-9 left-1/2 -translate-x-1/2
            px-2.5 py-1
            bg-neutral-800 dark:bg-neutral-700
            text-white text-xs font-medium
            rounded-md shadow-lg
            whitespace-nowrap
            transition-all duration-200 ease-out
            pointer-events-none
            z-10
            ${isTooltipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
          `}
          role="tooltip"
          aria-hidden={!isTooltipVisible}
        >
          {displayText}
          {/* Tooltip arrow */}
          <span
            className="
              absolute top-full left-1/2 -translate-x-1/2
              border-4 border-transparent
              border-t-neutral-800 dark:border-t-neutral-700
            "
            aria-hidden="true"
          />
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
