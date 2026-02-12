import React, { useState, useCallback, useRef, useId, useEffect } from 'react';

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
  /** Show loading spinner instead of icon */
  isLoading?: boolean;
  /** Show success state with checkmark */
  showSuccess?: boolean;
  /** Duration to show success state in milliseconds */
  successDuration?: number;
  /** Show error state with X mark */
  showError?: boolean;
  /** Duration to show error state in milliseconds */
  errorDuration?: number;
  /**
   * Keyboard shortcut to display in tooltip (e.g., "Ctrl+K", "Esc", "Enter")
   * Improves UX by making keyboard shortcuts discoverable
   */
  shortcut?: string;
}

const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275) focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed relative group ripple-effect icon-hover hover-lift-premium focus-visible-enhanced mobile-touch-target haptic-feedback button-enhanced glass-effect";

const variantClasses: Record<IconButtonVariant, string> = {
  default: "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-primary-500/50 hover:scale-110 active:scale-95 active:bg-neutral-200 dark:active:bg-neutral-600 focus-visible-enhanced glass-effect focus-indicator-enhanced",
  primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500/50 shadow-sm hover:shadow-lg hover:scale-[1.05] active:scale-95 glass-effect-elevated",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 active:bg-neutral-100 dark:active:bg-neutral-600 focus:ring-primary-500/50 hover:scale-[1.05] active:scale-95 glass-effect",
  danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50 active:bg-red-300 dark:active:bg-red-700 focus:ring-red-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 active:bg-green-300 dark:active:bg-green-700 focus:ring-green-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 active:bg-blue-300 dark:active:bg-blue-700 focus:ring-blue-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  warning: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/50 active:bg-orange-300 dark:active:bg-orange-700 focus:ring-orange-500/50 hover:scale-[1.05] active:scale-95 glass-effect focus-indicator-enhanced",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 active:bg-neutral-200 dark:active:bg-neutral-600 focus:ring-neutral-500/50 hover:scale-[1.05] active:scale-95 focus-indicator-enhanced",
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
  isLoading = false,
  showSuccess = false,
  successDuration = 2000,
  showError = false,
  errorDuration = 2000,
  shortcut,
  className = '',
  disabled,
  ...props
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shortcutHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTooltip = Boolean(tooltip) && !isLoading && !isSuccessVisible && !isErrorVisible;
  const hasLoadingTooltip = isLoading && Boolean(tooltip);
  const hasDisabledReason = Boolean(disabledReason) && disabled;

  // Handle success state with auto-reset
  useEffect(() => {
    if (showSuccess) {
      setIsSuccessVisible(true);
      setIsErrorVisible(false);

      // Clear any existing timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      // Auto-reset success state after duration
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

  // Handle error state with auto-reset
  useEffect(() => {
    if (showError) {
      setIsErrorVisible(true);
      setIsSuccessVisible(false);

      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Auto-reset error state after duration
      errorTimeoutRef.current = setTimeout(() => {
        setIsErrorVisible(false);
      }, errorDuration);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [showError, errorDuration]);

  useEffect(() => {
    return () => {
      if (shortcutHintTimeoutRef.current) {
        clearTimeout(shortcutHintTimeoutRef.current);
      }
    };
  }, []);

  const showTooltip = useCallback(() => {
    setIsTooltipVisible(true);
    if (shortcut && !isLoading && !isSuccessVisible && !isErrorVisible) {
      shortcutHintTimeoutRef.current = setTimeout(() => {
        setShowShortcutHint(true);
      }, 400);
    }
  }, [shortcut, isLoading, isSuccessVisible, isErrorVisible]);

  const hideTooltip = useCallback(() => {
    setIsTooltipVisible(false);
    setShowShortcutHint(false);
    if (shortcutHintTimeoutRef.current) {
      clearTimeout(shortcutHintTimeoutRef.current);
      shortcutHintTimeoutRef.current = null;
    }
  }, []);

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${isLoading ? 'cursor-wait opacity-80' : ''}
    ${isSuccessVisible ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700' : ''}
    ${isErrorVisible ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700' : ''}
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
      disabled={disabled}
      aria-describedby={hasTooltip ? tooltipId : hasLoadingTooltip ? `${tooltipId}-loading` : undefined}
      aria-busy={isLoading}
      aria-live="polite"
      aria-label={isLoading ? `${ariaLabel} - Memuat` : isSuccessVisible ? `${ariaLabel} - Berhasil` : isErrorVisible ? `${ariaLabel} - Gagal` : shortcut ? `${ariaLabel} (${shortcut})` : ariaLabel}
      onMouseEnter={hasTooltip ? showTooltip : undefined}
      onMouseLeave={hasTooltip ? hideTooltip : undefined}
      onFocus={hasTooltip ? showTooltip : undefined}
      onBlur={hasTooltip ? hideTooltip : undefined}
      {...props}
    >
      <span className={`${iconSizeClasses[size]} relative flex items-center justify-center`} aria-hidden="true">
        {/* Loading Spinner */}
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
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Success Checkmark */}
        {isSuccessVisible && !isLoading && (
          <span className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-200">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}

        {/* Error X Mark */}
        {isErrorVisible && !isLoading && (
          <span className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-200">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
        )}

        {/* Original Icon */}
        <span
          className={`transition-all duration-200 ${
            isLoading || isSuccessVisible || isErrorVisible ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
          }`}
        >
          {icon}
        </span>
      </span>
      {hasTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700
            rounded-md shadow-lg whitespace-nowrap pointer-events-none
            transition-all duration-200 ease-out backdrop-blur-sm border border-neutral-700 dark:border-neutral-600
            ${tooltipPositionClasses[tooltipPosition]}
            ${isTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `.replace(/\s+/g, ' ').trim()}
        >
          <span className="flex items-center gap-2">
            <span>{tooltip}</span>
            {shortcut && (
              <kbd className="px-1.5 py-0.5 bg-neutral-600 dark:bg-neutral-600 rounded text-[10px] font-mono border border-neutral-500 shadow-sm">
                {shortcut}
              </kbd>
            )}
          </span>
          <span
            className={`
              absolute w-2 h-2 bg-neutral-800 dark:bg-neutral-700 rotate-45
              ${tooltipArrowClasses[tooltipPosition]}
            `.replace(/\s+/g, ' ').trim()}
            aria-hidden="true"
          />
        </span>
      )}
      {/* Tooltip for loading state */}
      {hasLoadingTooltip && (
        <span
          id={`${tooltipId}-loading`}
          role="status"
          aria-live="polite"
          className={`
            absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 dark:bg-blue-500
            rounded-md shadow-lg whitespace-nowrap pointer-events-none
            transition-all duration-200 ease-out backdrop-blur-sm border border-blue-500 dark:border-blue-400
            ${tooltipPositionClasses[tooltipPosition]}
            opacity-100 scale-100
          `.replace(/\s+/g, ' ').trim()}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span>Memuat...</span>
          </span>
          <span
            className={`
              absolute w-2 h-2 bg-blue-600 dark:bg-blue-500 rotate-45
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

      {showShortcutHint && shortcut && !isLoading && !isSuccessVisible && !isErrorVisible && (
        <div
          className={`
            absolute -top-9 left-1/2 -translate-x-1/2
            px-2.5 py-1
            bg-neutral-800 dark:bg-neutral-700
            text-white text-[10px] font-medium
            rounded-md shadow-md
            whitespace-nowrap
            transition-all duration-200 ease-out
            pointer-events-none
            z-50
            ${showShortcutHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
          `.replace(/\s+/g, ' ').trim()}
          role="tooltip"
          aria-hidden={!showShortcutHint}
        >
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">
              {shortcut}
            </kbd>
            <span>shortcut</span>
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
        </div>
      )}
    </button>
  );
};

export default IconButton;
