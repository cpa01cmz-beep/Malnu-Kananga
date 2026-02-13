import React, { forwardRef, useRef, useCallback, useState, useId, useEffect } from 'react';
import { XMarkIcon } from '../icons/MaterialIcons';
import { generateComponentId } from '../../utils/idGenerator';
import { UI_DELAYS } from '../../constants';

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectState = 'default' | 'error' | 'success';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: SelectSize;
  state?: SelectState;
  fullWidth?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  /** Enable Escape key to clear selection when dropdown is not open */
  clearOnEscape?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white dark:bg-neutral-700 cursor-pointer min-h-[44px] mobile-touch-target focus-visible-enhanced";

const sizeClasses: Record<SelectSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm sm:text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const stateClasses: Record<SelectState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-primary-500/50 focus:border-primary-500",
  error: "border-red-300 dark:border-red-700 text-neutral-900 dark:text-white hover:border-red-400 dark:hover:border-red-600 focus:ring-red-500/50 focus:border-red-500",
  success: "border-green-300 dark:border-green-700 text-neutral-900 dark:text-white hover:border-green-400 dark:hover:border-green-600 focus:ring-green-500/50 focus:border-green-500",
};

const labelSizeClasses: Record<SelectSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<SelectSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  id,
  label,
  helperText,
  errorText,
  size = 'md',
  state = errorText ? 'error' : 'default',
  fullWidth = false,
  options,
  placeholder,
  showClearButton = false,
  onClear,
  clearOnEscape = false,
  isLoading = false,
  loadingText = 'Memuat...',
  className = '',
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLSelectElement>(null);
  const selectRef = (ref as React.RefObject<HTMLSelectElement>) || internalRef;
  const selectId = id || generateComponentId('select');
  const helperTextId = helperText ? `${selectId}-helper` : undefined;
  const errorTextId = errorText ? `${selectId}-error` : undefined;
  const describedBy = [helperTextId, errorTextId].filter(Boolean).join(' ') || undefined;

  // Check if there's a value to show clear button
  const hasValue = value !== undefined && value !== '';
  const shouldShowClearButton = showClearButton && hasValue && !props.disabled && !isLoading;

  // Tooltip state for clear button with delayed appearance
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearButtonTooltipId = useId();
  const CLEAR_BUTTON_TOOLTIP_TEXT = 'Bersihkan pilihan';

  // Keyboard shortcut hint state (similar to Input component pattern)
  const [showEscapeHint, setShowEscapeHint] = useState(false);
  const escapeHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = useCallback(() => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setIsTooltipVisible(true);
    }, UI_DELAYS.DEFAULT_UI_FEEDBACK);
  }, []);

  const hideTooltip = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setIsTooltipVisible(false);
  }, []);

  // Show escape hint when select is focused and has a value
  const handleFocus = useCallback((e: React.FocusEvent<HTMLSelectElement>) => {
    if (clearOnEscape && hasValue) {
      // Delay showing hint to avoid flickering on quick interactions
      escapeHintTimeoutRef.current = setTimeout(() => {
        setShowEscapeHint(true);
      }, UI_DELAYS.ESCAPE_HINT_DELAY);
    }
    onFocus?.(e);
  }, [clearOnEscape, hasValue, onFocus]);

  // Hide escape hint when select loses focus
  const handleBlur = useCallback((e: React.FocusEvent<HTMLSelectElement>) => {
    setShowEscapeHint(false);
    if (escapeHintTimeoutRef.current) {
      clearTimeout(escapeHintTimeoutRef.current);
    }
    onBlur?.(e);
  }, [onBlur]);

  // Escape key handler to clear selection
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (clearOnEscape && e.key === 'Escape' && hasValue) {
      // Only clear if dropdown is not open (native select behavior: Escape closes dropdown)
      // We detect this by checking if the select is focused but not showing options
      // Since we can't directly detect if options are shown, we rely on the fact that
      // when Escape is pressed on a closed select with value, it should clear
      e.preventDefault();
      
      // Create synthetic event to clear value
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLSelectElement>;
      
      if (onChange) {
        onChange(syntheticEvent);
      }
      
      if (onClear) {
        onClear();
      }
    }
    onKeyDown?.(e);
  }, [clearOnEscape, hasValue, onChange, onClear, onKeyDown]);

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

  // Handle clear action
  const handleClear = useCallback(() => {
    // Create synthetic event to clear value
    const syntheticEvent = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    if (onChange) {
      onChange(syntheticEvent);
    }
    
    // Call custom onClear handler if provided
    if (onClear) {
      onClear();
    }
    
    // Focus back on select after clearing
    if (selectRef.current) {
      selectRef.current.focus();
    }
  }, [onChange, onClear, selectRef]);

  const selectClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[state]}
    ${fullWidth ? 'w-full' : ''}
    pr-10
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-label="wajib diisi">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={selectRef}
          id={selectId}
          className={selectClasses}
          aria-describedby={describedBy}
          aria-invalid={state === 'error'}
          aria-busy={isLoading}
          aria-label={isLoading ? loadingText : undefined}
          disabled={props.disabled || isLoading}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
          {props.children}
        </select>

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

        {/* Clear button - appears when there's a value and showClearButton is true */}
        {shouldShowClearButton && (
          <button
            type="button"
            onClick={handleClear}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            className="absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 right-10 min-w-[44px] min-h-[44px] mobile-touch-target"
            aria-label={CLEAR_BUTTON_TOOLTIP_TEXT}
            aria-describedby={clearButtonTooltipId}
            title={CLEAR_BUTTON_TOOLTIP_TEXT}
          >
            <XMarkIcon className={iconSize} aria-hidden="true" />
            {/* Tooltip */}
            <span
              id={clearButtonTooltipId}
              role="tooltip"
              className={`
                absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700 
                rounded-md shadow-lg whitespace-nowrap pointer-events-none
                transition-all duration-200 ease-out
                top-full left-1/2 -translate-x-1/2 mt-2
                ${isTooltipVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `.replace(/\s+/g, ' ').trim()}
            >
              {CLEAR_BUTTON_TOOLTIP_TEXT}
              <span
                className="
                  absolute w-2 h-2 bg-neutral-800 dark:bg-neutral-700 rotate-45
                  bottom-full left-1/2 -translate-x-1/2 mb-[-3px]
                "
                aria-hidden="true"
              />
            </span>
          </button>
        )}

        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 dark:text-neutral-500 ${shouldShowClearButton ? 'right-10' : 'right-3'}`} aria-hidden="true">
          {isLoading ? (
            <svg
              className={`${iconSize} animate-spin`}
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
          ) : (
            <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {helperText && (
        <p id={helperTextId} className={`${helperTextSizeClasses[size]} text-neutral-500 dark:text-neutral-400`}>
          {helperText}
        </p>
      )}

      {errorText && (
        <p id={errorTextId} className={`${helperTextSizeClasses[size]} text-red-600 dark:text-red-400`} role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
