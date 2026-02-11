import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import { useFieldValidation } from '../../hooks/useFieldValidation';
import { XMarkIcon } from '../icons/MaterialIcons';
import { useHapticFeedback } from '../../utils/hapticFeedback';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { idGenerators } from '../../utils/idGenerator';

// Micro-UX: Character count indicator with progressive visual feedback
interface CharacterCountIndicatorProps {
  current: number;
  max: number;
  size: TextareaSize;
}

const CharacterCountIndicator: React.FC<CharacterCountIndicatorProps> = ({ current, max, size }) => {
  const percentage = (current / max) * 100;
  const isWarning = percentage >= 80 && percentage < 100;
  const isError = percentage >= 100;

  const getColorClasses = () => {
    if (isError) return 'text-red-600 dark:text-red-400 font-semibold animate-pulse-once';
    if (isWarning) return 'text-amber-600 dark:text-amber-400 font-medium';
    return 'text-neutral-400 dark:text-neutral-500';
  };

  const getAriaLabel = () => {
    if (isError) return `${current} dari ${max} karakter. Batas maksimum tercapai!`;
    if (isWarning) return `${current} dari ${max} karakter. Mendekati batas.`;
    return `${current} dari ${max} karakter`;
  };

  const helperTextSizeClasses: Record<TextareaSize, string> = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <span 
      className={`${helperTextSizeClasses[size]} ${getColorClasses()} transition-colors duration-200`}
      aria-label={getAriaLabel()}
      role="status"
      aria-live="polite"
    >
      {current}/{max}
    </span>
  );
};

// Micro-UX: Visual progress bar for character limit
interface CharacterProgressBarProps {
  current: number;
  max: number;
}

const CharacterProgressBar: React.FC<CharacterProgressBarProps> = ({ current, max }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isWarning = percentage >= 80 && percentage < 100;
  const isError = percentage >= 100;

  const getBarColor = () => {
    if (isError) return 'bg-red-500';
    if (isWarning) return 'bg-amber-500';
    return 'bg-primary-500';
  };

  return (
    <div 
      className="h-1 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden"
      aria-hidden="true"
    >
      <div 
        className={`h-full ${getBarColor()} transition-all duration-300 ease-out rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export type TextareaSize = 'sm' | 'md' | 'lg';
export type TextareaState = 'default' | 'error' | 'success';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: TextareaSize;
  state?: TextareaState;
  fullWidth?: boolean;
  autoResize?: boolean;
  maxRows?: number;
  minRows?: number;
  validationRules?: Array<{ validate: (value: string) => boolean; message: string }>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  accessibility?: {
    announceErrors?: boolean;
    describedBy?: string;
  };
  showClearButton?: boolean;
  clearOnEscape?: boolean;
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none";

const sizeClasses: Record<TextareaSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm sm:text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const stateClasses: Record<TextareaState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-primary-500/50 focus:border-primary-500",
  error: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-neutral-900 dark:text-white placeholder-red-400 dark:placeholder-red-500 hover:border-red-400 dark:hover:border-red-600 focus:ring-red-500/50 focus:border-red-500",
  success: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-neutral-900 dark:text-white placeholder-green-400 dark:placeholder-green-500 hover:border-green-400 dark:hover:border-green-600 focus:ring-green-500/50 focus:border-green-500",
};

const labelSizeClasses: Record<TextareaSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<TextareaSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const sizeIconClasses: Record<TextareaSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  id,
  label,
  helperText,
  errorText,
  size = 'md',
  state = errorText ? 'error' : 'default',
  fullWidth = false,
  autoResize = true,
  maxRows = 8,
  minRows = 1,
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  accessibility = { announceErrors: true },
  showClearButton = false,
  clearOnEscape = false,
  className = '',
  value,
  onChange,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escapeHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const textareaId = id || idGenerators.textarea();
  const helperTextId = helperText ? `${textareaId}-helper` : undefined;
  const errorTextId = errorText ? `${textareaId}-error` : undefined;
  const accessibilityDescribedBy = accessibility?.describedBy;
  const describedBy = [helperTextId, errorTextId, accessibilityDescribedBy].filter(Boolean).join(' ') || undefined;

  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showEscapeHint, setShowEscapeHint] = useState(false);
  const _prefersReducedMotion = useReducedMotion();
  const CLEAR_BUTTON_TOOLTIP_TEXT = 'Bersihkan textarea';
  const clearButtonTooltipId = `${textareaId}-clear-tooltip`;

  const showTooltip = useCallback(() => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(true);
    }, 400);
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setIsTooltipVisible(false);
  }, []);

  // Show escape hint when textarea is focused and has a value
  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (clearOnEscape && value && String(value).length > 0) {
      // Delay showing hint to avoid flickering on quick interactions
      escapeHintTimeoutRef.current = setTimeout(() => {
        setShowEscapeHint(true);
      }, 400);
    }
    onFocus?.(e);
  }, [clearOnEscape, value, onFocus]);

  // Hide escape hint when textarea loses focus
  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setShowEscapeHint(false);
    if (escapeHintTimeoutRef.current) {
      clearTimeout(escapeHintTimeoutRef.current);
    }
    validation.blurHandler();
    onBlur?.(e);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBlur]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (escapeHintTimeoutRef.current) {
        clearTimeout(escapeHintTimeoutRef.current);
      }
    };
  }, []);

  const { onSelection } = useHapticFeedback();

  const validation = useFieldValidation({
    value: String(value || ''),
    rules: validationRules,
    triggers: {
      onBlur: validateOnBlur,
      onChange: validateOnChange,
      onSubmit: true
    },
    accessibility: {
      announceErrors: accessibility.announceErrors,
      errorRole: 'alert'
    }
  });

  const textareaClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[state]}
    ${fullWidth ? 'w-full' : ''}
    ${autoResize ? '' : `min-h-[${minRows * 1.5}rem]`}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Enhanced change handler
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    }
    validation.changeHandler(e.target.value);
  };

  const handleClear = () => {
    onSelection();
    const syntheticEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    handleChange(syntheticEvent);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setIsTooltipVisible(false);
  };

  // Escape key handler to clear input value
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (clearOnEscape && e.key === 'Escape') {
      handleClear();
    }
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  // Auto-focus management for validation errors
  useEffect(() => {
    if (validation.state.errors.length > 0 && validation.state.isTouched && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [validation.state.errors, validation.state.isTouched, textareaRef]);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 24;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, minRows, maxRows, textareaRef]);

  // Determine final state based on validation
  const finalState = validation.state.errors.length > 0 && validation.state.isTouched ? 'error' : 
                    (validation.state.isValid ? state : 'error');
  const finalErrorText = validation.state.errors.length > 0 && validation.state.isTouched ? 
                        validation.state.errors[0] : errorText;

  // Check if clear button should be shown
  const hasClearButton = showClearButton && value && String(value).length > 0 && !props.disabled;

  // Enhanced accessibility attributes
  const accessibilityProps = {
    'aria-required': props.required,
    'aria-errormessage': finalErrorText ? errorTextId : undefined,
    ...(validation.state.isValidating && { 'aria-live': 'polite' as const }),
    ...(validation.state.isValidating && { 'aria-busy': true })
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={textareaId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
          {props.required && (
            <span className="text-red-500 ml-1" aria-label="wajib diisi">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {/* Keyboard shortcut hint for clearOnEscape - Micro UX Delight */}
        {clearOnEscape && showEscapeHint && (
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
              z-10
            `.replace(/\s+/g, ' ').trim()}
            role="tooltip"
            aria-hidden={!showEscapeHint}
          >
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0 bg-neutral-600 dark:bg-neutral-600 rounded text-[9px] font-bold border border-neutral-500">ESC</kbd>
              <span>bersihkan</span>
            </span>
            {/* Tooltip arrow */}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700" aria-hidden="true" />
          </div>
        )}

<textarea
         ref={textareaRef}
         id={textareaId}
         className={textareaClasses}
         aria-describedby={describedBy}
         aria-invalid={finalState === 'error'}
         value={value}
         onChange={handleChange}
         onBlur={handleBlur}
         onFocus={handleFocus}
         onKeyDown={handleKeyDown}
         {...accessibilityProps}
         {...props}
       />

        {hasClearButton && !validation.state.isValidating && (
          <>
            <button
              type="button"
              onClick={handleClear}
              onMouseEnter={showTooltip}
              onMouseLeave={hideTooltip}
              onFocus={() => setIsTooltipVisible(true)}
              onBlur={hideTooltip}
              className="absolute right-3 top-3 p-0.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 active:scale-95 touch-manipulation"
              aria-label="Bersihkan textarea"
              aria-describedby={isTooltipVisible ? clearButtonTooltipId : undefined}
              style={{ touchAction: 'manipulation' }}
            >
              <XMarkIcon className={sizeIconClasses[size]} aria-hidden="true" />
            </button>
            {isTooltipVisible && (
              <div
                id={clearButtonTooltipId}
                role="tooltip"
                className="absolute right-3 top-10 z-20 px-2 py-1 bg-neutral-800 dark:bg-neutral-700 text-white text-xs rounded shadow-lg animate-in fade-in duration-150"
              >
                <div className="flex items-center gap-1.5">
                  <span>{CLEAR_BUTTON_TOOLTIP_TEXT}</span>
                  {clearOnEscape && (
                    <kbd className="px-1 py-0.5 bg-neutral-600 dark:bg-neutral-500 rounded text-[10px] font-mono">
                      Esc
                    </kbd>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {validation.state.isValidating && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-primary-500" aria-hidden="true" />
          </div>
        )}
      </div>

{helperText && (
        <p id={helperTextId} className={`${helperTextSizeClasses[size]} text-neutral-500 dark:text-neutral-400`}>
          {helperText}
        </p>
      )}

      {finalErrorText && (
        <p id={errorTextId} className={`${helperTextSizeClasses[size]} text-red-600 dark:text-red-400`} role="alert" aria-live="polite">
          {finalErrorText}
        </p>
      )}

      {/* Character count with visual feedback */}
      {props.maxLength && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <CharacterCountIndicator 
              current={String(value || '').length} 
              max={props.maxLength}
              size={size}
            />
          </div>
          <CharacterProgressBar 
            current={String(value || '').length} 
            max={props.maxLength}
          />
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
