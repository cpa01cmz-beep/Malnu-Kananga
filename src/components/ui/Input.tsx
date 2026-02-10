import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useFieldValidation } from '../../hooks/useFieldValidation';
import { MaskOptions } from '../../utils/inputMasks';
import { createFormatter } from '../../utils/inputMasks';
import { XMarkIcon, InformationCircleIcon } from '../icons/MaterialIcons';
import { AlertCircleIcon, CheckCircleIcon } from '../icons/StatusIcons';
import IconButton from './IconButton';
import { useReducedMotion } from '../../hooks/useAccessibility';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'nisn' | 'phone' | 'date' | 'year' | 'class' | 'grade';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
  tooltip?: string;
  size?: InputSize;
  state?: InputState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  validationRules?: Array<{ validate: (value: string) => boolean; message: string }>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  accessibility?: {
    announceErrors?: boolean;
    describedBy?: string;
  };
  inputMask?: 'nisn' | 'phone' | 'date' | 'year' | 'class' | 'grade';
  customType?: InputType;
  clearOnEscape?: boolean;
  showClearButton?: boolean;
  showCharacterCount?: boolean;
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-300 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation focus-enhanced shadow-sm hover:shadow-md focus:shadow-lg backdrop-blur-sm hover-lift-enhanced focus-visible-enhanced";

const sizeClasses: Record<InputSize, string> = {
  sm: "px-3 py-3 text-sm min-h-[3rem]",
  md: "px-4 py-3 text-sm sm:text-base min-h-[3.25rem]",
  lg: "px-5 py-4 text-base sm:text-lg min-h-[3.75rem]",
};

const sizeIconClasses: Record<InputSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const stateClasses: Record<InputState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-primary-400 dark:hover:border-primary-500 focus:ring-primary-500/30 focus:border-primary-500 focus:scale-[1.01]",
  error: "border-red-400 dark:border-red-500 bg-red-50/95 dark:bg-red-900/40 text-neutral-900 dark:text-white placeholder-red-500 dark:placeholder-red-400 hover:border-red-500 dark:hover:border-red-400 focus:ring-red-500/40 focus:border-red-500 focus:scale-[1.01]",
  success: "border-green-300 dark:border-green-600 bg-green-50/95 dark:bg-green-900/30 text-neutral-900 dark:text-white placeholder-green-400 dark:placeholder-green-500 hover:border-green-400 dark:hover:border-green-500 focus:ring-green-500/30 focus:border-green-500 focus:scale-[1.01]",
};

const labelSizeClasses: Record<InputSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const helperTextSizeClasses: Record<InputSize, string> = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
};

const Input = forwardRef<HTMLInputElement, InputProps>(({
  id,
  label,
  helperText,
  errorText,
  tooltip,
  size = 'md',
  state = errorText ? 'error' : 'default',
  leftIcon,
  rightIcon,
  fullWidth = false,
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  accessibility = { announceErrors: true },
  inputMask,
  customType = 'text',
  clearOnEscape = false,
  showClearButton = false,
  showCharacterCount = false,
  value,
  onChange,
  onBlur,
  className = '',
  maxLength,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
  const [shakeKey, setShakeKey] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Character counter logic
  const currentLength = String(value || '').length;
  const maxLengthNumber = maxLength ? parseInt(String(maxLength), 10) : undefined;
  const showCounter = showCharacterCount && maxLengthNumber !== undefined;
  const usagePercentage = maxLengthNumber ? (currentLength / maxLengthNumber) * 100 : 0;
  
  const getCounterColorClass = (): string => {
    if (usagePercentage >= 100) {
      return 'text-red-600 dark:text-red-400';
    } else if (usagePercentage >= 80) {
      return 'text-amber-600 dark:text-amber-400';
    }
    return 'text-neutral-400 dark:text-neutral-500';
  };

  const getAnimationClass = (inputState: InputState): string => {
    if (prefersReducedMotion) return '';

    switch (inputState) {
      case 'error':
        return 'animate-input-shake-subtle';
      case 'success':
        return showSuccessAnimation ? 'animate-success-pulse' : '';
      default:
        return '';
    }
  };

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  const errorTextId = errorText ? `${inputId}-error` : undefined;
  const accessibilityDescribedBy = accessibility?.describedBy;
  const describedBy = [helperTextId, errorTextId, accessibilityDescribedBy].filter(Boolean).join(' ') || undefined;

  // Initialize input mask if provided
  const maskFormatter = inputMask ? createFormatter(inputMask) : null;

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

  // Handle input mask formatting
  const handleMaskedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (maskFormatter) {
      const formattedValue = maskFormatter.format(e.target.value);
      e.target.value = formattedValue;
    }

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

  // Escape key handler to clear input value
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (clearOnEscape && e.key === 'Escape') {
      const syntheticEvent = {
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      handleMaskedChange(syntheticEvent);
    }
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  // Trigger subtle shake animation when validation errors occur
  useEffect(() => {
    if (validation.state.errors.length > 0 && validation.state.isTouched && !prefersReducedMotion) {
      setShakeKey(prev => prev + 1);
    }
  }, [validation.state.errors, validation.state.isTouched, prefersReducedMotion]);

  // Trigger success animation when validation passes
  useEffect(() => {
    if (validation.state.isValid && validation.state.isTouched && state === 'success') {
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [validation.state.isValid, validation.state.isTouched, state]);

  // Auto-focus management for validation errors (only for new errors, not on every re-render)
  useEffect(() => {
    const hasNewError = validation.state.errors.length > 0 && validation.state.isTouched;
    const hadPreviousError = validation.state.errors.length > 0;
    
    // Only auto-focus if this is a new error, not continuing an existing one
    if (hasNewError && !hadPreviousError && inputRef.current) {
      inputRef.current.focus();
    }
  }, [validation.state.errors.length, validation.state.isTouched, inputRef]);

  // Determine final state based on validation
  const finalState = validation.state.errors.length > 0 && validation.state.isTouched ? 'error' :
                    (validation.state.isValid ? state : 'error');
  const finalErrorText = validation.state.errors.length > 0 && validation.state.isTouched ?
                        validation.state.errors[0] : errorText;

  // Icon spacing adjustments
  const hasClearButton = showClearButton && value && String(value).length > 0;
  const hasValidationIcon = finalState === 'error' || finalState === 'success';
  const leftIconSpacing = leftIcon || inputMask === 'phone' || inputMask === 'nisn' ? 'pl-11' : '';
  const rightIconSpacing = rightIcon || hasClearButton || hasValidationIcon ? 'pr-11' : '';

  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[finalState]}
    ${getAnimationClass(finalState)}
    ${fullWidth ? 'w-full' : ''}
    ${leftIconSpacing} ${rightIconSpacing}
    mobile-touch-target focus-enhanced hover-lift-enhanced transition-smooth
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Enhanced accessibility attributes
  const accessibilityProps = {
    'aria-describedby': describedBy,
    'aria-invalid': finalState === 'error',
    'aria-required': props.required,
    'aria-errormessage': finalErrorText ? errorTextId : undefined,
    ...(validation.state.isValidating && { 'aria-live': 'polite' as const }),
    ...(validation.state.isValidating && { 'aria-busy': true })
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block`}
        >
          {label}
          {tooltip && (
            <IconButton
              icon={<InformationCircleIcon className={sizeIconClasses[size]} />}
              ariaLabel={tooltip}
              tooltip={tooltip}
              size="sm"
              variant="ghost"
              className="ml-1 inline-flex align-middle"
              tabIndex={-1}
            />
          )}
          {props.required && (
            <span className="text-red-500 ml-1" aria-label="wajib diisi">
              *
            </span>
          )}
        </label>
      )}

      <div key={shakeKey} className="relative">
        {leftIcon && (
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 ${sizeIconClasses[size]}`}
            aria-hidden="true"
          >
            {leftIcon}
          </div>
        )}

        {inputMask === 'phone' && !leftIcon && (
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 ${sizeIconClasses[size]}`}
            aria-hidden="true"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type={customType === 'nisn' || customType === 'phone' ? 'tel' : customType}
          inputMode={
            customType === 'nisn' || customType === 'phone' || customType === 'year' || customType === 'grade' ? 'numeric' :
            customType === 'date' ? 'numeric' : 'text'
          }
          pattern={
            customType === 'nisn' ? '[0-9]{10}' :
            customType === 'phone' ? '[0-9]{10,13}' :
            customType === 'year' ? '[0-9]{4}' :
            customType === 'grade' ? '[0-9]{1,3}' : undefined
          }
          maxLength={customType === 'nisn' ? 10 : customType === 'year' ? 4 : customType === 'grade' ? 3 : undefined}
          className={inputClasses}
          value={value}
          onChange={handleMaskedChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          {...accessibilityProps}
          {...props}
        />

        {rightIcon && (
          <div
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 ${sizeIconClasses[size]}`}
            aria-hidden="true"
          >
            {rightIcon}
          </div>
        )}

        {/* Error state icon */}
        {finalState === 'error' && !rightIcon && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${hasClearButton ? 'right-10' : 'right-3'}`}
            aria-hidden="true"
          >
            <AlertCircleIcon size={size} color="danger" />
          </div>
        )}

        {/* Success state icon */}
        {finalState === 'success' && !rightIcon && !validation.state.isValidating && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 ${hasClearButton ? 'right-10' : 'right-3'}`}
            aria-hidden="true"
          >
            <CheckCircleIcon size={size} color="success" />
          </div>
        )}

        {/* Clear button - appears when there's a value and showClearButton is true */}
        {hasClearButton && !validation.state.isValidating && finalState !== 'error' && finalState !== 'success' && (
          <button
            type="button"
            onClick={() => {
              const syntheticEvent = {
                target: { value: '' }
              } as React.ChangeEvent<HTMLInputElement>;
              handleMaskedChange(syntheticEvent);
              // Focus back on input after clearing
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/50 min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center ${
              rightIcon ? 'right-10' : 'right-3'
            }`}
            aria-label="Bersihkan input"
            title="Bersihkan input"
          >
            <XMarkIcon className={sizeIconClasses[size]} aria-hidden="true" />
          </button>
        )}

        {validation.state.isValidating && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${rightIcon ? 'right-10' : hasClearButton ? 'right-10' : 'right-3'}`}>
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
        <p id={errorTextId} className={`${helperTextSizeClasses[size]} text-red-700 dark:text-red-300 flex items-center gap-1 font-medium`} role="alert" aria-live="polite">
          <AlertCircleIcon size="xs" color="danger" ariaHidden={true} />
          {finalErrorText}
        </p>
      )}

      {/* Helper text for masked inputs */}
      {inputMask && !finalErrorText && (
        <p className={`${helperTextSizeClasses[size]} text-neutral-400 dark:text-neutral-500 italic`}>
          {maskFormatter && (maskFormatter as unknown as { options: MaskOptions }).options?.placeholder}
        </p>
      )}

      {/* Character counter */}
      {showCounter && (
        <div 
          className="flex justify-end items-center gap-1"
          aria-live="polite"
          aria-atomic="true"
        >
          <span 
            className={`${helperTextSizeClasses[size]} ${getCounterColorClass()} transition-colors duration-200 font-medium ${
              usagePercentage >= 80 && !prefersReducedMotion ? 'animate-pulse-subtle' : ''
            }`}
            aria-label={`${currentLength} dari ${maxLengthNumber} karakter digunakan`}
          >
            {currentLength}
            <span className="text-neutral-300 dark:text-neutral-600 mx-0.5">/</span>
            {maxLengthNumber}
          </span>
          {usagePercentage >= 100 && (
            <span className="sr-only" role="alert">
              Batas karakter tercapai
            </span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
