import React, { useState, useCallback, useRef, useId } from 'react';

export type CopyButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost';
export type CopyButtonSize = 'sm' | 'md' | 'lg';
export type CopyButtonTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  text: string;
  variant?: CopyButtonVariant;
  size?: CopyButtonSize;
  tooltipPosition?: CopyButtonTooltipPosition;
  showTooltip?: boolean;
  successMessage?: string;
  resetDelay?: number;
  ariaLabel?: string;
  onCopied?: (success: boolean) => void;
}

const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";

const variantClasses: Record<CopyButtonVariant, string> = {
  default: "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-primary-500/50 hover:scale-110 active:scale-95",
  primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/50 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95",
  secondary: "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-2 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 focus:ring-primary-500/50 hover:scale-[1.02] active:scale-95",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200 focus:ring-neutral-500/50 hover:scale-[1.05] active:scale-95",
};

const sizeClasses: Record<CopyButtonSize, string> = {
  sm: "p-1",
  md: "p-2",
  lg: "p-2.5",
};

const iconSizeClasses: Record<CopyButtonSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  variant = 'default',
  size = 'md',
  tooltipPosition = 'bottom',
  showTooltip = true,
  successMessage = 'Copied!',
  resetDelay = 2000,
  ariaLabel = 'Copy to clipboard',
  className = '',
  disabled,
  onCopied,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTooltip = showTooltip;

  const showCopiedFeedback = useCallback(() => {
    setIsCopied(true);
    
    // Clear any existing timeout
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    
    // Reset after delay
    resetTimeoutRef.current = setTimeout(() => {
      setIsCopied(false);
    }, resetDelay);
  }, [resetDelay]);

  const handleCopy = useCallback(async () => {
    if (disabled || isCopied) return;

    try {
      await navigator.clipboard.writeText(text);
      showCopiedFeedback();
      onCopied?.(true);
    } catch (_err) {
      // Fallback for older browsers or if clipboard API fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          showCopiedFeedback();
          onCopied?.(true);
        } else {
          onCopied?.(false);
        }
      } catch (_fallbackErr) {
        onCopied?.(false);
      }
    }
  }, [text, disabled, isCopied, showCopiedFeedback, onCopied]);

  const showTooltipFn = useCallback(() => {
    if (!isCopied) {
      setIsTooltipVisible(true);
    }
  }, [isCopied]);

  const hideTooltip = useCallback(() => {
    setIsTooltipVisible(false);
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${isCopied ? 'text-green-600 dark:text-green-400' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const tooltipPositionClasses: Record<CopyButtonTooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const tooltipArrowClasses: Record<CopyButtonTooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-t-transparent border-b-transparent border-l-transparent',
  };

  const tooltipText = isCopied ? successMessage : 'Copy';

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classes}
      aria-label={isCopied ? `${ariaLabel} - ${successMessage}` : ariaLabel}
      aria-describedby={hasTooltip ? tooltipId : undefined}
      aria-live="polite"
      onClick={handleCopy}
      onMouseEnter={hasTooltip ? showTooltipFn : undefined}
      onMouseLeave={hasTooltip ? hideTooltip : undefined}
      onFocus={hasTooltip ? showTooltipFn : undefined}
      onBlur={hasTooltip ? hideTooltip : undefined}
      disabled={disabled}
      {...props}
    >
      <span className={`relative flex items-center justify-center ${iconSizeClasses[size]}`} aria-hidden="true">
        {/* Copy Icon */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isCopied 
              ? 'opacity-0 scale-50 rotate-[-45deg]' 
              : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <CopyIcon className="w-full h-full" />
        </span>
        
        {/* Check Icon */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isCopied 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-50 rotate-[45deg]'
          }`}
        >
          <CheckIcon className="w-full h-full" />
        </span>
      </span>
      
      {hasTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none
            transition-all duration-200 ease-out
            ${isCopied ? 'bg-green-600 dark:bg-green-500' : 'bg-neutral-800 dark:bg-neutral-700'}
            text-white
            ${tooltipPositionClasses[tooltipPosition]}
            ${isTooltipVisible || isCopied ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `.replace(/\s+/g, ' ').trim()}
        >
          {tooltipText}
          <span
            className={`
              absolute w-2 h-2 rotate-45
              ${isCopied ? 'bg-green-600 dark:bg-green-500' : 'bg-neutral-800 dark:bg-neutral-700'}
              ${tooltipArrowClasses[tooltipPosition]}
            `.replace(/\s+/g, ' ').trim()}
            aria-hidden="true"
          />
        </span>
      )}
    </button>
  );
};

export default CopyButton;
