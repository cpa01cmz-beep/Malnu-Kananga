import React from 'react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { 
  buildFormFieldClasses, 
  FORM_LABEL_CLASSES, 
  FORM_ERROR_CLASSES, 
  VALIDATION_FEEDBACK_CLASSES,
  VALIDATION_ICON_SIZE,
  VALIDATION_FEEDBACK_ICON_SIZE
} from '../../utils/formUtils';

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
          className={FORM_LABEL_CLASSES}
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
            className={buildFormFieldClasses({
              state: error ? 'error' : (isValid && isDirty) ? 'success' : 'default',
              disabled,
              className: 'w-full'
            })}
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
              <div className={`${VALIDATION_ICON_SIZE} text-red-500`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {isValid && isDirty && showSuccessIndicator && (
              <div className={`${VALIDATION_ICON_SIZE} text-green-500`}>
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
          className={FORM_ERROR_CLASSES}
          role="alert"
          aria-live="polite"
        >
          {showErrorIcon && (
            <svg className={VALIDATION_FEEDBACK_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const typeStyles = VALIDATION_FEEDBACK_CLASSES;

  const typeIcons = {
    success: (
      <svg className={VALIDATION_FEEDBACK_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className={VALIDATION_FEEDBACK_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className={VALIDATION_FEEDBACK_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    info: (
      <svg className={VALIDATION_FEEDBACK_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div 
      className={`
        ${VALIDATION_FEEDBACK_CLASSES.base}
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