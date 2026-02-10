import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import ChevronLeftIcon from '../icons/ChevronLeftIcon';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type BackButtonVariant = 'primary' | 'green' | 'custom';
export type BackButtonTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface BackButtonProps {
  label?: string;
  onClick: () => void | Promise<void>;
  variant?: BackButtonVariant;
  className?: string;
  ariaLabel?: string;
  /** Show tooltip on hover/focus */
  tooltip?: string;
  tooltipPosition?: BackButtonTooltipPosition;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Disabled state with reason tooltip */
  disabled?: boolean;
  disabledReason?: string;
  /** Show success checkmark briefly after click */
  showSuccess?: boolean;
  successDuration?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<BackButtonVariant, string> = {
  primary: 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300',
  green: 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300',
  custom: ''
};

const sizeClasses = {
  sm: { icon: 'w-4 h-4', text: 'text-sm', gap: 'gap-1.5' },
  md: { icon: 'w-5 h-5', text: 'text-base', gap: 'gap-2' },
  lg: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-2.5' },
};

const BackButton: React.FC<BackButtonProps> = ({
  label = 'Kembali',
  onClick,
  variant = 'primary',
  className = '',
  ariaLabel,
  tooltip,
  tooltipPosition = 'bottom',
  isLoading = false,
  disabled = false,
  disabledReason,
  showSuccess = false,
  successDuration = 2000,
  size = 'md',
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { onTap } = useHapticFeedback();

  const hasTooltip = Boolean(tooltip) && !isLoading && !isSuccessVisible && !disabled;
  const hasDisabledReason = Boolean(disabledReason) && disabled;

  useEffect(() => {
    if (showSuccess) {
      setIsSuccessVisible(true);
      
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      
      successTimeoutRef.current = setTimeout(() => {
        setIsSuccessVisible(false);
      }, successDuration);
    }

    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [showSuccess, successDuration]);

  const showTooltipFn = useCallback(() => {
    if (!isSuccessVisible && !disabled) {
      setIsTooltipVisible(true);
    }
  }, [isSuccessVisible, disabled]);

  const hideTooltip = useCallback(() => {
    setIsTooltipVisible(false);
  }, []);

  const handleClick = useCallback(async () => {
    if (disabled || isLoading) return;
    
    onTap();
    
    try {
      await onClick();
    } catch (error) {
      console.error('BackButton click error:', error);
    }
  }, [onClick, disabled, isLoading, onTap]);

  const handleMouseDown = () => {
    if (!disabled && !isLoading) {
      setIsPressed(true);
    }
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTap();
      handleClick();
    }
  };

  const tooltipText = isSuccessVisible ? 'Berhasil!' : (tooltip || label);

  const ariaAttr = ariaLabel || `Navigasi kembali ke ${label}`;
  const computedAriaLabel = isLoading 
    ? `${ariaAttr} - Memuat` 
    : isSuccessVisible 
      ? `${ariaAttr} - Berhasil` 
      : ariaAttr;

  const baseClasses = "font-medium flex items-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 rounded-lg relative group overflow-visible";
  
  const motionClasses = prefersReducedMotion 
    ? "" 
    : "hover:translate-x-[-6px] active:translate-x-[-2px]";
  
  const pressClasses = isPressed && !prefersReducedMotion ? "scale-95" : "";
  
  const loadingClasses = isLoading ? "cursor-wait opacity-70" : "";
  
  const disabledClasses = disabled ? "cursor-not-allowed opacity-50" : "";

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size].gap}
    ${motionClasses}
    ${pressClasses}
    ${loadingClasses}
    ${disabledClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const tooltipPositionClasses: Record<BackButtonTooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const tooltipArrowClasses: Record<BackButtonTooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={hasTooltip ? showTooltipFn : undefined}
      onMouseLeave={hasTooltip ? hideTooltip : undefined}
      onFocus={hasTooltip ? showTooltipFn : undefined}
      onBlur={hasTooltip ? hideTooltip : undefined}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      disabled={disabled || isLoading}
      aria-label={computedAriaLabel}
      aria-describedby={hasTooltip ? tooltipId : undefined}
      aria-busy={isLoading}
      aria-live="polite"
      className={classes}
    >
      <span 
        className={`relative flex items-center justify-center ${sizeClasses[size].icon} ${prefersReducedMotion ? '' : 'transition-transform duration-200'} ${!isLoading && !isSuccessVisible ? 'group-hover:-translate-x-1' : ''}`}
        aria-hidden="true"
      >
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        {isSuccessVisible && !isLoading && (
          <span className={`absolute inset-0 flex items-center justify-center ${prefersReducedMotion ? '' : 'animate-in fade-in zoom-in duration-200'}`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
        <span
          className={`${prefersReducedMotion ? '' : 'transition-all duration-200'} ${
            isLoading || isSuccessVisible 
              ? 'opacity-0 scale-50' 
              : 'opacity-100 scale-100'
          }`}
        >
          <ChevronLeftIcon className="w-full h-full" />
        </span>
      </span>
      <span className={`${sizeClasses[size].text} ${isLoading || isSuccessVisible ? 'opacity-70' : ''}`}>
        {label}
      </span>
      {(hasTooltip || isSuccessVisible) && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none
            transition-all duration-200 ease-out
            ${isSuccessVisible ? 'bg-green-600 dark:bg-green-500 text-white' : 'bg-neutral-800 dark:bg-neutral-700 text-white'}
            ${tooltipPositionClasses[tooltipPosition]}
            ${isTooltipVisible || isSuccessVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `.replace(/\s+/g, ' ').trim()}
        >
          {tooltipText}
          <span
            className={`
              absolute w-2 h-2 rotate-45
              ${isSuccessVisible ? 'bg-green-600 dark:bg-green-500' : 'bg-neutral-800 dark:bg-neutral-700'}
              ${tooltipArrowClasses[tooltipPosition]}
            `.replace(/\s+/g, ' ').trim()}
            aria-hidden="true"
          />
        </span>
      )}
      {hasDisabledReason && (
        <span
          className={`
            absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700
            rounded-lg shadow-lg whitespace-nowrap pointer-events-none
            transition-all duration-200
            ${tooltipPositionClasses[tooltipPosition]}
            opacity-0 invisible group-hover:opacity-100 group-hover:visible
          `.replace(/\s+/g, ' ').trim()}
        >
          {disabledReason}
          <span
            className={`
              absolute w-2 h-2 bg-neutral-800 dark:bg-neutral-700 rotate-45
              ${tooltipArrowClasses[tooltipPosition]}
            `.replace(/\s+/g, ' ').trim()}
            aria-hidden="true"
          />
        </span>
      )}
      <span 
        className={`absolute inset-0 rounded-lg bg-current opacity-0 transition-opacity duration-150 ${disabled || isLoading ? '' : 'group-active:opacity-10'}`} 
        aria-hidden="true" 
      />
    </button>
  );
};

export default BackButton;
