import React, { useState, useCallback, useRef, useId } from 'react';

export type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  icon: React.ReactNode;
  ariaLabel: string;
  tooltip?: string;
  tooltipPosition?: IconButtonTooltipPosition;
  /** Reason shown in tooltip when button is disabled */
  disabledReason?: string;
}

const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed relative group ripple-effect icon-hover hover-lift-premium focus-visible-enhanced mobile-touch-target haptic-feedback button-enhanced glass-effect";

const variantClasses: Record<IconButtonVariant, string> = {
  default: "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-primary-500/50 hover:scale-110 active:scale-95 focus-visible-enhanced glass-effect focus-indicator-enhanced",
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-sm hover:shadow-lg hover:scale-[1.05] active:scale-95 glass-effect-elevated",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:scale-[1.05] active:scale-95 glass-effect",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 focus:ring-red-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 focus:ring-green-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 focus:ring-blue-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/50 focus:ring-orange-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-neutral-500/50 hover:scale-[1.05] active:scale-95 focus-indicator-enhanced",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "p-3 min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px]",
  md: "p-3 min-w-[48px] min-h-[48px]",
  lg: "p-4 min-w-[52px] min-h-[52px] sm:min-w-[56px] sm:min-h-[56px]",
};

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: "w-5 h-5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const IconButton: React.FC<IconButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  ariaLabel,
  tooltip,
  tooltipPosition = 'bottom',
  disabledReason,
  className = '',
  disabled,
  ...props
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const hasTooltip = Boolean(tooltip);
  const hasDisabledReason = Boolean(disabledReason) && disabled;

  const showTooltip = useCallback(() => setIsTooltipVisible(true), []);
  const hideTooltip = useCallback(() => setIsTooltipVisible(false), []);

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const tooltipPositionClasses: Record<IconButtonTooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const tooltipArrowClasses: Record<IconButtonTooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <button
      ref={buttonRef}
      className={classes}
      aria-label={ariaLabel}
      aria-describedby={hasTooltip ? tooltipId : undefined}
      onMouseEnter={hasTooltip ? showTooltip : undefined}
      onMouseLeave={hasTooltip ? hideTooltip : undefined}
      onFocus={hasTooltip ? showTooltip : undefined}
      onBlur={hasTooltip ? hideTooltip : undefined}
      {...props}
    >
      <span className={iconSizeClasses[size]} aria-hidden="true">
        {icon}
      </span>
      {hasTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700
            rounded-md shadow-lg whitespace-nowrap pointer-events-none
            transition-all duration-200 ease-out
            ${tooltipPositionClasses[tooltipPosition]}
            ${isTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `.replace(/\s+/g, ' ').trim()}
        >
          {tooltip}
          <span
            className={`
              absolute w-2 h-2 bg-neutral-800 dark:bg-neutral-700 rotate-45
              ${tooltipArrowClasses[tooltipPosition]}
            `.replace(/\s+/g, ' ').trim()}
            aria-hidden="true"
          />
        </span>
      )}
      {/* Tooltip for disabled state */}
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
    </button>
  );
};

export default IconButton;
