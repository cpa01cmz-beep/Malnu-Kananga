import React, { forwardRef, useState } from 'react';
import { useFieldValidation } from '../../hooks/useFieldValidation';
import { MagnifyingGlassIcon } from '../icons/NotificationIcons';
import { XMarkIcon } from '../icons/MaterialIcons';
import { useReducedMotion } from '../../hooks/useAccessibility';
import { useHapticFeedback } from '../../utils/hapticFeedback';

export type SearchInputSize = 'sm' | 'md' | 'lg';
export type SearchInputState = 'default' | 'error' | 'success';

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  size?: SearchInputSize;
  state?: SearchInputState;
  fullWidth?: boolean;
  showIcon?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  validationRules?: Array<{ validate: (value: string) => boolean; message: string }>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  accessibility?: {
    announceErrors?: boolean;
    describedBy?: string;
  };
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-300 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation focus-enhanced hover-lift-enhanced backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-lg";

const sizeClasses: Record<SearchInputSize, string> = {
  sm: "px-3 py-3 text-sm min-h-[3rem]",
  md: "px-4 py-3 text-sm sm:text-base min-h-[3.25rem]",
  lg: "px-5 py-4 text-base sm:text-lg min-h-[3.75rem]",
};

const sizeIconClasses: Record<SearchInputSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const stateClasses: Record<SearchInputState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-primary-400 dark:hover:border-primary-500 focus:ring-primary-500/30 focus:border-primary-500 focus:scale-[1.01] glass-effect",
  error: "border-red-400 dark:border-red-500 bg-red-50/95 dark:bg-red-900/40 text-neutral-900 dark:text-white placeholder-red-500 dark:placeholder-red-400 hover:border-red-500 dark:hover:border-red-400 focus:ring-red-500/40 focus:border-red-500 focus:scale-[1.01] animate-input-shake-subtle",
  success: "border-green-300 dark:border-green-600 bg-green-50/95 dark:bg-green-900/30 text-neutral-900 dark:text-white placeholder-green-400 dark:placeholder-green-500 hover:border-green-400 dark:hover:border-green-500 focus:ring-green-500/30 focus:border-green-500 focus:scale-[1.01] animate-success-pulse",
};

const labelSizeClasses: Record<SearchInputSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<SearchInputSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  id,
  label,
  helperText,
  errorText,
  size = 'md',
  state = errorText ? 'error' : 'default',
  fullWidth = false,
  showIcon = true,
  placeholder,
  icon,
  iconPosition = 'left',
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  accessibility = { announceErrors: true },
  className = '',
  value,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const [isClearPressed, setIsClearPressed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { onTap, onSelection, onDelete } = useHapticFeedback();
  const searchId = id || `search-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${searchId}-helper` : undefined;
  const errorTextId = errorText ? `${searchId}-error` : undefined;
  const accessibilityDescribedBy = accessibility?.describedBy;
  const describedBy = [helperTextId, errorTextId, accessibilityDescribedBy].filter(Boolean).join(' ') || undefined;

  // Enhanced validation state management
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

  const iconContent = icon || <MagnifyingGlassIcon className={sizeIconClasses[size]} aria-hidden />;

  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[state]}
    ${fullWidth ? 'w-full' : ''}
    ${showIcon && iconPosition === 'left' ? 'pl-11' : ''}
    ${showIcon && iconPosition === 'right' ? 'pr-11' : ''}
    ${size === 'sm' ? 'min-h-[44px]' : size === 'lg' ? 'min-h-[56px]' : 'min-h-[48px]'}
    mobile-touch-target focus-enhanced hover-lift-enhanced transition-smooth
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Enhanced change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    validation.changeHandler(e.target.value);
  };

  // Enhanced blur handler
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    validation.blurHandler();
    if (onBlur) {
      onBlur(e);
    }
  };

  // Enhanced key down handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      // Clear value on Escape key
      onDelete();
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(syntheticEvent);
    }
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };
  // Determine final state based on validation
  const finalState = validation.state.errors.length > 0 && validation.state.isTouched ? 'error' : 
                    (validation.state.isValid ? state : 'error');
  const finalErrorText = validation.state.errors.length > 0 && validation.state.isTouched ? 
                        validation.state.errors[0] : errorText;

  // Enhanced accessibility attributes
  const accessibilityProps = {
    'aria-required': props.required,
    'aria-errormessage': finalErrorText ? errorTextId : undefined,
    ...(validation.state.isValidating && { 'aria-live': 'polite' as const }),
    ...(validation.state.isValidating && { 'aria-busy': true })
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`} role="search">
      {label && (
        <label
          htmlFor={searchId}
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
        {showIcon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" aria-hidden="true">
            {iconContent}
          </div>
        )}

        <input
          ref={ref}
          id={searchId}
          type="search"
          role="searchbox"
          placeholder={placeholder}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={finalState === 'error' ? 'true' : 'false'}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={props.onFocus}
          onKeyDown={handleKeyDown}
          value={value}
          {...accessibilityProps}
          {...props}
        />

        {showIcon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" aria-hidden="true">
            {iconContent}
          </div>
        )}

        {/* Enhanced Clear button with ripple effect and better feedback */}
        <button
          type="button"
          onClick={() => {
            onDelete();
            const syntheticEvent = {
              target: { value: '' }
            } as React.ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
            // Focus back on input after clearing for better UX
            if (ref && 'current' in ref && ref.current) {
              ref.current.focus();
            }
            setShowTooltip(false);
          }}
          onMouseEnter={() => {
            setShowTooltip(true);
            onTap();
          }}
          onMouseLeave={() => {
            setShowTooltip(false);
            setIsClearPressed(false);
          }}
          onMouseDown={() => {
            setIsClearPressed(true);
            onSelection();
          }}
          onMouseUp={() => setIsClearPressed(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-500 icon-interactive-enhanced mobile-touch-target haptic-feedback min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center ${
            showIcon && iconPosition === 'right' ? 'right-10' : 'right-3'
          } ${
            value && String(value).length > 0 && !validation.state.isValidating
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-75 pointer-events-none'
          } ${prefersReducedMotion ? '' : 'transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)'} ${
            isClearPressed ? (prefersReducedMotion ? '' : 'scale-95 rotate-90') : (prefersReducedMotion ? '' : 'hover:scale-110 hover:rotate-12')
          }`}
          aria-label="Bersihkan pencarian (Tekan Escape)"
          aria-hidden={!(value && String(value).length > 0 && !validation.state.isValidating)}
        >
          <XMarkIcon className={`${sizeIconClasses[size]} ${prefersReducedMotion ? '' : 'transition-transform duration-300'} ${isClearPressed ? 'rotate-90' : 'hover:rotate-90'}`} aria-hidden="true" />
          
          {/* Ripple effect overlay */}
          <span className="absolute inset-0 rounded-xl overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></span>
          </span>
          
          {/* Enhanced Tooltip with better positioning */}
          {showTooltip && value && String(value).length > 0 && (
            <span 
              className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-2 bg-neutral-900 dark:bg-neutral-700 text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50 ${prefersReducedMotion ? '' : 'animate-scale-in'}`}
              role="tooltip"
            >
              <span className="font-medium">Bersihkan</span>
              <kbd className="ml-2 px-2 py-0.5 bg-neutral-700 dark:bg-neutral-600 rounded text-[10px] font-mono border border-neutral-600 dark:border-neutral-500">Esc</kbd>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900 dark:bg-neutral-700 rotate-45 border-r border-b border-neutral-600 dark:border-neutral-500" aria-hidden="true" />
            </span>
          )}
        </button>

        {validation.state.isValidating && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${showIcon && iconPosition === 'right' ? 'right-12' : 'right-3'}`}>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-neutral-300 border-t-primary-500" aria-hidden="true" />
          </div>
        )}
      </div>

      {helperText && !finalErrorText && (
        <p id={helperTextId} className={`${helperTextSizeClasses[size]} text-neutral-500 dark:text-neutral-400`}>
          {helperText}
        </p>
      )}

      {finalErrorText && (
        <p id={errorTextId} className={`${helperTextSizeClasses[size]} text-red-600 dark:text-red-400`} role="alert" aria-live="polite">
          {finalErrorText}
        </p>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
