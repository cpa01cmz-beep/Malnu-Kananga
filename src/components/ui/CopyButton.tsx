import React, { useState, useCallback, useRef, useId } from 'react';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type CopyButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost';
export type CopyButtonSize = 'sm' | 'md' | 'lg';
export type CopyButtonTooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type CopyButtonState = 'idle' | 'copied' | 'error';

interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  text: string;
  variant?: CopyButtonVariant;
  size?: CopyButtonSize;
  tooltipPosition?: CopyButtonTooltipPosition;
  showTooltip?: boolean;
  successMessage?: string;
  errorMessage?: string;
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

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// Detect OS for keyboard shortcut display
const getKeyboardShortcut = (): string => {
  if (typeof navigator === 'undefined') return 'Ctrl+C';
  const platform = navigator.platform.toLowerCase();
  const isMac = platform.includes('mac') || platform.includes('darwin');
  return isMac ? '⌘+C' : 'Ctrl+C';
};

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  variant = 'default',
  size = 'md',
  tooltipPosition = 'bottom',
  showTooltip = true,
  successMessage = 'Copied!',
  errorMessage = 'Failed to copy',
  resetDelay = 2000,
  ariaLabel = 'Copy to clipboard',
  className = '',
  disabled,
  onCopied,
  ...props
}) => {
  const [buttonState, setButtonState] = useState<CopyButtonState>('idle');
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showShortcutHint, setShowShortcutHint] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shortcutHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { onSuccess, onError } = useHapticFeedback();
  const hasTooltip = showTooltip;
  const keyboardShortcut = getKeyboardShortcut();

  const isCopied = buttonState === 'copied';
  const isError = buttonState === 'error';

  const showSuccessFeedback = useCallback(() => {
    setButtonState('copied');
    
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    
    resetTimeoutRef.current = setTimeout(() => {
      setButtonState('idle');
    }, resetDelay);
  }, [resetDelay]);

  const showErrorFeedback = useCallback(() => {
    setButtonState('error');
    setIsShaking(true);
    
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
    
    resetTimeoutRef.current = setTimeout(() => {
      setButtonState('idle');
    }, resetDelay);
  }, [resetDelay]);

  const handleCopy = useCallback(async () => {
    if (disabled || buttonState !== 'idle') return;

    try {
      await navigator.clipboard.writeText(text);
      showSuccessFeedback();
      onSuccess();
      onCopied?.(true);
    } catch {
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
          showSuccessFeedback();
          onSuccess();
          onCopied?.(true);
        } else {
          showErrorFeedback();
          onError();
          onCopied?.(false);
        }
      } catch {
        showErrorFeedback();
        onError();
        onCopied?.(false);
      }
    }
  }, [text, disabled, buttonState, showSuccessFeedback, showErrorFeedback, onCopied, onSuccess, onError]);

  const showTooltipFn = useCallback(() => {
    if (buttonState === 'idle') {
      setIsTooltipVisible(true);
      shortcutHintTimeoutRef.current = setTimeout(() => {
        setShowShortcutHint(true);
      }, 400);
    }
  }, [buttonState]);

  const hideTooltip = useCallback(() => {
    setIsTooltipVisible(false);
    setShowShortcutHint(false);
    if (shortcutHintTimeoutRef.current) {
      clearTimeout(shortcutHintTimeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      if (shortcutHintTimeoutRef.current) {
        clearTimeout(shortcutHintTimeoutRef.current);
      }
    };
  }, []);

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${isCopied ? 'text-green-600 dark:text-green-400' : ''}
    ${isError ? 'text-red-600 dark:text-red-400' : ''}
    ${isShaking ? 'error-animation' : ''}
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

  const tooltipText = isCopied ? successMessage : isError ? errorMessage : 'Copy';
  const tooltipBgClass = isCopied 
    ? 'bg-green-600 dark:bg-green-500' 
    : isError 
      ? 'bg-red-600 dark:bg-red-500' 
      : 'bg-neutral-800 dark:bg-neutral-700';

  const getAriaLabel = () => {
    if (isCopied) return `${ariaLabel} - ${successMessage}`;
    if (isError) return `${ariaLabel} - ${errorMessage}`;
    return ariaLabel;
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classes}
      aria-label={getAriaLabel()}
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
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isCopied || isError
              ? 'opacity-0 scale-50 rotate-[-45deg]' 
              : 'opacity-100 scale-100 rotate-0'
          }`}
        >
          <CopyIcon className="w-full h-full" />
        </span>
        
        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isCopied 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-50 rotate-[45deg]'
          }`}
        >
          <CheckIcon className="w-full h-full" />
        </span>

        <span
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
            isError 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-50 rotate-[-45deg]'
          }`}
        >
          <ErrorIcon className="w-full h-full" />
        </span>
      </span>
      
      {hasTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`
            absolute z-50 px-2.5 py-1.5 text-xs font-medium rounded-md shadow-lg whitespace-nowrap pointer-events-none
            transition-all duration-200 ease-out
            ${tooltipBgClass}
            text-white
            ${tooltipPositionClasses[tooltipPosition]}
            ${isTooltipVisible || isCopied || isError ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `.replace(/\s+/g, ' ').trim()}
        >
          {tooltipText}
          <span
            className={`
              absolute w-2 h-2 rotate-45
              ${tooltipBgClass}
              ${tooltipArrowClasses[tooltipPosition]}
            `.replace(/\s+/g, ' ').trim()}
            aria-hidden="true"
          />
        </span>
      )}

      {showShortcutHint && buttonState === 'idle' && (
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
              {keyboardShortcut}
            </kbd>
            <span>salin</span>
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
        </div>
      )}
    </button>
  );
};

export default CopyButton;
