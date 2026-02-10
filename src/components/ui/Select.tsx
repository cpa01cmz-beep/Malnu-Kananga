import React, { forwardRef, useRef, useCallback, useState, useId } from 'react';
import { XMarkIcon } from '../icons/MaterialIcons';
import { useReducedMotion } from '../../hooks/useAccessibility';

// Haptic feedback utility for mobile devices
const triggerHapticFeedback = (type: 'light' | 'medium' = 'light') => {
  if ('vibrate' in navigator && window.innerWidth <= 768) {
    const pattern = {
      light: [10],
      medium: [20]
    };
    navigator.vibrate(pattern[type]);
  }
};

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
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-white dark:bg-neutral-700 cursor-pointer";

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
  className = '',
  value,
  onChange,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLSelectElement>(null);
  const selectRef = (ref as React.RefObject<HTMLSelectElement>) || internalRef;
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${selectId}-helper` : undefined;
  const errorTextId = errorText ? `${selectId}-error` : undefined;
  const describedBy = [helperTextId, errorTextId].filter(Boolean).join(' ') || undefined;
  const prefersReducedMotion = useReducedMotion();

  // Check if there's a value to show clear button
  const hasValue = value !== undefined && value !== '';
  const shouldShowClearButton = showClearButton && hasValue && !props.disabled;

  // Tooltip and animation state for clear button
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isClearPressed, setIsClearPressed] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const clearButtonTooltipId = useId();
  const CLEAR_BUTTON_TOOLTIP_TEXT = 'Bersihkan pilihan';

  const showTooltip = useCallback(() => setIsTooltipVisible(true), []);
  const hideTooltip = useCallback(() => {
    setIsTooltipVisible(false);
    setIsClearPressed(false);
  }, []);

  // Handle clear action with haptic feedback and animation
  const handleClear = useCallback(() => {
    // Trigger haptic feedback for mobile
    triggerHapticFeedback('light');
    
    // Set clearing state for animation
    setIsClearing(true);
    
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
    
    // Reset clearing state after animation
    setTimeout(() => {
      setIsClearing(false);
    }, 300);
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
          value={value}
          onChange={onChange}
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

        {/* Clear button - appears when there's a value and showClearButton is true */}
        {shouldShowClearButton && (
          <button
            type="button"
            onClick={handleClear}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onMouseDown={() => setIsClearPressed(true)}
            onMouseUp={() => setIsClearPressed(false)}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            className={`absolute top-1/2 -translate-y-1/2 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-500 mobile-touch-target right-10 transition-all duration-200 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${
              size === 'sm' ? 'p-1.5 min-w-[32px] min-h-[32px]' : 'p-2 min-w-[36px] min-h-[36px]'
            } ${
              isClearPressed && !prefersReducedMotion ? 'scale-90' : 'hover:scale-110'
            }`}
            aria-label={CLEAR_BUTTON_TOOLTIP_TEXT}
            aria-describedby={clearButtonTooltipId}
            title={CLEAR_BUTTON_TOOLTIP_TEXT}
          >
            <XMarkIcon 
              className={`${iconSize} transition-transform duration-300 ease-out ${
                isClearing && !prefersReducedMotion ? 'rotate-180 scale-75' : 'rotate-0 scale-100'
              }`} 
              aria-hidden="true" 
            />
            {/* Enhanced Tooltip */}
            <span
              id={clearButtonTooltipId}
              role="tooltip"
              className={`
                absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-800 dark:bg-neutral-700 
                rounded-lg shadow-lg whitespace-nowrap pointer-events-none
                transition-all duration-200 ease-out
                top-full left-1/2 -translate-x-1/2 mt-2
                ${isTooltipVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-1'}
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
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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
