import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedInputProps, ValidationState } from './types';
import { DEBOUNCE_DELAYS } from '../../constants';
export type { EnhancedInputProps, ValidationState } from './types';

/**
 * Enhanced input component with real-time validation and animations
 */
export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  placeholder,
  validationRules = [],
  validateOnChange = true,
  validateOnBlur = true,
  showError = true,
  showWarning = true,
  debounceMs = DEBOUNCE_DELAYS.FIELD_VALIDATION,
  onValidationChange,
  customError,
  successMessage,
  icon,
  rightIcon,
  size = 'md',
  variant = 'default',
  value,
  onChange,
  onBlur,
  onFocus,
  className = '',
  disabled,
  required,
  ...props
}) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    isDirty: false,
    errors: [],
    warnings: []
  });
  
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation function
  const validateValue = useCallback((val: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const rule of validationRules) {
      const result = rule.validate(val);
      if (result === false) {
        errors.push(rule.message);
      } else if (typeof result === 'string') {
        if (rule.type === 'required' || rule.type === 'pattern' || rule.type === 'length') {
          errors.push(result);
        } else {
          warnings.push(result);
        }
      }
    }
    
    const newState: ValidationState = {
      isValid: errors.length === 0,
      isDirty: true,
      errors,
      warnings
    };
    
    setValidationState(newState);
    onValidationChange?.(newState);
    
    return newState;
  }, [validationRules, onValidationChange]);

  // Handle debounced validation
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedValue(value || '');
    }, debounceMs);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, debounceMs]);

  // Validate when debounced value changes
  useEffect(() => {
    if (validateOnChange && validationState.isDirty) {
      validateValue(debouncedValue);
    }
  }, [debouncedValue, validateOnChange, validateValue, validationState.isDirty]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    
    if (!validateOnChange) {
      setValidationState(prev => ({ ...prev, isDirty: true }));
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    if (validateOnBlur) {
      validateValue(e.target.value);
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };

  // Handle focus
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
    if (onFocus) {
      onFocus(e);
    }
  };

  // Determine input variant
  const getInputVariant = () => {
    if (customError) return 'error';
    if (!validationState.isValid && validationState.errors.length > 0) return 'error';
    if (validationState.warnings.length > 0) return 'warning';
    if (successMessage && validationState.isValid && validationState.isDirty) return 'success';
    return variant;
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-5 py-4 text-lg min-h-[48px]'
  };

  // Variant classes
  const variantClasses = {
    default: 'border-neutral-300 dark:border-neutral-600 focus:border-primary-500 focus:ring-primary-500',
    success: 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-green-500',
    warning: 'border-orange-300 dark:border-orange-600 focus:border-orange-500 focus:ring-orange-500',
    error: 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500'
  };

  const inputVariant = getInputVariant();
  const shouldShowError = showError && (customError || (validationState.isDirty && !validationState.isValid && validationState.errors.length > 0));
  const shouldShowWarning = showWarning && validationState.warnings.length > 0;
  const shouldShowSuccess = successMessage && validationState.isValid && validationState.isDirty;

  return (
    <div className={`form-group-enhanced ${className}`}>
      {label && (
        <label className={`form-label-enhanced ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            input-enhanced form-interactive input-polished
            ${sizeClasses[size]}
            ${icon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${variantClasses[inputVariant]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isFocused ? 'transform -translate-y-0.5' : ''}
            transition-all duration-200 ease-out
          `.replace(/\s+/g, ' ').trim()}
          aria-invalid={shouldShowError ? "true" : "false"}
          aria-describedby={
            shouldShowError ? 'input-error' : 
            shouldShowWarning ? 'input-warning' : 
            shouldShowSuccess ? 'input-success' : 
            undefined
          }
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}
        
        {/* Validation status indicator */}
        {validationState.isDirty && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {shouldShowSuccess && (
              <div className="w-5 h-5 text-green-500 animate-pulse-once" role="img" aria-label="Valid input">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {shouldShowError && (
              <div className="w-5 h-5 text-red-500 animate-pulse-once" role="img" aria-label="Invalid input">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            
            {shouldShowWarning && (
              <div className="w-5 h-5 text-orange-500 animate-pulse-once" role="img" aria-label="Warning">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {shouldShowError && (
        <div id="input-error" className="form-error-text animate-fade-in" role="alert" aria-live="polite">
          {customError || validationState.errors[0]}
        </div>
      )}
      
      {/* Warning message */}
      {shouldShowWarning && (
        <div id="input-warning" className="text-sm text-orange-600 dark:text-orange-400 mt-1 animate-fade-in" role="alert" aria-live="polite">
          {validationState.warnings[0]}
        </div>
      )}
      
      {/* Success message */}
      {shouldShowSuccess && (
        <div id="input-success" className="form-success-text animate-fade-in" role="status" aria-live="polite">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default EnhancedInput;