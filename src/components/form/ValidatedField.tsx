import React from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';

type UseFormValidationReturn = ReturnType<typeof useFormValidation>;

// Enhanced form field component with real-time validation
interface ValidatedFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  validation?: UseFormValidationReturn;
  showSuccessIndicator?: boolean;
  showErrorIcon?: boolean;
}

export const ValidatedField: React.FC<ValidatedFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  children,
  validation,
  showSuccessIndicator = true,
  showErrorIcon = true,
}) => {
  const fieldProps = validation?.getFieldProps(name);
  const error = fieldProps?.error;
  const isValid = fieldProps?.isValid;
  const isDirty = fieldProps?.isDirty;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {children || (
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${error 
                ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500' 
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400'
              }
              ${disabled ? 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed' : ''}
            `}
            onChange={fieldProps?.onChange ? (e) => fieldProps.onChange?.(e.target.value) : undefined}
            onBlur={fieldProps?.onBlur}
            onFocus={fieldProps?.onFocus}
            aria-invalid={fieldProps?.['aria-invalid']}
            aria-describedby={fieldProps?.['aria-describedby']}
          />
        )}
        
        {/* Validation indicators */}
        {(error || (isValid && isDirty && showSuccessIndicator)) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {error && showErrorIcon && (
              <div className="w-5 h-5 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {isValid && isDirty && showSuccessIndicator && (
              <div className="w-5 h-5 text-green-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div 
          id={`${name}-error`}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          {showErrorIcon && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {error}
        </div>
      )}
    </div>
  );
};

// Real-time validation feedback component
interface ValidationFeedbackProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  className?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  type,
  message,
  isVisible,
  className = '',
}) => {
  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  };

  const typeIcons = {
    success: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div 
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
        transition-all duration-200 animate-fade-in
        ${typeStyles[type]}
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {typeIcons[type]}
      <span>{message}</span>
    </div>
  );
};

export default ValidatedField;