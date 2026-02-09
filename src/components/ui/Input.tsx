import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useFieldValidation } from '../../hooks/useFieldValidation';
import { MaskOptions } from '../../utils/inputMasks';
import { createFormatter } from '../../utils/inputMasks';
import { XMarkIcon } from '../icons/MaterialIcons';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success';
export type InputType = 'text' | 'email' | 'password' | 'tel' | 'number' | 'nisn' | 'phone' | 'date' | 'year' | 'class' | 'grade';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  errorText?: string;
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
  floatingLabel?: boolean;
  placeholder?: string;
}

const baseClasses = "flex items-center border rounded-xl transition-all duration-200 ease-out font-medium focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed relative group";

const sizeClasses: Record<InputSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-sm sm:text-base",
  lg: "px-5 py-4 text-base sm:text-lg",
};

const sizeIconClasses: Record<InputSize, string> = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const stateClasses: Record<InputState, string> = {
  default: "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-primary-500/50 focus:border-primary-500 hover:shadow-sm focus:shadow-md transition-all duration-200",
  error: "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-neutral-900 dark:text-white placeholder-red-400 dark:placeholder-red-500 hover:border-red-400 dark:hover:border-red-600 focus:ring-red-500/50 focus:border-red-500 hover:shadow-sm focus:shadow-red-100/50 dark:focus:shadow-red-900/50 transition-all duration-200",
  success: "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-neutral-900 dark:text-white placeholder-green-400 dark:placeholder-green-500 hover:border-green-400 dark:hover:border-green-600 focus:ring-green-500/50 focus:border-green-500 hover:shadow-sm focus:shadow-green-100/50 dark:focus:shadow-green-900/50 transition-all duration-200",
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
  floatingLabel = false,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  className = '',
  ...props
}, ref) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));
  
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = label ? `${inputId}-label` : undefined;
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

  // Enhanced focus handler
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    if (onFocus) {
      onFocus(e);
    }
  };

  // Enhanced blur handler
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    validation.blurHandler();
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // Track value changes for floating label
  useEffect(() => {
    setHasValue(Boolean(value) && String(value).length > 0);
  }, [value]);

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

  // Auto-focus management for validation errors
  useEffect(() => {
    if (validation.state.errors.length > 0 && validation.state.isTouched && inputRef.current) {
      inputRef.current.focus();
    }
  }, [validation.state.errors, validation.state.isTouched, inputRef]);

  // Determine final state based on validation
  const finalState = validation.state.errors.length > 0 && validation.state.isTouched ? 'error' : 
                    (validation.state.isValid ? state : 'error');
  const finalErrorText = validation.state.errors.length > 0 && validation.state.isTouched ? 
                        validation.state.errors[0] : errorText;

  // Icon spacing adjustments
  const hasClearButton = showClearButton && value && String(value).length > 0;
  const leftIconSpacing = leftIcon || inputMask === 'phone' || inputMask === 'nisn' ? 'pl-11' : '';
  const rightIconSpacing = rightIcon || hasClearButton ? 'pr-11' : '';

  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${stateClasses[finalState]}
    ${fullWidth ? 'w-full' : ''}
    ${leftIconSpacing} ${rightIconSpacing}
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

  const shouldLabelFloat = floatingLabel && (isFocused || hasValue);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
      {label && !floatingLabel && (
        <label
          htmlFor={inputId}
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
        {label && floatingLabel && (
          <label
            id={labelId}
            htmlFor={inputId}
            className={`
              ${labelSizeClasses[size]} font-semibold text-neutral-700 dark:text-neutral-300 block
              ${floatingLabel ? `
                absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ease-out pointer-events-none
                ${leftIcon ? 'left-11' : 'left-4'}
                ${shouldLabelFloat ? `
                  -top-2.5 translate-y-0 text-xs bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded
                  ${finalState === 'error' ? 'text-red-600 dark:text-red-400' : 'text-primary-600 dark:text-primary-400'}
                ` : 'text-neutral-500 dark:text-neutral-400'}
              ` : ''}
            `}
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="wajib diisi">
                *
              </span>
            )}
          </label>
        )}

        {leftIcon && (
          <div 
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 ${sizeIconClasses[size]} z-10`} 
            aria-hidden="true"
          >
            {leftIcon}
          </div>
        )}

        {inputMask === 'phone' && !leftIcon && (
          <div 
            className={`absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 ${sizeIconClasses[size]} z-10`} 
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
            customType === 'phone' ? '[0-9]{10,13]' :
            customType === 'year' ? '[0-9]{4}' :
            customType === 'grade' ? '[0-9]{1,3}' : undefined
          }
          maxLength={customType === 'nisn' ? 10 : customType === 'year' ? 4 : customType === 'grade' ? 3 : undefined}
          placeholder={floatingLabel ? '' : placeholder}
          className={`${inputClasses} ${floatingLabel ? 'pt-6 pb-2' : ''}`}
          value={value}
          onChange={handleMaskedChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          aria-labelledby={floatingLabel ? labelId : undefined}
          {...accessibilityProps}
          {...props}
        />

        {rightIcon && (
          <div 
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 ${sizeIconClasses[size]} z-10`} 
            aria-hidden="true"
          >
            {rightIcon}
          </div>
        )}

        {/* Clear button - appears when there's a value and showClearButton is true */}
        {hasClearButton && !validation.state.isValidating && (
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
            className={`absolute top-1/2 -translate-y-1/2 p-0.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 hover:scale-110 active:scale-95 z-10 ${
              rightIcon ? 'right-10' : 'right-3'
            }`}
            aria-label="Bersihkan input"
            title="Bersihkan input"
          >
            <XMarkIcon className={sizeIconClasses[size]} aria-hidden="true" />
          </button>
        )}

        {validation.state.isValidating && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${rightIcon ? 'right-10' : hasClearButton ? 'right-10' : 'right-3'} z-10`}>
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

      {/* Helper text for masked inputs */}
      {inputMask && !finalErrorText && (
        <p className={`${helperTextSizeClasses[size]} text-neutral-400 dark:text-neutral-500 italic`}>
          {maskFormatter && (maskFormatter as unknown as { options: MaskOptions }).options?.placeholder}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
