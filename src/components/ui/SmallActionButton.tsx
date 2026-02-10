import React, { useState, useCallback, useRef, useId } from 'react';
import { XML_NAMESPACES } from '../../constants';

export type SmallActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning' | 'neutral';
export type SmallActionButtonTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface SmallActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SmallActionButtonVariant;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  tooltip?: string;
  tooltipPosition?: SmallActionButtonTooltipPosition;
}

const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm px-3 py-1.5 min-h-[44px] mobile-touch-target focus-visible-enhanced";

const variantClasses: Record<SmallActionButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:ring-primary-500/50",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 focus:ring-red-500/50",
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 focus:ring-green-500/50",
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:ring-blue-500/50",
  warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/50 focus:ring-orange-500/50",
  neutral: "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:ring-neutral-500/50",
};

const SmallActionButton: React.FC<SmallActionButtonProps> = ({
  variant = 'info',
  isLoading = false,
  loadingText,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  tooltip,
  tooltipPosition = 'bottom',
  className = '',
  disabled,
  ...props
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const hasTooltip = Boolean(tooltip);

  const showTooltip = useCallback(() => setIsTooltipVisible(true), []);
  const hideTooltip = useCallback(() => setIsTooltipVisible(false), []);

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${fullWidth ? 'flex-1' : ''}
    ${isLoading ? 'cursor-wait' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const ariaProps: Record<string, string | boolean | undefined> = {};
  
  if (isLoading) {
    ariaProps['aria-busy'] = 'true';
  }

  const tooltipPositionClasses: Record<SmallActionButtonTooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const tooltipArrowClasses: Record<SmallActionButtonTooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <button
      ref={buttonRef}
      className={`${classes} relative`}
      disabled={disabled || isLoading}
      aria-describedby={hasTooltip ? tooltipId : undefined}
      onMouseEnter={hasTooltip ? showTooltip : undefined}
      onMouseLeave={hasTooltip ? hideTooltip : undefined}
      onFocus={hasTooltip ? showTooltip : undefined}
      onBlur={hasTooltip ? hideTooltip : undefined}
      {...ariaProps}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 mr-1.5" xmlns={XML_NAMESPACES.SVG} fill="none" viewBox="0 0 24 24" role="status" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-1.5 flex items-center">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-1.5 flex items-center">{icon}</span>
          )}
        </>
      )}
      
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
    </button>
  );
};

export default SmallActionButton;
